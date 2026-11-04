import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { validateSnapshot } from '../results/model.mjs';
import { normalizeBoeExport, geographicCodes } from '../results/boe-adapter.mjs';
import { makeMockBase, mockAtStep } from '../results/mock.mjs';
import { createFeed, readSnapshotResponse } from '../results/feed.mjs';
import { CONFIG, previewsAllowed } from '../results/config.mjs';
import { leadOf, leaderColors } from '../results/map-colors.mjs';

const file = name => JSON.parse(readFileSync(new URL('../data/results/' + name + '.json', import.meta.url), 'utf8'));
const sourceFile = name => JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/' + name + '-export.json.gz', import.meta.url))));
const sourceGeneral = sourceFile('general');
const sourcePrimary = sourceFile('primary');
const generalManifest = file('general-manifest');
const primaryManifest = file('primary-manifest');
const waiting = file('waiting');
const primary = file('primary-2026');
const mock = file('mock');
const publishedAt = '2026-11-03T22:00:00.000Z';
const fixedNow = Date.parse(publishedAt);
const clone = value => structuredClone(value);
const options = { publishedAt };
const governorAt = (source, town = 'Providence') => source.localResults.find(item => item.name === town).ballotItems.find(contest => contest.id === '4');
const areaKinds = (snapshot, contest, kind) => Object.values(snapshot.contests[contest].areas).filter(area => area.kind === kind);
const sum = values => values.reduce((a, b) => a + b, 0);
function votesFor(snapshot, contest, name) {
  const c = snapshot.contests[contest];
  const index = c.choices.findIndex(choice => choice.name === name);
  assert.notEqual(index, -1, `Missing expected candidate ${name}`);
  return c.areas[c.totalArea].votes[index];
}

test('frozen official general source reconciles all three contests and the waiting fixture contains no results', () => {
  const normalized = normalizeBoeExport(sourceGeneral, generalManifest, options);
  assert.equal(normalized.electionId, 'ri-2026-general');
  assert.equal(areaKinds(normalized, 'governor', 'town').length, 39);
  assert.equal(areaKinds(normalized, 'governor', 'precinct').length, 414);
  assert.equal(areaKinds(normalized, 'governor', 'unmapped').length, 40);
  assert.equal(areaKinds(normalized, 'mayor', 'precinct').length, 82);
  assert.equal(areaKinds(normalized, 'question7', 'precinct').length, 82);
  for (const contest of Object.values(normalized.contests)) {
    assert.equal(contest.available, true);
    assert.equal(contest.areas[contest.totalArea].total, 0);
  }
  assert.equal(validateSnapshot(waiting, { expectedMode: 'live' }), waiting);
  assert.equal(waiting.status, 'waiting');
  for (const contest of Object.values(waiting.contests)) for (const area of Object.values(contest.areas)) assert.equal(area.total, 0);
});

test('historical results match independently recorded official candidate totals', () => {
  const normalized = normalizeBoeExport(sourcePrimary, primaryManifest, { ...options, mode: 'historical' });
  assert.equal(votesFor(normalized, 'governor', 'Helena Buonanno Foulkes'), 81_314);
  assert.equal(votesFor(normalized, 'governor', 'Daniel J. McKee'), 48_872);
  assert.equal(votesFor(normalized, 'mayor', 'David Morales'), 14_299);
  assert.equal(votesFor(normalized, 'mayor', 'Brett P. Smiley'), 12_961);
  assert.equal(normalized.contests.governor.areas.state.total, 130_186);
  assert.equal(normalized.contests.mayor.areas['town:Providence'].total, 27_260);
  assert.equal(normalized.contests.question7.available, false);
  assert.deepEqual(normalized.contests.question7.areas, {});
  for (const id of ['governor', 'mayor']) assert.deepEqual(normalized.contests[id].areas, primary.contests[id].areas);
});

