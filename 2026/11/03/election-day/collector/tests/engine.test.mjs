import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { validateSnapshot } from '../../results/model.mjs';
import { LATEST_KEY, MAX_SOURCE_BYTES, PREFIX, readBounded } from '../src/engine.mjs';
import { rig, original, populated, NOW } from './helpers.mjs';
import { LIVE_STARTS_AT } from '../../results/schedule.mjs';

const latest = r => JSON.parse(r.bucket.values.get(LATEST_KEY).value);
test('one collection validates all three contests and publishes an atomic snapshot with its raw archive', async () => {
  const r = rig({ source: populated() });
  assert.equal((await r.engine.collect()).ok, true);
  const data = latest(r); validateSnapshot(data, { expectedMode: 'live' });
  for (const c of Object.values(data.contests)) assert.equal(c.areas[c.totalArea].total, 222);
  assert.equal(r.calls(), 1);
  assert.equal(r.bucket.puts.length, 3);
  assert.equal(r.bucket.puts.at(-1), LATEST_KEY);
  assert.equal(r.store.get('pending'), null);
  const archive = [...r.bucket.values].find(([key]) => key.includes('/source/'))[1];
  assert.equal(JSON.parse(gunzipSync(Buffer.from(archive.value))).createdAt, '2026-11-03T21:59:00Z');
  assert.match(r.bucket.values.get(LATEST_KEY).options.httpMetadata.cacheControl, /s-maxage=15/);
  assert.equal(r.bucket.values.get(LATEST_KEY).options.customMetadata.snapshotMode, 'live');
  assert.ok((await r.engine.status()).archiveBytesReserved > 0);
});
test('the persisted archive budget stops new writes without losing the last good snapshot', async () => {
  const r = rig({ source: populated(), maxArchiveBytes: 1_000_000 });
  assert.equal((await r.engine.collect()).ok, true);
  const before = latest(r), puts = r.bucket.puts.length;
  r.store.put('archiveBudget', { reservedBytes: 999_999 });
  r.advance(); r.set(populated(140, '2026-11-03T22:00:00Z'));
  const restarted = r.make();
  assert.match((await restarted.collect()).error, /storage budget/);
  assert.deepEqual(latest(r), before); assert.equal(r.bucket.puts.length, puts);
  assert.equal((await restarted.status()).archiveBytesReserved, 999_999);
});
test('pre-election zero counts remain explicitly waiting', async () => {
  const r = rig(); await r.engine.collect(); assert.equal(latest(r).status, 'waiting');
});
test('the official octet-stream content type is accepted only when the body passes full JSON validation', async () => {
  const valid = rig({ source: populated(), headers: { 'Content-Type': 'application/octet-stream' } });
  assert.equal((await valid.engine.collect()).ok, true);
  const invalid = rig({ fetchSource: async () => new Response('<html>upstream error</html>', { headers: { 'Content-Type': 'application/octet-stream' } }) });
  assert.equal((await invalid.engine.collect()).ok, false); assert.equal(invalid.bucket.values.size, 0);
});
test('conditional 304 advances checked time but preserves source time, revision and counts', async () => {
  const r = rig({ source: populated() }); await r.engine.collect(); const first = latest(r);
  r.advance(); r.set(null, 304); await r.engine.collect(); const second = latest(r);
  assert.equal(r.requests[1].init.headers.get('if-none-match'), '"source-one"');
  assert.equal(second.sourceUpdated, first.sourceUpdated); assert.equal(second.revision, first.revision);
  assert.ok(second.checkedAt > first.checkedAt); assert.deepEqual(second.contests, first.contests);
  assert.equal(r.bucket.puts.length, 4);
});
test('unchanged 200 responses update health without duplicating archives', async () => {
  const r = rig(); await r.engine.collect(); r.advance(); await r.engine.collect();
  assert.equal(r.bucket.puts.length, 4); assert.equal(r.calls(), 2);
});
test('a 304 before a validated baseline is rejected', async () => {
  const r = rig({ status: 304 }); assert.equal((await r.engine.collect()).ok, false); assert.equal(r.bucket.values.size, 0);
});
for (const [label, mutate] of [
  ['wrong election', s => { s.electionName = 'Different election'; }],
  ['new reporting grouping', s => { s.localResults.find(t => t.name === 'Providence').ballotItems.find(c => c.id === '4').ballotOptions[0].precinctResults[0].name = 'Combined (2801, 2802)'; }],
  ['nonreconciling total', s => { s.results.ballotItems.find(c => c.id === '4').ballotOptions[0].voteCount += 1; }],
  ['future source timestamp', s => { s.createdAt = '2027-01-01T00:00:00Z'; }]
]) test(label + ' leaves published results and last successful check untouched', async () => {
  const r = rig({ source: populated() }); await r.engine.collect(); const previous = r.bucket.values.get(LATEST_KEY).value;
  const bad = populated(200); mutate(bad); r.advance(); r.set(bad);
  assert.equal((await r.engine.collect()).ok, false);
  assert.equal(r.bucket.values.get(LATEST_KEY).value, previous);
  assert.equal(r.store.get('meta').failures, 1);
  assert.equal(r.store.get('meta').checkedAt, new Date(NOW).toISOString());
});
test('a newer downward correction is accepted but an older source is rejected', async () => {
  const r = rig({ source: populated() }); await r.engine.collect(); r.advance();
  r.set(populated(81, '2026-11-03T22:00:00Z')); assert.equal((await r.engine.collect()).ok, true);
  assert.equal(latest(r).contests.governor.areas.state.total, 142);
  r.advance(); r.set(populated(600, '2026-11-03T21:30:00Z'));
  assert.equal((await r.engine.collect()).ok, false); assert.equal(latest(r).contests.governor.areas.state.total, 142);
});
test('an R2 failure leaves a durable pending snapshot; a replacement instance resumes without refetching', async () => {
  const r = rig({ source: populated() }); await r.engine.collect(); const first = latest(r);
  r.advance(); r.set(populated(241, '2026-11-03T22:00:00Z'));
  r.bucket.fail = key => key === LATEST_KEY;
  assert.equal((await r.engine.collect()).ok, false);
  assert.equal(latest(r).revision, first.revision); assert.ok(r.store.get('pending'));
  r.bucket.fail = null; r.advance();
  assert.equal((await r.make().collect()).ok, true); assert.equal(r.calls(), 2);
  assert.equal(latest(r).contests.governor.areas.state.total, 462); assert.equal(r.store.get('pending'), null);
});
test('a crash after the R2 write safely republishes the same pending revision', async () => {
  const r = rig(); r.store.failCommit = true; assert.equal((await r.engine.collect()).ok, false);
  const first = latest(r); assert.ok(r.store.get('pending')); r.advance();
  assert.equal((await r.make().collect()).ok, true); assert.equal(latest(r).revision, first.revision); assert.equal(r.calls(), 1);
});
test('raw archive failure cannot publish unauditable new results', async () => {
  const r = rig(); r.bucket.fail = key => key.includes('/source/');
  assert.equal((await r.engine.collect()).ok, false); assert.equal(r.bucket.values.has(LATEST_KEY), false);
});
test('overlapping collection requests coalesce and an evicted instance respects the one-minute limit', async () => {
  const r = rig(); const results = await Promise.all(Array.from({ length: 12 }, () => r.engine.collect()));
  assert.ok(results.every(x => x.ok)); assert.equal(r.calls(), 1);
  assert.equal((await r.make().collect()).skipped, 'already-checked-this-minute');
});
test('alarms persist, resume after instance replacement, and stop cancels future collection', async () => {
  const r = rig(); await r.engine.start(); assert.equal(r.store.alarm, NOW + 1000);
  r.advance(1001); await r.engine.collect({ alarm: true });
  assert.equal(r.store.alarm, r.now() + 60_000);
  r.advance(); await r.make().collect({ alarm: true }); assert.equal(r.calls(), 2);
  await r.engine.stop(); assert.equal(r.store.alarm, null);
  r.advance(); assert.equal((await r.engine.collect({ alarm: true })).skipped, 'stopped'); assert.equal(r.calls(), 2);
});
test('watchdog repairs a missing alarm but does not restart a stopped collector', async () => {
  const r = rig(); await r.engine.start(); r.store.alarm = null; await r.make().watchdog(); assert.ok(r.store.alarm);
  await r.engine.stop(); await r.engine.watchdog(); assert.equal(r.store.alarm, null);
});

