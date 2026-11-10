// tools/export/test/credits.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { isCreditFile, parseCreditFile, spdxUrl } from '../credits.mjs';

// Shaped like a real credit file: a table of adapted text, a table of ideas re-expressed without their
// text, and tools in a list. Every source is invented.
const CREDITS = [
  '# ATTRIBUTION',
  '',
  '### Lifted with attribution (permissive)',
  '',
  '| Source | Licence | What was adapted |',
  '|---|---|---|',
  '| [someone/checklists](https://example.invalid/someone/checklists) | MIT | The checklist. |',
  '| [other/method](https://example.invalid/other/method) | Apache-2.0 | The method. |',
  '| third/a · fourth/b | MIT / Apache-2.0 | A shape. |',
  '',
  '### Re-authored only, never copied',
  '',
  '| Source | Licence | Pattern re-authored (not copied) |',
  '|---|---|---|',
  '| fifth/copyleft | AGPL-3.0 | An idea. |',
  '| sixth/closed | none (all rights reserved) | Another idea. |',
  '| seventh/mixed | mixed | A third idea. |',
  '',
  '### Tools, run as separate programs',
  '- eighth/tool (GPLv3)',
  '',
].join('\n');

test('a credit file is ATTRIBUTION.md or a file whose name starts with NOTICE, at any depth; nothing else is', () => {
  for (const f of ['ATTRIBUTION.md', 'skills/x/ATTRIBUTION.md', 'catalog/packs/d/skills/x/attribution.md', 'NOTICE', 'NOTICE.md', 'skills/x/NOTICE.txt', 'NOTICES.md']) assert.ok(isCreditFile(f), f);
  for (const f of ['references/method/attribution-tiering.md', 'ATTRIBUTION.txt', 'data/SHAPE-INDEX-NOTICE.md', 'README.md', 'LICENSE', 'skills/notice-board/SKILL.md']) assert.ok(!isCreditFile(f), f);
});

test('the licences of the adapted text come from the credit file\'s tables, sorted, and the not-copied table is left out', () => {
  assert.deepEqual(parseCreditFile(CREDITS, 'x/ATTRIBUTION.md'), { licences: ['Apache-2.0', 'MIT'] });
  const one = CREDITS.replace(/\| \[other[^\n]*\n/, '').replace('| MIT / Apache-2.0 |', '| MIT |');
  assert.deepEqual(parseCreditFile(one, 'x/ATTRIBUTION.md'), { licences: ['MIT'] });
  const bsd = CREDITS.replace('| Apache-2.0 | The method. |', '| BSD-3-Clause | The method. |');
  assert.deepEqual(parseCreditFile(bsd, 'x/ATTRIBUTION.md'), { licences: ['Apache-2.0', 'BSD-3-Clause', 'MIT'] });
});

test('a table says its text was not copied in its header row or in the heading above it', () => {
  const byHeader = CREDITS.replace('### Re-authored only, never copied', '### Ideas');
  assert.deepEqual(parseCreditFile(byHeader, 'x/ATTRIBUTION.md'), { licences: ['Apache-2.0', 'MIT'] });
  const byHeading = CREDITS.replace('Pattern re-authored (not copied)', 'Pattern');
  assert.deepEqual(parseCreditFile(byHeading, 'x/ATTRIBUTION.md'), { licences: ['Apache-2.0', 'MIT'] });
});

test('a credit file the build cannot read stops it, naming the file and what is wrong', () => {
  assert.throws(() => parseCreditFile('# Credits\n\nWe thank someone/checklists (MIT).\n', 'catalog/packs/d/NOTICE.md'),
    /catalog\/packs\/d\/NOTICE\.md: .*no table that has a Licence column/);
  assert.throws(() => parseCreditFile(CREDITS.replace('| MIT | The checklist. |', '| mixed | The checklist. |'), 'x/ATTRIBUTION.md'),
    /x\/ATTRIBUTION\.md: the row for \[someone\/checklists\].* names its licence as "mixed".*SPDX identifier/);
  assert.throws(() => parseCreditFile(CREDITS.replace('| Apache-2.0 | The method. |', '|  | The method. |'), 'x/ATTRIBUTION.md'),
    /the row for \[other\/method\].* names its licence as ""/);
  const ideasOnly = CREDITS.split('### Re-authored')[1].replace(/^[^\n]*/, '### Re-authored only, never copied');
  assert.throws(() => parseCreditFile(ideasOnly, 'x/ATTRIBUTION.md'), /x\/ATTRIBUTION\.md: .*no source of adapted text/);
});

test('each licence links to its text on the SPDX licence list', () => {
  assert.equal(spdxUrl('Apache-2.0'), 'https://spdx.org/licenses/Apache-2.0.html');
  assert.equal(spdxUrl('MIT'), 'https://spdx.org/licenses/MIT.html');
});
