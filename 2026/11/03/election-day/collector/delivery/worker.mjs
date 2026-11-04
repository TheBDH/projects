import { serveSnapshot } from './handler.mjs';
export default { fetch(request, env, ctx) { return serveSnapshot(request, env, ctx, caches.default); } };
