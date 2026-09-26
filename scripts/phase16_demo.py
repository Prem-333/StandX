"""Read-only public demo check without an API key."""
import json
import os
from urllib.error import HTTPError
from urllib.request import urlopen
from urllib.parse import urlparse


def main():
    origin = os.environ['STANDX_FRONTEND_ORIGIN'].rstrip('/')
    parsed = urlparse(origin)
    if (parsed.scheme != 'https' or not parsed.netloc or parsed.username or
            parsed.password or parsed.path or parsed.query or parsed.fragment):
        raise ValueError('Use a frontend HTTPS origin without credentials.')
    def get(path):
        with urlopen(origin + path, timeout=120) as response:
            return json.load(response)
    context = get('/demo-context')
    assert context['public_demo'] and context['authenticated_proxy'] and context['backend_configured']
    health = get('/v1/health')
    assert health['status'] == 'ok'
    assert get('/v1/system')['graph_backend'] == 'neo4j'
    assert get('/v1/standards?limit=1')['items'][0]['evidence']
    try:
        get('/v1/history')
    except HTTPError as exc:
        assert exc.code == 403
    else:
        raise AssertionError('Public demo must not expose shared officer history')
    print(json.dumps({'public_demo': True, 'keyless_health': health['status'],
                      'directory_evidence': True, 'shared_history_blocked': True}))


if __name__ == '__main__':
    main()
