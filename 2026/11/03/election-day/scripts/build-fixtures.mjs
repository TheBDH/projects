// Rebuild reviewed source manifests and browser fixtures from saved official exports.
// node scripts/build-fixtures.mjs /path/to/source-folder /path/to/precincts.geojson
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { makeManifest, normalizeBoeExport } from '../results/boe-adapter.mjs';
import { makeMockBase } from '../results/mock.mjs';
import { validateSnapshot } from '../results/model.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = process.argv[2], geoPath = process.argv[3];
if (!sourceDir || !geoPath) throw new Error('Usage: node scripts/build-fixtures.mjs SOURCE_DIRECTORY OFFICIAL_PRECINCTS_GEOJSON');
const geo = JSON.parse(await readFile(geoPath, 'utf8'));
const geography = { precincts: geo.features.map(f => ({ id: 'precinct:' + f.properties.DISTRICT, code: f.properties.DISTRICT, town: f.properties.TOWN, ward: f.properties.Ward ? String(f.properties.Ward) : null })) };
const stamp = '2026-11-03T17:00:00.000Z';
const sources = [];
for (const dir of ['data/results', 'tests/fixtures']) await mkdir(join(root, dir), { recursive: true });
for (const primary of [false, true]) {
  const sourceName = primary ? 'primary-export.json' : 'general-export.json';
  const raw = await readFile(join(sourceDir, sourceName)), source = JSON.parse(raw);
  const manifest = makeManifest(source, geography, { primary });
  const data = normalizeBoeExport(source, manifest, { mode: primary ? 'historical' : 'live', publishedAt: stamp });
  const name = primary ? 'primary-2026' : 'waiting';
  if (!primary) {
    if (data.contests.governor.areas.state.total !== 0 || data.contests.mayor.areas['town:Providence'].total !== 0 || data.contests.question7.areas['town:Providence'].total !== 0) throw new Error('Waiting fixture must be created from the reviewed pre-election export, never replace real returns with zero.');
    data.status = 'waiting'; data.revision = 'waiting-for-service'; validateSnapshot(data);
    await writeFile(join(root, 'data/results/mock.json'), JSON.stringify(makeMockBase(data)) + '\n');
  }
  await writeFile(join(root, `data/results/${name}.json`), JSON.stringify(data) + '\n');
  await writeFile(join(root, `data/results/${primary ? 'primary' : 'general'}-manifest.json`), JSON.stringify(manifest) + '\n');
  await writeFile(join(root, 'tests/fixtures', sourceName + '.gz'), gzipSync(raw, { level: 9 }));
  sources.push({ name, url: 'https://electionresults.ri.gov/cdn/results/RhodeIsland/' + (primary ? 'export-RI2026StatewidePrimary.json' : 'export-2026StatewideGeneralElection.json'),
    sourceCreatedAt: source.createdAt, downloadedAt: '2026-11-03', originalBytes: raw.length, sha256: createHash('sha256').update(raw).digest('hex'),
    snapshotBytes: Buffer.byteLength(JSON.stringify(data)), sourceElectionDate: source.electionDate });
  console.log(name, 'governor', data.contests.governor.areas.state.total, 'mayor', data.contests.mayor.areas['town:Providence'].total);
}
await writeFile(join(root, 'data/results/geography-manifest.json'), JSON.stringify(geography) + '\n');
await writeFile(join(root, 'data/results/sources.json'), JSON.stringify(sources, null, 2) + '\n');