test('arming before polls close survives replacement and cannot fetch before the exact start boundary', async () => {
  const startAt = Date.parse(LIVE_STARTS_AT), r = rig({ startAt });
  const status = await r.engine.start();
  assert.equal(status.phase, 'scheduled'); assert.equal(status.stale, false);
  assert.equal(status.nextAlarm, startAt);
  assert.equal((await r.engine.collect()).skipped, 'before-start'); assert.equal(r.calls(), 0);
  r.store.alarm = null; await r.make().watchdog(); assert.equal(r.store.alarm, startAt);
  r.advance(startAt - r.now() - 1);
  assert.equal((await r.make().collect({ alarm: true })).skipped, 'before-start'); assert.equal(r.calls(), 0);
  r.advance(1); await r.make().collect({ alarm: true }); assert.equal(r.calls(), 1);
  assert.equal(r.store.alarm, startAt + 60_000);
  await r.engine.stop(); r.advance(); await r.make().watchdog(); assert.equal(r.store.alarm, null);
});

test('late activation starts immediately, while invalid or reversed windows fail closed', async () => {
  const r = rig({ startAt: NOW - 1000 });
  assert.equal((await r.engine.start()).nextAlarm, NOW + 1000);
  for (const window of [{ startAt: NaN }, { startAt: NOW + 2000, stopAt: NOW + 1000 }]) {
    const invalid = rig(window); await assert.rejects(invalid.engine.start());
    await invalid.engine.collect(); assert.equal(invalid.calls(), 0); assert.equal(invalid.store.alarm, null);
  }
});
test('failed checks back off, honor Retry-After, and never refresh a stale publication', async () => {
  const r = rig(); await r.engine.start(); await r.engine.collect();
  r.advance(); r.set({}, 429, { 'Retry-After': '300' });
  assert.equal((await r.engine.collect({ alarm: true })).ok, false);
  assert.equal(r.store.alarm, r.now() + 300_000); r.advance(181_000);
  assert.equal((await r.engine.status()).stale, true);
  assert.equal(latest(r).checkedAt, new Date(NOW).toISOString());
});
test('timeouts cancel the source request and do not publish', async () => {
  let aborted = false;
  const r = rig({ timeoutMs: 15, fetchSource: (_, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => { aborted = true; reject(init.signal.reason); })) });
  assert.equal((await r.engine.collect()).ok, false); assert.equal(aborted, true); assert.equal(r.bucket.values.size, 0);
});
test('HTML, broken JSON and invalid UTF-8 cannot enter the live publication', async () => {
  for (const response of [
    new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } }),
    new Response('{broken', { headers: { 'Content-Type': 'application/json' } }),
    new Response(new Uint8Array([255, 254]), { headers: { 'Content-Type': 'application/json' } })
  ]) {
    const r = rig({ fetchSource: async () => response }); assert.equal((await r.engine.collect()).ok, false); assert.equal(r.bucket.values.size, 0);
  }
});
test('both declared and streamed oversized responses are cancelled', async () => {
  await assert.rejects(readBounded(new Response('x', { headers: { 'Content-Length': String(MAX_SOURCE_BYTES + 1) } })), /size limit/);
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(30)); }, cancel() { cancelled = true; } });
  await assert.rejects(readBounded(new Response(stream), 40), /size limit/); assert.equal(cancelled, true);
});
test('disabled or expired collection cannot be started or fetch results', async () => {
  for (const options of [{ allowCollection: false }, { stopAt: NOW - 1 }, { stopAt: NaN }]) {
    const r = rig(options); await assert.rejects(r.engine.start()); await r.engine.collect(); assert.equal(r.calls(), 0); assert.equal(r.store.alarm, null);
  }
});

