"""Local language detection and query translation with explicit English-only fallback."""
import hashlib
import json
import os
from pathlib import Path
import re
import unicodedata

from services.ingestion.records import ROOT
from kb.local_models import config as retrieval_config  # Sets offline HF environment before model imports.


def configuration():
    return json.loads(Path(os.environ.get('MULTILINGUAL_CONFIG',ROOT/'services/nlp/multilingual_config.json')).read_text(encoding='utf-8'))


def verified_path(cfg):
    path=ROOT/cfg['translation_path']
    manifest=json.loads((path/'manifest.json').read_text(encoding='utf-8'))
    if (manifest['repo'],manifest['revision'])!=(cfg['translation_model'],cfg['translation_revision']):
        raise ValueError('Translation cache revision mismatch')
    for name,entry in manifest['files'].items():
        file=(path/name).resolve()
        if not file.is_relative_to(path.resolve()):raise ValueError('Invalid model manifest path')
        with file.open('rb') as stream:checksum=hashlib.file_digest(stream,'sha256').hexdigest()
        if checksum!=entry['sha256']:raise ValueError('Translation cache checksum mismatch')
    return path


class IndicTranslator:
    """Pinned publisher architecture with a narrow Transformers-5 loading adapter.

    No mutation of model files. SentencePiece vocabulary mapping follows the
    publisher tokenizer. Greedy decoding avoids the old tuple-cache interface.
    """
    def __init__(self,cfg):
        import torch
        from transformers import AutoConfig
        from transformers.dynamic_module_utils import get_class_from_dynamic_module
        from sentencepiece import SentencePieceProcessor
        self.cfg=cfg;self.torch=torch;path=verified_path(cfg)
        torch.set_num_threads(cfg['torch_threads'])
        config=AutoConfig.from_pretrained(str(path),trust_remote_code=True,local_files_only=True)
        config._attn_implementation='eager'
        base=get_class_from_dynamic_module(config.auto_map['AutoModelForSeq2SeqLM'],str(path),local_files_only=True)
        class CompatibleModel(base):
            _tied_weights_keys={'lm_head.weight':'model.decoder.embed_tokens.weight'}
            def tie_weights(self,**kwargs):
                self.lm_head.weight=self.model.decoder.embed_tokens.weight
        self.model=CompatibleModel(config)
        weights=torch.load(path/'pytorch_model.bin',map_location='cpu',weights_only=True)
        self.model.load_state_dict(weights,strict=True)
        del weights
        self.model.to(cfg['device']).eval()
        self.vocabulary=json.loads((path/'dict.SRC.json').read_text(encoding='utf-8'))
        self.target={v:k for k,v in json.loads((path/'dict.TGT.json').read_text(encoding='utf-8')).items()}
        self.pieces=SentencePieceProcessor(model_file=str(path/'model.SRC'))

    def translate(self,text,language):
        from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
        from indicnlp.tokenize import indic_tokenize
        from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator
        from sacremoses import MosesDetokenizer
        tag=self.cfg['language_tags'][language]
        normalized=IndicNormalizerFactory().get_normalizer(language).normalize(text)
        normalized=' '.join(indic_tokenize.trivial_tokenize(normalized,language))
        if tag.split('_')[1] not in ('Arab','Aran','Olck','Mtei','Latn'):
            normalized=UnicodeIndicTransliterator.transliterate(normalized,language,'hi')
        pieces=[tag,'eng_Latn']+self.pieces.encode(normalized,out_type=str)+['</s>']
        if len(pieces)>self.cfg['max_input_tokens']:raise ValueError('Translation segment exceeds token budget')
        torch=self.torch
        inputs=torch.tensor([[self.vocabulary.get(p,self.vocabulary['<unk>']) for p in pieces]],device=self.cfg['device'])
        mask=torch.ones_like(inputs)
        with torch.inference_mode():
            encoded=self.model.get_encoder()(input_ids=inputs,attention_mask=mask,return_dict=True)
            output=torch.tensor([[self.model.config.decoder_start_token_id]],device=inputs.device)
            ended=False
            for _ in range(self.cfg['max_new_tokens']):
                result=self.model(encoder_outputs=encoded,attention_mask=mask,decoder_input_ids=output,use_cache=False,return_dict=True)
                token=result.logits[:,-1].argmax(-1,keepdim=True)
                output=torch.cat([output,token],dim=1)
                if token.item()==self.model.config.eos_token_id:
                    ended=True;break
        if not ended:raise ValueError('Translation exceeded output budget')
        result=''.join(self.target.get(i,'') for i in output[0].tolist() if i not in (0,1,2)).replace('▁',' ').strip()
        return MosesDetokenizer(lang='en').detokenize(result.split())


