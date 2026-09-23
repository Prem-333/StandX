"""Evaluation separates candidate recall, abstention, execution errors and grounding.

Recall is the fraction of distinct expected records found in top K. Empty expected
sets are excluded from recall/MRR and scored through abstention instead. Closest
candidates explicitly marked below threshold are not authoritative matches.
"""
import re
from typing import Any


def _norm(value):
    return re.sub(r'[^A-Z0-9]', '', value.upper())


def recall_at_k(expected, returned, k=5):
    if k < 1: raise ValueError('k must be positive')
    relevant={_norm(n) for n in expected}
    return len(relevant & {_norm(n) for n in returned[:k]})/len(relevant) if relevant else 0.0


def reciprocal_rank(expected, returned):
    relevant={_norm(n) for n in expected}
    return next((1/rank for rank,n in enumerate(returned,1) if _norm(n) in relevant),0.0)


def hallucination_flags(returned,kb_numbers):
    known={_norm(n) for n in kb_numbers}
    return sorted({n for n in returned if _norm(n) not in known})


def cited_numbers(response):
    """Check structured primary/allied evidence, including nested graph records."""
    found=[]
    def walk(node):
        if isinstance(node,dict):
            for key,value in node.items():
                if key in ('is_number','final_current_standard') and isinstance(value,str):found.append(value)
                elif key=='supersession_path' and isinstance(value,list):found.extend(n for n in value if isinstance(n,str))
                elif isinstance(value,(dict,list)):walk(value)
        elif isinstance(node,list):
            for value in node:walk(value)
    for key in ('primary_standards','allied_standards','evidence'):walk(response.get(key,[]))
    return found


def evaluate(gold_items:list[dict[str,Any]],responses:list[dict[str,Any]],kb_numbers:set[str],k=5):
    if len(gold_items)!=len(responses):raise ValueError('Gold items and responses must have equal length')
    if not gold_items:raise ValueError('Evaluation requires at least one query')
    if not 1<=k<=10:raise ValueError('k must be in [1,10]')
    per_item=[];hallucinations=[]
    for item,response in zip(gold_items,responses):
        expected=item.get('expected_is_numbers',[])
        returned=[s['is_number'] for s in response.get('primary_standards',[])]
        error=response.get('status')=='error'
        flags=hallucination_flags(cited_numbers(response),kb_numbers)
        oos=not expected
        confident=any(s.get('meets_confidence_threshold',False) for s in response.get('primary_standards',[]))
        abstained=not error and (not returned or (response.get('status')=='review_required' and not confident))
        if flags:hallucinations.append({'id':item['id'],'hallucinated':flags})
        per_item.append({'id':item['id'],'domain':item.get('domain'),'query':item['query'],
            'expected_is_numbers':expected,'returned_is_numbers':returned,'allow_empty':item.get('allow_empty',False),
            f'recall_at_{k}':recall_at_k(expected,returned,k) if not error else 0.0,
            'reciprocal_rank':reciprocal_rank(expected,returned) if not error else 0.0,
            'hallucinated_numbers':flags,'out_of_scope':oos,'abstained':abstained,
            'false_positive_abstention':oos and not error and not abstained,
            'status':response.get('status'),'error':error,'recommendation_id':str(response.get('recommendation_id',''))})
    scoped=[r for r in per_item if not r['out_of_scope']];oos=[r for r in per_item if r['out_of_scope']]
    errors=sum(r['error'] for r in per_item);fp=sum(r['false_positive_abstention'] for r in oos)
    aggregates={f'recall_at_{k}':round(sum(r[f'recall_at_{k}'] for r in scoped)/len(scoped),4) if scoped else 0.0,
        'mrr':round(sum(r['reciprocal_rank'] for r in scoped)/len(scoped),4) if scoped else 0.0,
        'hallucination_rate':len(hallucinations)/len(per_item),'hallucinated_items':len(hallucinations),
        'false_positive_rate':fp/len(oos) if oos else None,'false_positive_items':fp,
        'abstention_accuracy':sum(r['abstained'] for r in oos)/len(oos) if oos else None,
        'execution_errors':errors,'total_items':len(per_item),'in_scope_items':len(scoped),'out_of_scope_items':len(oos),'k':k}
    return {'gold_set_warning':'SYNTHETIC author-written queries and expectations; not expert-validated ground truth.',
        'metric_definition':'Macro recall over nonempty expected sets; MRR over in-scope queries. Review-only candidates count as abstention on out-of-scope queries. Errors never count as successful abstention.',
        'aggregates':aggregates,'hallucination_details':hallucinations,'per_item':per_item}
