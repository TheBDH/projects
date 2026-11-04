import { normalizeBoeExport } from '../../results/boe-adapter.mjs';
import { validateSnapshot } from '../../results/model.mjs';

export const SOURCE_URL = 'https://electionresults.ri.gov/cdn/results/RhodeIsland/export-2026StatewideGeneralElection.json';
export const INTERVAL_MS = 60_000;
export const MAX_SOURCE_BYTES = 20_000_000;
export const MAX_SNAPSHOT_BYTES = 1_000_000;
export const MAX_ARCHIVE_BYTES = 5_000_000_000;
export const PREFIX = 'ri-2026-general/';
export const LATEST_KEY = PREFIX + 'latest.json';
const utf8 = new TextEncoder();
const iso = n => new Date(n).toISOString();
const initial = () => ({ running: false, attempts: 0, successes: 0, failures: 0, lastAttemptAt: 0, nextRunAt: 0 });
const httpMetadata = cacheControl => ({ contentType: 'application/json; charset=utf-8', cacheControl });
// The official Azure-hosted .json export uses application/octet-stream.
// This allowlist applies only to SOURCE_URL; the body still must parse and
// reconcile against the reviewed manifest before any publication.
export const sourceContentTypeAllowed = value => /^application\/(?:octet-stream|(?:[\w.-]+\+)?json)(?:\s*;|$)/i.test(value || '');
export async function sha256(value) {
  const bytes = typeof value === 'string' ? utf8.encode(value) : value;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
}

