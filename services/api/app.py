"""Authenticated, bounded offline API. One worker per model/index runtime."""
from collections import defaultdict,deque
from contextlib import asynccontextmanager
import hashlib
import hmac
import json
import logging
import os
import secrets
from pathlib import Path
import time
from threading import Lock
from uuid import uuid4, UUID

from fastapi import FastAPI, Depends, HTTPException, Request, Security, Query
from fastapi.security import APIKeyHeader
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
from starlette.responses import JSONResponse, HTMLResponse
from starlette.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html

from .schemas import (RecommendRequest, RecommendResponse, StandardResponse, AlliedResponse,
                      CertificationResponse, FeedbackRequest, FeedbackResponse, HealthResponse,
                      DirectoryResponse, HistoryResponse, SystemResponse)
from .documents import extract_document,MAX_UPLOAD

logger=logging.getLogger('standards_api')
if not logger.handlers:
    handler=logging.StreamHandler();handler.setFormatter(logging.Formatter('%(message)s'));logger.addHandler(handler)
logger.setLevel(logging.INFO);logger.propagate=False
key_header=APIKeyHeader(name='X-API-Key',auto_error=False)


class RateLimiter:
    def __init__(self,limit=30,window=60):
        self.limit=limit;self.window=window;self.entries=defaultdict(deque);self.lock=Lock()
    def check(self,key):
        now=time.monotonic()
        with self.lock:
            queue=self.entries[key]
            while queue and queue[0]<=now-self.window:queue.popleft()
            if len(queue)>=self.limit:return max(1,int(self.window-(now-queue[0]))+1)
            queue.append(now);return 0


