// tools/export/overlap.mjs
// Which shipped descriptions claim the same requests (public issue #61)? Claude picks a skill from its
// description, so two descriptions that share their rare trigger words compete for one request. A word is
// rare when it appears in at most `maxDf` of all descriptions (three by default) and is not a stop word; a
// pair is listed when it shares at least `min` of them. Only descriptions that load count: a skill Claude
// cannot start itself (`disable-model-invocation`) is left out, and a domain's stubs are read too.
// The export prints the pairs at every run, the ones `tools/export/overlaps.json` does not know yet marked
// new, so a new overlap is seen at release; it is a report, not a gate: which one goes first is said in the
// descriptions themselves, which come from the hub.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter, startedByName } from './frontmatter.mjs';

const STOP = new Set(`about after also before being does doing done each even from have here into just like made make
many more most must need only other over same some such than that their them then there these they this those
through under very want what when where which while with would your user ask say using use used work open every
its out`.split(/\s+/));

// Plural endings are folded first ("tasks", "users", "bugs"), then short words and stop words leave.
const words = (text) => new Set(String(text).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
  .map((w) => (w.length > 3 && /[^su]s$/.test(w) ? w.slice(0, -1) : w))
  .filter((w) => w.length > 2 && !STOP.has(w)));

const order = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

// `descriptions`: { key: text }. Returns [{ a, b, shared: [words] }], the pairs with most shared words first.
export function descriptionOverlaps(descriptions, { maxDf = 3, min = 2 } = {}) {
  const sets = Object.fromEntries(Object.entries(descriptions).map(([k, d]) => [k, words(d)]));
  const df = new Map();
  for (const s of Object.values(sets)) for (const w of s) df.set(w, (df.get(w) || 0) + 1);
  const keys = Object.keys(sets).sort(order);
  const pairs = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const shared = [...sets[keys[i]]].filter((w) => sets[keys[j]].has(w) && df.get(w) <= maxDf).sort(order);
      if (shared.length >= min) pairs.push({ a: keys[i], b: keys[j], shared });
    }
  }
  return pairs.sort((x, y) => y.shared.length - x.shared.length || order(x.a, y.a) || order(x.b, y.b));
}

const loaded = (file) => {
  const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
  return data?.description && !startedByName(data) ? String(data.description) : null;
};

// The descriptions a session lists: each shipped skill's, each domain entry's and each of its stubs' that
// Claude can start itself, from the catalog.
export function shippedDescriptions(root) {
  const out = {};
  const dirs = (rel) => (existsSync(path.join(root, rel)) ? readdirSync(path.join(root, rel)).sort(order) : []);
  for (const id of dirs('catalog/skills')) {
    const file = path.join(root, 'catalog/skills', id, 'SKILL.md');
    const d = existsSync(file) && loaded(file);
    if (d) out[`skill:${id}`] = d;
  }
  for (const id of dirs('catalog/packs')) {
    const entry = path.join(root, 'catalog/packs', id, 'SKILL.md');
    const d = existsSync(entry) && loaded(entry);
    if (d) out[`pack:${id}`] = d;
    for (const stub of dirs(`catalog/packs/${id}/stubs`)) {
      const file = path.join(root, 'catalog/packs', id, 'stubs', stub, 'SKILL.md');
      const s = existsSync(file) && loaded(file);
      if (s) out[`stub:${id}/${stub}`] = s;
    }
  }
  return out;
}

// The pairs already read, from tools/export/overlaps.json (["a and b", ...]); [] when there is none.
export function knownOverlaps(root) {
  const file = path.join(root, 'tools/export/overlaps.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
}
export const pairName = (p) => `${p.a} and ${p.b}`;
