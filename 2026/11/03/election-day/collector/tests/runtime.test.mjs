import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { populated, original } from './helpers.mjs';
import { LATEST_KEY, SOURCE_URL } from '../src/engine.mjs';
import { validateSnapshot } from '../../results/model.mjs';

const bundled = await build({ entryPoints: [new URL('../src/worker.mjs', import.meta.url).pathname], bundle: true, write: false, format: 'esm', platform: 'neutral', external: ['cloudflare:workers'], target: 'es2022' });
const script = bundled.outputFiles[0].text;
const token = 'only-a-test-token-never-a-deployed-credential';
const auth = { Authorization: 'Bearer ' + token };
function options(path, outboundService, startsAt = '2026-01-01T00:00:00Z') {
  return convertV4MiniflareOptions({ cf: false, telemetry: { enabled: false }, name: 'herald-collector-test', modules: true, script,
    compatibilityDate: '2026-11-03', compatibilityFlags: ['nodejs_compat'],
    durableObjects: { COLLECTOR: { className: 'ElectionCollector', useSQLite: true } },
    r2Buckets: ['RESULTS'], resourcePersistencePath: path,
    bindings: { ADMIN_TOKEN: token, COLLECTION_ENABLED: 'true', COLLECTION_STARTS_AT: startsAt, COLLECTION_ENDS_AT: '2099-01-01T00:00:00Z' }, outboundService });
}
const request = (mf, action, init = {}) => mf.dispatchFetch('https://collector.test/admin/' + action, { method: action === 'status' ? 'GET' : 'POST', headers: auth, ...init });
async function waitUntil(check, limit = 15_000) {
  const end = Date.now() + limit;
  while (Date.now() < end) { const value = await check(); if (value) return value; await delay(200); }
  throw new Error('Runtime condition did not complete within ' + limit + ' ms');
}

test('workerd runs the real Worker, SQLite object, authentication and R2 publication; durable state survives restart', { timeout: 40_000 }, async () => {
  const path = await mkdtemp(join(tmpdir(), 'herald-runtime-'));
  let calls = 0, mf;
  const outbound = async req => { assert.equal(req.url, SOURCE_URL); calls++; return new Response(JSON.stringify(original), { headers: { 'Content-Type': 'application/json', ETag: '"zero"' } }); };
  try {
    mf = new Miniflare(options(path, outbound));
    assert.equal((await request(mf, 'status', { headers: {} })).status, 401);
    assert.equal((await request(mf, 'start', { headers: { Authorization: 'Bearer wrong-token' } })).status, 401);
    assert.equal((await request(mf, 'check', { method: 'GET' })).status, 405);
    const empty = await mf.dispatchFetch('https://collector.test/latest.json');
    assert.equal(empty.status, 404); await empty.text();
    assert.equal(calls, 0);
    const response = await request(mf, 'check');
    assert.equal(response.status, 200, await response.text());
    assert.equal(calls, 1);
    const bucket = await mf.getR2Bucket('RESULTS');
    const object = await bucket.get(LATEST_KEY), snapshot = await object.json();
    validateSnapshot(snapshot, { expectedMode: 'live' });
    assert.equal(snapshot.status, 'waiting');
    assert.equal((await bucket.list()).objects.length, 3);
    const before = await (await request(mf, 'status')).json();
    assert.equal(before.successes, 1);
    assert.equal(before.pending, false);
    for (let i = 0; i < 10; i++) await bucket.get(LATEST_KEY);
    const origin = 'https://projects.browndailyherald.com';
    const pub = await mf.dispatchFetch('https://collector.test/latest.json', { headers: { Origin: origin } });
    assert.equal(pub.status, 200);
    assert.equal(pub.headers.get('access-control-allow-origin'), origin);
    assert.match(pub.headers.get('cache-control'), /s-maxage=15/);
    assert.equal((await pub.json()).revision, snapshot.revision);
    const etag = pub.headers.get('etag');
    const revalidated = await mf.dispatchFetch('https://collector.test/latest.json', { headers: { Origin: origin, 'If-None-Match': etag } });
    assert.equal(revalidated.status, 304); await revalidated.arrayBuffer();
    const foreign = await mf.dispatchFetch('https://collector.test/latest.json', { headers: { Origin: 'https://evil.example' } });
    assert.equal(foreign.headers.get('access-control-allow-origin'), null); await foreign.arrayBuffer();
    assert.equal((await mf.dispatchFetch('https://collector.test/latest.json', { method: 'POST' })).status, 405);
    assert.equal(calls, 1, 'Reading the shared file must not fetch BOE again');
    await mf.dispose(); mf = new Miniflare(options(path, outbound));
    const after = await (await request(mf, 'status')).json();
    assert.equal(after.revision, before.revision);
    assert.equal((await (await request(mf, 'check')).json()).skipped, 'already-checked-this-minute');
    assert.equal(calls, 1);
  } finally { await mf?.dispose(); await rm(path, { recursive: true, force: true }); }
});

