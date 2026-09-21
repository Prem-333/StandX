"""Literal resolution + BM25/dense RRF + local cross-encoder. No external API."""
import argparse
from collections import defaultdict
import json
import re
import time
import unicodedata
import numpy as np
from rank_bm25 import BM25Okapi
from qdrant_client.models import Filter,FieldCondition,MatchValue
from services.ingestion.records import identifier
from kb.build_index import MANIFEST
from kb.local_models import config, embedding_model, reranker_model, qdrant


def tokens(text):
    # Unicode word tokens preserve Indic combining marks; splitting only on whitespace
    # and punctuation avoids turning a Devanagari word into unrelated characters.
    text=unicodedata.normalize('NFKC',text).casefold()
    return [t for t in re.split(r'[\s,.;:()\[\]{}!?/\\—–-]+',text) if t]


def rrf(rankings,k=60):
    scores=defaultdict(float)
    for ranking in rankings:
        for rank,key in enumerate(dict.fromkeys(ranking),1):scores[key]+=1/(k+rank)
    return sorted(scores.items(),key=lambda x:(-x[1],x[0]))


class Retriever:
    def __init__(self,settings=None,manifest_path=MANIFEST):
        self.settings=settings or config()
        self.manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
        for key in ('embedding_model','embedding_revision','max_tokens','query_prefix','document_prefix'):
            if self.settings[key]!=self.manifest['settings'][key]:
                raise ValueError(f'Index incompatible with {key}; rebuild before searching')
        self.records=self.manifest['records'];self.docs=self.manifest['documents']
        self.by_id={p:i for i,p in enumerate(self.manifest['point_ids'])}
        self.by_number={identifier(r['is_number']):i for i,r in enumerate(self.records)}
        self.by_family=defaultdict(list)
        for i,r in enumerate(self.records):self.by_family[identifier(r['family'])].append(i)
        self.bm25=BM25Okapi([tokens(d) for d in self.docs])
        self.embedder=embedding_model(self.settings);self.reranker=reranker_model(self.settings)
        self.client=qdrant(self.settings)
        if not self.client.collection_exists(self.manifest['collection']):
            self.client.close();raise ValueError('Configured Qdrant backend has no matching index; run build_index')

    def close(self):self.client.close()

    def exact_matches(self,query):
        key=identifier(query)
        if key in self.by_number:return [self.by_number[key]],True
        if key in self.by_family:
            return sorted(self.by_family[key],key=lambda i:self.records[i]['publication_year'],reverse=True),True
        literal=re.search(r'\bIS(?:[- ]SEED[- ]|/(?:ISO|IEC)\s*)?\s*\d+(?:\s*[:(/]?\s*(?:Part|Sec)\s*\d+\s*\)?)*(?:\s*:\s*\d{4})?',query,re.I)
        if literal:
            key=identifier(literal.group())
            if key in self.by_number:return [self.by_number[key]],True
            if key in self.by_family:return sorted(self.by_family[key],key=lambda i:self.records[i]['publication_year'],reverse=True),True
            return [],True
        return [],False

    def _result(self,i,**scores):
        r=self.records[i]
        return {k:r[k] for k in ('record_id','is_number','title','source','display_label','status','latest_confirmed')} | {
            'citation':r.get('source_url') or r['record_id'],'fetched_at':r['fetched_at'],
            'certification_required':r.get('certification_required'),**scores}

    def search(self,query,include_synthetic=False,top_k=None):
        started=time.perf_counter();top_k=top_k or self.settings['top_k']
        if not query.strip():return {'results':[],'abstained':True,'reason':'empty_query'}
        allowed=lambda i:include_synthetic or self.records[i]['source']!='synthetic_seed'
        exact,literal=self.exact_matches(query)
        if literal:
            results=[self._result(i,match='exact_identifier',confidence='identifier_match_only') for i in exact if allowed(i)][:top_k]
            return {'results':results,'abstained':not results,'reason':None if results else 'identifier_not_in_allowed_kb',
                    'timings':{'total_seconds':time.perf_counter()-started},'synthetic_enabled':include_synthetic}
        lexical=self.bm25.get_scores(tokens(query))
        bm25_rank=sorted((i for i in range(len(self.records)) if allowed(i) and lexical[i]>0),
                         key=lambda i:(-lexical[i],i))[:self.settings['hybrid_candidates']]
        lexical_done=time.perf_counter()
        vector=self.embedder.encode([self.settings['query_prefix']+unicodedata.normalize('NFKC',query)],
            normalize_embeddings=True,show_progress_bar=False)[0].tolist()
        embedded=time.perf_counter()
        query_filter=None if include_synthetic else Filter(must_not=[FieldCondition(key='source',match=MatchValue(value='synthetic_seed'))])
        hits=self.client.query_points(self.manifest['collection'],query=vector,
            query_filter=query_filter,limit=self.settings['hybrid_candidates'],with_payload=False).points
        dense_rank=[self.by_id[str(hit.id)] for hit in hits]
        fused=rrf([bm25_rank,dense_rank],self.settings['rrf_k'])[:self.settings['hybrid_candidates']]
        retrieved=time.perf_counter()
        if not fused:return {'results':[],'abstained':True,'reason':'no_candidates'}
        values=np.asarray(self.reranker.predict([(query,self.docs[i]) for i,_ in fused],
            batch_size=self.settings['batch_size'],show_progress_bar=False)).reshape(-1)
        ordered=sorted(zip(fused,values),key=lambda pair:(-float(pair[1]),-pair[0][1],pair[0][0]))[:top_k]
        results=[self._result(i,match='hybrid_reranked',rrf_score=float(score),reranker_score=float(value),
                             confidence='uncalibrated_candidate_requires_review') for ((i,score),value) in ordered]
        return {'results':results,'abstained':False,'confidence_notice':'Ranking scores are not probabilities or applicability decisions.',
            'synthetic_enabled':include_synthetic,'candidates_reranked':len(fused),
            'timings':{'bm25_seconds':lexical_done-started,'query_embedding_seconds':embedded-lexical_done,
                       'fusion_and_vector_seconds':retrieved-embedded,'rerank_seconds':time.perf_counter()-retrieved,
                       'total_seconds':time.perf_counter()-started}}


def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    p=argparse.ArgumentParser();p.add_argument('query');p.add_argument('--include-synthetic',action='store_true')
    a=p.parse_args();engine=Retriever()
    try:print(json.dumps(engine.search(a.query,a.include_synthetic),indent=2,ensure_ascii=False))
    finally:engine.close()


if __name__=='__main__':main()
