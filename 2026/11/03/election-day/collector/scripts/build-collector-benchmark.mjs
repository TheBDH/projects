// A separate, bounded deployment exercises the real collector and R2 writes.
// It cannot fetch BOE or write to the live bucket. Three minute alarms stop it.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
const source = await readFile(new URL('../../tests/fixtures/general-export.json.gz', import.meta.url));
const output = new URL('../.build/collector-benchmark/', import.meta.url);
await mkdir(output, { recursive: true });
const code = `import handler, { ElectionCollector } from '../../src/worker.mjs';
const encoded = ${JSON.stringify(source.toString('base64'))};
export class MockElectionCollector extends ElectionCollector {
  constructor(ctx, env) {
    super(ctx, env);
    this.engine.fetchSource = async () => {
      const call = (this.engine.store.get('mockCalls') || 0) + 1;
      this.engine.store.put('mockCalls', call);
      if (call > 3) throw new Error('The bounded three-check benchmark is complete');
      if (call === 2) return new Response(null, {status:304});
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      const source = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
      source.createdAt = new Date().toISOString();
      const votes = call === 1 ? 121 : 81;
      for (const id of ['4','280','417']) {
        const local = source.localResults.find(t=>t.name==='Providence').ballotItems.find(c=>c.id===id);
        const name = local.ballotOptions[0].precinctResults.find(p=>!/limited/i.test(p.name)).name;
        for (const [i, option] of local.ballotOptions.entries()) {
          const row = option.precinctResults.find(p=>p.name===name);
          row.reportingStatus='Partially Reported'; row.voteCount = i===0?votes:i===1?votes-20:0;
          row.groupResults.find(m=>m.groupName==='Election Day').voteCount=row.voteCount;
          option.voteCount=row.voteCount; option.groupResults.find(m=>m.groupName==='Election Day').voteCount=row.voteCount;
        }
        if (id==='4') for (const option of source.results.ballotItems.find(c=>c.id==='4').ballotOptions) {
          const localOption=local.ballotOptions.find(o=>o.id===option.id);
          option.voteCount=localOption.voteCount; option.groupResults.find(m=>m.groupName==='Election Day').voteCount=localOption.voteCount;
        }
      }
      return Response.json(source,{headers:{ETag:'"mock-'+call+'"'}});
    };
    this.engine.bucket = { put: async (key, value, options) => {
      if (key.endsWith('.json')) {
        const snapshot = JSON.parse(value); snapshot.mode='mock'; snapshot.source.label='Simulated collector test — not election returns';
        value=JSON.stringify(snapshot); options={...options,customMetadata:{...options.customMetadata,snapshotMode:'mock'}};
      }
      return env.RESULTS.put('collector-test/'+key,value,options);
    }};
  }
  async alarm() { await this.engine.collect({alarm:true}); if ((this.engine.store.get('mockCalls')||0)>=3) await this.engine.stop(); }
}
export default handler;`;
const entry = new URL('entry.mjs', output); await writeFile(entry, code);
await build({ entryPoints: [entry.pathname], bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', external: ['cloudflare:workers'], outfile: new URL('worker.mjs', output).pathname });
console.log('Built isolated three-alarm collector benchmark.');
