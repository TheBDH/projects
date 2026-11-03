import { CONFIG } from './config.mjs';
import { validateSnapshot } from './model.mjs';
import { mockAtStep } from './mock.mjs';

export async function readSnapshotResponse(response, maxBytes = CONFIG.maxSnapshotBytes) {
  if (!response.ok) throw new Error('Results server returned HTTP ' + response.status);
  if (Number(response.headers.get('Content-Length')) > maxBytes) throw new Error('Results file is too large');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty results response');
  const chunks = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new Error('Results file is too large');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  const bytes = new Uint8Array(length); let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export function createFeed({ onSnapshot, onStatus, mode = 'live', scenario = 'normal', allowPreview = false, config = CONFIG,
  fetchImpl = (...args) => fetch(...args), now = () => Date.now(), documentRef = globalThis.document,
  storage = (() => { try { return globalThis.localStorage; } catch { return null; } })(),
} = {}) {
  let currentMode = allowPreview && ['historical', 'mock'].includes(mode) ? mode : 'live';
  let currentScenario = scenario, current = null, base = null, step = 3;
  let timer = null, controller = null, generation = 0, paused = false, stopped = true;
  let failures = 0, lastStatus = null;
  const startsAt = config.startsAt ? Date.parse(config.startsAt) : -Infinity;
  const beforeStart = () => currentMode === 'live' && config.endpoint && now() < startsAt;
  const startLabel = Number.isFinite(startsAt) ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' }).format(startsAt) : '';
  const cacheKey = config.cacheKey + ':' + (config.endpoint || 'not-connected');
  function status(kind, message, updating = false) {
    lastStatus = { kind, message, lastChecked: current?.checkedAt || null, updating };
    emitStatus();
  }
  function emitStatus() {
    if (lastStatus) onStatus?.({ ...lastStatus, updating: lastStatus.updating && !paused && !stopped && !documentRef?.hidden });
  }
  function cancel() { clearTimeout(timer); timer = null; controller?.abort(); controller = null; }
  function accept(snapshot) {
    validateSnapshot(snapshot, { previous: current, expectedMode: currentMode });
    current = snapshot; onSnapshot?.(snapshot);
    if (currentMode === 'live' && config.endpoint) {
      try { storage?.setItem(cacheKey, JSON.stringify(snapshot)); } catch { /* Storage is optional. */ }
    }
  }
  function liveStatus() {
    if (now() - Date.parse(current.checkedAt) > config.staleAfterMs) status('stale', 'Updates are delayed. Showing the last verified results.');
    else status(current.status === 'waiting' ? 'waiting' : 'live', current.status === 'waiting' ? 'Checking for election results every minute.' : 'Results refresh automatically every minute.', true);
  }
  async function load(url, token) {
    controller = new AbortController();
    const localController = controller;
    const timeout = setTimeout(() => localController.abort(), config.timeoutMs);
    try {
      const response = await fetchImpl(url, { signal: localController.signal, cache: 'default', credentials: 'omit' });
      const data = await readSnapshotResponse(response, config.maxSnapshotBytes);
      if (token !== generation || stopped) return null;
      return data;
    } finally { clearTimeout(timeout); if (controller === localController) controller = null; }
  }
  function schedule() {
    clearTimeout(timer);
    if (stopped || paused || documentRef?.hidden || currentMode === 'historical' || (currentMode === 'live' && !config.endpoint)) return;
    const interval = beforeStart() ? Math.min(2_147_000_000, startsAt - now()) : currentMode === 'mock' ? 8000 : Math.min(240000, config.pollIntervalMs * 2 ** Math.min(failures, 2));
    timer = setTimeout(() => { if (currentMode === 'mock') step = Math.min(12, step + 1); void refresh(); }, interval);
  }
  async function refresh() {
    if (stopped) return;
    const token = generation;
    try {
      if (currentMode === 'live' && config.endpoint && Number.isNaN(startsAt)) throw new Error('Invalid results start time');
      if (beforeStart()) {
        if (!current) {
          const data = await load(config.fixtureUrls.waiting, token);
          if (!data || token !== generation) return;
          accept(data);
        }
        status('scheduled', `Automatic updates begin ${startLabel}, when polls close.`);
      } else if (currentMode === 'mock') {
        if (!base) base = await load(config.fixtureUrls.mock, token);
        if (!base || token !== generation) return;
        if (currentScenario === 'failure') throw new Error('Simulated network failure');
        if (currentScenario === 'delayed' && current?.mode === 'mock') { status('stale', 'Simulation: source updates are delayed. Previous results remain visible.'); return; }
        let data = mockAtStep(base, step, { now: now(), correction: currentScenario === 'correction' });
        if (currentScenario === 'malformed') { data = structuredClone(data); data.contests.governor.areas.state.votes[0] = -1; }
        accept(data); status('mock', (currentScenario === 'correction' ? 'Simulation: a downward correction has been applied.' : 'Simulated election night.') + (paused ? ' Simulation paused; use Next update to advance.' : ' Updates every 8 seconds.'), true);
      } else {
        const url = currentMode === 'historical' ? config.fixtureUrls.historical : config.endpoint || config.fixtureUrls.waiting;
        const data = await load(url, token);
        if (!data || token !== generation) return;
        accept(data);
        if (currentMode === 'historical') status('historical', 'Historical 2026 Democratic primary results. These are not general-election returns.');
        else if (!config.endpoint) status('waiting', 'Results updates have not started. Official results are linked below.');
        else liveStatus();
      }
      failures = 0;
    } catch (error) {
      if (token !== generation || stopped) return;
      failures += 1;
      status(current ? 'stale' : 'error', currentMode === 'mock' ? 'Simulation: update rejected or unavailable. The last valid results remain visible.' : current ? 'Updates are temporarily unavailable. Showing the last verified results.' : 'Results are temporarily unavailable. Please try again shortly.');
    } finally { if (token === generation) schedule(); }
  }
  function visibilityChanged() {
    clearTimeout(timer);
    if (documentRef?.hidden) emitStatus();
    else if (!paused && !stopped && currentMode !== 'historical' && (currentMode !== 'live' || config.endpoint)) {
      generation++; cancel();
      if (lastStatus) status(lastStatus.kind, lastStatus.message);
      void refresh();
    }
  }
  return {
    async start() {
      if (!stopped) return; stopped = false;
      documentRef?.addEventListener('visibilitychange', visibilityChanged);
      if (currentMode === 'live' && config.endpoint && !beforeStart()) {
        try { const cached = JSON.parse(storage?.getItem(cacheKey) || 'null'); if (cached) { accept(cached); status('stale', 'Showing saved results while checking for an update.'); } } catch { /* Discard corrupt cache. */ }
      }
      await refresh();
    },
    async setMode(value) {
      if (!['live', 'historical', 'mock'].includes(value)) return;
      if (value !== 'live' && !allowPreview) return;
      generation++; cancel(); currentMode = value; current = null; base = null; failures = 0; step = 3; paused = false;
      status('loading', 'Checking results…');
      await refresh();
    },
    async setScenario(value) { currentScenario = value; generation++; cancel(); await refresh(); },
    async next() { if (currentMode !== 'mock') return; step = Math.min(12, step + 1); generation++; cancel(); await refresh(); },
    setPaused(value) {
      paused = !!value; if (paused) clearTimeout(timer); else schedule();
      if (currentMode === 'mock' && current && !failures && !['delayed', 'failure', 'malformed'].includes(currentScenario)) status('mock', paused ? 'Simulation paused; use Next update to advance.' : 'Simulated election night. Updates every 8 seconds.', true);
      else emitStatus();
    },
    stop() { stopped = true; generation++; cancel(); emitStatus(); documentRef?.removeEventListener('visibilitychange', visibilityChanged); },
  };
}
