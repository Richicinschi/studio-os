// tools/export/claude-ai-trial.mjs
// A maintainer's trial of two domains on claude.ai (public issue #64), in two steps:
//   node tools/export/claude-ai-trial.mjs build <out folder>
//     builds each domain's upload zip with tools/upload-bundle.mjs and writes CHECKLIST.md beside them:
//     where to upload, the one task to run per domain, and what to write down.
//   node tools/export/claude-ai-trial.mjs record --domain <id> --upload accepted|refused [--error <text>]
//       [--skill <file Claude read, or none>] [--note <one line>] [--date YYYY-MM-DD]
//     prints that domain's row for docs/trials.md, to paste under "Domains on claude.ai".
// The upload itself is a person's act on claude.ai; this script never reaches the network.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { bundleEntries, writeZip } from '../upload-bundle.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// One domain whose entry's front matter a strict YAML reader refused until #50 was fixed, and one it never
// touched; each with a task that needs a skill file inside the domain, and no local tool.
export const DOMAINS = [
  { id: 'advisor-council-for-big-decisions', why: 'one of the nine domains whose front matter a strict YAML reader refused until #50 was fixed, and whose skill asks for a panel that claude.ai has no agents for',
    task: 'I have two job offers: a steady salaried role, and a startup that pays less now but offers equity. Use the council to help me decide.' },
  { id: 'marketing-copy-emails-seo-signups', why: 'a domain #50 never touched, with many skills behind one entry',
    task: 'Rewrite this landing-page headline so it says what the product does: "Unlock your potential with our innovative platform." The product is a tool that turns meeting recordings into action lists.' },
];

export function checklist(today) {
  return [`# Trying two domains on claude.ai (${today})`, '',
    'Public issue #64: the domain route on claude.ai has not been run once. Do this once per domain, in a new chat each time.', '',
    '1. Customize > Skills > "+" > "+ Create skill" > "Upload a skill", and pick the zip (`docs/facts.md`, "claude.ai: custom skills and the built-in document skills"). Custom skills need code execution turned on.',
    '2. If the upload is refused, copy the error text exactly. That is the result; skip to step 5.',
    '3. In a new chat, paste the task below as the first message.',
    '4. Watch which files Claude opens (the entry `SKILL.md`, then a file under `skills/`), and whether the answer follows that file.',
    '5. Record it: `node tools/export/claude-ai-trial.mjs record --domain <id> --upload accepted --skill skills/<file> --note "<one line>"`, and paste the row it prints into `docs/trials.md`.',
    '6. Remove the skill again (Customize > Skills, the skill, then "..." and delete), unless you want to keep it.', '',
    ...DOMAINS.flatMap((d) => [`## ${d.id}`, '', `Zip: \`${d.id}.zip\`. Why this one: ${d.why}.`, '', 'Task:', '', `> ${d.task}`, '']),
  ].join('\n');
}

export function build(out, { kit = KIT, today = new Date().toISOString().slice(0, 10) } = {}) {
  mkdirSync(out, { recursive: true });
  const zips = DOMAINS.map((d) => {
    const file = path.join(out, `${d.id}.zip`);
    writeZip(bundleEntries(path.join(kit, 'catalog/packs', d.id), d.id), file);
    return file;
  });
  writeFileSync(path.join(out, 'CHECKLIST.md'), `${checklist(today)}\n`);
  return zips;
}

// One row for docs/trials.md: | Date | Domain | Upload | Skill Claude read | Note |
export function record({ domain, upload, error, skill, note, date = new Date().toISOString().slice(0, 10) }) {
  if (!DOMAINS.some((d) => d.id === domain)) throw new Error(`--domain is one of ${DOMAINS.map((d) => d.id).join(', ')}`);
  if (!['accepted', 'refused'].includes(upload)) throw new Error('--upload is accepted or refused');
  if (upload === 'refused' && !error) throw new Error('a refused upload needs --error with the text claude.ai showed');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('--date is YYYY-MM-DD');
  const cell = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  const up = upload === 'refused' ? `refused: "${cell(error)}"` : 'accepted';
  return `| ${date} | \`${domain}\` | ${up} | ${upload === 'refused' ? 'n/a' : cell(skill) || 'none'} | ${cell(note) || '-'} |`;
}

function main(argv) {
  const [cmd, ...rest] = argv;
  const opt = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
  if (cmd === 'build' && rest[0]) {
    for (const z of build(path.resolve(rest[0]))) console.log(`wrote ${z}`);
    console.log(`wrote ${path.join(path.resolve(rest[0]), 'CHECKLIST.md')}`);
    return 0;
  }
  if (cmd === 'record') {
    console.log(record({ domain: opt('--domain'), upload: opt('--upload'), error: opt('--error'), skill: opt('--skill'), note: opt('--note'), ...(opt('--date') ? { date: opt('--date') } : {}) }));
    return 0;
  }
  console.error('usage: node tools/export/claude-ai-trial.mjs build <out folder> | record --domain <id> --upload accepted|refused [--error <text>] [--skill <file>] [--note <text>] [--date YYYY-MM-DD]');
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`error: ${e.message}`); process.exitCode = 2; }
}
