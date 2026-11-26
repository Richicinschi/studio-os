// tools/export/test/phase-loads.test.mjs
// Public issue #58: what the adoption session reads, phase by phase. The drill keeps each phase in a file of
// its own, phase 1 reads every card's Detect from one generated file, START-HERE states the loads, and the
// load before the first question stays under a stated limit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { phaseLoads, medianCard, PHASES, FIRST_QUESTION_LIMIT } from '../phase-loads.mjs';
import { detectTable, DETECT_FILE } from '../detect.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

test(`every file a phase reads exists, and the load before the first question is under ${FIRST_QUESTION_LIMIT} tokens`, () => {
  for (const p of PHASES) for (const f of p.files) assert.ok(existsSync(path.join(KIT, f)), `${p.label}: ${f}`);
  const [before] = phaseLoads(KIT);
  assert.equal(before.key, 'before');
  assert.ok(before.tokens <= FIRST_QUESTION_LIMIT, `about ${before.tokens} tokens before the first question, over ${FIRST_QUESTION_LIMIT}`);
});

const near = (stated, actual, what) => assert.ok(Math.abs(stated - actual) <= actual * 0.1, `${what}: START-HERE says ${stated}, the files add up to ${actual}`);

test('START-HERE states each phase\'s load, within 10% of what the kit\'s files add up to', () => {
  const text = readFileSync(path.join(KIT, 'START-HERE.md'), 'utf8');
  for (const p of phaseLoads(KIT)) {
    const row = text.split(/\r?\n/).find((l) => l.startsWith(`| ${p.label} |`));
    assert.ok(row, `START-HERE has a row for ${p.label}`);
    near(Number(row.trim().replace(/\|$/, '').split('|').pop().replace(/[^\d]/g, '')), p.tokens, p.label);
  }
  // The figures for what the table leaves out: the median card, and the menu read in phase 2 after a no.
  const flat = text.replace(/\s+/g, ' ');
  const figure = (re) => Number((flat.match(re) || [, 'NaN'])[1].replace(/,/g, ''));
  near(figure(/the median card is about ([\d,]+) tokens/), medianCard(KIT), 'the median card');
  near(figure(/the menu, read in phase 2 instead when you said no to the audit \(about ([\d,]+)\)/),
    Math.ceil(readFileSync(path.join(KIT, 'catalog/features.json')).length / 4), 'the menu');
});

test('the first question is phase 1\'s, and the menu and the Detect file are read only after their yes', () => {
  const drill = readFileSync(path.join(KIT, '.claude/skills/drill-to-adopt/phases/1-audit.md'), 'utf8').replace(/\s+/g, ' ');
  const ask = drill.indexOf('Your first question');
  assert.ok(ask >= 0 && ask < drill.indexOf('catalog/features.json') && ask < drill.indexOf('catalog/DETECT.md'));
  assert.ok(PHASES[0].files.includes('.claude/skills/drill-to-adopt/phases/1-audit.md'), 'its file counts before the first question');
});

test('the committed catalog/DETECT.md is what the cards give (run node tools/export/detect.mjs after changing a Detect)', () => {
  assert.equal(readFileSync(path.join(KIT, DETECT_FILE), 'utf8').replace(/\r\n/g, '\n'), detectTable(KIT));
});

test('DETECT.md: each card\'s Detect, links still reaching their files, and the shared plugin check written once', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-detect-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  const reader = 'let s="";process.stdin.on("data",d=>s+=d)';
  const plugin = (kind, p, script = reader) => `- ${kind} of the same name from a plugin enabled here: run from the project folder, \`claude plugin list --json | node -e '${script}' ${p}\` prints the plugin's id.`;
  const menu = 'When nothing marks it **have** and that plugin line prints a copy, the menu says so, and does not offer it as a second.';
  try {
    // An agent card sorts first, so the shared check must not keep its "An agent".
    w('cards/a-agent.md', `# Item A\n\n## Why\n\nx\n\n## Detect\n\n- Look at [the facts](../docs/facts.md), [card b](b.md) and [its Ask](#ask).\n${plugin('An agent', 'agents/a-agent.md')}\n\nThe menu marks it have. ${menu}\n\n## Ask\n\ny\n`);
    w('cards/b.md', `# Item B\n\n## Detect\n\n${plugin('A skill', 'skills/b/SKILL.md')}\n\n\`\`\`\n## not a heading, inside a fence\n\`\`\`\n\nAfter the fence.\n\n## Ask\n\nz\n`);
    w('cards/c.md', `# Item C\n\n## Why\n\nno Detect section\n`);
    w('cards/d.md', `# Item D\n\n## Detect\n\n${plugin('A skill', 'skills/d/SKILL.md', 'other script')}\n`);
    const out = detectTable(root);
    assert.equal(out.split(`node -e '${reader}'`).length - 1, 1, 'the shared plugin command is written once');
    assert.match(out, /^## The plugin check, shared by the cards below$/m);
    assert.match(out, /^- A skill or agent of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json \| node -e '[^']*' <path>` prints the plugin's id\.$/m);
    assert.match(out, /^- An agent of the same name from a plugin enabled here: the plugin check, with `<path>` set to `agents\/a-agent\.md`\.$/m);
    assert.match(out, /^- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills\/b\/SKILL\.md`\.$/m);
    assert.ok(out.includes("node -e 'other script' skills/d/SKILL.md"), 'a card whose script differs keeps its own line');
    assert.match(out, /The plugin marks apply\./);
    assert.match(out, /\[the facts\]\(\.\.\/docs\/facts\.md\), \[card b\]\(\.\.\/cards\/b\.md\) and \[its Ask\]\(\.\.\/cards\/a-agent\.md#ask\)/);
    assert.match(out, /^## a-agent: Item A$/m);
    assert.ok(out.includes('## not a heading, inside a fence\n```\n\nAfter the fence.'), 'a "## " line inside a fence does not end the section');
    assert.ok(!/^## c:/m.test(out), 'a card with no Detect has no section');
    assert.ok(!out.includes('\n## Ask'), 'nothing after a card\'s Detect is taken');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
