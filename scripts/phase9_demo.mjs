// Owned, loopback-only demo processes. No browser credential or remote service.
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {createServer as netServer} from 'node:net';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createServer as viteServer} from '../frontend/node_modules/vite/dist/node/index.js';

const root=fileURLToPath(new URL('..',import.meta.url));
async function freePort(){const server=netServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));return port;}
const directory=resolve(root,'data/local/phase9_pg');await mkdir(directory,{recursive:true});
const db=await PGlite.create(directory),dbPort=await freePort(),apiPort=await freePort();
const sql=new PGLiteSocketServer({db,port:dbPort,host:'127.0.0.1'});
const settings=JSON.parse(await readFile(resolve(root,'services/recommendation/config.json'),'utf8'));
const configPath=resolve(root,'data/local/phase9_recommendation_config.json');
await writeFile(configPath,JSON.stringify({...settings,include_synthetic:true}));
const secret=randomBytes(32).toString('hex');
process.env.API_PROXY_TARGET=`http://127.0.0.1:${apiPort}`;
process.env.SERVER_API_KEY=secret;process.env.FRONTEND_DEMO='1';
let child,web,closed=false;
async function close(){if(closed)return;closed=true;await web?.close();if(child&&!child.killed){child.kill();await new Promise(r=>{if(child.exitCode!==null)return r();child.once('exit',r);});}await sql.stop();await db.close();}
process.on('SIGINT',()=>close().then(()=>process.exit(0)));
process.on('SIGTERM',()=>close().then(()=>process.exit(0)));
try{
  await sql.start();
  child=spawn(process.env.PYTHON||'python',['scripts/phase9_api.py'],{cwd:root,windowsHide:true,stdio:'inherit',env:{...process.env,PYTHONUTF8:'1',
    PHASE9_API_PORT:String(apiPort),DATABASE_URL:`postgresql://postgres:postgres@127.0.0.1:${dbPort}/postgres?sslmode=disable`,
    API_KEYS_JSON:JSON.stringify({'phase9-demo-officer':secret}),API_RATE_LIMIT:'300',RECOMMENDATION_CONFIG:configPath}});
  let started=false;
  child.on('error',e=>{console.error(e.message);});
  for(let i=0;i<180;i++){
    if(child.exitCode!==null)throw new Error('Demo API stopped during startup. Check cached models/index and Qdrant ownership.');
    try{const r=await fetch(`${process.env.API_PROXY_TARGET}/v1/health`,{headers:{'X-API-Key':secret},signal:AbortSignal.timeout(3000)});if(r.ok){started=true;break;}}catch{/* Wait for local model loading. */}
    await new Promise(r=>setTimeout(r,1000));
  }
  if(!started)throw new Error('Local API startup timed out');
  web=await viteServer({root:resolve(root,'frontend'),configFile:resolve(root,'frontend/vite.config.mjs')});await web.listen();
  await writeFile(resolve(root,'data/local/phase9_runtime.json'),JSON.stringify({url:'http://127.0.0.1:5173',pid:process.pid,api_pid:child.pid,api_port:apiPort,synthetic:true}));
  console.log('\nPhase 9 clickable demo: http://127.0.0.1:5173\nMOCK / SYNTHETIC fixtures enabled; verified records retain their provenance.\nPress Ctrl+C to stop this demo.\n');
  child.once('exit',()=>{if(!closed){console.error('Local API stopped');close().then(()=>{process.exitCode=1;});}});
  if(process.argv.includes('--test')){
    const test=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test'],{cwd:resolve(root,'frontend'),stdio:'inherit',windowsHide:true});
    const code=await new Promise((r,j)=>{test.on('error',j);test.on('exit',r);});
    // Read the durable SQL records produced by actual browser feedback requests.
    const feedback=await db.query('SELECT decision,record_id,actor_id FROM kb.user_feedback ORDER BY created_at');
    const audit=await db.query('SELECT count(*)::int AS count FROM kb.recommendations_log');
    await writeFile(resolve(root,'data/processed/frontend_audit_check.json'),JSON.stringify({audit_rows:audit.rows[0].count,feedback:feedback.rows},null,2));
    process.exitCode=code??1;await close();
  }
}catch(error){console.error(error.message);process.exitCode=1;await close();}