class Seq2SeqTranslator:
    """Configurable standard-HF alternative; no custom remote code permitted."""
    def __init__(self,cfg):
        from transformers import AutoTokenizer,AutoModelForSeq2SeqLM
        path=verified_path(cfg);self.cfg=cfg
        self.tokenizer=AutoTokenizer.from_pretrained(str(path),local_files_only=True,trust_remote_code=False)
        self.model=AutoModelForSeq2SeqLM.from_pretrained(str(path),local_files_only=True,trust_remote_code=False).to(cfg['device']).eval()

    def translate(self,text,language):
        import torch
        if hasattr(self.tokenizer,'src_lang'):self.tokenizer.src_lang=self.cfg['language_tags'][language]
        inputs=self.tokenizer(text,return_tensors='pt',truncation=False).to(self.cfg['device'])
        if inputs['input_ids'].shape[-1]>self.cfg['max_input_tokens']:raise ValueError('Translation segment exceeds token budget')
        kwargs={}
        if self.cfg.get('target_language_token'):
            kwargs['forced_bos_token_id']=self.tokenizer.convert_tokens_to_ids(self.cfg['target_language_token'])
        with torch.inference_mode():
            out=self.model.generate(**inputs,max_new_tokens=self.cfg['max_new_tokens'],num_beams=self.cfg['num_beams'],**kwargs)
        return self.tokenizer.decode(out[0],skip_special_tokens=True)


class QueryNormalizer:
    def __init__(self,cfg=None):
        from langid.langid import LanguageIdentifier,model
        self.cfg=cfg or configuration()
        self.detector=LanguageIdentifier.from_modelstring(model,norm_probs=True)
        self.lexicon=json.loads((ROOT/self.cfg['hinglish_lexicon_path']).read_text(encoding='utf-8'))['words']
        self.translator=None;self.load_error=None;self.attempted=False

    def load(self):
        if not self.attempted:
            self.attempted=True
            try:
                if not self.cfg['enabled']:raise ValueError('Translation disabled by configuration')
                adapters={'indictrans2':IndicTranslator,'seq2seq':Seq2SeqTranslator}
                self.translator=adapters[self.cfg['adapter']](self.cfg)
            except Exception as exc:
                self.load_error=f'{type(exc).__name__}: {exc}'
        return self.translator is not None

    def normalize(self,text,language_hint=None):
        original=text;normalized=unicodedata.normalize('NFKC',text)
        normalized=''.join(str(unicodedata.decimal(c)) if c.isdecimal() else c for c in normalized)
        predicted,probability=self.detector.classify(normalized)
        words=re.findall(r'[a-zA-Z]+',normalized.casefold())
        cues=[w for w in words if w in self.lexicon]
        devanagari=any('\u0900'<=c<='\u097f' for c in normalized)
        if language_hint:
            language=language_hint
        elif cues and (len(cues)>=2 or 'chahiye' in cues or 'chaiye' in cues):language='hi-Latn'
        elif devanagari:language=predicted if predicted in ('hi','mr','ne') else 'hi'
        elif normalized.isascii():language='en'
        else:language=predicted
        report={'original_text':original,'normalized_text':normalized,'detected_language':language,
                'classifier_language':predicted,'classifier_score':float(probability),'detector':'local_langid_with_script_and_hinglish_guards',
                'language_hint':language_hint,'status':'unchanged','notices':[],
                'translation_model':self.cfg['translation_model'],'translation_revision':self.cfg['translation_revision']}
        if re.search(r'\bIS(?:[- /]|\s)\s*(?:SEED[- ]|ISO\s*|IEC\s*)?\d',normalized,re.I):
            report['status']='identifier_preserved';return report
        if language=='en':return report
        prepared=normalized
        if language=='hi-Latn':
            prepared=re.sub(r'[A-Za-z]+',lambda m:self.lexicon.get(m.group().lower(),m.group()),prepared)
            report['romanized_normalization']=prepared
            report['notices'].append('Hinglish normalization uses a limited reviewed word lexicon; verify meaning.')
        model_language='hi' if language=='hi-Latn' else language
        try:
            if model_language not in self.cfg['language_tags']:raise ValueError('Detected language not configured for translation')
            if not self.load():raise ValueError(self.load_error or 'Translation model unavailable')
            # Preserve paragraph boundaries; do not translate or duplicate the standards corpus.
            segments=[s.strip() for s in re.split(r'[\n।!?]+|(?<=\.)\s+',prepared) if s.strip()]
            if len(segments)>self.cfg.get('max_segments',32):raise ValueError('Translation segment count exceeds configured limit')
            translations=[self.translator.translate(s,model_language) for s in segments]
            translated='\n'.join(translations)
            if not translated.strip():raise ValueError('Empty translation')
            # Numeric loss or alteration can change procurement requirements.
            if sorted(re.findall(r'\d+',normalized))!=sorted(re.findall(r'\d+',translated)):
                raise ValueError('Translation did not preserve numeric tokens')
            if re.search(r'नहीं|\bमत\b',prepared) and not re.search(r'\b(not|no|never|without|exclude|excluding)\b',translated,re.I):
                raise ValueError('Translation did not preserve a detected negation')
            report.update(normalized_text=translated,status='translated',segments=[{'source':s,'english':t} for s,t in zip(segments,translations)])
        except Exception as exc:
            # Only retained English/ASCII fragments are sent to retrieval, not untranslated Indic text.
            retained=[w for w in re.findall(r'[A-Za-z][A-Za-z0-9_-]*|\d+',normalized) if w.lower() not in self.lexicon]
            if re.search(r'नहीं|\bमत\b',prepared):retained=[]
            report.update(normalized_text=' '.join(retained),status='english_only_fallback')
            report['notices'].append('Translation unavailable; English-only matching of retained English terms. Supply an English query or load a compatible local translation model.')
            report['fallback_reason']=str(exc)
        return report
