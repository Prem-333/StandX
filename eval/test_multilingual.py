import unittest
from services.nlp.multilingual import QueryNormalizer,configuration


class MultilingualTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.normalizer=QueryNormalizer({**configuration(),'enabled':False})

    def test_missing_translation_is_english_only_and_preserves_original(self):
        text='लकड़ी की मेज'
        result=self.normalizer.normalize(text,'hi')
        self.assertEqual(result['original_text'],text)
        self.assertEqual(result['normalized_text'],'')
        self.assertEqual(result['status'],'english_only_fallback')
        self.assertTrue(result['notices'])

    def test_hinglish_detection_and_retained_english(self):
        result=self.normalizer.normalize('wooden bedside table chahiye')
        self.assertEqual(result['detected_language'],'hi-Latn')
        self.assertEqual(result['normalized_text'],'wooden bedside table')
        self.assertIn('चाहिए',result['romanized_normalization'])

    def test_literal_identity_is_never_translated(self):
        text='IS 9550:2024 की जानकारी'
        result=self.normalizer.normalize(text)
        self.assertEqual(result['normalized_text'],text)
        self.assertEqual(result['status'],'identifier_preserved')
