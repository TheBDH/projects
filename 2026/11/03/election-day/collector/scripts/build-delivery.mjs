import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const output = new URL('../.build/delivery/', import.meta.url);
await mkdir(output, { recursive: true });
await build({ entryPoints: [new URL('../delivery/worker.mjs', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', outfile: new URL('_worker.js', output).pathname });
await writeFile(new URL('_routes.json', output), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
// Pages does not accept --config. Give its CLI an isolated project directory
// so it cannot pick up the collector's Worker configuration by mistake.
const deployment = new URL('../.build/pages-project/', import.meta.url);
await mkdir(deployment, { recursive: true });
const config = JSON.parse(await readFile(new URL('../wrangler.delivery.jsonc', import.meta.url), 'utf8'));
delete config.$schema;
config.pages_build_output_dir = '../delivery';
await writeFile(new URL('wrangler.jsonc', deployment), JSON.stringify(config, null, 2) + '\n');
console.log('Built Pages delivery Function.');
