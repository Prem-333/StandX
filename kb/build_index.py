"""One public metadata document per standard edition; all inference is local."""
import argparse
from contextlib import closing
import json
from pathlib import Path
import sys
import time
import unicodedata
import uuid

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from services.ingestion.records import ROOT, SEED, read_records, digest
from services.ingestion.validate import versions
from kb.local_models import config, embedding_model, qdrant, verify_cache

MANIFEST=ROOT/'kb/index_manifest.json'


def document(record):
    parts=[record['is_number'],record['title']]
    if record.get('scope_abstract'):parts.append(record['scope_abstract'])
    parts.extend(x for x in record['classification'].values() if x)
    return unicodedata.normalize('NFKC','\n'.join(parts))


def build_index(records,settings,manifest_path=MANIFEST):
    started=time.perf_counter();verify_cache(settings,'embedding');verify_cache(settings,'reranker')
    model=embedding_model(settings);loaded=time.perf_counter()
    documents=[document(r) for r in records]
    texts=[settings['document_prefix']+d for d in documents]
    lengths=[len(model.tokenizer.encode(t)) for t in texts]
    if max(lengths)>settings['max_tokens']:
        raise ValueError(f'One-document contract would truncate metadata ({max(lengths)} tokens); raise max_tokens and rebuild')
    vectors=model.encode(texts,batch_size=settings['batch_size'],normalize_embeddings=True,show_progress_bar=False)
    embedded=time.perf_counter()
    fingerprint=digest({'records':records,'model':settings['embedding_model'],
        'revision':settings['embedding_revision'],'max_tokens':settings['max_tokens'],
        'prefixes':[settings['document_prefix'],settings['query_prefix']]})
    collection=settings['collection_prefix']+'_'+fingerprint[:16]
    from qdrant_client.models import Distance,VectorParams,PointStruct
    computed=versions(records)
    ids=[str(uuid.uuid5(uuid.NAMESPACE_URL,r['record_id'])) for r in records]
    with closing(qdrant(settings)) as client:
        if not client.collection_exists(collection):
            client.create_collection(collection,vectors_config=VectorParams(size=vectors.shape[1],distance=Distance.COSINE))
        points=[]
        for r,vector,point_id in zip(records,vectors,ids):
            payload={k:r[k] for k in ('is_number','title','source','record_id','display_label')}
            payload.update({'status':'superseded' if computed[r['record_id']]['superseded'] else r['status'],
                'group':r['classification']['group'],'certification_required':r.get('certification_required'),
                'source_url':r.get('source_url'),'fetched_at':r['fetched_at'],
                'latest_confirmed':r['latest_confirmed'],'document':document(r)})
            points.append(PointStruct(id=point_id,vector=vector.tolist(),payload=payload))
        client.upsert(collection,points,wait=True)
        count=client.count(collection,exact=True).count
        if count!=len(records):raise ValueError('Collection count does not match corpus')
    elapsed=time.perf_counter()-started
    manifest={'schema_version':1,'collection':collection,'fingerprint':fingerprint,'settings':settings,
        'records':records,'documents':documents,'point_ids':ids,'dimensions':int(vectors.shape[1]),
        'build_metrics':{'records':count,'model_load_seconds':loaded-started,
            'embedding_seconds':embedded-loaded,'total_seconds':elapsed,
            'qdrant_mode':settings['qdrant_mode'],'max_document_tokens':max(lengths)}}
    path=Path(manifest_path);temp=path.with_suffix('.tmp')
    temp.write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8');temp.replace(path)
    return manifest['build_metrics']


def main():
    p=argparse.ArgumentParser();p.add_argument('--config',type=Path);p.add_argument('--input',type=Path,default=SEED)
    a=p.parse_args();print(json.dumps(build_index(read_records(a.input),config(a.config)),indent=2))


if __name__=='__main__':main()
