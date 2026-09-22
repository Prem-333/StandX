"""Dedicated local UI demo API, using the unchanged Phase 2 mixed seed."""
import os
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import socket

original_connect=socket.socket.connect
def local_only(sock,address):
    if isinstance(address,tuple) and address[0] not in ('127.0.0.1','localhost','::1'):
        raise RuntimeError('Phase 9 demo forbids external inference connections')
    return original_connect(sock,address)
socket.socket.connect=local_only

import uvicorn
uvicorn.run('services.api.app:app',host='127.0.0.1',port=int(os.environ['PHASE9_API_PORT']),
            workers=1,access_log=False)
