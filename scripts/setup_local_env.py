"""Create missing local secrets only. Never prints or replaces existing credentials."""
from pathlib import Path
import json
import secrets

root=Path(__file__).resolve().parents[1]
path=root/'.env'
existing=path.read_text(encoding='utf-8') if path.exists() else ''
values={'POSTGRES_PASSWORD':secrets.token_hex(24),'NEO4J_PASSWORD':secrets.token_hex(24),
        'API_KEYS_JSON':json.dumps({'local-officer':secrets.token_hex(24)},separators=(',',':'))}
lines=[];seen=set()
for line in existing.splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        key,value=line.split('=',1);key=key.strip()
        if key in values:
            seen.add(key)
            if not value.strip().strip('\"\''):line=f'{key}={values[key]}'
    lines.append(line)
lines.extend(f'{key}={value}' for key,value in values.items() if key not in seen)
path.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Local environment file ready. Credentials retained in the Git-ignored .env; protect this file.')
