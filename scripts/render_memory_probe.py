"""Profile actual startup/inference in a worker thread; never print credentials."""
import gc
import json
from pathlib import Path
import sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import psutil

process = psutil.Process()
trim = None
if '--trim' in sys.argv and sys.platform == 'linux':
    import ctypes
    libc = ctypes.CDLL(None)
    trim = getattr(libc, 'malloc_trim', None)
    if trim:
        trim.argtypes = [ctypes.c_size_t]
        trim.restype = ctypes.c_int


def memory(stage):
    info = process.memory_info()
    result = {'memory_stage': stage, 'trim_enabled': trim is not None,
              'rss_mib': round(info.rss / 1048576, 1)}
    if sys.platform == 'linux':
        import resource
        result['peak_rss_mib'] = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
    print(json.dumps(result), flush=True)


def instrument(module, name):
    original = getattr(module, name)

    def measured(*args, **kwargs):
        memory('before_' + name)
        result = original(*args, **kwargs)
        memory('after_' + name)
        if trim:
            gc.collect()
            trim(0)
            memory('trimmed_' + name)
        return result

    setattr(module, name, measured)


def probe():
    from services.api.app import app  # Include the deployed API import footprint.
    from services.api import runtime
    from services.nlp import retrieve
    from services.recommendation import engine
    from kb import neo4j_projection
    memory('imports')
    for module, name in ((runtime, 'QueryNormalizer'), (runtime, 'Runtime'),
                         (retrieve, 'embedding_model'), (retrieve, 'reranker_model'),
                         (engine, 'RecommendationEngine'),
                         (neo4j_projection, 'load_projection')):
        instrument(module, name)
    active = runtime.create_runtime()
    try:
        memory('ready')
        result = active.engine.retriever.search('Bright steel bars for fabrication', False, 3)
        memory('inference')
        print(json.dumps({'probe_results': len(result['results']),
                          'health': active.health()}), flush=True)
    finally:
        active.close()


if __name__ == '__main__':
    memory('process')
    with ThreadPoolExecutor(max_workers=1) as executor:
        executor.submit(probe).result()
