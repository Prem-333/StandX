// Persistent, loopback PostgreSQL-compatible host for API/multilingual integration.
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {createServer} from 'node:net';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
const directory=resolve(root,'data/local/api_demo_pg');
await mkdir(directory,{recursive:true});
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));
const port=probe.address().port;await new Promise(r=>probe.close(r));
const db=await PGlite.create(directory);
const server=new PGLiteSocketServer({db,port,host:'127.0.0.1'});
try {
  await server.start();
  const child=spawn(process.env.PYTHON||'python',[process.argv[2]||'scripts/phase8_demo.py',...process.argv.slice(3)],{
    cwd:root,stdio:'inherit',windowsHide:true,
    env:{...process.env,PYTHONUTF8:'1',DATABASE_URL:`postgresql://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`}
  });
  process.exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',c=>resolve(c??1));});
} finally {await server.stop();await db.close();}
