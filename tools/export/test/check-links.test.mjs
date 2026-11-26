// tools/export/test/check-links.test.mjs
// The weekly link check of docs/facts.md (tools/docs/check-links.mjs), run against a local server so the
// test needs no network.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { linksOf, checkLinks } from '../../docs/check-links.mjs';

test('the links of the facts page: its references and its Markdown links, each once, relative links left out', () => {
  const text = '---\nreferences:\n  - https://a.example.invalid/one\n  - https://a.example.invalid/two\n---\n'
    + '- A fact. (checked 2026-11-25, [source](https://a.example.invalid/one), [source](https://b.example.invalid/x?y=1))\n'
    + '- Another, [the card](../cards/x.md).\n';
  assert.deepEqual(linksOf(text), ['https://a.example.invalid/one', 'https://a.example.invalid/two', 'https://b.example.invalid/x?y=1']);
});

test('a link answers with a status below 400, after a redirect or a GET where HEAD is refused; a failed round is tried again after a wait', async () => {
  let flaky = 0;
  const server = http.createServer((req, res) => {
    if (req.url === '/ok') return res.writeHead(200).end('ok');
    if (req.url === '/moved') return res.writeHead(301, { location: '/ok' }).end();
    if (req.url === '/no-head') return res.writeHead(req.method === 'HEAD' ? 405 : 200).end();
    // The first round (HEAD and GET) fails; only the second round can pass.
    if (req.url === '/flaky') return res.writeHead(flaky++ < 2 ? 503 : 200).end();
    return res.writeHead(404).end('gone');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const waits = [];
  try {
    const results = await checkLinks(['/ok', '/moved', '/no-head', '/flaky', '/gone'].map((p) => base + p), { timeoutMs: 5000, retryDelayMs: 7, sleep: async (ms) => { waits.push(ms); } });
    assert.deepEqual(results.map((r) => [r.url.slice(base.length), r.ok]), [['/ok', true], ['/moved', true], ['/no-head', true], ['/flaky', true], ['/gone', false]]);
    assert.equal(results[4].status, 404);
    assert.equal(flaky, 3, 'the flaky link took a second round');
    assert.deepEqual(waits, [7, 7], 'one wait before each second round: /flaky and /gone');
  } finally { server.close(); }
});

test('a HEAD that throws is asked again with GET, and a Retry-After sets the wait, at most a minute', async () => {
  const calls = [];
  const fetchImpl = async (url, { method }) => {
    calls.push(`${method} ${url}`);
    if (url.endsWith('/drops-head') && method === 'HEAD') throw new Error('socket hang up');
    if (url.endsWith('/drops-head')) return { status: 200 };
    return { status: 429, headers: { get: (h) => (h === 'retry-after' ? (url.endsWith('/slow') ? '3' : '3600') : null) } };
  };
  const waits = [];
  const results = await checkLinks(['https://a.example.invalid/drops-head', 'https://a.example.invalid/slow', 'https://a.example.invalid/very-slow'], { fetchImpl, concurrency: 1, sleep: async (ms) => { waits.push(ms); } });
  assert.deepEqual(results.map((r) => r.ok), [true, false, false]);
  assert.deepEqual(calls.slice(0, 2), ['HEAD https://a.example.invalid/drops-head', 'GET https://a.example.invalid/drops-head']);
  assert.deepEqual(waits, [3000, 60000]);
});

test('a host that does not answer is broken, with the reason', async () => {
  const fetchImpl = async () => { throw Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } }); };
  const [r] = await checkLinks(['https://nowhere.example.invalid/'], { fetchImpl, sleep: async () => {} });
  assert.equal(r.ok, false);
  assert.equal(r.error, 'ENOTFOUND');
});
