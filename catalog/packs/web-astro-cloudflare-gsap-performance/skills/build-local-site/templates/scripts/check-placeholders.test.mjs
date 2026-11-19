// Tests for check-placeholders.mjs. Run with: node --test scripts/check-placeholders.test.mjs
// Each case builds a throwaway project folder and runs the check inside it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-placeholders.mjs');

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'placeholders-'));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

function run(root) {
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  rmSync(root, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr };
}

test('a placeholder left in src fails the build and names file and line', () => {
  const { code, out } = run(project({ 'src/x.astro': '<p>Hello</p>\n<span>__RATING__</span>\n' }));
  assert.equal(code, 1);
  assert.match(out, /src\/x\.astro:2: __RATING__ is not filled in/);
});

test('a src with every placeholder filled passes', () => {
  const { code } = run(project({ 'src/x.astro': '<p>Hello</p>\n<span>BBB A+ Rated</span>\n' }));
  assert.equal(code, 0);
});

test('every placeholder is listed, in nested folders and with Windows line endings', () => {
  const { code, out } = run(
    project({
      'src/pages/about.astro': 'ok\r\n__LICENCE_STATEMENT__ and __RATING_BADGE__\r\n',
      'src/data/business.ts': "const a = 1;\nconst b = '__POSTAL_CODE__';\n",
    }),
  );
  assert.equal(code, 1);
  assert.match(out, /src\/pages\/about\.astro:2: __LICENCE_STATEMENT__ is not filled in/);
  assert.match(out, /src\/pages\/about\.astro:2: __RATING_BADGE__ is not filled in/);
  assert.match(out, /src\/data\/business\.ts:2: __POSTAL_CODE__ is not filled in/);
});

test('*.template source files are skipped: Astro does not build them', () => {
  const { code } = run(
    project({
      'src/data/business.ts.template': "name: '__BUSINESS_NAME__'\n",
      'src/data/business.ts': "name: 'Riverbend Plumbing'\n",
    }),
  );
  assert.equal(code, 0);
});

test('lower-case and single-underscore names are not placeholders', () => {
  const { code } = run(project({ 'src/x.ts': 'const __dirname = 1; const _A_ = 2; x.__proto__;\n' }));
  assert.equal(code, 0);
});

test('binary files are skipped', () => {
  const { code } = run(project({ 'src/assets/a.png': Buffer.from([0x89, 0x50, 0x00, 0x5f, 0x5f, 0x41, 0x5f, 0x5f]) }));
  assert.equal(code, 0);
});

test('a placeholder left in public fails too: robots.txt ships with __SITE_URL__', () => {
  const { code, out } = run(
    project({
      'src/x.astro': '<p>Hello</p>\n',
      'public/robots.txt': 'User-agent: *\nAllow: /\n\nSitemap: __SITE_URL__/sitemap-index.xml\n',
    }),
  );
  assert.equal(code, 1);
  assert.match(out, /public\/robots\.txt:4: __SITE_URL__ is not filled in/);
});

test('a filled-in public passes, and a project without public is fine', () => {
  assert.equal(
    run(project({ 'src/x.astro': 'ok\n', 'public/robots.txt': 'Sitemap: https://example.com/sitemap-index.xml\n' })).code,
    0,
  );
  assert.equal(run(project({ 'src/x.astro': 'ok\n' })).code, 0);
});

test('binary files in public are skipped, by content and by file type', () => {
  const token = Buffer.from('__A__');
  const { code } = run(
    project({
      'src/x.astro': 'ok\n',
      'public/images/a.png': Buffer.concat([Buffer.from([0x89, 0x50, 0x00]), token]),
      'public/fonts/f.woff2': Buffer.concat([Buffer.from('wOF2'), token]),
    }),
  );
  assert.equal(code, 0);
});

test('a folder with no src fails rather than passing on nothing', () => {
  const { code, out } = run(project({ 'README.md': 'x\n' }));
  assert.equal(code, 1);
  assert.match(out, /no src/);
});