test('combined historical reporting units cover 414 distinct polygons without dividing or double-counting votes', () => {
  const units = areaKinds(primary, 'governor', 'precinct');
  const ids = units.flatMap(area => area.geometryIds);
  assert.equal(ids.length, 414);
  assert.equal(new Set(ids).size, 414);
  assert.equal(units.length, 358);
  const barrington = primary.contests.governor.areas['unit:0101+0102+0103'];
  assert.deepEqual(barrington.geometryIds, ['precinct:0101', 'precinct:0102', 'precinct:0103']);
  assert.deepEqual(barrington.votes, [1_289, 387]);
  for (const id of barrington.geometryIds) assert.equal(primary.contests.governor.areas[id], undefined, 'A combined unit must not also appear as individual results');
  for (const town of ['Central Falls', 'Cumberland', 'Lincoln']) {
    assert.equal(areaKinds(primary, 'governor', 'ward').some(area => area.town === town), false, `${town} has units crossing wards`);
    assert.match(primary.contests.governor.areas['town:' + town].notice, /cross ward/);
  }
  assert.equal(areaKinds(primary, 'governor', 'ward').filter(area => area.town === 'Providence').length, 15);
});

test('public precinct codes, rather than school names or reusable source IDs, identify reporting groups', () => {
  assert.deepEqual(geographicCodes('A school (0103, 0101, 0102)'), ['0101', '0102', '0103']);
  assert.deepEqual(geographicCodes('PROVIDENCE LIMITED (2800)'), []);
  assert.throws(() => geographicCodes('A school (0101, 0101)'), /Unknown precinct label/);
  assert.throws(() => geographicCodes('A school'), /Unknown precinct label/);
});

for (const [name, mutate, expected] of [
  ['wrong source election', source => { source.electionDate = '2024-11-05'; }, /Wrong source election/],
  ['missing candidate', source => { governorAt(source).ballotOptions.pop(); }, /Choice coverage/],
  ['duplicate candidate', source => { const c = governorAt(source); c.ballotOptions.push(clone(c.ballotOptions[0])); }, /Duplicate choices/],
  ['changed candidate identity', source => { governorAt(source).ballotOptions[0].name = 'Unexpected candidate'; }, /Changed candidate identity/],
  ['unknown precinct code', source => { governorAt(source).ballotOptions[0].precinctResults[0].name = 'Unknown precinct (9999)'; }, /Missing reporting unit|coverage/],
  ['missing reporting unit', source => { governorAt(source).ballotOptions[0].precinctResults.pop(); }, /Reporting unit coverage/],
  ['duplicate reporting unit', source => { const rows = governorAt(source).ballotOptions[0].precinctResults; rows.push(clone(rows[0])); }, /Duplicate reporting units/],
  ['negative votes', source => { governorAt(source).ballotOptions[0].precinctResults[0].voteCount = -1; }, /Invalid source vote count/],
  ['fractional votes', source => { governorAt(source).ballotOptions[0].precinctResults[0].voteCount = 0.5; }, /Invalid source vote count/],
  ['unsafe integer votes', source => { governorAt(source).ballotOptions[0].precinctResults[0].voteCount = Number.MAX_SAFE_INTEGER + 1; }, /Invalid source vote count/],
  ['inconsistent method totals', source => { governorAt(source).ballotOptions[0].precinctResults[0].groupResults[0].voteCount = 1; }, /Source voting method mismatch/],
  ['unknown voting method', source => { governorAt(source).ballotOptions[0].groupResults[0].groupName = 'Unrecognized method'; }, /Invalid source vote count/],
  ['unknown reporting status', source => { governorAt(source).ballotOptions[0].precinctResults[0].reportingStatus = 'Maybe reported'; }, /Unknown reporting status/],
  ['missing municipality', source => { source.localResults = source.localResults.filter(town => town.name !== 'Warwick'); }, /Missing or duplicate source contest/],
]) {
  test(`adapter rejects ${name}`, () => {
    const source = clone(sourceGeneral); mutate(source);
    assert.throws(() => normalizeBoeExport(source, generalManifest, options), expected);
  });
}

