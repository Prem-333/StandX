import test from 'node:test';
import assert from 'node:assert/strict';
import {forward} from '../frontend/api/gateway.mjs';
import context from '../frontend/api/context.mjs';

const base = 'https://standx.example';
const backend = 'https://api.example';
const req = (route, options={}) => new Request(`${base}/api/gateway?route=${encodeURIComponent(route)}`, {
  headers: {'X-API-Key':'test-officer'}, ...options,
});
test('missing backend is explicit 503, never invented recommendations', async()=>{
  const r=await forward(req('recommend'), '');
  assert.equal(r.status,503); assert.match((await r.json()).detail,/frontend preview/);
});
test('rejects non-HTTPS or credential-bearing origins',async()=>{
  for(const origin of ['http://api.example','https://key@api.example','https://api.example/path'])
    assert.equal((await forward(req('health'),origin)).status,503);
});
test('requires individual officer key and rejects unrelated routes',async()=>{
  assert.equal((await forward(req('system',{headers:{}}),backend)).status,401);
  for(const path of ['../admin','https://evil.example','standards/../admin','standards/%252e%252e/admin'])
    assert.equal((await forward(req(path),backend)).status,404);
});
test('forwards literal identifiers and supported filters without credentials in URL',async()=>{
  const r=await forward(new Request(`${base}/v1/standards/IS%20302/1/allied?max_hops=2&url=https://evil.example`,{headers:{'X-API-Key':'officer','Cookie':'private=1'}}),backend, async(url,options)=>{
    assert.equal(url.origin,backend); assert.equal(decodeURIComponent(url.pathname),'/v1/standards/IS 302/1/allied');
    assert.equal(url.search,'?max_hops=2'); assert.equal(options.headers.get('X-API-Key'),'officer');
    assert.equal(options.headers.get('cookie'),null); assert.equal(options.redirect,'manual');
    return Response.json({evidence:[]});
  });
  assert.equal(r.status,200); assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('preserves multipart bytes and content type',async()=>{
  const form=new FormData(); form.set('file',new Blob(['tender text'],{type:'application/pdf'}),'tender.pdf');
  const request=req('recommend',{method:'POST',body:form,headers:{'X-API-Key':'officer'}});
  const bytes=Buffer.from(await request.clone().arrayBuffer());
  const response=await forward(request,backend,async(url,options)=>{
    assert.deepEqual(options.body,bytes); assert.match(options.headers.get('content-type'),/^multipart\/form-data; boundary=/);
    return Response.json({recommendation_id:'test'});
  }); assert.equal(response.status,200);
});
test('bounds request size and blocks cross-origin submissions',async()=>{
  assert.equal((await forward(req('recommend',{method:'POST',body:'x'.repeat(4_000_001)}),backend)).status,413);
  assert.equal((await forward(req('recommend',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),backend)).status,403);
});
test('rejects redirects and HTML; preserves upstream errors without retry',async()=>{
  for(const response of [new Response(null,{status:302,headers:{location:'https://evil.example'}}),new Response('HTML')])
    assert.equal((await forward(req('health'),backend,async()=>response)).status,502);
  const r=await forward(req('health'),backend,async()=>Response.json({detail:'Limit reached'},{status:429,headers:{'Retry-After':'30'}}));
  assert.equal(r.status,429); assert.equal(r.headers.get('retry-after'),'30');
  let calls=0;
  assert.equal((await forward(req('health'),backend,async()=>{calls++;throw Error('offline');})).status,502);
  assert.equal(calls,1);
});
test('public context never exposes origin or credentials',async()=>{
  const previous=process.env.STANDX_API_ORIGIN;
  try {
    delete process.env.STANDX_API_ORIGIN;
    let r=await context.fetch(); let data=await r.json();
    assert.equal(data.backend_configured,false); assert.equal(data.authenticated_proxy,false); assert.match(data.notice,/preview only/);
    process.env.STANDX_API_ORIGIN=backend;
    data=await (await context.fetch()).json();
    assert.equal(data.backend_configured,true); assert.equal(data.notice,null); assert.ok(!JSON.stringify(data).includes(backend));
  } finally { if(previous===undefined)delete process.env.STANDX_API_ORIGIN;else process.env.STANDX_API_ORIGIN=previous; }
});
