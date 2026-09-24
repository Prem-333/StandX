"""Explicit online provisioning of publisher-pinned quantized model files.

This command is for build/provisioning only; inference never invokes it.
"""
import argparse
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]


def provision(config_path):
    cfg = json.loads(Path(config_path).read_text(encoding='utf-8'))
    for role in ('embedding', 'reranker'):
        repo, revision = cfg[f'{role}_model'], cfg[f'{role}_revision']
        path = ROOT / cfg[f'{role}_path']
        path.mkdir(parents=True, exist_ok=True)
        tree_url = f'https://huggingface.co/api/models/{repo}/tree/{revision}/onnx'
        with urlopen(tree_url, timeout=60) as response:
            entries = json.load(response)
        selected = next(e for e in entries if e['path'] == 'onnx/model_quint8_avx2.onnx')
        expected = selected['lfs']['oid']
        files = {}
        with (ROOT / 'docs/SOURCES.md').open('a', encoding='utf-8') as audit:
            audit.write(f'\n- {tree_url} | {datetime.now(timezone.utc).date()} | Publisher LFS checksum used to verify pinned {role} quantized weights.\n')
        for name in ('onnx/model_quint8_avx2.onnx', 'tokenizer.json', 'tokenizer_config.json', 'config.json'):
            url = f'https://huggingface.co/{repo}/resolve/{revision}/{quote(name)}'
            destination = path / Path(name).name
            if not destination.exists():
                temp = destination.with_suffix('.download')
                with urlopen(url, timeout=180) as response, temp.open('wb') as output:
                    while chunk := response.read(1024 * 1024): output.write(chunk)
                temp.replace(destination)
            with destination.open('rb') as stream:
                checksum = hashlib.file_digest(stream, 'sha256').hexdigest()
            if name.endswith('.onnx') and checksum != expected:
                raise ValueError(f'Publisher checksum mismatch for {role}')
            files[destination.name] = {'sha256': checksum, 'bytes': destination.stat().st_size}
            with (ROOT / 'docs/SOURCES.md').open('a', encoding='utf-8') as audit:
                audit.write(f'\n- {url} | {datetime.now(timezone.utc).date()} | Pinned {role} ONNX provisioning; SHA256 {checksum}.\n')
        (path / 'manifest.json').write_text(json.dumps({'repo': repo, 'revision': revision, 'files': files}, indent=2), encoding='utf-8')
        print(f'Verified {role} ONNX cache: {path}', flush=True)


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--config',default=str(ROOT/'kb/retrieval_render.json'))
    provision(parser.parse_args().config)
