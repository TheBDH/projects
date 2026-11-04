import { METHODS, rebuildAggregates, validateSnapshot } from './model.mjs';
export function hash(value) { let h = 2166136261; for (const c of value) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
export function makeMockBase(waiting) {
  const data = structuredClone(waiting);
  data.mode = 'mock'; data.status = 'unofficial'; data.revision = 'mock-base';
  data.source.label = 'Simulated test data — not election returns';
  for (const c of Object.values(data.contests)) for (const a of Object.values(c.areas)) {
    if (!['precinct', 'unmapped'].includes(a.kind)) continue;
    const seed = hash(c.id + a.id), turnout = a.kind === 'unmapped' ? seed % 7 : 240 + seed % 1600;
    let weights;
    if (c.id === 'question7') { const yes = .25 + (seed % 53) / 100; weights = [yes, 1 - yes]; }
    else if (c.id === 'mayor') { const d = .46 + (seed % 40) / 100; weights = [1 - d - .01, d, .01]; }
    else { const d = .28 + (seed % 42) / 100, independent = .1 + (hash(a.town) % 10) / 100; weights = [1 - d - independent - .014, d, independent, .006, .004, .004]; }
    let allocated = 0;
    a.votes = weights.map((w, i) => { const n = i === weights.length - 1 ? turnout - allocated : Math.floor(turnout * w); allocated += n; return n; });
    a.methods = { electionDay: [], early: [], mail: [] };
    a.votes.forEach(n => { const early = Math.floor(n * .27), mail = Math.floor(n * .13); a.methods.electionDay.push(n - early - mail); a.methods.early.push(early); a.methods.mail.push(mail); });
    a.total = turnout; a.unmappedVotes = a.kind === 'unmapped' ? turnout : 0;
    a.reporting = { reported: 1, expected: 1 }; a.status = 'reported';
  }
  return validateSnapshot(rebuildAggregates(data));
}
export function mockAtStep(base, step, { correction = false, now = Date.now() } = {}) {
  const data = structuredClone(base), progress = Math.min(1, Math.max(0, step / 12));
  data.revision = 'mock-' + step + (correction ? '-correction' : '');
  data.sourceUpdated = data.publishedAt = data.checkedAt = new Date(now).toISOString();
  data.mode = 'mock'; data.status = 'unofficial';
  for (const c of Object.values(data.contests)) for (const a of Object.values(c.areas)) {
    if (!['precinct', 'unmapped'].includes(a.kind)) continue;
    const offset = (hash(a.id) % 30) / 100;
    for (const method of METHODS) {
      const phase = method === 'mail' ? .8 : method === 'early' ? .5 : 0;
      const fraction = progress === 1 ? 1 : Math.min(1, Math.max(0, (progress - offset) * (1 + phase)));
      a.methods[method] = a.methods[method].map(n => Math.floor(n * fraction));
    }
    // A consistent reduction in one genuine record exercises corrections.
    if (correction && a.id === 'precinct:2801') a.methods.electionDay[0] = Math.max(0, a.methods.electionDay[0] - 12);
    a.votes = a.votes.map((_, i) => METHODS.reduce((n, m) => n + a.methods[m][i], 0));
    a.total = a.votes.reduce((a, b) => a + b, 0); a.unmappedVotes = a.kind === 'unmapped' ? a.total : 0;
    a.reporting = { reported: progress === 1 || a.total > 0 ? 1 : 0, expected: 1 };
    a.status = progress === 1 ? 'reported' : a.total > 0 ? 'partial' : 'not-reporting';
  }
  return validateSnapshot(rebuildAggregates(data));
}
