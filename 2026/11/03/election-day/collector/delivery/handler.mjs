// Pages advanced-mode Function. Readers never invoke the collector or BOE.
export const SNAPSHOT_PATH = '/ri-2026-general/latest.json';
export const CACHE_SECONDS = 15;
const MAX_BYTES = 1_000_000;
const ORIGINS = new Set(['https://projects.browndailyherald.com', 'http://127.0.0.1:8000', 'http://localhost:8000']);

function headersFor(request) {
  const headers = new Headers({
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Access-Control-Expose-Headers': 'ETag, Last-Modified, X-Results-Cache, X-Results-Mode',
    Vary: 'Origin',
  });
  const origin = request.headers.get('Origin');
  if (ORIGINS.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}
function error(request, status, message) {
  const headers = headersFor(request);
  if (status === 503) headers.set('Retry-After', '60');
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ error: message }), { status, headers });
}
function notModified(request, etag) {
  return (request.headers.get('If-None-Match') || '').split(',').some(value => {
    const tag = value.trim().replace(/^W\//, '');
    return tag === '*' || tag === etag;
  });
}
function deliver(request, response, cacheState) {
  const headers = new Headers(response.headers);
  for (const [key, value] of headersFor(request)) headers.set(key, value);
  // Cache only at the edge for 15 seconds; browsers must revalidate each poll.
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('X-Results-Cache', cacheState);
  headers.delete('X-Results-Cached-At');
  const status = notModified(request, headers.get('ETag')) ? 304 : 200;
  if (status === 304 || request.method === 'HEAD') {
    void response.body?.cancel().catch(() => {});
    if (status === 304) headers.delete('Content-Length');
    return new Response(null, { status, headers });
  }
  return new Response(response.body, { status, headers });
}

export async function serveSnapshot(request, env, ctx, cache) {
  const url = new URL(request.url);
  if (url.pathname !== SNAPSHOT_PATH) return error(request, 404, 'Not found');
  const origin = request.headers.get('Origin');
  if (origin && !ORIGINS.has(origin)) return error(request, 403, 'Origin not allowed');
  if (request.method === 'OPTIONS') {
    const headers = headersFor(request);
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'If-None-Match, If-Modified-Since');
    headers.set('Access-Control-Max-Age', '3600');
    return new Response(null, { status: 204, headers });
  }
  if (!['GET', 'HEAD'].includes(request.method)) return error(request, 405, 'Method not allowed');
  if (!env.RESULTS || !['live', 'mock'].includes(env.SNAPSHOT_MODE)) return error(request, 503, 'Results delivery is not configured');

  // A preview deployment has a different bucket, hostname and mode. Query
  // strings cannot choose a bucket, object, mode or bypass the shared cache.
  const cacheKey = new Request(url.origin + SNAPSHOT_PATH + '?delivery=v1-' + env.SNAPSHOT_MODE);
  let cached;
  try { cached = await cache.match(cacheKey); }
  catch { console.warn(JSON.stringify({ event: 'delivery-cache-read-failed' })); }
  if (cached) {
    const age = Date.now() - Number(cached.headers.get('X-Results-Cached-At'));
    if (age >= 0 && age < CACHE_SECONDS * 1000 && cached.headers.get('X-Results-Mode') === env.SNAPSHOT_MODE) return deliver(request, cached, 'HIT');
    // Do not await cancellation of a cached/teed stream: another consumer may
    // still own its other branch. There is no publication work to wait for.
    void cached.body?.cancel().catch(() => {});
  }
  try {
    const object = await env.RESULTS.get(SNAPSHOT_PATH.slice(1));
    if (!object) return error(request, 503, 'Results have not been published yet');
    // Production requires the collector's mode metadata. The isolated mock
    // bucket also accepts fixtures seeded through R2's REST upload API, which
    // does not expose custom metadata. It is never bound to production.
    const markedMode = object.customMetadata?.snapshotMode;
    const modeMatches = markedMode === env.SNAPSHOT_MODE || (env.SNAPSHOT_MODE === 'mock' && markedMode === undefined);
    if (object.size > MAX_BYTES || !modeMatches || !/^application\/json\b/i.test(object.httpMetadata?.contentType || '')) {
      await object.body.cancel();
      console.error(JSON.stringify({ event: 'delivery-object-rejected' }));
      return error(request, 503, 'Results are temporarily unavailable');
    }
    const response = new Response(object.body, { headers: {
      'Content-Type': 'application/json; charset=utf-8', 'Content-Length': String(object.size),
      'Cache-Control': 'public, max-age=' + CACHE_SECONDS,
      ETag: object.httpEtag, 'Last-Modified': object.uploaded.toUTCString(),
      'X-Results-Mode': env.SNAPSHOT_MODE, 'X-Results-Cached-At': String(Date.now()),
    } });
    ctx.waitUntil(cache.put(cacheKey, response.clone()).catch(() => console.warn(JSON.stringify({ event: 'delivery-cache-write-failed' }))));
    return deliver(request, response, 'MISS');
  } catch {
    console.error(JSON.stringify({ event: 'delivery-storage-read-failed' }));
    return error(request, 503, 'Results are temporarily unavailable');
  }
}
