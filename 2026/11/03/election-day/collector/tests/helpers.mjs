import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { CollectorEngine } from '../src/engine.mjs';
export const manifest = JSON.parse(readFileSync(new URL('../../data/results/general-manifest.json', import.meta.url)));
export const original = JSON.parse(gunzipSync(readFileSync(new URL('../../tests/fixtures/general-export.json.gz', import.meta.url))));
export const NOW = Date.parse('2026-11-03T22:00:00Z');
export function populated(votes = 121, createdAt = '2026-11-03T21:59:00Z') {
  const source = structuredClone(original);
  source.createdAt = createdAt;
  for (const contestId of ['4', '280', '417']) {
    const local = source.localResults.find(t => t.name === 'Providence').ballotItems.find(c => c.id === contestId);
    const rowName = local.ballotOptions[0].precinctResults.find(p => !/limited/i.test(p.name)).name;
    for (const [index, option] of local.ballotOptions.entries()) {
      const row = option.precinctResults.find(p => p.name === rowName);
      row.reportingStatus = 'Partially Reported';
      row.voteCount = index === 0 ? votes : index === 1 ? votes - 20 : 0;
      row.groupResults.find(m => m.groupName === 'Election Day').voteCount = row.voteCount;
      option.voteCount = row.voteCount;
      option.groupResults.find(m => m.groupName === 'Election Day').voteCount = row.voteCount;
    }
    if (contestId === '4') {
      const statewide = source.results.ballotItems.find(c => c.id === '4');
      for (const option of statewide.ballotOptions) {
        const localOption = local.ballotOptions.find(o => o.id === option.id);
        option.voteCount = localOption.voteCount;
        option.groupResults.find(m => m.groupName === 'Election Day').voteCount = localOption.voteCount;
      }
    }
  }
  return source;
}
export class MemoryStore {
  values = new Map();
  alarm = null;
  failCommit = false;
  get(key) { return structuredClone(this.values.get(key) || null); }
  put(key, value) { this.values.set(key, structuredClone(value)); }
  commit(values, remove) {
    if (this.failCommit) { this.failCommit = false; throw new Error('Injected transaction failure'); }
    for (const [key, value] of Object.entries(values)) this.put(key, value);
    for (const key of remove) this.values.delete(key);
  }
  async getAlarm() { return this.alarm; }
  async setAlarm(time) { this.alarm = time; }
  async deleteAlarm() { this.alarm = null; }
}
export class MemoryBucket {
  values = new Map();
  puts = [];
  fail = null;
  async put(key, value, options) {
    if (this.fail?.(key)) throw new Error('Injected R2 publication failure');
    this.puts.push(key); this.values.set(key, { value, options }); return {};
  }
}
export function rig({ source = original, status = 200, headers = {}, timeoutMs = 20_000, fetchSource, ...extra } = {}) {
  let time = NOW, calls = 0, currentSource = source, currentStatus = status, currentHeaders = headers;
  const store = new MemoryStore(), bucket = new MemoryBucket(), requests = [];
  const fetcher = fetchSource || (async (url, init) => {
    calls++; requests.push({ url, init });
    return new Response(currentStatus === 304 ? null : JSON.stringify(currentSource), {
      status: currentStatus, headers: { 'Content-Type': 'application/json', ETag: '"source-one"', ...currentHeaders }
    });
  });
  const make = () => new CollectorEngine({ store, bucket, manifest, now: () => time, fetchSource: fetcher, timeoutMs, ...extra });
  return { store, bucket, requests, make, engine: make(), calls: () => calls, now: () => time,
    advance: (ms = 60_001) => { time += ms; },
    set: (source, status = 200, headers = {}) => { currentSource = source; currentStatus = status; currentHeaders = headers; } };
}
