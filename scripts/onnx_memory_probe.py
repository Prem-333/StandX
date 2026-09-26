"""Measure one pinned local ONNX model in a clean process, without PyTorch."""
import json
import os
from pathlib import Path
import sys
import time

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

import numpy as np
import onnxruntime as ort
import psutil
from tokenizers import Tokenizer

root = Path(__file__).resolve().parents[1]
role = sys.argv[1]
path = root / 'models' / f'onnx-{role}'
options = ort.SessionOptions()
options.intra_op_num_threads = 1
options.inter_op_num_threads = 1
options.enable_cpu_mem_arena = False
options.enable_mem_pattern = False
options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL if os.environ.get('ORT_ALL') == '1' else ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
options.add_session_config_entry('session.disable_prepacking', '1')
if os.environ.get('ORT_NO_OPT') == '1': options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
started = time.perf_counter()
if role == 'reranker' and os.environ.get('SPM') == '1':
    from sentencepiece import SentencePieceProcessor
    tokenizer = SentencePieceProcessor(model_file=str(path / 'sentencepiece.bpe.model'))
else:
    tokenizer = Tokenizer.from_file(str(path / 'tokenizer.json'))
    tokenizer.enable_truncation(max_length=256)

if os.environ.get('ORT_CONVERT') == '1':
    options.optimized_model_filepath = str(path / 'model.ort')
    options.add_session_config_entry('session.save_model_format', 'ORT')
model_path = path / ('model.ort' if os.environ.get('ORT_FORMAT') == '1' else 'model_quint8_avx2.onnx')
if os.environ.get('ORT_DIRECT') == '1':
    options.add_session_config_entry('session.use_ort_model_bytes_directly', '1')
    options.add_session_config_entry('session.use_ort_model_bytes_for_initializers', '0')
    options.add_session_config_entry('session.load_model_format', 'ORT')
    model_bytes = model_path.read_bytes()
    session = ort.InferenceSession(model_bytes, options, providers=['CPUExecutionProvider'])
else:
    session = ort.InferenceSession(str(model_path), options, providers=['CPUExecutionProvider'])
stages = {'session': psutil.Process().memory_info().rss/1048576, 'session_peak': getattr(psutil.Process().memory_info(), 'peak_wset', 0)/1048576}
stages['tokenizer'] = psutil.Process().memory_info().rss/1048576
stages['tokenizer_peak'] = getattr(psutil.Process().memory_info(), 'peak_wset', 0)/1048576
texts = ['Supply bright steel bars for fabrication.', 'Wooden bedside tables for hospital wards.']
outputs = []
for text in texts:
    if role == 'reranker' and os.environ.get('SPM') == '1':
        a = [v+1 if v else 3 for v in tokenizer.encode(text)]
        b = [v+1 if v else 3 for v in tokenizer.encode('Bright steel bars specification')]
        ids = [0]+a+[2,2]+b+[2]
        candidates = {'input_ids': ids, 'attention_mask': [1]*len(ids)}
    else:
        encoded = tokenizer.encode(text, 'Bright steel bars specification' if role == 'reranker' else None)
        candidates = {'input_ids': encoded.ids, 'attention_mask': encoded.attention_mask, 'token_type_ids': encoded.type_ids}
    inputs = {item.name: np.array([candidates[item.name]], dtype=np.int64) for item in session.get_inputs()}
    result = session.run(None, inputs)[0]
    outputs.append({'shape': list(result.shape), 'sample': result.reshape(-1)[:3].tolist()})
memory = psutil.Process().memory_info()
print(json.dumps({'role': role, 'seconds': time.perf_counter()-started,
    'rss_mib': memory.rss/1048576, 'peak_mib': getattr(memory, 'peak_wset', memory.rss)/1048576,
    'inputs': [v.name for v in session.get_inputs()], 'outputs': outputs,
    'stages_mib': stages, 'torch_loaded': 'torch' in sys.modules}, indent=2))

