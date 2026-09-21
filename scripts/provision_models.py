"""Explicit online provisioning only. Runtime modules never call this script."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from huggingface_hub import snapshot_download

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=Path, default=ROOT / 'kb/retrieval_config.json')
    args = parser.parse_args()
    config = json.loads(args.config.read_text())
    for role in ('embedding', 'reranker'):
        repo, revision = config[f'{role}_model'], config[f'{role}_revision']
        if len(revision) != 40:
            raise ValueError('Provision a verified immutable model commit, not main')
        path = ROOT / config[f'{role}_path']
        print(f'Provisioning {role}: {repo}@{revision}', flush=True)
        snapshot_download(repo_id=repo, revision=revision, local_dir=path,
                          allow_patterns=['*.json','*.safetensors','*.txt','*.model','README.md','LICENSE*'],
                          ignore_patterns=['onnx/*','openvino/*'], max_workers=2)
        files = {}
        for file in sorted(path.rglob('*')):
            if not file.is_file() or '.cache' in file.parts or file.name == 'manifest.json':
                continue
            rel = file.relative_to(path).as_posix()
            files[rel] = {'sha256': hashlib.file_digest(file.open('rb'), 'sha256').hexdigest(),
                          'bytes': file.stat().st_size}
            url = f'https://huggingface.co/{repo}/resolve/{revision}/{quote(rel)}'
            with (ROOT / 'docs/SOURCES.md').open('a', encoding='utf-8') as audit:
                audit.write(f'| {url} | {datetime.now(timezone.utc).date()} | Local {role} asset; SHA256 {files[rel]["sha256"]}. |\n')
        if not any(k.endswith('.safetensors') for k in files):
            raise RuntimeError('No safe model weights cached')
        (path / 'manifest.json').write_text(json.dumps({'repo':repo,'revision':revision,'files':files},indent=2),encoding='utf-8')
        print(f'Cached and hashed {len(files)} files under {path}', flush=True)


if __name__ == '__main__':
    main()
