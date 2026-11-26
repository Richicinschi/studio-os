// tools/export/phase-loads.mjs
// What the adoption session itself reads, phase by phase (public issue #58), with the kit's estimator
// (bytes divided by 4, rounded up). Each phase adds its own file of the drill, the kit files it says to
// read, and the template it writes from. The first question is phase 1's, so its file counts before it;
// the menu and the Detect file come after their yes. Not counted: the cards Claude reads as it asks
// about items (medianCard estimates one), the audit's output, what the person's setup holds, and Claude
// Code's own instructions. START-HERE states these figures, and `npm test` holds them within 10% and the
// load before the first question under FIRST_QUESTION_LIMIT.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { splitFrontmatter } from './frontmatter.mjs';

export const FIRST_QUESTION_LIMIT = 8000;

const DRILL = '.claude/skills/drill-to-adopt';
export const PHASES = [
  { key: 'before', label: 'Before the first question', files: [`${DRILL}/SKILL.md`, 'ADOPT.md', `${DRILL}/phases/1-audit.md`] },
  { key: 'phase1', label: 'Phase 1, Audit', files: ['catalog/features.json', 'catalog/DETECT.md', 'templates/adoption/inventory.md'] },
  { key: 'phase2', label: 'Phase 2, Decide', files: [`${DRILL}/phases/2-decide.md`, 'catalog/INDEX.md', 'templates/adoption/features.md'], moduleQuestions: true },
  { key: 'phase3', label: 'Phase 3, Spec and plan', files: [`${DRILL}/phases/3-spec-and-plan.md`, 'templates/adoption/spec.md', 'templates/adoption/plan.md'] },
  { key: 'phase4', label: 'Phase 4, Install', files: [`${DRILL}/phases/4-install.md`, '.claude/skills/vet-and-adopt/SKILL.md', 'templates/adoption/decisions.md'] },
  { key: 'phase5', label: 'Phase 5, Verify', files: [`${DRILL}/phases/5-verify.md`, 'templates/adoption/handover.md'] },
];

const tokens = (bytes) => Math.ceil(bytes / 4);
// A missing file counts 0 here, so the export runs on a kit without a drill; the kit's own test checks
// that every file listed above exists.
const size = (root, rel) => (existsSync(path.join(root, rel)) ? readFileSync(path.join(root, rel)).length : 0);

// The front matter of each module page: the drill reads its `questions:` in phase 2.
const moduleFrontmatter = (root) => {
  const dir = path.join(root, 'modules');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((d) => existsSync(path.join(dir, d, 'README.md')))
    .reduce((n, d) => n + Buffer.byteLength(splitFrontmatter(readFileSync(path.join(dir, d, 'README.md'), 'utf8')).raw || ''), 0);
};

// [{ key, label, tokens, files }], one per phase: what that phase adds to the session.
export function phaseLoads(root) {
  return PHASES.map((p) => {
    const bytes = p.files.reduce((n, f) => n + size(root, f), 0) + (p.moduleQuestions ? moduleFrontmatter(root) : 0);
    return { key: p.key, label: p.label, tokens: tokens(bytes), files: p.files };
  });
}

// The median card, as an estimate of what each card read in phases 2 to 4 adds.
export function medianCard(root) {
  const dir = path.join(root, 'cards');
  const sizes = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => tokens(size(root, `cards/${f}`))).sort((a, b) => a - b);
  return sizes[Math.floor(sizes.length / 2)];
}
