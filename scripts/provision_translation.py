"""Explicit online provisioning of the reviewed, pinned translation repository."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from huggingface_hub import snapshot_download

ROOT = Path(__file__).resolve().parents[1]


def main():
    cfg=json.loads((ROOT/'services/nlp/multilingual_config.json').read_text(encoding='utf-8'))
    repo=cfg['translation_model'];revision=cfg['translation_revision'];path=ROOT/cfg['translation_path']
    if len(revision)!=40:raise ValueError('An immutable publisher commit is required')
    snapshot_download(repo_id=repo,revision=revision,local_dir=path,
        allow_patterns=['*.json','*.py','*.bin','*.safetensors','*.SRC','*.TGT','*.model','*.spm','README.md','LICENSE*'],max_workers=2)
    files={}
    for file in sorted(path.rglob('*')):
        if not file.is_file() or '.cache' in file.parts or file.name=='manifest.json':continue
        name=file.relative_to(path).as_posix()
        with file.open('rb') as stream:checksum=hashlib.file_digest(stream,'sha256').hexdigest()
        files[name]={'sha256':checksum,'bytes':file.stat().st_size}
        with (ROOT/'docs/SOURCES.md').open('a',encoding='utf-8') as log:
            log.write(f'\n- {datetime.now(timezone.utc).isoformat()} | https://huggingface.co/{repo}/resolve/{revision}/{quote(name)} | Local translation asset, SHA256 {checksum}.\n')
    (path/'manifest.json').write_text(json.dumps({'repo':repo,'revision':revision,'files':files},indent=2),encoding='utf-8')
    print('Cached translation assets:',len(files),path)


if __name__=='__main__':main()