test('a redirect is rejected instead of following an unreviewed source', async () => {
  const r = rig({ fetchSource: async (_, init) => {
    assert.equal(init.redirect, 'manual');
    return new Response(null, { status: 302, headers: { Location: 'https://unreviewed.example/results' } });
  } });
  assert.equal((await r.engine.collect()).ok, false);
  assert.equal(r.bucket.values.size, 0);
});

test('stop during collection lets the current publication finish without leaving another alarm', async () => {
  let release;
  const r = rig({ fetchSource: () => new Promise(resolve => { release = resolve; }) });
  await r.engine.start();
  const collection = r.engine.collect();
  while (!release) await new Promise(resolve => setTimeout(resolve, 1));
  const stopped = r.engine.stop();
  release(new Response(JSON.stringify(original), { headers: { 'Content-Type': 'application/json' } }));
  assert.equal((await collection).ok, true);
  assert.equal((await stopped).running, false);
  assert.equal(r.store.alarm, null);
});

test('ending coverage publishes an explicit archive without changing totals, certification or verification time', async () => {
  const r = rig({ source: populated() });
  await r.engine.start(); await r.engine.collect();
  const first = latest(r), successes = (await r.engine.status()).successes;
  r.advance();
  const status = await r.engine.finish(), ended = latest(r);
  validateSnapshot(ended, { previous: first, expectedMode: 'live' });
  assert.equal(status.phase, 'ended'); assert.equal(status.running, false); assert.equal(status.nextAlarm, null);
  assert.equal(status.successes, successes, 'Publishing coverage metadata is not a source check');
  assert.equal(ended.coverageEndedAt, new Date(r.now()).toISOString());
  assert.equal(ended.checkedAt, first.checkedAt); assert.equal(ended.sourceUpdated, first.sourceUpdated);
  assert.equal(ended.status, 'unofficial'); assert.equal(ended.revision, first.revision);
  assert.deepEqual(ended.contests, first.contests);
  const writes = r.bucket.puts.length;
  await r.make().finish(); assert.equal(r.bucket.puts.length, writes, 'Repeated finish is idempotent');
  r.advance(86_400_000); await r.make().watchdog();
  assert.equal((await r.engine.collect()).skipped, 'coverage-ended'); assert.equal(r.calls(), 1);
  assert.equal((await r.engine.status()).stale, false); assert.equal(r.store.alarm, null);
});

