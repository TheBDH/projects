// Shared contract validation: used by the browser, fixtures and future collector.
export const METHODS = ['electionDay', 'early', 'mail'];
export const CONTEST_IDS = ['governor', 'mayor', 'question7'];
export function assert(ok, message) { if (!ok) throw new Error(message); }
const sum = values => values.reduce((a, b) => a + b, 0);
const count = n => Number.isSafeInteger(n) && n >= 0;
const date = n => typeof n === 'string' && Number.isFinite(Date.parse(n));
export function validateSnapshot(snapshot, { previous = null, expectedMode = null } = {}) {
  assert(snapshot?.schemaVersion === 1, 'Unsupported results format');
  assert(['ri-2026-general', 'ri-2026-primary'].includes(snapshot.electionId), 'Wrong election');
  assert(['live', 'historical', 'mock'].includes(snapshot.mode), 'Unknown data mode');
  assert(!expectedMode || snapshot.mode === expectedMode, 'Unexpected data mode');
  assert(snapshot.mode !== 'live' || snapshot.electionId === 'ri-2026-general', 'Wrong live election');
  assert(['waiting', 'unofficial', 'certified'].includes(snapshot.status), 'Unknown result status');
  assert(snapshot.mode !== 'mock' || snapshot.status !== 'certified', 'A simulation cannot be certified');
  assert(typeof snapshot.revision === 'string' && snapshot.revision.length > 0, 'Missing revision');
  for (const field of ['sourceUpdated', 'publishedAt', 'checkedAt']) assert(date(snapshot[field]), 'Invalid ' + field);
  if (snapshot.coverageEndedAt !== undefined) {
    assert(date(snapshot.coverageEndedAt), 'Invalid coverage end time');
    assert(Date.parse(snapshot.coverageEndedAt) >= Date.parse(snapshot.checkedAt) && Date.parse(snapshot.coverageEndedAt) <= Date.parse(snapshot.publishedAt), 'Coverage end time must follow verification and precede publication');
  }
  assert(snapshot.source && typeof snapshot.source.label === 'string' && /^https:\/\//.test(snapshot.source.url), 'Missing source');
  if (previous && previous.mode === snapshot.mode && previous.electionId === snapshot.electionId) {
    assert(Date.parse(snapshot.sourceUpdated) >= Date.parse(previous.sourceUpdated), 'Older source snapshot');
    assert(Date.parse(snapshot.publishedAt) >= Date.parse(previous.publishedAt), 'Older publication');
    // Vote totals can go DOWN in a genuine correction. Never reject for that alone.
  }
  assert(Object.keys(snapshot.contests || {}).sort().join() === [...CONTEST_IDS].sort().join(), 'Contest coverage');
  for (const id of CONTEST_IDS) {
    const c = snapshot.contests[id];
    assert(c?.id === id && typeof c.title === 'string', 'Wrong contest identity');
    assert(c.scope === (id === 'governor' ? 'state' : 'Providence'), 'Wrong contest geography');
    assert(typeof c.available === 'boolean', 'Missing availability');
    assert(c.available || snapshot.mode === 'historical', 'Missing live contest');
    if (!c.available) { assert(Object.keys(c.areas).length === 0, 'Unavailable contest contains results'); continue; }
    assert(Array.isArray(c.choices) && c.choices.length >= 2 && c.choices.length <= 20, 'Invalid choices');
    assert(new Set(c.choices.map(x => x.id)).size === c.choices.length, 'Duplicate choice');
    for (const x of c.choices) assert(typeof x.name === 'string' && /^#[0-9a-f]{6}$/i.test(x.color), 'Invalid choice label or color');
    assert(c.totalArea === (id === 'governor' ? 'state' : 'town:Providence'), 'Wrong total area');
    const entries = Object.entries(c.areas);
    assert(entries.length > 0 && entries.length < 2000 && c.areas[c.totalArea], 'Invalid region coverage');
    for (const [key, a] of entries) {
      assert(a.id === key && typeof a.name === 'string', 'Invalid region identity');
      assert(['state', 'town', 'precinct', 'ward', 'unmapped'].includes(a.kind), 'Unknown region type');
      assert(Array.isArray(a.votes) && a.votes.length === c.choices.length && a.votes.every(count), 'Invalid vote count');
      assert(count(a.total) && a.total === sum(a.votes), 'Region total mismatch');
      assert(METHODS.every(m => Array.isArray(a.methods?.[m]) && a.methods[m].length === c.choices.length && a.methods[m].every(count)), 'Invalid voting method');
      assert(a.votes.every((n, i) => n === sum(METHODS.map(m => a.methods[m][i]))), 'Voting method total mismatch');
      assert(count(a.reporting?.reported) && count(a.reporting?.expected) && a.reporting.reported <= a.reporting.expected, 'Invalid reporting count');
      assert(['not-reporting', 'partial', 'reported'].includes(a.status), 'Invalid reporting status');
      assert(count(a.unmappedVotes) && a.unmappedVotes <= a.total, 'Invalid unmapped votes');
      if (a.kind === 'precinct') assert(a.geometryIds?.length && new Set(a.geometryIds).size === a.geometryIds.length, 'Missing geographic join');
      if (id !== 'governor') assert(a.town === 'Providence', 'Local contest outside Providence');
      if (snapshot.status === 'waiting') assert(a.total === 0, 'Waiting snapshot contains votes');
    }
    const towns = entries.map(([, a]) => a).filter(a => a.kind === 'town');
    assert(towns.length === (id === 'governor' ? 39 : 1), 'Municipality coverage');
    const usedGeometry = new Set();
    for (const town of towns) {
      const children = entries.map(([, a]) => a).filter(a => ['precinct', 'unmapped'].includes(a.kind) && a.town === town.town);
      assert(children.length > 0, 'Missing reporting units');
      assert(town.votes.every((n, i) => n === sum(children.map(a => a.votes[i]))), 'Reporting unit total mismatch');
      assert(METHODS.every(m => town.methods[m].every((n, i) => n === sum(children.map(a => a.methods[m][i])))), 'Reporting unit method mismatch');
      assert(town.reporting.expected === children.length && town.reporting.reported === sum(children.map(a => a.reporting.reported)), 'Reporting unit count mismatch');
      for (const child of children) for (const key of child.geometryIds || []) {
        assert(!usedGeometry.has(key), 'Overlapping reporting units'); usedGeometry.add(key);
      }
      for (const ward of entries.map(([, a]) => a).filter(a => a.kind === 'ward' && a.town === town.town)) {
        const members = children.filter(a => String(a.ward) === String(ward.ward));
        assert(members.length > 0 && ward.votes.every((n, i) => n === sum(members.map(a => a.votes[i]))), 'Ward total mismatch');
        assert(METHODS.every(m => ward.methods[m].every((n, i) => n === sum(members.map(a => a.methods[m][i])))), 'Ward method mismatch');
        assert(ward.reporting.expected === members.length && ward.reporting.reported === sum(members.map(a => a.reporting.reported)), 'Ward reporting mismatch');
      }
    }
    if (id === 'governor') {
      assert(c.areas.state.votes.every((n, i) => n === sum(towns.map(a => a.votes[i]))), 'State total mismatch');
      assert(METHODS.every(m => c.areas.state.methods[m].every((n, i) => n === sum(towns.map(a => a.methods[m][i])))), 'State method mismatch');
      assert(c.areas.state.reporting.expected === sum(towns.map(a => a.reporting.expected)) && c.areas.state.reporting.reported === sum(towns.map(a => a.reporting.reported)), 'State reporting mismatch');
    }
  }
  return snapshot;
}

export function aggregateAreas(id, name, kind, children, extra = {}) {
  assert(children.length > 0, 'Cannot aggregate empty regions');
  const n = children[0].votes.length;
  const votes = Array.from({ length: n }, (_, i) => sum(children.map(a => a.votes[i])));
  const reported = sum(children.map(a => a.reporting.reported));
  const expected = sum(children.map(a => a.reporting.expected));
  return { id, name, kind, ...extra, votes, total: sum(votes),
    methods: Object.fromEntries(METHODS.map(m => [m, Array.from({ length: n }, (_, i) => sum(children.map(a => a.methods[m][i])))])),
    reporting: { reported, expected },
    status: reported === 0 ? 'not-reporting' : reported === expected && children.every(a => a.status === 'reported') ? 'reported' : 'partial',
    unmappedVotes: sum(children.map(a => a.kind === 'unmapped' ? a.total : a.unmappedVotes)),
  };
}

export function rebuildAggregates(snapshot) {
  for (const c of Object.values(snapshot.contests)) {
    if (!c.available) continue;
    const all = Object.values(c.areas);
    for (const a of all.filter(a => a.kind === 'ward' || a.kind === 'town')) {
      const children = all.filter(p => ['precinct', 'unmapped'].includes(p.kind) && p.town === a.town && (a.kind === 'town' || String(p.ward) === String(a.ward)));
      c.areas[a.id] = aggregateAreas(a.id, a.name, a.kind, children, { town: a.town, ...(a.ward ? { ward: a.ward } : {}) });
    }
    if (c.areas.state) c.areas.state = aggregateAreas('state', 'Rhode Island', 'state', Object.values(c.areas).filter(a => a.kind === 'town'));
  }
  return snapshot;
}
