// Only the owned, explicitly mock Pages preview is eligible. No BOE requests.
import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
const [target, output] = process.argv.slice(2);
const url = new URL(target);
if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.herald-election-data-2026\.pages\.dev$/.test(url.hostname) || url.pathname !== '/ri-2026-general/latest.json') throw new Error('Use only the owned mock Pages preview URL');
if (!output) throw new Error('Specify the evidence JSON output path');
const origin = 'https://projects.browndailyherald.com';
const probe = await fetch(url, { headers: { Origin: origin }, signal: AbortSignal.timeout(12_000) });
const baseline = await probe.json();
if (probe.status !== 200 || probe.headers.get('X-Results-Mode') !== 'mock' || baseline.mode !== 'mock') throw new Error('Endpoint is not the expected isolated mock benchmark');
const report = { startedAt: new Date().toISOString(), target, mode: 'mock', storage: 'R2 Standard test bucket',
  limitations: ['One client/network location; simulated minute polls, not full browsers.', 'Reader load test does not itself test collection, write latency, storage failures or daily-quota exhaustion.', 'No automatic retries; full response bodies consumed.'],
  snapshot: { revision: baseline.revision, checkedAt: baseline.checkedAt, bytes: Number(probe.headers.get('Content-Length')) }, phases: [] };
const quantile = (a, q) => a[Math.min(a.length - 1, Math.floor(q * a.length))] ?? null;
async function phase(name, count, durationMs) {
  const rows = [], begin = performance.now(); let inFlight = 0, maximumInFlight = 0;
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const scheduled = begin + i * durationMs / count;
    await delay(Math.max(0, scheduled - performance.now()));
    jobs.push((async () => {
      inFlight++; maximumInFlight = Math.max(maximumInFlight, inFlight);
      const started = performance.now();
      try {
        const response = await fetch(url, { headers: { Origin: origin, 'Accept-Encoding': 'gzip, br' }, signal: AbortSignal.timeout(12_000) });
        const body = await response.text();
        const row = { ms: performance.now() - started, lagMs: started - scheduled, status: response.status, cache: response.headers.get('X-Results-Cache'), colo: response.headers.get('CF-Ray')?.split('-').at(-1), bytes: Buffer.byteLength(body), encoding: response.headers.get('Content-Encoding') };
        if (response.status === 200) {
          const snapshot = JSON.parse(body);
          if (snapshot.mode !== 'mock' || snapshot.revision !== baseline.revision || snapshot.checkedAt !== baseline.checkedAt || response.headers.get('Access-Control-Allow-Origin') !== origin) row.error = 'Unexpected payload, timestamp or CORS';
        } else row.error = 'HTTP ' + response.status;
        rows.push(row);
      } catch (e) { rows.push({ ms: performance.now() - started, lagMs: started - scheduled, error: String(e).slice(0, 160) }); }
      finally { inFlight--; }
    })());
  }
  await Promise.all(jobs);
  const times = rows.map(r => r.ms).sort((a,b) => a-b), lags = rows.map(r => r.lagMs).sort((a,b) => a-b);
  const tally = key => rows.reduce((a,r) => { const k = r[key] ?? 'missing'; a[k] = (a[k] || 0) + 1; return a; }, {});
  const result = { name, requests: count, scheduledDurationSeconds: durationMs / 1000, elapsedSeconds: (performance.now() - begin) / 1000, maximumInFlight,
    latencyMs: { p50: quantile(times,.5), p95: quantile(times,.95), p99: quantile(times,.99), max: times.at(-1) },
    schedulingLagMs: { p95: quantile(lags,.95), max: lags.at(-1) }, statuses: tally('status'), cache: tally('cache'), colos: tally('colo'), encoding: tally('encoding'),
    decodedBytes: rows.reduce((n,r) => n+(r.bytes || 0),0), errors: rows.filter(r => r.error) };
  report.phases.push(result); await writeFile(output, JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(result));
  if (result.errors.length > Math.max(5, count*.02)) throw new Error('Stopped load test after excessive errors');
}
for (const readers of [100,500,1000]) await phase(readers+' readers polling once per minute', readers, 60_000);
await phase('1000 initial page loads over 10 seconds', 1000, 10_000);
report.finishedAt = new Date().toISOString();
report.projections = [100,500,1000].map(readers => ({ readers, requestsPerSecond: readers/60, requests8Hours: readers*480, requests24Hours: readers*1440, requests72Hours: readers*4320, hoursTo100kDailyLimit: 100000/(readers*60) }));
await writeFile(output, JSON.stringify(report,null,2)+'\n');
