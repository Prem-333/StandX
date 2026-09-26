"""Optional CPU ONNX profile. Only verified local files are opened at runtime."""
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer
import sys


def release_unused_heap():
    """Return freed startup buffers on glibc; other platforms need no action."""
    if sys.platform != 'linux':
        return
    import ctypes
    trim = getattr(ctypes.CDLL(None), 'malloc_trim', None)
    if trim is not None:
        trim.argtypes = [ctypes.c_size_t]
        trim.restype = ctypes.c_int
        trim(0)


class LocalTokenizer:
    def __init__(self, path):
        self.raw = Tokenizer.from_file(str(path / 'tokenizer.json'))

    def encode(self, text):
        # Index construction must detect truncation, not silently lose metadata.
        self.raw.no_truncation()
        return self.raw.encode(text).ids


class OnnxModel:
    def __init__(self, path, settings, role):
        self.role, self.settings = role, settings
        # Tokenizer construction has a transient memory peak: do it before weights.
        release_unused_heap()
        self.tokenizer = LocalTokenizer(path)
        release_unused_heap()
        options = ort.SessionOptions()
        options.intra_op_num_threads = 1
        options.inter_op_num_threads = 1
        options.enable_cpu_mem_arena = False
        options.enable_mem_pattern = False
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
        options.add_session_config_entry('session.disable_prepacking', '1')
        self.session = ort.InferenceSession(str(path / settings['onnx_filename']), options,
                                            providers=['CPUExecutionProvider'])
        release_unused_heap()

    def _run(self, text, pair=None):
        tokenizer = self.tokenizer.raw
        tokenizer.enable_truncation(max_length=self.settings['max_tokens'])
        encoded = tokenizer.encode(text, pair)
        values = {'input_ids': encoded.ids, 'attention_mask': encoded.attention_mask,
                  'token_type_ids': encoded.type_ids}
        inputs = {v.name: np.asarray([values[v.name]], dtype=np.int64)
                  for v in self.session.get_inputs()}
        return self.session.run(None, inputs)[0]

    def encode(self, texts, normalize_embeddings=True, **kwargs):
        # Granite r2 publisher config uses CLS pooling. No remote inference.
        vectors = np.asarray([self._run(text)[0, 0] for text in texts], dtype=np.float32)
        if normalize_embeddings:
            vectors /= np.maximum(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-12)
        return vectors

    def predict(self, pairs, **kwargs):
        # Raw logits; the existing recommendation layer records score semantics.
        return np.asarray([float(self._run(query, document).reshape(-1)[0])
                           for query, document in pairs], dtype=np.float32)
