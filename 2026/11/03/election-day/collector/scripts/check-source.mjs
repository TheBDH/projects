// Read-only launch check. Never regenerates the reviewed election manifest.
import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { normalizeBoeExport } from '../../results/boe-adapter.mjs';
import { SOURCE_URL, readBounded, sha256, sourceContentTypeAllowed } from '../src/engine.mjs';
const manifest = JSON.parse(await readFile(new URL('../../data/results/general-manifest.json', import.meta.url)));
const response = await fetch(SOURCE_URL, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
if (!response.ok || !sourceContentTypeAllowed(response.headers.get('Content-Type'))) {
  await response.body?.cancel(); throw new Error('Official source request failed: HTTP ' + response.status + ' / ' + response.headers.get('Content-Type'));
}
const bytes = await readBounded(response), checkedAt = new Date().toISOString();
const source = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
const snapshot = normalizeBoeExport(source, manifest, { publishedAt: checkedAt });
const report = { checkedAt, url: SOURCE_URL, contentType: response.headers.get('Content-Type'), sourceUpdated: source.createdAt, sourceSha256: await sha256(bytes), rawBytes: bytes.byteLength, gzipBytes: gzipSync(bytes).byteLength,
  normalizedBytes: Buffer.byteLength(JSON.stringify(snapshot)),
  contests: Object.fromEntries(Object.entries(snapshot.contests).map(([key,c]) => [key,{total:c.areas[c.totalArea].total, reporting:c.areas[c.totalArea].reporting}])) };
await writeFile(new URL('../../docs/evidence/cloudflare-launch-source-check.json', import.meta.url), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
