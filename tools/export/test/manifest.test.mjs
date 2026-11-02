// tools/export/test/manifest.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { makeFixtureHub } from './fixture-hub.mjs';
import { hubInventory, classify, validateManifest, readSkillMeta } from '../manifest.mjs';

const ext = { id: 'tool', kind: 'external', status: 'link-only', pack: 'foundation', upstream: 'https://example.invalid/tool', licence: 'MIT', install: 'see docs',
  module: '05-skills', importance: 'optional', why: 'A tool some adopters want.', loads: 'none' };

test('inventory ignores folders without SKILL.md and the agents index', () => {
  const hub = makeFixtureHub();
  try {
    assert.deepEqual(hubInventory(hub), { skills: ['alpha', 'beta'], agents: ['gamma'] });
  } finally { rmSync(hub, { recursive: true, force: true }); }
});

test('classify reports unclassified hub items and manifest items missing from the hub', () => {
  const inv = { skills: ['alpha', 'beta'], agents: ['gamma'] };
  const manifest = { items: [
    { id: 'alpha', kind: 'skill', status: 'shipped', pack: 'way-of-working' },
    { id: 'gamma', kind: 'agent', status: 'shipped', pack: 'way-of-working' },
    { id: 'ghost', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    ext,
  ] };
  assert.deepEqual(classify(inv, manifest), { unclassified: ['skill:beta'], missing: ['skill:ghost'] });
});

test('validateManifest names every rule a bad item breaks', () => {
  const errors = validateManifest({ items: [
    { id: 'a', kind: 'skill', status: 'shipped', pack: 'catalog' },
    { id: 'b', kind: 'skill', status: 'private', pack: 'catalog' },
    { id: 'c', kind: 'external', status: 'shipped', pack: 'foundation' },
    { id: 'd', kind: 'skill', status: 'later', pack: 'catalog' },
    { id: 'd', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    ext,
  ] });
  assert.ok(errors.some((e) => e.startsWith('skill:a: a shipped item belongs to')));
  assert.ok(errors.some((e) => e.startsWith('skill:b: a private item has pack "none"')));
  assert.ok(errors.some((e) => e.startsWith('external:c: an external item needs upstream')));
  assert.ok(errors.some((e) => e.startsWith('external:c: external items are never shipped')));
  assert.ok(errors.some((e) => e.startsWith('skill:d: status must be one of')));
  assert.ok(errors.some((e) => e === 'skill:d: listed twice'));
  assert.equal(errors.filter((e) => e.startsWith('external:tool')).length, 0);
});

test('every menu item needs importance and why, and a practice needs loads and files; the report lists every offending id', () => {
  const ok = { importance: 'recommended', why: 'Fixes a problem most adopters have.' };
  const errors = validateManifest({ items: [
    { id: 'a', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity' },
    { id: 'b', kind: 'agent', status: 'shipped', pack: 'way-of-working', module: '08-agents-and-council', importance: 'recommended' },
    { id: 'c', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', importance: 'essential', why: 'x' },
    { id: 'd', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', importance: 'optional', why: 'w'.repeat(141) },
    { id: 'e', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'A practice', ...ok },
    { id: 'f', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'A practice', loads: 'always', files: [], ...ok },
    { id: 'g', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    { id: 'h', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', ...ok },
    { id: 'i', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'A practice', loads: 'none', files: ['templates/x.md'], ...ok },
    { ...ext, id: 'j', importance: undefined, loads: undefined },
    ext,
  ] });
  assert.ok(errors.includes('menu items without importance or why (add both in export.manifest.json): skill:a, agent:b, external:j'), errors.join('\n'));
  assert.ok(errors.includes('importance must be core, recommended or optional: skill:c'), errors.join('\n'));
  assert.ok(errors.includes('why longer than 140 characters: skill:d'), errors.join('\n'));
  assert.ok(errors.includes('practices and outside items without loads (none, on-demand or every-session): practice:e, practice:f, external:j'), errors.join('\n'));
  assert.ok(errors.includes('practices without files (the kit paths they adopt): practice:e, practice:f'), errors.join('\n'));
  assert.equal(errors.filter((e) => /\b(skill:g|skill:h|practice:i|external:tool)\b/.test(e)).length, 0, errors.join('\n'));
});

test('an outside item that loads every session states its token estimate; later items need id, title and why', () => {
  const errors = validateManifest({ items: [{ ...ext, loads: 'every-session' }], later: [{ id: 'graph', title: 'A graph' }, { id: 'archive', title: 'An archive', why: 'Needs privacy rules first.' }] });
  assert.ok(errors.includes('outside items that load every session need everySessionTokens: external:tool'), errors.join('\n'));
  assert.ok(errors.includes('later items need id, title and why: graph'), errors.join('\n'));
  assert.equal(validateManifest({ items: [{ ...ext, loads: 'every-session', everySessionTokens: 500 }], later: [] }).length, 0);
});

test('importance and why may differ by profile: an object needs a default and known profile keys only', () => {
  const item = (importance, why = 'A reason.') => ({ id: 'x', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '03-planning', importance, why });
  assert.deepEqual(validateManifest({ items: [item({ default: 'optional', software: 'recommended', ml: 'recommended', data: 'core' })] }), []);
  assert.deepEqual(validateManifest({ items: [item({ default: 'optional' }, { default: 'Why.', ml: 'Why for ml.' })] }), []);
  assert.ok(validateManifest({ items: [item({ software: 'recommended' })] }).includes('importance or why given per profile without a default: skill:x'));
  assert.ok(validateManifest({ items: [item({ default: 'optional', general: 'recommended' })] }).includes('importance or why with a key other than default, data, ml or software: skill:x'));
  assert.ok(validateManifest({ items: [item({ default: 'optional', ml: 'essential' })] }).includes('importance must be core, recommended or optional: skill:x'));
  assert.ok(validateManifest({ items: [item('optional', { default: 'Why.', data: 'w'.repeat(141) })] }).includes('why longer than 140 characters: skill:x'));
});

test('practices are not hub items: classify never reports them missing', () => {
  const manifest = { items: [{ id: 'memory', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity' }] };
  assert.deepEqual(classify({ skills: [], agents: [] }, manifest), { unclassified: [], missing: [] });
});

test('readSkillMeta tells studio-original from third-party and finds the upstream', () => {
  const hub = makeFixtureHub();
  try {
    const a = readSkillMeta(path.join(hub, '.claude', 'skills', 'alpha'));
    assert.equal(a.thirdParty, false);
    assert.equal(a.upstream, null);
    assert.equal(a.description, 'Use when alpha.');
    const b = readSkillMeta(path.join(hub, '.claude', 'skills', 'beta'));
    assert.equal(b.thirdParty, true);
    assert.equal(b.licenceFile, 'LICENSE');
    assert.equal(b.licenceLine, 'Copyright (c) 2026 Someone');
    assert.equal(b.upstream, 'https://github.com/someone/upstream-repo');
  } finally { rmSync(hub, { recursive: true, force: true }); }
});

test('the licence line takes copyright notices only, never legal text that mentions copyright', () => {
  const hub = makeFixtureHub();
  try {
    const lic = path.join(hub, '.claude', 'skills', 'beta', 'LICENSE');
    writeFileSync(lic, 'Attribution-ShareAlike 4.0\n\n  a. Adapted Material means material subject to Copyright and Similar\n  copyright--then that use is not regulated by the license.\n');
    assert.equal(readSkillMeta(path.join(hub, '.claude', 'skills', 'beta')).licenceLine, null);
    writeFileSync(lic, 'MIT License\n\nCopyright 2025 Someone\n© 2024 Other\nThe above copyright notice shall be included.\n');
    assert.equal(readSkillMeta(path.join(hub, '.claude', 'skills', 'beta')).licenceLine, 'Copyright 2025 Someone; © 2024 Other');
  } finally { rmSync(hub, { recursive: true, force: true }); }
});