for (const failure of ['R2 write', 'SQLite commit']) test(`end-of-coverage survives a failed ${failure} and instance replacement`, async () => {
  const r = rig({ source: populated() });
  await r.engine.collect(); const first = latest(r); r.advance();
  if (failure === 'R2 write') r.bucket.fail = key => key === LATEST_KEY;
  else r.store.failCommit = true;
  await assert.rejects(r.engine.finish(), /Injected/);
  const pending = r.store.get('pendingCoverage');
  assert.ok(pending); assert.equal((await r.engine.status()).phase, 'ending');
  assert.equal(r.store.alarm, r.now() + 60_000);
  await assert.rejects(r.engine.start(), /end-of-coverage/);
  if (failure === 'R2 write') assert.deepEqual(latest(r), first);
  r.bucket.fail = null; r.advance();
  const status = await r.make().collect({ alarm: true });
  assert.equal(status.phase, 'ended'); assert.equal(status.coveragePending, false);
  assert.equal(latest(r).coverageEndedAt, pending.coverageEndedAt);
  assert.equal(latest(r).checkedAt, first.checkedAt); assert.equal(r.calls(), 1);
  assert.equal(r.store.alarm, null);
});

test('ending coverage drains an in-flight collection and prevents a new check from overwriting the archive', async () => {
  let release;
  const r = rig({ fetchSource: () => new Promise(resolve => { release = resolve; }) });
  await r.engine.start();
  const collection = r.engine.collect();
  while (!release) await new Promise(resolve => setTimeout(resolve, 1));
  const ending = r.engine.finish();
  await assert.rejects(r.engine.start(), /end-of-coverage/);
  release(Response.json(populated()));
  assert.equal((await collection).ok, true);
  assert.equal((await ending).phase, 'ended');
  assert.equal(latest(r).contests.governor.areas.state.total, 222);
  assert.ok(latest(r).coverageEndedAt);
  assert.equal((await r.make().collect()).skipped, 'coverage-ended');
  assert.equal(r.store.alarm, null);
});

test('ending coverage needs a verified snapshot and cannot fabricate a last-verified time', async () => {
  const r = rig();
  await assert.rejects(r.engine.finish(), /verified snapshot/);
  assert.equal(r.bucket.values.size, 0); assert.equal(r.calls(), 0);
  assert.equal((await r.engine.status()).coverageEndedAt, undefined);
});

for (const responseStatus of [200, 304]) test(`explicit restart reopens coverage on an unchanged ${responseStatus} response`, async () => {
  const r = rig({ source: populated() });
  await r.engine.collect(); await r.engine.finish();
  const ended = latest(r);
  r.advance(); r.set(responseStatus === 304 ? null : populated(), responseStatus);
  await r.make().start();
  assert.equal((await r.make().collect()).ok, true);
  assert.equal(latest(r).coverageEndedAt, undefined);
  assert.equal((await r.engine.status()).coverageEndedAt, null);
  assert.equal((await r.engine.status()).phase, 'running');
  assert.ok(latest(r).checkedAt > ended.checkedAt);
  assert.deepEqual(latest(r).contests, ended.contests);
});