test('adapter rejects a locally consistent precinct change that does not reconcile statewide', () => {
  const source = clone(sourceGeneral), choice = governorAt(source).ballotOptions[0], precinct = choice.precinctResults[0];
  choice.voteCount = precinct.voteCount = 1;
  choice.groupResults.find(method => method.groupName === 'Election Day').voteCount = 1;
  precinct.groupResults.find(method => method.groupName === 'Election Day').voteCount = 1;
  assert.throws(() => normalizeBoeExport(source, generalManifest, options), /State\/municipality totals/);
});

test('adapter rejects an older source snapshot even if its shape and totals are otherwise valid', () => {
  const previous = normalizeBoeExport(sourceGeneral, generalManifest, options);
  const older = clone(sourceGeneral); older.createdAt = '2026-10-29T00:00:00Z';
  assert.throws(() => normalizeBoeExport(older, generalManifest, { ...options, previous }), /Older source snapshot/);
});

test('normalized data rejects negative counts, impossible method sums, overlapping geographic joins and older publication', () => {
  const negative = clone(mock); negative.contests.governor.areas.state.votes[0] = -1;
  assert.throws(() => validateSnapshot(negative), /Invalid vote count/);
  const badMethod = clone(mock); badMethod.contests.mayor.areas['precinct:2801'].methods.mail[0] += 1;
  assert.throws(() => validateSnapshot(badMethod), /Voting method total mismatch/);
  const overlap = clone(mock); overlap.contests.mayor.areas['precinct:2802'].geometryIds = ['precinct:2801'];
  assert.throws(() => validateSnapshot(overlap), /Overlapping reporting units/);
  const older = clone(mock); older.publishedAt = '2000-01-01T00:00:00Z';
  assert.throws(() => validateSnapshot(older, { previous: mock }), /Older publication/);
});

for (const parentId of ['town:Providence', 'ward:Providence:1', 'state']) {
  test(`normalized voting methods in ${parentId} reconcile with child reporting units`, () => {
    const altered = clone(mock);
    const parent = altered.contests.governor.areas[parentId];
    assert.ok(parent.methods.early[0] > 0);
    // Preserve every candidate's total, but move a vote between methods only
    // in the parent. The source methods of its children remain unchanged.
    parent.methods.early[0] -= 1;
    parent.methods.mail[0] += 1;
    assert.throws(() => validateSnapshot(altered), /method/i);
  });
}

test('mock progress reconciles methods and all geographic totals, including a legitimate downward correction', () => {
  const base = makeMockBase(waiting);
  assert.deepEqual(base.contests, mock.contests);
  const earlier = mockAtStep(base, 3, { now: fixedNow });
  const later = mockAtStep(base, 12, { now: fixedNow + 60_000 });
  assert.ok(later.contests.governor.areas.state.total > earlier.contests.governor.areas.state.total);
  for (const c of Object.values(later.contests)) {
    const root = c.areas[c.totalArea];
    assert.equal(root.reporting.reported, root.reporting.expected);
    assert.equal(root.status, 'reported');
    assert.equal(root.total, sum(root.votes));
  }
  const corrected = mockAtStep(base, 12, { correction: true, now: fixedNow + 120_000 });
  assert.equal(corrected.contests.governor.areas.state.total, later.contests.governor.areas.state.total - 12);
  assert.equal(corrected.contests.governor.areas['precinct:2801'].votes[0], later.contests.governor.areas['precinct:2801'].votes[0] - 12);
  assert.equal(validateSnapshot(corrected, { previous: later, expectedMode: 'mock' }), corrected);
  assert.throws(() => validateSnapshot(corrected, { expectedMode: 'live' }), /Unexpected data mode/);
});

