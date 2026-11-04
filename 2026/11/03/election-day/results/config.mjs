import { LIVE_STARTS_AT } from './schedule.mjs';

// Set this to the public, normalized snapshot URL after deployment acceptance.
// Never point browsers at the Board of Elections API or put credentials here.
export const CONFIG = Object.freeze({
  endpoint: null,
  startsAt: LIVE_STARTS_AT,
  // Preview controls and test modes are allowed only on these exact hosts.
  // Add a Herald staging host explicitly if needed; never add the public site.
  previewHosts: Object.freeze(['localhost', '127.0.0.1', '[::1]']),
  electionId: 'ri-2026-general',
  pollIntervalMs: 60_000,
  staleAfterMs: 180_000,
  timeoutMs: 12_000,
  maxSnapshotBytes: 2_000_000,
  cacheKey: 'herald-election-2026:last-good:v1',
  geographyUrl: 'assets/results/geography.json',
  fixtureUrls: {
    waiting: 'data/results/waiting.json',
    historical: 'data/results/primary-2026.json',
    mock: 'data/results/mock.json',
  },
});

export function previewsAllowed(hostname, hosts = CONFIG.previewHosts) {
  return hosts.includes(hostname);
}
