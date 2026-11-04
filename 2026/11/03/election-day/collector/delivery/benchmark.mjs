// Preview-only administration of the isolated collector test. The collector
// verifies the bearer secret; production has neither this route nor binding.
import delivery from './worker.mjs';
export default {
  fetch(request, env, ctx) {
    if (env.SNAPSHOT_MODE === 'mock' && new URL(request.url).pathname.startsWith('/admin/') && env.MOCK_COLLECTOR) return env.MOCK_COLLECTOR.fetch(request);
    return delivery.fetch(request, env, ctx);
  }
};
