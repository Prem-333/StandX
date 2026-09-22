import json
import os
import urllib.request

keys=json.loads(os.environ['API_KEYS_JSON'])
key=next(iter(keys.values()))
request=urllib.request.Request('http://127.0.0.1:8000/v1/health',headers={'X-API-Key':key})
with urllib.request.urlopen(request,timeout=8) as response:
    if json.load(response)['status']!='ok':raise SystemExit(1)
