// Use an environment variable or ignored owner-readable .env.production file.
// Never pass the token on the command line or put it in a URL.
import { readFile } from 'node:fs/promises';
const action = process.argv[2] || 'status';
const actions = new Set(['status', 'check', 'start', 'stop', 'finish', 'health', 'test-alert']);
if (!actions.has(action) || process.argv.length > 3) throw new Error('Usage: npm run admin -- status|check|start|stop|finish|health|test-alert');
const monitor = ['health', 'test-alert'].includes(action);
let token = monitor ? process.env.HEALTH_ADMIN_TOKEN : process.env.ADMIN_TOKEN;
if (!token) {
  const file = await readFile(new URL(monitor ? '../.env.health' : '../.env.production', import.meta.url), 'utf8');
  token = file.match(/^ADMIN_TOKEN=(.+)$/m)?.[1].trim().replace(/^(['"])(.*)\1$/, '$2');
}
if (!token || token.length < 32) throw new Error('Set the administrative token securely or restore its ignored file from the team secret manager');
const hostname = monitor ? 'herald-election-health-2026.herald-election-services.workers.dev' : 'herald-election-results-2026.herald-election-services.workers.dev';
const path = action === 'health' ? 'check' : action;
const response = await fetch('https://' + hostname + '/admin/' + path, {
  method: ['status', 'health'].includes(action) ? 'GET' : 'POST',
  headers: { Authorization: 'Bearer ' + token }, redirect: 'error', signal: AbortSignal.timeout(30_000)
});
const body = await response.json();
console.log(JSON.stringify({ status: response.status, ...body }, null, 2));
if (!response.ok && !(action === 'test-alert' && response.status === 503 && body.error?.startsWith('HERALD MONITOR TEST:'))) process.exitCode = 1;
