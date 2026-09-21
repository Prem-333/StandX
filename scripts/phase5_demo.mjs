// Persistent local PostgreSQL-compatible audit store. No external services.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const root=fileURLToPath(new URL('..',import.meta.url));
const directory=resolve(root,'data/local/recommendations_pg');
await mkdir(directory,{recursive:true});
const probe=createServer();
await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
const port=probe.address().port;
await new Promise(resolve=>probe.close(resolve));
const db=await PGlite.create(directory);
const server=new PGLiteSocketServer({db,port,host:'127.0.0.1'});
try {
  await server.start();
  console.log(`Persistent local audit database: ${directory}`);
  const child=spawn(process.env.PYTHON || 'python',['scripts/phase5_demo.py'],{
    cwd:root,stdio:'inherit',windowsHide:true,
    env:{...process.env,PYTHONUTF8:'1',DATABASE_URL:`postgresql://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`}
  });
  process.exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>resolve(code??1));});
} finally {
  await server.stop();await db.close();
}
// Reopen from disk to verify audit persistence beyond the server lifecycle.
if (!process.exitCode) {
  const reopened=await PGlite.create(directory);
  try {
    const result=await reopened.query('SELECT count(*)::int AS rows FROM kb.recommendations_log');
    if (result.rows[0].rows<8) throw new Error('Audit rows did not survive reopening');
    console.log('Audit rows after closing and reopening database:',result.rows[0].rows);
  } finally { await reopened.close(); }
}
