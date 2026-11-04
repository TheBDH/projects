import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { setTimeout as delay } from 'node:timers/promises';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { serveSnapshot, SNAPSHOT_PATH } from '../delivery/handler.mjs';

const origin = 'https://projects.browndailyherald.com';
const url = 'https://delivery.test' + SNAPSHOT_PATH;
const body = JSON.stringify({ mode: 'live', checkedAt: '2026-11-03T21:00:00Z', votes: 121 });
function rig({ mode = 'live', objectMode = mode, size = body.length, throws = false, missing = false } = {}) {
  let reads = 0;
  const entries = new Map(), pending = [];
  const cache = { async match(key) { return entries.get(key.url)?.clone(); }, async put(key, value) { entries.set(key.url, new Response(await value.arrayBuffer(), value)); } };
  const env = { SNAPSHOT_MODE: mode, RESULTS: { async get(key) {
    reads++; assert.equal(key, SNAPSHOT_PATH.slice(1));
    if (throws) throw new Error('R2 unavailable');
    if (missing) return null;
    return { body: new Response(body).body, size, httpEtag: '"revision-a"', uploaded: new Date('2026-11-03T21:00:00Z'),
      httpMetadata: { contentType: 'application/json' }, customMetadata: { snapshotMode: objectMode } };
  } } };
  return { reads: () => reads, cache, entries, env,
    async request(path = url, options = {}) {
      const result = await serveSnapshot(new Request(path, { headers: { Origin: origin }, ...options }), env, { waitUntil: p => pending.push(p) }, cache);
      // Drain the response and the queued cache write, just as the runtime does.
      const bytes = await result.arrayBuffer(); await Promise.all(pending.splice(0));
      return new Response(result.status === 304 || result.status === 204 ? null : bytes, result);
    } };
}
test('delivery shares one cached snapshot across readers, origins and query strings without changing collection time', async () => {
  const r = rig();
  const first = await r.request();
  assert.equal(first.status, 200); assert.equal(first.headers.get('X-Results-Cache'), 'MISS');
  assert.equal(first.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(first.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
  assert.equal(await first.text(), body);
  const second = await r.request(url + '?anything=ignored', { headers: { Origin: 'http://localhost:8000' } });
  assert.equal(second.headers.get('X-Results-Cache'), 'HIT');
  assert.equal(second.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8000');
  assert.equal((await second.json()).checkedAt, '2026-11-03T21:00:00Z');
  assert.equal(r.reads(), 1);
  const conditional = await r.request(url, { headers: { Origin: origin, 'If-None-Match': 'W/"revision-a"' } });
  assert.equal(conditional.status, 304); assert.equal(await conditional.text(), '');
  assert.equal(conditional.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(await (await r.request(url, { method: 'HEAD' })).text(), '');
  assert.equal(r.reads(), 1);
});
test('delivery only exposes the latest object and supports browser preflight', async () => {
  const r = rig();
  assert.equal((await r.request(url + '/source/private')).status, 404);
  assert.equal((await r.request(url, { method: 'POST' })).status, 405);
  assert.equal((await r.request(url, { headers: { Origin: 'https://unapproved.test' } })).status, 403);
  const preflight = await r.request(url, { method: 'OPTIONS' });
  assert.equal(preflight.status, 204); assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /GET/);
  assert.equal(r.reads(), 0);
});
test('missing, mismatched, oversized or failed storage returns uncached errors, never invented returns', async () => {
  for (const options of [{ missing: true }, { throws: true }, { objectMode: 'mock' }, { size: 1_000_001 }, { mode: 'invalid' }]) {
    const r = rig(options), result = await r.request();
    assert.equal(result.status, 503); assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.equal(result.headers.get('Retry-After'), '60'); assert.equal(r.entries.size, 0);
  }
  const preview = rig({ mode: 'mock', objectMode: 'live' });
  assert.equal((await preview.request()).status, 503);
});
test('an expired cached response is never treated as a new collection', async () => {
  const r = rig(); await r.request();
  for (const [key, response] of r.entries) {
    const headers = new Headers(response.headers); headers.set('X-Results-Cached-At', String(Date.now() - 16_000));
    r.entries.set(key, new Response(await response.arrayBuffer(), { headers }));
  }
  assert.equal((await r.request()).headers.get('X-Results-Cache'), 'MISS'); assert.equal(r.reads(), 2);
});
test('actual Cloudflare runtime streams R2, caches, expires after 15 seconds and exposes a replacement', { timeout: 30_000 }, async () => {
  const bundle = await build({ entryPoints: [new URL('../delivery/worker.mjs', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', write: false });
  const mf = new Miniflare(convertV4MiniflareOptions({ cf: false, telemetry: { enabled: false }, modules: true,
    script: bundle.outputFiles[0].text,
    compatibilityDate: '2026-11-03', r2Buckets: ['RESULTS'], bindings: { SNAPSHOT_MODE: 'live' } }));
  try {
    const bucket = await mf.getR2Bucket('RESULTS');
    const metadata = { httpMetadata: { contentType: 'application/json' }, customMetadata: { snapshotMode: 'live' } };
    await bucket.put(SNAPSHOT_PATH.slice(1), body, metadata);
    const first = await mf.dispatchFetch(url, { headers: { Origin: origin } });
    assert.equal(first.headers.get('X-Results-Cache'), 'MISS'); assert.equal(await first.text(), body);
    await delay(200);
    await bucket.put(SNAPSHOT_PATH.slice(1), body.replace('121', '81'), metadata);
    const cached = await mf.dispatchFetch(url);
    assert.equal(cached.headers.get('X-Results-Cache'), 'HIT'); assert.equal((await cached.json()).votes, 121);
    await delay(15_100);
    const replacement = await mf.dispatchFetch(url);
    assert.equal(replacement.headers.get('X-Results-Cache'), 'MISS'); assert.equal((await replacement.json()).votes, 81);
    await mf.dispatchFetch('https://delivery.test/ri-2026-general/source/secret.json').then(r => assert.equal(r.status, 404));
  } finally { await mf.dispose(); }
});