test('real one-minute alarms publish results, accept 304, apply a correction and stop cleanly', { timeout: 160_000 }, async () => {
  const path = await mkdtemp(join(tmpdir(), 'herald-alarm-'));
  let calls = 0, mf;
  const sourceTime = new Date(Date.now() - 60_000).toISOString();
  const callsAt = [];
  const outbound = async req => {
    assert.equal(req.url, SOURCE_URL); calls++; callsAt.push(Date.now());
    if (calls === 2) {
      assert.equal(req.headers.get('if-none-match'), '"first"');
      return new Response(null, { status: 304 });
    }
    return new Response(JSON.stringify(populated(calls === 1 ? 121 : 81, sourceTime)), { headers: { 'Content-Type': 'application/json', ETag: calls === 1 ? '"first"' : '"corrected"' } });
  };
  try {
    mf = new Miniflare(options(path, outbound));
    const bucket = await mf.getR2Bucket('RESULTS');
    assert.equal((await request(mf, 'start')).status, 200);
    await waitUntil(async () => (await (await request(mf, 'status')).json()).successes === 1);
    const first = await (await bucket.get(LATEST_KEY)).json();
    assert.equal(first.contests.governor.areas.state.total, 222);
    console.log('Runtime alarm 1: populated source published.');
    await waitUntil(async () => (await (await request(mf, 'status')).json()).successes >= 2, 70_000);
    const second = await (await bucket.get(LATEST_KEY)).json();
    assert.equal(second.revision, first.revision); assert.ok(second.checkedAt > first.checkedAt);
    console.log('Runtime alarm 2: conditional 304 refreshed collection health.');
    await waitUntil(async () => (await (await request(mf, 'status')).json()).successes >= 3, 70_000);
    const third = await (await bucket.get(LATEST_KEY)).json();
    assert.equal(third.contests.governor.areas.state.total, 142);
    assert.notEqual(third.revision, first.revision);
    assert.ok(callsAt[1] - callsAt[0] >= 59_500); assert.ok(callsAt[2] - callsAt[1] >= 59_500);
    assert.equal(calls, 3);
    const stopped = await (await request(mf, 'stop')).json();
    assert.equal(stopped.running, false); assert.equal(stopped.nextAlarm, null);
    console.log('Runtime alarm 3: downward correction published; schedule stopped.');
  } finally { await mf?.dispose(); await rm(path, { recursive: true, force: true }); }
});

test('workerd arms a future start without fetching early and starts automatically at the boundary', { timeout: 25_000 }, async () => {
  const path = await mkdtemp(join(tmpdir(), 'herald-start-'));
  let mf, firstCall = null;
  const startsAt = new Date(Date.now() + 5000).toISOString();
  try {
    mf = new Miniflare(options(path, async () => {
      firstCall = Date.now();
      return Response.json(original);
    }, startsAt));
    const armed = await (await request(mf, 'start')).json();
    assert.equal(armed.phase, 'scheduled'); assert.equal(armed.nextAlarm, Date.parse(startsAt));
    assert.equal((await (await request(mf, 'check')).json()).skipped, 'before-start');
    assert.equal(firstCall, null);
    await waitUntil(async () => (await (await request(mf, 'status')).json()).successes === 1);
    assert.ok(firstCall >= Date.parse(startsAt));
    assert.equal((await (await request(mf, 'stop')).json()).nextAlarm, null);
  } finally { await mf?.dispose(); await rm(path, { recursive: true, force: true }); }
});