test('response reader accepts valid JSON and rejects HTTP errors, bad JSON and invalid UTF-8', async () => {
  assert.deepEqual(await readSnapshotResponse(Response.json({ revision: 'one' })), { revision: 'one' });
  await assert.rejects(() => readSnapshotResponse(new Response('down', { status: 503 })), /HTTP 503/);
  await assert.rejects(() => readSnapshotResponse(new Response('{broken}')), SyntaxError);
  await assert.rejects(() => readSnapshotResponse(new Response(new Uint8Array([255]))), TypeError);
  await assert.rejects(() => readSnapshotResponse(new Response(null)), /Empty results response/);
});

test('response size limit is enforced both before downloading and during streaming', async () => {
  await assert.rejects(() => readSnapshotResponse(new Response('{}', { headers: { 'Content-Length': '200' } }), 10), /too large/);
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(6)); controller.enqueue(new Uint8Array(6)); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(() => readSnapshotResponse(new Response(stream), 10), /too large/);
  assert.equal(cancelled, true);
});

class Visibility extends EventTarget {
  hidden = false;
  setHidden(value) { this.hidden = value; this.dispatchEvent(new Event('visibilitychange')); }
}
function fixtureFetch(url) {
  const value = url === CONFIG.fixtureUrls.mock ? mock : url === CONFIG.fixtureUrls.historical ? primary : waiting;
  return Promise.resolve(Response.json(value));
}
function harness(t, overrides = {}) {
  const snapshots = [], statuses = [], documentRef = overrides.documentRef || new Visibility();
  const feed = createFeed({ onSnapshot: snapshot => snapshots.push(snapshot), onStatus: status => statuses.push(status),
    now: () => fixedNow, fetchImpl: fixtureFetch, storage: null, documentRef, ...overrides });
  t.after(() => feed.stop());
  return { feed, snapshots, statuses, documentRef };
}

test('mock feed retains the exact last good snapshot during delay, failure and malformed updates', async t => {
  let time = fixedNow;
  const { feed, snapshots, statuses } = harness(t, { mode: 'mock', allowPreview: true, now: () => time });
  await feed.start();
  assert.equal(snapshots.length, 1);
  const first = snapshots[0];
  for (const scenario of ['delayed', 'failure', 'malformed']) {
    time += 60_000; await feed.setScenario(scenario);
    assert.equal(snapshots.length, 1, `${scenario} must not replace results`);
    assert.equal(snapshots.at(-1), first);
    assert.equal(statuses.at(-1).kind, 'stale');
  }
  time += 60_000; await feed.setScenario('normal');
  assert.equal(snapshots.length, 2);
  assert.equal(statuses.at(-1).kind, 'mock');
  const beforeCorrection = snapshots.at(-1);
  time += 60_000; await feed.setScenario('correction');
  assert.equal(snapshots.length, 3);
  assert.equal(snapshots.at(-1).contests.governor.areas.state.total, beforeCorrection.contests.governor.areas.state.total - 12);
  assert.match(statuses.at(-1).message, /downward correction/);
});

test('late results from an abandoned mode cannot overwrite the current historical view', async t => {
  let resolveWaiting;
  const requests = [];
  const { feed, snapshots } = harness(t, {
    allowPreview: true,
    fetchImpl(url) {
      requests.push(url);
      if (url === CONFIG.fixtureUrls.waiting) return new Promise(resolve => { resolveWaiting = resolve; });
      return fixtureFetch(url);
    },
  });
  const pendingStart = feed.start();
  await feed.setMode('historical');
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].mode, 'historical');
  resolveWaiting(Response.json(waiting));
  await pendingStart;
  assert.equal(snapshots.length, 1);
  assert.deepEqual(requests, [CONFIG.fixtureUrls.waiting, CONFIG.fixtureUrls.historical]);
});

