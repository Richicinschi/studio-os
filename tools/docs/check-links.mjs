// tools/docs/check-links.mjs
// Checks that every source link in docs/facts.md still answers: each http(s) URL in its front matter's
// `references:` and in the page's Markdown links, fetched once (HEAD, then GET where HEAD is refused),
// redirects followed. A status of 400 or more, a timeout or a network error is a failure, after one retry.
// The CI job `links` runs it weekly; it needs the network, so `npm test` runs it only against a local server.
//   node tools/docs/check-links.mjs [file]      # default docs/facts.md; exit 1 on any failure
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Every http(s) URL the page cites, once each, in order of first appearance.
export function linksOf(text) {
  const urls = [
    ...[...text.matchAll(/^\s+-\s+(https?:\/\/\S+)\s*$/gm)].map((m) => m[1]),
    ...[...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]),
  ];
  return [...new Set(urls)];
}

// HEAD first; some hosts refuse it (405, 403, 404 on a HEAD route) or drop it, so GET is asked before a
// URL counts as failed this round.
async function probe(url, fetchImpl, timeoutMs) {
  let last = { ok: false, status: 0 };
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetchImpl(url, { method, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: { 'user-agent': 'studio-os-link-check' } });
      await res.body?.cancel?.();
      if (res.status < 400) return { ok: true, status: res.status };
      last = { ok: false, status: res.status, retryAfter: res.headers?.get?.('retry-after') };
    } catch (e) {
      last = { ok: false, status: 0, error: e.name === 'TimeoutError' ? 'timeout' : (e.cause?.code || e.message) };
    }
  }
  return last;
}

// How long to wait before the second round: the host's Retry-After in seconds when it sent one (at most a
// minute), else `delayMs`, so a rate limit or a short outage has time to clear.
const waitFor = (r, delayMs) => {
  const s = r.retryAfter == null || String(r.retryAfter).trim() === '' ? NaN : Number(r.retryAfter);
  return Number.isFinite(s) && s >= 0 ? Math.min(s, 60) * 1000 : delayMs;
};

// Each URL with its result; a URL that fails is tried once more, after a wait, before it counts as broken.
export async function checkLinks(urls, { fetchImpl = fetch, timeoutMs = 20000, concurrency = 4, retryDelayMs = 10000, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const results = new Array(urls.length);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const i = next++;
      let r = await probe(urls[i], fetchImpl, timeoutMs);
      if (!r.ok) {
        await sleep(waitFor(r, retryDelayMs));
        r = await probe(urls[i], fetchImpl, timeoutMs);
      }
      results[i] = { url: urls[i], ...r };
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const file = path.resolve(root, process.argv[2] || 'docs/facts.md');
  const urls = linksOf(readFileSync(file, 'utf8'));
  const results = await checkLinks(urls);
  const failed = results.filter((r) => !r.ok);
  for (const r of failed) console.log(`broken: ${r.error || r.status} ${r.url}`);
  console.log(`checked ${results.length} link(s) in ${path.relative(root, file).split(path.sep).join('/')}: ${failed.length} broken`);
  process.exitCode = failed.length ? 1 : 0;
}
