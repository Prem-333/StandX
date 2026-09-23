// Sequential execution: embedded Qdrant admits one owning runtime at a time.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('..',import.meta.url));
const tasks=[
  ['Unit and HTTP boundary tests',process.env.PYTHON||'python',['-m','unittest','discover','-s','eval','-p','test_*.py','-v']],
  ['Frontend formatting',process.execPath,['frontend/node_modules/prettier/bin/prettier.cjs','--check','frontend/src','frontend/tests']],
  ['TypeScript',process.execPath,['frontend/node_modules/typescript/bin/tsc','-b','frontend']],
  ['Frontend build',process.execPath,['frontend/node_modules/vite/bin/vite.js','build','frontend','--config','frontend/vite.config.mjs']],
  ['API integration',process.execPath,['scripts/local_backend_demo.mjs','scripts/phase8_demo.py']],
  ['Real browser flows',process.execPath,['scripts/phase9_demo.mjs','--test']],
];
for(const [name,command,args] of tasks){
  console.log(`\nChecking: ${name}`);
  const child=spawn(command,args,{cwd,stdio:'inherit',windowsHide:true,env:{...process.env,PYTHONUTF8:'1'}});
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  if(code!==0){console.error(`${name} failed; quality checks stopped.`);process.exit(code||1);}
}
console.log('\nQuality regression checks passed. Scope and remaining limits: docs/quality_review.md');