test('a live feed rejects a cached mock snapshot and keeps valid results if the next response is malformed', async t => {
  let request = 0;
  const config = { ...CONFIG, startsAt: null, endpoint: 'https://results.example.test/current.json' };
  const { feed, snapshots, statuses, documentRef } = harness(t, {
    config,
    storage: { getItem: () => JSON.stringify(mock), setItem() {} },
    fetchImpl: async () => ++request === 1 ? Response.json(waiting) : new Response('{invalid}'),
  });
  await feed.start();
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].mode, 'live');
  documentRef.setHidden(true); documentRef.setHidden(false);
  await nextTurn();
  assert.equal(request, 2);
  assert.equal(snapshots.length, 1);
  assert.equal(statuses.at(-1).kind, 'stale');
});

test('a hidden tab stops automatic polling and refreshes immediately when visible again', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let requests = 0;
  const { feed, documentRef } = harness(t, { config: { ...CONFIG, startsAt: null, endpoint: 'https://results.example.test/current.json', pollIntervalMs: 100 },
    fetchImpl: async () => { requests++; return Response.json(waiting); } });
  await feed.start();
  assert.equal(requests, 1);
  documentRef.setHidden(true);
  t.mock.timers.tick(1000); await nextTurn();
  assert.equal(requests, 1);
  documentRef.setHidden(false); await nextTurn();
  assert.equal(requests, 2);
  feed.stop(); documentRef.setHidden(true); documentRef.setHidden(false); await nextTurn();
  assert.equal(requests, 2, 'A stopped feed must detach the visibility listener');
});

test('failed live polls back off and successful recovery restores the normal cadence', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let requests = 0;
  const { feed, snapshots, statuses } = harness(t, {
    config: { ...CONFIG, startsAt: null, endpoint: 'https://results.example.test/current.json', pollIntervalMs: 100 },
    fetchImpl: async () => { requests++; if (requests === 2 || requests === 3) throw new Error('offline'); return Response.json(waiting); },
  });
  await feed.start();
  t.mock.timers.tick(100); await nextTurn();
  assert.equal(requests, 2); assert.equal(snapshots.length, 1); assert.equal(statuses.at(-1).kind, 'stale');
  t.mock.timers.tick(199); await nextTurn(); assert.equal(requests, 2);
  t.mock.timers.tick(1); await nextTurn(); assert.equal(requests, 3);
  t.mock.timers.tick(399); await nextTurn(); assert.equal(requests, 3);
  t.mock.timers.tick(1); await nextTurn(); assert.equal(requests, 4); assert.equal(snapshots.length, 2);
  t.mock.timers.tick(100); await nextTurn(); assert.equal(requests, 5); assert.equal(snapshots.length, 3);
});

test('preview access requires an exact approved host, not a public host or lookalike', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) assert.equal(previewsAllowed(host), true);
  for (const host of ['projects.browndailyherald.com', 'personal.example.org', 'localhost.example.com', '127.0.0.1.example.com', 'localhost.', '']) assert.equal(previewsAllowed(host), false);
  assert.equal(previewsAllowed('staging.example.org', ['staging.example.org']), true);
});

test('a feed without preview permission cannot start or switch into test data', async t => {
  for (const mode of ['mock', 'historical']) {
    const requests = [];
    const { feed, snapshots } = harness(t, { mode, fetchImpl: url => { requests.push(url); return fixtureFetch(url); } });
    await feed.start();
    await feed.setMode('mock'); await feed.setMode('historical'); await feed.next();
    assert.deepEqual(requests, [CONFIG.fixtureUrls.waiting]);
    assert.equal(snapshots.length, 1);
    assert.equal(snapshots[0].mode, 'live');
    assert.equal(snapshots[0].status, 'waiting');
  }
});

