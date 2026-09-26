"""Read-only smoke check of the deployed backend; credentials stay in the environment."""
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def main():
    origin = os.environ.get('STANDX_API_ORIGIN', '').rstrip('/')
    key = os.environ.get('STANDX_API_KEY', '')
    parsed = urlparse(origin)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('Set STANDX_API_ORIGIN to the backend HTTPS origin without credentials.')
    if parsed.path or parsed.query or parsed.fragment or not key:
        raise ValueError('Use an origin without a path/query and set STANDX_API_KEY.')

    def get(path, authenticated=True):
        headers = {'X-API-Key': key} if authenticated else {}
        with urlopen(Request(origin + path, headers=headers), timeout=120) as response:
            return json.load(response)

    try:
        get('/v1/health', authenticated=False)
    except HTTPError as exc:
        if exc.code != 401:
            raise ValueError(f'Unauthenticated health returned HTTP {exc.code}; expected 401.') from None
    else:
        raise ValueError('Health endpoint accepted an unauthenticated request.')
    health = get('/v1/health')
    if health.get('status') != 'ok' or any(
        health.get('services', {}).get(name) != 'ok' for name in ('postgres', 'qdrant', 'graph')
    ):
        raise ValueError('One or more backend dependencies are unhealthy.')
    system = get('/v1/system')
    if system.get('graph_backend') != 'neo4j':
        raise ValueError('Expected the Neo4j graph backend.')
    directory = get('/v1/standards?limit=1')
    if not directory.get('items') or not directory['items'][0].get('evidence'):
        raise ValueError('The record directory did not return record-level evidence.')
    print(json.dumps({'authenticated': True, 'health': health,
                     'visible_records': system['visible_records'],
                     'verified_records': system['verified_records'],
                     'synthetic_records': system['synthetic_records'],
                     'graph_backend': system['graph_backend'],
                     'directory_evidence': True}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except HTTPError as exc:
        print(f'Smoke check failed: HTTP {exc.code}', file=sys.stderr)
        sys.exit(1)
    except (URLError, TimeoutError):
        print('Smoke check failed: backend connection unavailable.', file=sys.stderr)
        sys.exit(1)
    except (ValueError, KeyError) as exc:
        print(f'Smoke check failed: {exc}', file=sys.stderr)
        sys.exit(1)
