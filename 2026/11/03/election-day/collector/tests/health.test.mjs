import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { checkDelivery, snapshotHealth, SNAPSHOT_URL, READER_ORIGIN, STALE_MS } from '../src/health.mjs';
import { normalizeBoeExport } from '../../results/boe-adapter.mjs';
import { original, manifest } from './helpers.mjs';

const time = Date.parse('2026-11-04T02:00:00Z');
const snapshot = () => normalizeBoeExport(original, manifest, { publishedAt: new Date(time).toISOString() });
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': READER_ORIGIN };
const options = extra => ({ now: () => time, startsAt: '2026-11-04T01:00:00Z', ...extra });

test('monitor uses verification freshness even when source results are old or unchanged', () => {
  const data = snapshot();
  assert.equal(snapshotHealth(data, time + STALE_MS).phase, 'healthy');
  assert.throws(() => snapshotHealth(data, time + STALE_MS + 1), /over three minutes/);
  data.checkedAt = data.publishedAt = new Date(time + 120_000).toISOString();
  assert.throws(() => snapshotHealth(data, time), /future verification/);
});

test('intentional coverage end remains healthy without pretending that old results were rechecked', () => {
  const data = snapshot();
  data.coverageEndedAt = data.publishedAt = new Date(time + 1000).toISOString();
  const result = snapshotHealth(data, time + 86400_000);
  assert.equal(result.phase, 'ended');
  assert.equal(result.checkedAt, new Date(time).toISOString());
  data.mode = 'mock';
  assert.throws(() => snapshotHealth(data, time + 86400_000), /Unexpected data mode/);
});

test('monitor does not fetch before the start and only grants three minutes for first publication', async () => {
  let calls = 0;
  const fetcher = async () => { calls++; return new Response('not published', { status: 503 }); };
  assert.equal((await checkDelivery(options({ startsAt: new Date(time + 1000).toISOString(), fetcher }))).phase, 'scheduled');
  assert.equal(calls, 0);
  assert.equal((await checkDelivery(options({ startsAt: new Date(time - STALE_MS + 1).toISOString(), fetcher }))).phase, 'starting');
  await assert.rejects(checkDelivery(options({ startsAt: new Date(time - STALE_MS).toISOString(), fetcher })), /HTTP 503/);
  await assert.rejects(checkDelivery(options({ startsAt: 'invalid', fetcher })), /start time/);
});

test('monitor checks public delivery and browser CORS without calling the source or collector', async () => {
  const result = await checkDelivery(options({ fetcher: async (url, init) => {
    assert.equal(url, SNAPSHOT_URL);
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers.Origin, READER_ORIGIN);
    return Response.json(snapshot(), { headers });
  } }));
  assert.equal(result.phase, 'healthy');
});

test('monitor rejects redirects, malformed data, wrong mode, wrong CORS and oversized responses', async () => {
  for (const response of [
    () => new Response(null, { status: 302, headers: { Location: 'https://untrusted.test' } }),
    () => new Response('bad json', { headers }),
    () => Response.json({ ...snapshot(), mode: 'mock' }, { headers }),
    () => Response.json(snapshot()),
    () => new Response('too large', { headers: { ...headers, 'Content-Length': '1000001' } })
  ]) await assert.rejects(checkDelivery(options({ fetcher: response })));
});

test('monitor cancels a stalled delivery instead of hanging indefinitely', async () => {
  let aborted = false;
  await assert.rejects(checkDelivery(options({ timeoutMs: 10, fetcher: async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => { aborted = true; reject(init.signal.reason); }, { once: true });
  }) })), /timed out/);
  assert.equal(aborted, true);
});

test('runtime monitor protects checks and intentional test alerts with the admin credential', { timeout: 20_000 }, async () => {
  const bundle = await build({ entryPoints: [new URL('../src/health-worker.mjs', import.meta.url).pathname], bundle: true, write: false, format: 'esm', platform: 'neutral', target: 'es2022' });
  const token = 'synthetic-monitor-token-for-local-testing-only';
  const mf = new Miniflare(convertV4MiniflareOptions({ cf: false, telemetry: { enabled: false }, modules: true,
    script: bundle.outputFiles[0].text, compatibilityDate: '2026-11-03', compatibilityFlags: ['nodejs_compat'],
    bindings: { ADMIN_TOKEN: token, COLLECTION_STARTS_AT: '2099-01-01T00:00:00Z' } }));
  const auth = { Authorization: 'Bearer ' + token };
  try {
    assert.equal((await mf.dispatchFetch('https://monitor.test/admin/check')).status, 401);
    assert.equal((await mf.dispatchFetch('https://monitor.test/admin/test-alert', { method: 'POST' })).status, 401);
    assert.equal((await mf.dispatchFetch('https://monitor.test/admin/test-alert', { headers: auth })).status, 405);
    const healthy = await mf.dispatchFetch('https://monitor.test/admin/check', { headers: auth });
    assert.equal(healthy.status, 200); assert.equal((await healthy.json()).phase, 'scheduled');
    const alert = await mf.dispatchFetch('https://monitor.test/admin/test-alert', { method: 'POST', headers: auth });
    assert.equal(alert.status, 503); assert.match((await alert.json()).error, /^HERALD MONITOR TEST:/);
  } finally { await mf.dispose(); }
});
