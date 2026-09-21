"""No downloads or external inference: manifest-verified local model loading."""
import hashlib
import json
import os
from pathlib import Path
from services.ingestion.records import ROOT

os.environ['HF_HUB_OFFLINE']='1'
os.environ['TRANSFORMERS_OFFLINE']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
os.environ['TOKENIZERS_PARALLELISM']='false'


def config(path=None):
    path=Path(path or os.environ.get('RETRIEVAL_CONFIG',ROOT/'kb/retrieval_config.json'))
    return json.loads(path.read_text(encoding='utf-8'))


def verify_cache(settings,role):
    path=ROOT/settings[f'{role}_path'];manifest_path=path/'manifest.json'
    if not manifest_path.exists():
        raise FileNotFoundError(f'{role} cache missing: {path}. Provision locally before offline execution.')
    manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest['repo']!=settings[f'{role}_model'] or manifest['revision']!=settings[f'{role}_revision']:
        raise ValueError(f'{role} manifest does not match selected model/revision')
    for name,info in manifest['files'].items():
        file=(path/name).resolve()
        if not file.is_relative_to(path.resolve()):raise ValueError('Invalid cache manifest path')
        if not file.is_file():raise FileNotFoundError(f'Missing local model file {file}')
        with file.open('rb') as f:actual=hashlib.file_digest(f,'sha256').hexdigest()
        if actual!=info['sha256']:raise ValueError(f'Model cache checksum mismatch: {file}')
    if not any(k.endswith('.safetensors') for k in manifest['files']):raise ValueError('No local safe model weights')
    return path


def embedding_model(settings):
    path=verify_cache(settings,'embedding')
    import torch
    from sentence_transformers import SentenceTransformer
    torch.set_num_threads(settings['torch_threads'])
    model=SentenceTransformer(str(path),device=settings['device'],local_files_only=True,
        trust_remote_code=False,model_kwargs={'dtype':torch.float32,'attn_implementation':'eager'})
    model.max_seq_length=settings['max_tokens']
    return model


def reranker_model(settings):
    path=verify_cache(settings,'reranker')
    import torch
    from sentence_transformers import CrossEncoder
    torch.set_num_threads(settings['torch_threads'])
    return CrossEncoder(str(path),device=settings['device'],max_length=settings['max_tokens'],
        local_files_only=True,trust_remote_code=False,
        model_kwargs={'dtype':torch.float32,'attn_implementation':'eager'})


def qdrant(settings):
    from qdrant_client import QdrantClient
    if settings['qdrant_mode']=='local':return QdrantClient(path=str(ROOT/settings['qdrant_path']))
    if settings['qdrant_mode']!='server':raise ValueError('qdrant_mode must be local or server')
    from urllib.parse import urlparse
    if urlparse(settings['qdrant_url']).hostname not in ('localhost','127.0.0.1','::1'):
        raise ValueError('Offline profile permits only a loopback Qdrant endpoint')
    return QdrantClient(url=settings['qdrant_url'])
