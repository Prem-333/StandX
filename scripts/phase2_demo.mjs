// Ephemeral local PostgreSQL-compatible test engine; not a production server.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';

const probe=createServer();
await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
const port=probe.address().port;
await new Promise(resolve=>probe.close(resolve));
const db=await PGlite.create();
const server=new PGLiteSocketServer({db,port,host:'127.0.0.1'});
try {
  await server.start();
  console.log('Phase 2: isolated PGlite SQL demo on loopback; no BIS network access.');
  const child=spawn(process.env.PYTHON || 'python',['scripts/phase2_demo.py'],{
    stdio:'inherit',windowsHide:true,
    env:{...process.env,DATABASE_URL:`postgresql://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`}
  });
  process.exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>resolve(code??1));});
} finally {
  await server.stop();await db.close();
}