test('tie colors contain exactly the tied leaders, including three-way ties', () => {
  const choices = [{ color: '#bb2233' }, { color: '#2266bb' }, { color: '#228855' }, { color: '#775599' }];
  const area = votes => ({ votes, total: votes.reduce((sum, n) => sum + n, 0) });
  assert.deepEqual(leaderColors(area([30, 30, 20, 5]), choices), ['#bb2233', '#2266bb']);
  assert.deepEqual(leaderColors(area([40, 40, 40, 7]), choices), ['#bb2233', '#2266bb', '#228855']);
  assert.deepEqual(leaderColors(area([40, 40, 40, 40]), choices), choices.map(choice => choice.color));
  assert.deepEqual(leaderColors(area([5, 30, 10, 30]), choices), ['#2266bb', '#775599']);
  assert.equal(leadOf(area([40, 20, 20, 0])).tie, false, 'A tie for second place is not a map tie');
  assert.equal(leadOf(area([0, 0, 0, 0])), null, 'No votes must stay neutral');
  assert.deepEqual(leaderColors(area([0, 0, 0, 0]), choices), []);
});

test('an already-open page starts polling at 8 p.m. Eastern, then polls each minute without a reload', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const start = Date.parse(CONFIG.startsAt);
  assert.equal(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(start), '8:00 PM');
  let time = start - 1000;
  const requests = [], endpoint = 'https://results.example.test/current.json';
  const { feed, statuses } = harness(t, { config: { ...CONFIG, endpoint }, now: () => time,
    fetchImpl: async url => {
      requests.push(url);
      return Response.json(url === endpoint ? { ...waiting, checkedAt: new Date(time).toISOString(), publishedAt: new Date(time).toISOString() } : waiting);
    } });
  await feed.start();
  assert.deepEqual(requests, [CONFIG.fixtureUrls.waiting]);
  assert.equal(statuses.at(-1).kind, 'scheduled'); assert.equal(statuses.at(-1).updating, false);
  time += 999; t.mock.timers.tick(999); await nextTurn(); assert.equal(requests.length, 1);
  time++; t.mock.timers.tick(1); await nextTurn();
  assert.equal(requests.at(-1), endpoint); assert.equal(statuses.at(-1).updating, true);
  time += 60_000; t.mock.timers.tick(60_000); await nextTurn(); assert.equal(requests.length, 3);
});

test('the update indicator stops for paused, failed, historical and disconnected data', async t => {
  const { feed, statuses, documentRef } = harness(t, { mode: 'mock', allowPreview: true });
  await feed.start(); assert.equal(statuses.at(-1).updating, true);
  feed.setPaused(true); assert.equal(statuses.at(-1).updating, false);
  feed.setPaused(false); assert.equal(statuses.at(-1).updating, true);
  documentRef.setHidden(true); assert.equal(statuses.at(-1).updating, false);
  documentRef.setHidden(false); await nextTurn(); assert.equal(statuses.at(-1).updating, true);
  await feed.setScenario('failure'); assert.equal(statuses.at(-1).updating, false);
  await feed.setMode('historical'); assert.equal(statuses.at(-1).updating, false);
  await feed.setMode('live'); assert.equal(statuses.at(-1).updating, false);
});

test('an invalid start date cannot fetch or advertise a live endpoint', async t => {
  const requests = [];
  const { feed, statuses } = harness(t, { config: { ...CONFIG, endpoint: 'https://results.example.test/current.json', startsAt: 'invalid' }, fetchImpl: url => { requests.push(url); return fixtureFetch(url); } });
  await feed.start();
  assert.equal(requests.length, 0); assert.equal(statuses.at(-1).kind, 'error'); assert.equal(statuses.at(-1).updating, false);
});

test('successful delivery of an old snapshot cannot keep the live indicator on', async t => {
  let time = fixedNow;
  const { feed, statuses, documentRef } = harness(t, { now: () => time,
    config: { ...CONFIG, startsAt: null, endpoint: 'https://results.example.test/current.json' },
    fetchImpl: async () => Response.json({ ...waiting, checkedAt: publishedAt, publishedAt }) });
  await feed.start(); assert.equal(statuses.at(-1).updating, true);
  time += CONFIG.staleAfterMs + 1;
  documentRef.setHidden(true); documentRef.setHidden(false); await nextTurn();
  assert.equal(statuses.at(-1).kind, 'stale'); assert.equal(statuses.at(-1).updating, false);
});