export async function readBounded(response, maxBytes = MAX_SOURCE_BYTES) {
  const advertised = Number(response.headers.get('content-length'));
  if (Number.isFinite(advertised) && advertised > maxBytes) {
    await response.body?.cancel(); throw new Error('Source exceeds the response size limit');
  }
  if (!response.body) throw new Error('Empty source response');
  const reader = response.body.getReader(), chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new Error('Source exceeds the response size limit'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

/**
 * One engine per election Durable Object. Storage methods get/put/commit are
 * synchronous SQLite transactions; the alarm is durable. Dependency injection
 * lets tests reproduce crashes and failed publications without a live source.
 */
export class CollectorEngine {
  constructor({ store, bucket, manifest, fetchSource = (url, init) => fetch(url, init), now = Date.now, timeoutMs = 20_000, startAt = -Infinity, stopAt = Infinity, allowCollection = true, maxArchiveBytes = MAX_ARCHIVE_BYTES, log = () => {} }) {
    // Invalid configured dates fail closed instead of starting early or running forever.
    Object.assign(this, { store, bucket, manifest, fetchSource, now, timeoutMs, startAt: Number.isNaN(startAt) ? Infinity : startAt, stopAt: Number.isNaN(stopAt) ? 0 : stopAt, allowCollection, maxArchiveBytes, log });
    this.busy = null;
    this.finishing = null;
  }
  meta() { return this.store.get('meta') || initial(); }
  async status() {
    const meta = this.meta(), now = this.now();
    return { ...meta, pending: Boolean(this.store.get('pending')), coveragePending: Boolean(this.store.get('pendingCoverage')), nextAlarm: await this.store.getAlarm(),
      startsAt: Number.isFinite(this.startAt) ? iso(this.startAt) : null,
      endsAt: Number.isFinite(this.stopAt) ? iso(this.stopAt) : null,
      phase: meta.ending ? 'ending' : meta.coverageEndedAt && !meta.running ? 'ended' : !this.allowCollection || this.startAt >= this.stopAt ? 'disabled' : now >= this.stopAt ? 'ended' : !meta.running ? 'stopped' : now < this.startAt ? 'scheduled' : 'running',
      archiveBytesReserved: this.store.get('archiveBudget')?.reservedBytes || 0,
      archiveByteLimit: this.maxArchiveBytes,
      stale: !(meta.coverageEndedAt && !meta.running) && now >= this.startAt && (!meta.checkedAt || now - Date.parse(meta.checkedAt) > 180_000) };
  }
  reserveArchive(bytes) {
    const used = this.store.get('archiveBudget')?.reservedBytes || 0;
    if (!Number.isSafeInteger(bytes) || bytes < 0 || !Number.isSafeInteger(this.maxArchiveBytes) || used + bytes > this.maxArchiveBytes) throw new Error('Archive storage budget reached; retain last good results and review storage before resetting the budget');
    // Reserve before the R2 write, so a crash/retry can overcount but cannot
    // undercount storage. Expiry does not reset this conservative lifetime cap.
    this.store.put('archiveBudget', { reservedBytes: used + bytes });
  }
  async start() {
    if (this.meta().ending || this.finishing) throw new Error('Wait for the end-of-coverage publication before restarting');
    if (!this.allowCollection || !this.bucket) throw new Error('Collector is not configured for collection');
    if (this.startAt >= this.stopAt || this.now() >= this.stopAt) throw new Error('Collection window is invalid or has ended');
    const meta = this.meta(); meta.running = true;
    meta.nextRunAt = Math.max(this.startAt, this.now() + 1000, meta.lastAttemptAt + INTERVAL_MS);
    this.store.put('meta', meta);
    await this.store.setAlarm(meta.nextRunAt);
    return this.status();
  }
  async stop() {
    this.store.put('meta', { ...this.meta(), running: false, nextRunAt: 0 });
    await this.store.deleteAlarm();
    if (this.busy) await this.busy;
    await this.store.deleteAlarm();
    return this.status();
  }
  finish() {
    if (this.finishing) return this.finishing;
    if (!this.store.get('current') && !this.busy) return Promise.reject(new Error('A verified snapshot is required before ending coverage'));
    // Persist the editorial decision before yielding. Alarms and the watchdog
    // can finish publication after a failed R2 write or an instance restart.
    this.store.put('meta', { ...this.meta(), running: false, nextRunAt: 0, ending: true });
    this.finishing = this.finishCoverage().finally(() => { this.finishing = null; });
    return this.finishing;
  }
  async finishCoverage() {
    await this.store.deleteAlarm();
    if (this.busy) await this.busy;
    const current = this.store.get('current');
    if (!current) {
      this.store.put('meta', { ...this.meta(), ending: false, running: false, nextRunAt: 0 });
      throw new Error('A verified snapshot is required before ending coverage');
    }
    try {
      let snapshot = this.store.get('pendingCoverage');
      if (!snapshot && !current.coverageEndedAt) {
        const endedAt = iso(Math.max(this.now(), Date.parse(current.publishedAt), Date.parse(current.checkedAt)));
        snapshot = { ...current, coverageEndedAt: endedAt, publishedAt: endedAt };
        validateSnapshot(snapshot, { expectedMode: 'live', previous: current });
        this.store.put('pendingCoverage', snapshot);
      }
      if (snapshot) {
        validateSnapshot(snapshot, { expectedMode: 'live', previous: current });
        const body = JSON.stringify(snapshot);
        if (utf8.encode(body).length > MAX_SNAPSHOT_BYTES) throw new Error('Prepared snapshot exceeds size limit');
        // This only publishes coverage metadata. It must never advance the
        // successful source-check time, change totals, or certify results.
        await this.bucket.put(LATEST_KEY, body, {
          httpMetadata: httpMetadata('public, max-age=0, s-maxage=15, must-revalidate'),
          customMetadata: { sourceHash: this.meta().sourceHash, snapshotMode: snapshot.mode }
        });
      } else snapshot = current;
      this.store.commit({ current: snapshot, meta: { ...this.meta(), running: false, nextRunAt: 0,
        ending: false, coverageEndedAt: snapshot.coverageEndedAt, publishedAt: snapshot.publishedAt, lastError: null } }, ['pendingCoverage', 'pending']);
      await this.store.deleteAlarm();
      this.log({ event: 'coverage-ended', coverageEndedAt: snapshot.coverageEndedAt, checkedAt: snapshot.checkedAt });
      return this.status();
    } catch (error) {
      const nextRunAt = this.now() + INTERVAL_MS, lastError = String(error.message || error).slice(0, 240);
      this.store.put('meta', { ...this.meta(), ending: true, running: false, nextRunAt, lastError });
      await this.store.setAlarm(nextRunAt);
      this.log({ event: 'coverage-publication-failed', error: lastError });
      throw error;
    }
  }
  async watchdog() {
    const meta = this.meta();
    if (meta.ending) return this.finish();
    if (!this.allowCollection || this.startAt >= this.stopAt || this.now() >= this.stopAt) return this.stop();
    if (meta.running) {
      const alarm = await this.store.getAlarm();
      // A separate five-minute Cron only repairs a missing/overdue alarm.
      // It never fetches or restarts an intentionally stopped election.
      if (!alarm || alarm < this.now() - INTERVAL_MS) {
        await this.store.setAlarm(Math.max(this.startAt, this.now() + 1000, meta.nextRunAt || 0, meta.lastAttemptAt + INTERVAL_MS));
      }
    }
    return this.status();
  }
  collect({ alarm = false } = {}) {
    // HTTP, alarms and retries share this lock. The persisted attempt timestamp
    // also prevents a replacement instance from fetching twice in one minute.
    if (this.busy) return this.busy;
    const meta = this.meta();
    if (meta.ending) return this.finish();
    if (meta.coverageEndedAt && !meta.running) return Promise.resolve({ skipped: 'coverage-ended' });
    this.busy = this.run(alarm).finally(() => { this.busy = null; });
    return this.busy;
  }
  async publishPending(pending) {
    const snapshot = pending.snapshot;
    validateSnapshot(snapshot, { expectedMode: 'live', previous: this.store.get('current') });
    const body = JSON.stringify(snapshot);
    if (utf8.encode(body).length > MAX_SNAPSHOT_BYTES) throw new Error('Prepared snapshot exceeds size limit');
    if (pending.changed) {
      this.reserveArchive(utf8.encode(body).length);
      await this.bucket.put(PREFIX + 'snapshots/' + snapshot.revision + '.json', body, {
        httpMetadata: httpMetadata('public, max-age=31536000, immutable'),
        customMetadata: { sourceHash: pending.sourceHash, snapshotMode: snapshot.mode }
      });
    }
    // A single R2 PUT atomically replaces the entire three-contest publication.
    await this.bucket.put(LATEST_KEY, body, {
      httpMetadata: httpMetadata('public, max-age=0, s-maxage=15, must-revalidate'),
      customMetadata: { sourceHash: pending.sourceHash, snapshotMode: snapshot.mode }
    });
    const meta = this.meta();
    const next = { ...meta, successes: meta.successes + 1, failures: 0, lastError: null,
      checkedAt: snapshot.checkedAt, publishedAt: iso(this.now()), sourceUpdated: snapshot.sourceUpdated, coverageEndedAt: snapshot.coverageEndedAt || null,
      revision: snapshot.revision, sourceHash: pending.sourceHash, manifestHash: pending.manifestHash,
      etag: pending.etag, lastModified: pending.lastModified };
    this.store.commit({ meta: next, current: snapshot }, ['pending']);
    this.log({ event: 'published', revision: snapshot.revision, checkedAt: snapshot.checkedAt });
  }
  async fetchCandidate(meta) {
    const previous = this.store.get('current');
    const activePrevious = previous && { ...previous };
    if (activePrevious) delete activePrevious.coverageEndedAt;
    const manifestHash = await sha256(JSON.stringify(this.manifest));
    const headers = new Headers({ Accept: 'application/json' });
    if (previous && meta.manifestHash === manifestHash) {
      if (meta.etag) headers.set('If-None-Match', meta.etag);
      else if (meta.lastModified) headers.set('If-Modified-Since', meta.lastModified);
    }
    const controller = new AbortController();
    // Clear this timer on every path so it cannot keep the object active.
    const timer = setTimeout(() => controller.abort(new Error('Source request timed out')), this.timeoutMs);
    let response, bytes;
    try {
      response = await this.fetchSource(SOURCE_URL, { headers, signal: controller.signal, redirect: 'manual' });
      if (response.status !== 304) {
        if (!response.ok) {
          const raw = response.headers.get('retry-after');
          const seconds = Number(raw);
          const retryAt = raw && Number.isFinite(seconds) ? this.now() + seconds * 1000 : Date.parse(raw);
          const error = new Error('Source HTTP ' + response.status);
          if ([429, 503].includes(response.status) && Number.isFinite(retryAt)) error.retryAt = Math.min(this.now() + 900_000, Math.max(this.now() + INTERVAL_MS, retryAt));
          await response.body?.cancel();
          throw error;
        }
        if (!sourceContentTypeAllowed(response.headers.get('content-type'))) {
          await response.body?.cancel(); throw new Error('Source did not return JSON');
        }
        bytes = await readBounded(response);
      }
    } finally { clearTimeout(timer); }
    const checkedAt = iso(this.now());
    if (response.status === 304) {
      if (!previous || meta.manifestHash !== manifestHash) throw new Error('Not-modified response without an approved baseline');
      return { snapshot: validateSnapshot({ ...activePrevious, checkedAt, publishedAt: checkedAt }, { expectedMode: 'live', previous }),
        changed: false, sourceHash: meta.sourceHash, manifestHash, etag: meta.etag, lastModified: meta.lastModified };
    }
    const sourceHash = await sha256(bytes);
    let snapshot;
    if (previous && sourceHash === meta.sourceHash && manifestHash === meta.manifestHash) {
      snapshot = validateSnapshot({ ...activePrevious, checkedAt, publishedAt: checkedAt }, { expectedMode: 'live', previous });
    } else {
      const source = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (Date.parse(source.createdAt) > this.now() + 300_000) throw new Error('Source timestamp is in the future');
      snapshot = normalizeBoeExport(source, this.manifest, { publishedAt: checkedAt, previous });
      snapshot.revision = await sha256(sourceHash + manifestHash);
      if (Object.values(snapshot.contests).every(c => c.areas[c.totalArea].reporting.reported === 0)) snapshot.status = 'waiting';
      validateSnapshot(snapshot, { expectedMode: 'live', previous });
    }
    const changed = sourceHash !== meta.sourceHash || manifestHash !== meta.manifestHash;
    if (sourceHash !== meta.sourceHash) {
      // Archive only changed source versions; gzip and R2 lifecycle rules bound
      // storage. Do this before publishing so every new revision has evidence.
      const compressed = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      const archive = await new Response(compressed).arrayBuffer();
      this.reserveArchive(archive.byteLength);
      await this.bucket.put(PREFIX + 'source/' + sourceHash + '.json.gz', archive, {
        httpMetadata: { contentType: 'application/gzip', cacheControl: 'public, max-age=31536000, immutable' },
        customMetadata: { sourceHash, sourceUpdated: snapshot.sourceUpdated }
      });
    }
    return { snapshot, changed, sourceHash, manifestHash, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') };
  }
  async run(fromAlarm) {
    let meta = this.meta();
    if (!this.allowCollection || this.startAt >= this.stopAt || this.now() >= this.stopAt) {
      this.store.put('meta', { ...meta, running: false, nextRunAt: 0 });
      await this.store.deleteAlarm(); return { skipped: 'disabled-or-ended' };
    }
    if (fromAlarm && !meta.running) return { skipped: 'stopped' };
    if (this.now() < this.startAt) {
      if (meta.running) {
        this.store.put('meta', { ...meta, nextRunAt: this.startAt });
        await this.store.setAlarm(this.startAt);
      }
      return { skipped: 'before-start', startsAt: iso(this.startAt) };
    }
    if (!this.bucket) throw new Error('Missing results storage binding');
    const now = this.now();
    if (meta.lastAttemptAt && now < meta.lastAttemptAt + INTERVAL_MS) {
      if (meta.running) await this.store.setAlarm(Math.max(meta.nextRunAt, meta.lastAttemptAt + INTERVAL_MS));
      return { skipped: 'already-checked-this-minute' };
    }
    meta = { ...meta, attempts: meta.attempts + 1, lastAttemptAt: now, nextRunAt: now + INTERVAL_MS };
    this.store.put('meta', meta);
    // Schedule before doing external work so a crash still leaves a wake-up.
    if (meta.running) await this.store.setAlarm(meta.nextRunAt);
    let outcome;
    try {
      let pending = this.store.get('pending');
      if (pending && pending.manifestHash !== await sha256(JSON.stringify(this.manifest))) {
        this.store.commit({}, ['pending']); pending = null;
      }
      if (!pending) {
        pending = await this.fetchCandidate(meta);
        this.store.put('pending', pending);
      }
      await this.publishPending(pending);
      outcome = { ok: true, revision: pending.snapshot.revision };
    } catch (error) {
      const current = this.meta(), failures = current.failures + 1;
      const nextRunAt = Math.max(now + Math.min(INTERVAL_MS * 2 ** Math.min(failures - 1, 2), 240_000), error.retryAt || 0);
      const lastError = String(error.message || error).slice(0, 240);
      this.store.put('meta', { ...current, failures, lastError, nextRunAt });
      this.log({ event: 'collection-failed', failures, error: lastError });
      outcome = { ok: false, error: lastError };
    } finally {
      const current = this.meta();
      if (current.running) await this.store.setAlarm(current.nextRunAt);
      else await this.store.deleteAlarm();
    }
    return outcome;
  }
}
