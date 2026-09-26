"""Read-only check of the hosted frontend's connection to the backend."""
import json
import os
from urllib.parse import urlparse
from urllib.request import urlopen

from phase14_demo import main as check_backend


def main():
    origin = os.environ.get('STANDX_FRONTEND_ORIGIN', '').rstrip('/')
    parsed = urlparse(origin)
    if (parsed.scheme != 'https' or not parsed.netloc or parsed.username or
            parsed.password or parsed.path or parsed.query or parsed.fragment):
        raise ValueError('Set STANDX_FRONTEND_ORIGIN to the frontend HTTPS origin.')
    with urlopen(origin + '/demo-context', timeout=120) as response:
        context = json.load(response)
    if not context.get('backend_configured') or context.get('authenticated_proxy'):
        raise ValueError('Expected a configured gateway that requires an individual API key.')
    os.environ['STANDX_API_ORIGIN'] = origin
    check_backend()


if __name__ == '__main__':
    main()
