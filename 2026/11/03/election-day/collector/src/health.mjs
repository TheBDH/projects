import { validateSnapshot } from '../../results/model.mjs';
import { LIVE_STARTS_AT } from '../../results/schedule.mjs';
import { readBounded, MAX_SNAPSHOT_BYTES } from './engine.mjs';

export const SNAPSHOT_URL = 'https://herald-election-data-2026.pages.dev/ri-2026-general/latest.json';
export const READER_ORIGIN = 'https://projects.browndailyherald.com';
export const STALE_MS = 180_000;

// Health uses the successful source check, not when vote totals last changed.
// Election-night returns can legitimately remain unchanged for a long time.
export function snapshotHealth(snapshot, now = Date.now()) {
  validateSnapshot(snapshot, { expectedMode: 'live' });
  for (const key of ['checkedAt', 'publishedAt', 'coverageEndedAt']) {
    if (snapshot[key] && Date.parse(snapshot[key]) > now + 30_000) throw new Error('Election results have a future verification timestamp');
  }
  if (snapshot.coverageEndedAt) return { phase: 'ended', checkedAt: snapshot.checkedAt, coverageEndedAt: snapshot.coverageEndedAt };
  if (now - Date.parse(snapshot.checkedAt) > STALE_MS) throw new Error('Election results have not passed a source check for over three minutes');
  return { phase: 'healthy', checkedAt: snapshot.checkedAt, revision: snapshot.revision };
}

export async function checkDelivery({ fetcher = fetch, now = Date.now, startsAt = LIVE_STARTS_AT, timeoutMs = 12_000 } = {}) {
  const start = Date.parse(startsAt);
  if (!Number.isFinite(start)) throw new Error('Election monitoring start time is invalid');
  if (now() < start) return { phase: 'scheduled', startsAt };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Election results delivery timed out')), timeoutMs);
  try {
    const response = await fetcher(SNAPSHOT_URL, { headers: { Origin: READER_ORIGIN, Accept: 'application/json' }, redirect: 'manual', signal: controller.signal });
    if (response.status === 503 && now() < start + STALE_MS) {
      await response.body?.cancel();
      return { phase: 'starting', startsAt };
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error('Election results delivery returned HTTP ' + response.status); }
    if (response.headers.get('Access-Control-Allow-Origin') !== READER_ORIGIN) {
      await response.body?.cancel(); throw new Error('Election results CORS does not allow the Herald site');
    }
    if (!/^application\/json\b/i.test(response.headers.get('Content-Type') || '')) {
      await response.body?.cancel(); throw new Error('Election results delivery did not return JSON');
    }
    const bytes = await readBounded(response, MAX_SNAPSHOT_BYTES);
    return snapshotHealth(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)), now());
  } finally { clearTimeout(timer); }
}
