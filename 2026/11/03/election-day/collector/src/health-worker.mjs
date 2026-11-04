import { authorized } from './auth.mjs';
import { checkDelivery } from './health.mjs';

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export default {
  async scheduled(_controller, env) {
    // A separate Cron and Worker still run if the collector's alarm fails.
    // The scoped Cloudflare log monitor sends errors to the incident inboxes.
    try {
      const health = await checkDelivery({ startsAt: env.COLLECTION_STARTS_AT });
      console.log(JSON.stringify({ event: 'results-health', ...health }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (!['/admin/check', '/admin/test-alert'].includes(path)) return json({ error: 'Not found' }, 404);
    if (!await authorized(request, env.ADMIN_TOKEN)) return json({ error: 'Unauthorized' }, 401);
    if (request.method !== (path === '/admin/check' ? 'GET' : 'POST')) return json({ error: 'Method not allowed' }, 405);
    try {
      if (path === '/admin/test-alert') throw new Error('HERALD MONITOR TEST: intentional alert delivery check; no election-results outage');
      return json(await checkDelivery({ startsAt: env.COLLECTION_STARTS_AT }));
    } catch (error) {
      console.error(error);
      return json({ error: String(error.message).slice(0, 240) }, 503);
    }
  }
};