def create_app(runtime=None,keys=None,rate_limit=None):
    owned=runtime is None
    @asynccontextmanager
    async def lifespan(app):
        active_keys=keys if keys is not None else json.loads(os.environ.get('API_KEYS_JSON','{}'))
        if not active_keys or any(not isinstance(k,str) or not isinstance(v,str) or len(v)<24 for k,v in active_keys.items()):
            raise RuntimeError('API_KEYS_JSON must map officer IDs to secrets of at least 24 characters')
        app.state.keys=active_keys
        if runtime is None:
            from .runtime import create_runtime
            app.state.runtime=await run_in_threadpool(create_runtime)
        else:app.state.runtime=runtime
        try:yield
        finally:
            if owned:await run_in_threadpool(app.state.runtime.close)
    app=FastAPI(title='Procurement Standards API',version='1.0.0',lifespan=lifespan,docs_url=None,redoc_url=None,
                description='Offline metadata recommendations. Every result carries evidence; legal applicability requires review.')
    app.mount('/static',StaticFiles(directory=Path(__file__).with_name('static')),name='static')
    @app.get('/docs',include_in_schema=False)
    async def documentation():
        html=get_swagger_ui_html(openapi_url='/openapi.json',title=app.title,
            swagger_js_url='/static/swagger-ui-bundle.js',swagger_css_url='/static/swagger-ui.css',
            swagger_favicon_url='/static/favicon-32x32.png',swagger_ui_parameters={'validatorUrl':None})
        nonce=secrets.token_urlsafe(24)
        return HTMLResponse(html.body.decode().replace('<script>',f'<script nonce="{nonce}">'),headers={
            'Content-Security-Policy':f"default-src 'none'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"})
    limiter=RateLimiter(rate_limit or int(os.environ.get('API_RATE_LIMIT','30')))
    app.state.inflight=0
    max_inflight=int(os.environ.get('API_MAX_INFLIGHT','4'))
    if max_inflight<1:raise ValueError('API_MAX_INFLIGHT must be positive')

    async def admit(request:Request):
        # Check and reserve without an await: atomic within the serving event loop.
        if app.state.inflight>=max_inflight:
            raise HTTPException(503,'Local model is busy. Please retry shortly.',headers={'Retry-After':'2'})
        app.state.inflight+=1
        try:yield
        finally:app.state.inflight-=1

    async def authorize(request:Request,key:str|None=Security(key_header)):
        actor=None
        for candidate,secret in request.app.state.keys.items():
            if key and hmac.compare_digest(key.encode('utf-8'),secret.encode('utf-8')):actor=candidate
        if actor is None:raise HTTPException(401,'Missing or invalid API key',headers={'WWW-Authenticate':'APIKey'})
        retry=limiter.check(actor)
        if retry:raise HTTPException(429,'Rate limit exceeded',headers={'Retry-After':str(retry)})
        request.state.actor=actor;return actor

    @app.middleware('http')
    async def request_logging(request,call_next):
        rid=str(uuid4());started=time.perf_counter();status=500
        # Bound both declared and streamed bodies; no unbounded chunked multipart upload.
        try:
            length=request.headers.get('content-length')
            bound=MAX_UPLOAD+65536 if request.url.path=='/v1/recommend' else 16384
            oversized=bool(length and (not length.isdigit() or int(length)>bound))
            if not oversized and request.method in ('POST','PUT','PATCH'):
                body=bytearray()
                async for chunk in request.stream():
                    if len(body)+len(chunk)>bound:
                        oversized=True;break
                    body.extend(chunk)
                if not oversized:request._body=bytes(body)
            response=JSONResponse({'detail':'Request body exceeds limit'},status_code=413) if oversized else await call_next(request)
            status=response.status_code
            response.headers['X-Request-ID']=rid
            # Phase 11 hardening: defence-in-depth security headers on every response.
            response.headers['X-Content-Type-Options']='nosniff'
            response.headers['X-Frame-Options']='DENY'
            response.headers['Cache-Control']='no-store'
            response.headers.setdefault('Content-Security-Policy',"default-src 'none'")
            return response
        finally:
            logger.info(json.dumps({'event':'http_request','request_id':rid,'method':request.method,
                'route':request.scope.get('route').path if request.scope.get('route') else 'unmatched',
                'status':status,'actor':getattr(request.state,'actor',None),
                'duration_ms':round(1000*(time.perf_counter()-started),2)}))

    @app.exception_handler(Exception)
    async def unexpected(request,exc):
        logger.error(json.dumps({'event':'request_failed','error_type':type(exc).__name__}))
        return JSONResponse({'detail':'Local processing failed; no successful unaudited result was returned.'},status_code=503)

    @app.post('/v1/recommend',response_model=RecommendResponse,dependencies=[Depends(authorize),Depends(admit)],
        openapi_extra={'requestBody':{'required':True,'content':{
            'application/json':{'schema':RecommendRequest.model_json_schema(ref_template='#/components/schemas/{model}')},
            'multipart/form-data':{'schema':{'type':'object','required':['file'],'properties':{
                'file':{'type':'string','format':'binary'},'top_k':{'type':'integer','default':5},
                'language_hint':{'type':'string'},'product_category':{'type':'string'},
                'certification_context':{'type':'string','description':'JSON object of scope assertions'}}}}}}})
    async def recommend(request:Request):
        raw=bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw)>MAX_UPLOAD+65536:raise HTTPException(413,'Request body exceeds limit')
        request._body=bytes(raw)
        try:
            kind=request.headers.get('content-type','').split(';')[0]
            if kind=='application/json':
                payload=RecommendRequest.model_validate_json(raw)
            elif kind=='multipart/form-data':
                async with request.form(max_files=1,max_fields=6,max_part_size=MAX_UPLOAD) as form:
                    file=form.get('file')
                    if not file or not hasattr(file,'read'):raise ValueError('A PDF or DOCX file field is required')
                    content=await file.read(MAX_UPLOAD+1)
                    text=await run_in_threadpool(extract_document,file.filename or '',content)
                    payload=RecommendRequest(text=text,tender=True,top_k=form.get('top_k',5),
                        language_hint=form.get('language_hint') or None,product_category=form.get('product_category') or None,
                        certification_context=json.loads(form.get('certification_context','{}')))
            else:raise HTTPException(415,'Use application/json or multipart/form-data')
            return await run_in_threadpool(request.app.state.runtime.recommend,payload,request.state.actor)
        except (ValidationError,ValueError,UnicodeError) as exc:
            raise HTTPException(422,str(exc)[:500]) from exc

    @app.get('/v1/system',response_model=SystemResponse,dependencies=[Depends(authorize)])
    async def system(request:Request):
        return request.app.state.runtime.system()

    @app.get('/v1/history',response_model=HistoryResponse,dependencies=[Depends(authorize)])
    async def history(request:Request,limit:int=Query(20,ge=1,le=50),offset:int=Query(0,ge=0,le=100000)):
        return await run_in_threadpool(request.app.state.runtime.history,request.state.actor,limit,offset)

    @app.get('/v1/history/{report_id}',response_model=RecommendResponse,dependencies=[Depends(authorize)])
    async def saved_report(request:Request,report_id:UUID):
        try:return await run_in_threadpool(request.app.state.runtime.saved_report,request.state.actor,report_id)
        except KeyError:raise HTTPException(404,'Recommendation not found')

    @app.get('/v1/standards',response_model=DirectoryResponse,dependencies=[Depends(authorize)])
    async def directory(request:Request,q:str=Query('',max_length=200),limit:int=Query(20,ge=1,le=50),offset:int=Query(0,ge=0,le=100000)):
        return await run_in_threadpool(request.app.state.runtime.directory,q,limit,offset)

    @app.get('/v1/standards/{is_number:path}/allied',response_model=AlliedResponse,dependencies=[Depends(authorize)])
    async def allied(request:Request,is_number:str,max_hops:int=Query(default=2,ge=0,le=4)):
        try:return await run_in_threadpool(request.app.state.runtime.allied,is_number,max_hops)
        except KeyError:raise HTTPException(404,'Standard is not in the allowed KB')

    @app.get('/v1/standards/{is_number:path}',response_model=StandardResponse,dependencies=[Depends(authorize)])
    async def standard(request:Request,is_number:str):
        try:return await run_in_threadpool(request.app.state.runtime.standard,is_number)
        except KeyError:raise HTTPException(404,'Standard is not in the allowed KB')

    @app.get('/v1/certifications/{product_category}',response_model=CertificationResponse,dependencies=[Depends(authorize)])
    async def certifications(request:Request,product_category:str,domestic_supply:bool|None=None,
                             exemption_claimed:bool|None=None,district_in_current_annexure:bool|None=None):
        context={k:v for k,v in {'domestic_supply':domestic_supply,'exemption_claimed':exemption_claimed,
                 'district_in_current_annexure':district_in_current_annexure}.items() if v is not None}
        return request.app.state.runtime.engine.certification_rules.evaluate(product_category,context)

    @app.post('/v1/feedback',response_model=FeedbackResponse,status_code=201)
    async def feedback(request:Request,payload:FeedbackRequest,actor:str=Depends(authorize)):
        try:return await run_in_threadpool(request.app.state.runtime.feedback,payload,actor)
        except KeyError:raise HTTPException(404,'Recommendation not found')
        except ValueError as exc:raise HTTPException(422,str(exc))

    @app.get('/v1/health',response_model=HealthResponse,dependencies=[Depends(authorize)])
    async def health(request:Request):
        report=await run_in_threadpool(request.app.state.runtime.health)
        if report['status']=='degraded':return JSONResponse(report,status_code=503)
        return report
    def openapi():
        if app.openapi_schema:return app.openapi_schema
        from fastapi.openapi.utils import get_openapi
        schema=get_openapi(title=app.title,version=app.version,description=app.description,routes=app.routes)
        body=RecommendRequest.model_json_schema(ref_template='#/components/schemas/{model}')
        schema['components']['schemas'].update(body.pop('$defs',{}))
        schema['components']['schemas']['RecommendRequest']=body
        schema['paths']['/v1/recommend']['post']['requestBody']['content']['application/json']['schema']={'$ref':'#/components/schemas/RecommendRequest'}
        app.openapi_schema=schema;return schema
    app.openapi=openapi
    return app


app=create_app()
