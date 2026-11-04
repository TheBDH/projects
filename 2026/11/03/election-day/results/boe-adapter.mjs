// Host-independent adapter. The future scheduled service calls this after fetching
// the official export once; browsers only consume its normalized output.
import { assert, aggregateAreas, validateSnapshot, METHODS } from './model.mjs';
const SOURCE_METHODS = ['Election Day', 'Early Voting', 'Mail Ballots'];
const STATUSES = new Map([
  ['Not Reported', 'not-reporting'], ['Not Participating', 'not-reporting'], ['Partially Reported', 'partial'],
  ['Election Night Complete', 'reported'], ['Fully Reported', 'reported'],
]);
const COUNCIL_DISTRICTS = new Set(['Coventry', 'Cumberland', 'Johnston', 'Lincoln', 'North Providence', 'Pawtucket']);
const count = n => { assert(Number.isSafeInteger(n) && n >= 0, 'Invalid source vote count'); return n; };
function unique(items, key, label) {
  assert(Array.isArray(items), 'Missing ' + label);
  const out = new Map();
  for (const x of items) { const id = String(key(x)); assert(!out.has(id), 'Duplicate ' + label + ': ' + id); out.set(id, x); }
  return out;
}
function findContest(locality, id) {
  const found = locality?.ballotItems?.filter(c => String(c.id) === String(id));
  assert(found?.length === 1, 'Missing or duplicate source contest: ' + id);
  return found[0];
}
export function geographicCodes(name) {
  if (/limited/i.test(name)) return [];
  const suffix = /\(([^()]*)\)\s*$/.exec(name)?.[1];
  const codes = [...(suffix?.matchAll(/\b\d{4}\b/g) || [])].map(m => m[0]).sort();
  assert(codes.length > 0 && new Set(codes).size === codes.length, 'Unknown precinct label: ' + name);
  return codes;
}
function unitKey(name, town) {
  const codes = geographicCodes(name);
  return codes.length === 1 ? 'precinct:' + codes[0] : codes.length ? 'unit:' + codes.join('+') : 'unmapped:' + town + ':' + name.toLowerCase();
}
function methodCounts(rows, total) {
  const byName = unique(rows, x => x.groupName, 'voting methods');
  assert(byName.size === 3, 'Unexpected voting methods');
  const values = SOURCE_METHODS.map(m => count(byName.get(m)?.voteCount));
  assert(values.reduce((a, b) => a + b, 0) === total, 'Source voting method mismatch');
  return values;
}
function choicesOf(contest, primary, id) {
  return contest.ballotOptions.map((o, i) => ({ id: String(o.id), name: o.name.replace(/\s*\((?:REP|DEM|Ind)\)\s*$/, '').replace(/\*$/, ''),
    sourceName: o.name, party: o.politicalParty || '',
    color: id === 'question7' ? (i === 0 ? '#187f79' : '#bd681c') : primary ? ['#176ca4', '#8059a2'][i] :
      o.politicalParty === 'DEMOCRAT' ? '#176ca4' : o.politicalParty === 'REPUBLICAN' ? '#bf3542' : /write.in/i.test(o.name) ? '#647078' : ['#aa791e', '#8059a2', '#398766'][Math.max(0, i - 2)] || '#647078',
  }));
}
// This is an explicit build/review operation, not something the live collector
// should run automatically. A changed election roster needs a reviewed manifest.
export function makeManifest(source, geography, { primary = false } = {}) {
  const polygons = new Map(geography.precincts.map(p => [p.code, p]));
  const state = findContest(source.results, '4');
  const towns = source.localResults.filter(t => t.ballotItems.some(c => c.id === '4'));
  assert(towns.length === 39, 'Expected 39 municipalities');
  const manifest = { electionDate: source.electionDate, electionName: source.electionName, primary, contests: {} };
  for (const [id, sourceId] of [['governor', '4'], ['mayor', primary ? '122' : '280'], ['question7', '417']]) {
    if (primary && id === 'question7') continue;
    const locals = id === 'governor' ? towns : towns.filter(t => t.name === 'Providence');
    const first = id === 'governor' ? state : findContest(locals[0], sourceId);
    const choices = choicesOf(first, primary, id);
    manifest.contests[id] = { sourceId, sourceName: first.name, choices, towns: locals.map(t => {
      const c = findContest(t, sourceId);
      const units = c.ballotOptions[0].precinctResults.map(p => {
        const codes = geographicCodes(p.name);
        assert(codes.every(code => polygons.get(code)?.town === t.name), 'Unmatched geographic precinct: ' + p.name);
        const wards = [...new Set(codes.map(code => polygons.get(code).ward).filter(Boolean))];
        return { id: unitKey(p.name, t.name), name: p.name, geometryIds: codes.map(code => 'precinct:' + code),
          ward: wards.length === 1 ? String(wards[0]) : null, crossesWard: wards.length > 1 };
      });
      return { name: t.name, sourceName: c.name, units, allowWards: !units.some(u => u.crossesWard) };
    }) };
  }
  return manifest;
}
export function normalizeBoeExport(source, manifest, { mode = 'live', publishedAt = new Date().toISOString(), certified = false, previous = null } = {}) {
  assert(source.electionDate === manifest.electionDate && source.electionName === manifest.electionName, 'Wrong source election');
  assert(Number.isFinite(Date.parse(source.createdAt)), 'Invalid source timestamp');
  const byTown = unique(source.localResults, x => x.name, 'municipalities');
  const snapshot = { schemaVersion: 1, electionId: manifest.primary ? 'ri-2026-primary' : 'ri-2026-general',
    revision: source.createdAt, mode, status: certified ? 'certified' : 'unofficial',
    sourceUpdated: source.createdAt, publishedAt, checkedAt: publishedAt,
    source: { label: 'Rhode Island Board of Elections', url: 'https://electionresults.ri.gov/results/public/rhodeisland' }, contests: {} };
  for (const id of ['governor', 'mayor', 'question7']) {
    const spec = manifest.contests[id];
    const title = id === 'governor' ? (manifest.primary ? 'Governor · Democratic primary' : 'Governor') : id === 'mayor' ? (manifest.primary ? 'Providence mayor · Democratic primary' : 'Providence mayor') : 'Providence Question 7';
    const c = snapshot.contests[id] = { id, title, scope: id === 'governor' ? 'state' : 'Providence', available: !!spec,
      totalArea: id === 'governor' ? 'state' : 'town:Providence', choices: spec?.choices.map(({ sourceName, ...choice }) => choice) || [], areas: {} };
    if (!spec) { c.notice = 'Question 7 was not on the September 2026 primary ballot. Use the mock preview to test this contest.'; continue; }
    if (id === 'question7') c.description = 'An ordinance divesting from foreign countries conducting severe violation of human rights.';
    const towns = [];
    for (const town of spec.towns) {
      const raw = findContest(byTown.get(town.name), spec.sourceId);
      assert(raw.name === town.sourceName && raw.voteFor === 1, 'Changed source contest');
      const options = unique(raw.ballotOptions, x => x.id, 'choices');
      assert(options.size === spec.choices.length, 'Choice coverage mismatch');
      const units = new Map(town.units.map(u => [u.id, { id: u.id, name: u.geometryIds.length ? (u.geometryIds.length === 1 ? 'Precinct ' : 'Combined precincts ') + u.geometryIds.map(g => g.split(':')[1]).join(', ') : 'Limited ballots',
        sourceName: u.name, kind: u.geometryIds.length ? 'precinct' : 'unmapped', town: town.name,
        ward: town.allowWards ? u.ward : null, geometryIds: u.geometryIds, votes: [], methods: Object.fromEntries(METHODS.map(m => [m, []])),
        reporting: { reported: 0, expected: 1 }, status: null, total: 0, unmappedVotes: 0 }]));
      spec.choices.forEach((choice, i) => {
        const option = options.get(choice.id);
        assert(option?.name === choice.sourceName && (option.politicalParty || '') === choice.party, 'Changed candidate identity');
        const total = count(option.voteCount), methods = methodCounts(option.groupResults, total);
        const rows = unique(option.precinctResults, p => unitKey(p.name, town.name), 'reporting units');
        assert(rows.size === units.size, 'Reporting unit coverage mismatch');
        const totals = [0, 0, 0]; let subtotal = 0;
        for (const unit of units.values()) {
          const row = rows.get(unit.id);
          assert(row, 'Missing reporting unit: ' + unit.id);
          assert(STATUSES.has(row.reportingStatus), 'Unknown reporting status: ' + String(row.reportingStatus).slice(0, 80) + ' in ' + unit.id);
          const status = STATUSES.get(row.reportingStatus);
          if (i === 0) unit.status = status;
          assert(unit.status === status, 'Inconsistent reporting status');
          const votes = count(row.voteCount), byMethod = methodCounts(row.groupResults, votes);
          // The source can mark limited units Not Participating even with mail votes.
          // Preserve reconciled votes without treating that status as completed.
          unit.votes.push(votes); subtotal += votes;
          byMethod.forEach((n, j) => { unit.methods[METHODS[j]].push(n); totals[j] += n; });
        }
        assert(subtotal === total && totals.every((n, j) => n === methods[j]), 'Source precinct totals do not reconcile');
      });
      for (const unit of units.values()) {
        unit.total = unit.votes.reduce((a, b) => a + b, 0);
        unit.reporting.reported = unit.status !== 'not-reporting' || unit.total > 0 ? 1 : 0;
        if (unit.kind === 'unmapped') unit.unmappedVotes = unit.total;
        c.areas[unit.id] = unit;
      }
      const summary = aggregateAreas('town:' + town.name, town.name, 'town', [...units.values()], { town: town.name });
      if (!town.allowWards) summary.notice = 'Some historical reporting units cross ward boundaries, so ward totals cannot be calculated without allocating votes.';
      c.areas[summary.id] = summary; towns.push(summary);
      if (town.allowWards) for (const ward of new Set([...units.values()].map(u => u.ward).filter(Boolean))) {
        const wardId = 'ward:' + town.name + ':' + ward;
        c.areas[wardId] = aggregateAreas(wardId, (COUNCIL_DISTRICTS.has(town.name) ? 'Council district ' : 'Ward ') + ward, 'ward', [...units.values()].filter(u => u.ward === ward), { town: town.name, ward });
      }
    }
    if (id === 'governor') {
      const rawState = findContest(source.results, spec.sourceId);
      assert(rawState.name === spec.sourceName, 'Changed statewide contest');
      const options = unique(rawState.ballotOptions, x => x.id, 'state choices');
      assert(options.size === spec.choices.length, 'State candidate coverage');
      const state = aggregateAreas('state', 'Rhode Island', 'state', towns);
      spec.choices.forEach((choice, i) => {
        const o = options.get(choice.id);
        assert(o?.name === choice.sourceName && count(o.voteCount) === state.votes[i], 'State/municipality totals do not reconcile');
        assert(methodCounts(o.groupResults, o.voteCount).every((n, j) => n === state.methods[METHODS[j]][i]), 'State method totals do not reconcile');
      });
      c.areas.state = state;
    }
  }
  return validateSnapshot(snapshot, { previous, expectedMode: mode });
}
