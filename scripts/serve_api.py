"""Local development launcher. Environment values take precedence over .env."""
import os
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from services.ingestion.records import ROOT

path=ROOT/'.env'
if path.exists():
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.strip() and not line.lstrip().startswith('#') and '=' in line:
            key,value=line.split('=',1)
            if value.strip() and not os.environ.get(key.strip()):os.environ[key.strip()]=value.strip()
import uvicorn
uvicorn.run('services.api.app:app',host='127.0.0.1',port=8000,workers=1,access_log=False)
