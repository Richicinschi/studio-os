// tools/export/test/short-path.test.mjs
// The short path (public issues #3, #28 and #29) and the skill-count warning (#26): the entry pages and the
// drill name the same sentence, the drill's continuity mode ends with the fresh-session proof, the README
// shows the protocol before the catalog, and the warning's limit is the one docs/facts.md states.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitFrontmatter } from '../frontmatter.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = (rel) => readFileSync(path.join(KIT, rel), 'utf8').replace(/\r\n/g, '\n');
const flat = (s) => s.replace(/\s+/g, ' ');
const PHRASE = 'Start with continuity';

test('README, START-HERE and the drill\'s description name the same sentence for the short path', () => {
  assert.ok(read('README.md').includes(`"${PHRASE}"`));
  assert.ok(read('START-HERE.md').includes(`"${PHRASE}"`));
  const { raw } = splitFrontmatter(read('.claude/skills/drill-to-adopt/SKILL.md'));
  assert.ok(flat(raw).toLowerCase().includes(`"${PHRASE.toLowerCase()}"`), 'the description triggers on it');
});

test('the drill\'s continuity mode takes the scanner, the front door and the handoff note, and ends with the fresh-session proof', () => {
  const drill = read('.claude/skills/drill-to-adopt/SKILL.md');
  const mode = read('.claude/skills/drill-to-adopt/modes/continuity.md');
  assert.ok(mode.startsWith('## Continuity mode'), 'the mode has its own file');
  assert.match(drill, /\| Continuity mode \| `\.claude\/skills\/drill-to-adopt\/modes\/continuity\.md` \|/, 'SKILL.md says when to read it');
  // What a later full run does with the short path's items is in SKILL.md, which that run reads.
  assert.match(flat(drill), /That run never asks about the short path's items again: the menu shows each as \*\*taken \(short path, light\)\*\*/);
  for (const card of ['cards/skillspector.md', 'cards/front-door.md', 'cards/handoff.md']) assert.ok(mode.includes(card), card);
  assert.match(flat(mode), /where did we stop\?/);
  assert.match(flat(drill), /"Start with continuity" or "the short path" means \*\*continuity mode\*\*/);
  // A run that stopped partway, or the short path, resumes at phase 1; only its own phrases start update mode.
  assert.match(flat(drill), /holds only the "Continuity path" section is unfinished, so phase 1 runs/);
  assert.match(flat(drill), /"Update my adoption" or "what is new in the kit" means \*\*update mode\*\*/);
});

test('the README names the short path before its first table, and shows the protocol and the ways in before what the protocol can install', () => {
  const readme = read('README.md');
  const at = (s) => { const i = readme.indexOf(s); assert.ok(i >= 0, s); return i; };
  assert.ok(at(`"${PHRASE}"`) < at('| **Audit** |'));
  assert.ok(at('| **Audit** |') < at('## Three ways in'));
  assert.ok(at('## Three ways in') < at('## Why'));
  assert.ok(at('## Three ways in') < at('## What the protocol can install'));
});

test('the short path\'s time and number of checks on the entry pages are the ones run 10 recorded', () => {
  const run = read('docs/trials.md').split('## Run 10')[1].split('\n## ')[0];
  const minutes = flat(run).match(/(\d+) minutes \d+ seconds? from the first message to the fresh session's answer/)?.[1];
  const checks = flat(run).match(/running the (\w+) handed-over commands/)?.[1];
  assert.ok(minutes && checks, 'run 10 states both');
  for (const page of ['README.md', 'START-HERE.md']) {
    const text = flat(read(page));
    assert.match(text, new RegExp(`took ${minutes} minutes to`), page);
    assert.match(text, new RegExp(`\\(${checks} in the trial\\)`), page);
  }
});

test('the skill-count warning uses the fallback budget docs/facts.md states', () => {
  assert.match(flat(read('docs/facts.md')), /with a fallback of 8,000 characters/);
  const drill = flat(read('.claude/skills/drill-to-adopt/phases/2-decide.md'));
  const step = drill.slice(drill.indexOf('**Skills Claude can tell apart.**'), drill.indexOf('### Round 2'));
  assert.match(step, /8,000 characters when Claude Code cannot work that out/);
  assert.match(step, /use 8,000 as a cautious line/);
  assert.match(step, /"Claude Code: measuring context and asking multiple choice"/);
});
