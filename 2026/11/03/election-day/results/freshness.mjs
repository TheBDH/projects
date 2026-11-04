const zone = { timeZone: 'America/New_York' };
const clock = new Intl.DateTimeFormat('en-US', { ...zone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const datedClock = new Intl.DateTimeFormat('en-US', { ...zone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const exactClock = new Intl.DateTimeFormat('en-US', { ...zone, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
const day = new Intl.DateTimeFormat('en-US', { ...zone, year: 'numeric', month: 'numeric', day: 'numeric' });

function ageLabel(elapsed) {
  const minutes = Math.floor(Math.max(0, elapsed) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// checkedAt measures a successful upstream check, even when votes are unchanged.
// A browser download, retry, or render must never advance this timestamp.
export function describeFreshness({ snapshot, status = {}, connected = false, now = Date.now() }) {
  const empty = { text: '', title: '' };
  const mode = status.mode || snapshot?.mode || 'live';
  if (['scheduled', 'loading'].includes(status.kind) || (mode === 'live' && !connected)) return empty;
  if (mode === 'historical') {
    const sourceAt = Date.parse(snapshot?.mode === mode ? snapshot.sourceUpdated : '');
    return Number.isFinite(sourceAt) ? { ...empty, text: `Historical results · ${datedClock.format(sourceAt)}`, title: `Official source timestamp: ${exactClock.format(sourceAt)}.` } : empty;
  }
  const verifiedAt = Date.parse(status.lastChecked || '');
  if (!Number.isFinite(verifiedAt) || snapshot?.mode !== mode) return empty;
  const elapsed = now - verifiedAt;
  const time = (day.format(verifiedAt) === day.format(now) ? clock : datedClock).format(verifiedAt);
  const suffix = status.paused ? ' · Paused' : '';
  const sourceAt = Date.parse(snapshot.sourceUpdated);
  const sourceTitle = Number.isFinite(sourceAt) ? ` Official source timestamp: ${exactClock.format(sourceAt)}.` : '';
  return {
    text: snapshot.coverageEndedAt ? `Last verified ${exactClock.format(verifiedAt)}` : `Last verified ${ageLabel(elapsed)} (${time})${suffix}`,
    title: `Last successful source check: ${exactClock.format(verifiedAt)}.${sourceTitle} A successful check may have unchanged vote totals.`,
  };
}
