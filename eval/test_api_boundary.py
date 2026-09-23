"""HTTP boundary tests without downloading/loading model weights."""
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from unittest import TestCase
from unittest.mock import patch
import os
from fastapi.testclient import TestClient
from services.api.app import create_app

KEY='test-only-credential-with-32-characters'

class BoundaryRuntime:
    def __init__(self):self.entered=Event();self.release=Event()
    def recommend(self,payload,actor):
        self.entered.set();self.release.wait(5)
        raise ValueError('Intentional boundary test rejection')
    def health(self):return {'status':'ok','services':{},'translation':{}}

class APIBoundaryTests(TestCase):
    def test_model_admission_is_bounded_and_released_on_error(self):
        runtime=BoundaryRuntime()
        with patch.dict(os.environ,{'API_MAX_INFLIGHT':'1'}):app=create_app(runtime,{'officer':KEY},rate_limit=100)
        with TestClient(app) as client,ThreadPoolExecutor(max_workers=2) as pool:
            first=pool.submit(client.post,'/v1/recommend',headers={'X-API-Key':KEY},json={'text':'test'})
            try:
                self.assertTrue(runtime.entered.wait(3))
                overloaded=client.post('/v1/recommend',headers={'X-API-Key':KEY},json={'text':'test'})
                self.assertEqual(overloaded.status_code,503)
                self.assertEqual(overloaded.headers['Retry-After'],'2')
            finally:runtime.release.set()
            self.assertEqual(first.result().status_code,422)
            self.assertEqual(app.state.inflight,0)
    def test_chunked_feedback_body_limit_and_error_security_headers(self):
        with TestClient(create_app(BoundaryRuntime(),{'officer':KEY})) as client:
            response=client.post('/v1/feedback',content=iter([b'a'*10000,b'b'*10000]))
            self.assertEqual(response.status_code,413)
            self.assertEqual(response.headers['X-Content-Type-Options'],'nosniff')
            self.assertEqual(response.headers['Content-Security-Policy'],"default-src 'none'")
            self.assertIn('X-Request-ID',response.headers)
    def test_documentation_nonce_is_unique_and_assets_stay_local(self):
        import re
        with TestClient(create_app(BoundaryRuntime(),{'officer':KEY})) as client:
            first=client.get('/docs');second=client.get('/docs')
            nonce=re.search(r'<script nonce="([^"]+)"',first.text).group(1)
            self.assertIn("'nonce-"+nonce+"'",first.headers['Content-Security-Policy'])
            self.assertNotIn(nonce,second.text)
            self.assertIn('/static/swagger-ui-bundle.js',first.text)
            self.assertNotIn('cdn.jsdelivr',first.text)
