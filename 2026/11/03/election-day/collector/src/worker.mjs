import { DurableObject } from 'cloudflare:workers';
import manifest from '../../data/results/general-manifest.json';
import { CollectorEngine } from './engine.mjs';
import { LIVE_STARTS_AT } from '../../results/schedule.mjs';

const OBJECT_NAME = 'ri-2026-general';
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export class ElectionCollector extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS collector_state (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    });
    const get = key => {
      const rows = ctx.storage.sql.exec('SELECT value FROM collector_state WHERE key = ?', key).toArray();
      return rows.length ? JSON.parse(rows[0].value) : null;
    };
    const put = (key, value) => ctx.storage.sql.exec('INSERT INTO collector_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, JSON.stringify(value));
    this.engine = new CollectorEngine({
      manifest, bucket: env.RESULTS,
      allowCollection: env.COLLECTION_ENABLED === 'true',
      startAt: Date.parse(env.COLLECTION_STARTS_AT || LIVE_STARTS_AT),
      stopAt: Date.parse(env.COLLECTION_ENDS_AT || '2026-11-30T23:59:59Z'),
      store: {
        get, put,
        commit: (values, remove) => ctx.storage.transactionSync(() => {
          for (const [key, value] of Object.entries(values)) put(key, value);
          for (const key of remove) ctx.storage.sql.exec('DELETE FROM collector_state WHERE key = ?', key);
        }),
        getAlarm: () => ctx.storage.getAlarm(),
        setAlarm: time => ctx.storage.setAlarm(time),
        deleteAlarm: () => ctx.storage.deleteAlarm()
      },
      log: record => console.log(JSON.stringify(record))
    });
  }
  async start() { return this.engine.start(); }
  async stop() { return this.engine.stop(); }
  async status() { return this.engine.status(); }
  async check() { return this.engine.collect(); }
  async watchdog() { return this.engine.watchdog(); }
  async alarm() { await this.engine.collect({ alarm: true }); }
}

async function authorized(request, secret) {
  if (!secret || secret.length < 32) return false;
  const candidate = request.headers.get('authorization') || '';
  if (!candidate.startsWith('Bearer ') || candidate.length > 256) return false;
  const enc = new TextEncoder();
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(candidate.slice(7))),
    crypto.subtle.digest('SHA-256', enc.encode(secret))
  ]);
  return crypto.subtle.timingSafeEqual(actual, expected);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/admin/status' && !['/admin/start', '/admin/stop', '/admin/check'].includes(url.pathname)) return json({ error: 'Not found' }, 404);
    if (!await authorized(request, env.ADMIN_TOKEN)) return json({ error: 'Unauthorized' }, 401);
    const method = url.pathname === '/admin/status' ? 'GET' : 'POST';
    if (request.method !== method) return json({ error: 'Method not allowed' }, 405);
    const stub = env.COLLECTOR.getByName(OBJECT_NAME);
    try {
      const result = await stub[url.pathname.slice('/admin/'.length)]();
      return json(result, result?.ok === false ? 503 : 200);
    } catch (error) {
      console.error(JSON.stringify({ event: 'admin-operation-failed', message: String(error.message).slice(0, 240) }));
      return json({ error: 'Collector operation failed; inspect the service logs.' }, 503);
    }
  },
  async scheduled(controller, env) {
    await env.COLLECTOR.getByName(OBJECT_NAME).watchdog();
  }
};
