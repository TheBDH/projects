import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
const target = process.argv[2];
if (!/^https:\/\/[a-z0-9-]+\.herald-election-data-2026\.pages\.dev$/.test(target)) throw new Error('Specify the isolated collector-test Pages preview');
const secret = (await readFile(new URL('../.env.benchmark', import.meta.url), 'utf8')).trim().split('=')[1];
const headers = { Authorization: 'Bearer ' + secret };
const report = { startedAt: new Date().toISOString(), target, source: 'synthetic source embedded in isolated test Worker; no BOE fetch', checks: [] };
const output = new URL('../../docs/evidence/cloudflare-collector-benchmark.json', import.meta.url);
async function admin(action) {
  const r = await fetch(target + '/admin/' + action, { method: action === 'status' ? 'GET' : 'POST', headers, signal: AbortSignal.timeout(35_000) });
  if (!r.ok) throw new Error('Collector ' + action + ' HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return r.json();
}
let started = false;
try {
  const unauthenticated = await fetch(target+'/admin/status');
  if (unauthenticated.status !== 401) throw new Error('Admin authentication not enforced');
  report.authStatus = unauthenticated.status;
  report.start = await admin('start'); started = true;
  const end = Date.now()+160_000; let last = -1;
  while (Date.now()<end) {
    const status = await admin('status');
    if (status.successes!==last) {
      last=status.successes; report.checks.push(status);
      await writeFile(output, JSON.stringify(report,null,2)+'\n');
      console.log(JSON.stringify({ successes:status.successes, attempts:status.attempts, running:status.running, checkedAt:status.checkedAt, lastError:status.lastError }));
    }
    if (status.failures) throw new Error('Collector test failed: '+status.lastError);
    if (status.successes===3 && !status.running) { report.final=status; break; }
    await delay(5000);
  }
  if (!report.final) throw new Error('Collector did not complete all three alarms');
} finally {
  if (started) report.stop=await admin('stop');
  report.finishedAt=new Date().toISOString();
  await writeFile(output, JSON.stringify(report,null,2)+'\n');
}
