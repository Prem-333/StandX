"""Exercise recommendation token budgeting against the actual ONNX wrapper."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase

from tokenizers import Tokenizer, models, pre_tokenizers, processors
from kb.onnx_models import LocalTokenizer


class OnnxTokenizerTests(TestCase):
    def test_query_budget_excludes_special_tokens_and_disables_truncation(self):
        raw = Tokenizer(models.WordLevel({'[UNK]': 0, '[CLS]': 1, '[SEP]': 2,
                                          'steel': 3}, unk_token='[UNK]'))
        raw.pre_tokenizer = pre_tokenizers.Whitespace()
        raw.post_processor = processors.TemplateProcessing(
            single='[CLS] $A [SEP]', special_tokens=[('[CLS]', 1), ('[SEP]', 2)])
        with TemporaryDirectory() as directory:
            path = Path(directory)
            raw.save(str(path / 'tokenizer.json'))
            tokenizer = LocalTokenizer(path)
            self.assertEqual(tokenizer.encode('steel'), [1, 3, 2])
            tokenizer.raw.enable_truncation(max_length=4)
            tokens = tokenizer.encode(' '.join(['steel'] * 140), add_special_tokens=False)
            self.assertEqual(tokens, [3] * 140)
