"""Offline build-time conversion to portable, basic-optimized ORT format."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def convert(config_path=ROOT / 'kb/retrieval_render.json'):
    import onnxruntime as ort
    cfg = json.loads(Path(config_path).read_text(encoding='utf-8'))
    for role in ('embedding', 'reranker'):
        path = ROOT / cfg[f'{role}_path']
        manifest = json.loads((path / 'manifest.json').read_text(encoding='utf-8'))
        source = path / 'model_quint8_avx2.onnx'
        with source.open('rb') as stream:
            if hashlib.file_digest(stream, 'sha256').hexdigest() != manifest['files'][source.name]['sha256']:
                raise ValueError('Unverified ONNX source')
        options = ort.SessionOptions()
        options.intra_op_num_threads = options.inter_op_num_threads = 1
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
        options.optimized_model_filepath = str(path / cfg['onnx_filename'])
        options.add_session_config_entry('session.save_model_format', 'ORT')
        session = ort.InferenceSession(str(source), options, providers=['CPUExecutionProvider'])
        del session
        output = path / cfg['onnx_filename']
        with output.open('rb') as stream:
            checksum = hashlib.file_digest(stream, 'sha256').hexdigest()
        manifest['files'][output.name] = {'sha256': checksum, 'bytes': output.stat().st_size}
        manifest['conversion'] = {'runtime': ort.__version__, 'optimization': 'basic',
                                  'source_sha256': manifest['files'][source.name]['sha256']}
        (path / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
        print(f'Converted and checksummed {role}', flush=True)


if __name__ == '__main__':
    convert()
