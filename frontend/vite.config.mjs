import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Local demonstration only. This credential never enters VITE_* or browser code.
const target=process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000';
if (!['127.0.0.1','localhost','[::1]'].includes(new URL(target).hostname)) throw new Error('API proxy must be loopback');
const demo=process.env.FRONTEND_DEMO==='1';
const proxy={'/v1':{target,changeOrigin:false,configure(proxy){
  proxy.on('proxyReq',(proxyReq)=>{if (process.env.SERVER_API_KEY) proxyReq.setHeader('X-API-Key',process.env.SERVER_API_KEY);});
}}};
function localContext(){
  const middleware=(server)=>{server.middlewares.use((req,res,next)=>{
    if(req.url==='/demo-context'){
      res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
      res.end(JSON.stringify({demo,authenticated_proxy:Boolean(process.env.SERVER_API_KEY)}));return;
    }
    // A browser from another origin cannot use the local credentialed demo proxy.
    if(req.url?.startsWith('/v1') && req.headers.origin && req.headers.origin!==`http://${req.headers.host}`){res.statusCode=403;res.end('Origin not allowed');return;}
    next();
  });};
  return {name:'local-demo-context',configureServer:middleware,configurePreviewServer:middleware};
}
export default defineConfig({plugins:[react(),tailwindcss(),localContext()],
  server:{host:'127.0.0.1',port:5173,strictPort:true,proxy,cors:false},
  preview:{host:'127.0.0.1',port:5173,strictPort:true,proxy,cors:false}});
