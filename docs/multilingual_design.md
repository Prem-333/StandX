# Offline multilingual input

The default strategy translates the **query**, preserving the original text and provenance. It does not translate BIS metadata into multiple derivative corpora. This avoids multiplying the index, refresh work, and opportunities to change technical meaning. Exact IS identifiers remain untouched apart from normalization of decimal digit glyphs; the English KB continues to cite the original record. Query translation adds latency and can lose terminology, so every translated request exposes the English text and requires review.

## Model review — 21 September 2026

| Model/card checked live | Licence and access | Decision |
| --- | --- | --- |
| [AI4Bharat IndicTrans2 Indic–English distilled 200M](https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M) | MIT; gated repository requiring acceptance/contact sharing | Its card links extended-context RoPE models. No gate was bypassed. |
| [IndicTrans2 RoPE Indic–English distilled 200M](https://huggingface.co/prajdabre/rotary-indictrans2-indic-en-dist-200M) | MIT, ungated, author-published adaptation linked from the original card | Selected laptop baseline. Pinned commit `00213ee82929050694b162123bb26a8dc177cdae`; published float32 weights are 847,373,378 bytes, about 0.79 GiB before runtime overhead. |
| [Meta NLLB-200 distilled 600M](https://huggingface.co/facebook/nllb-200-distilled-600M) | CC-BY-NC-4.0; card describes research limitations | Not selected as the government production default. |
| [Helsinki-NLP OPUS Hindi–English](https://huggingface.co/Helsinki-NLP/opus-mt-hi-en) | Apache 2.0, ungated | Hindi-only alternative investigated; not the selected multilingual model. |

The inspected publisher repositories did not contain official GGUF assets. Community quantizations exist in model-tree links, but those links do not establish publisher verification, licence suitability, or compatibility with this stack. No third-party quantization was downloaded. Float32 CPU execution avoids assuming a CUDA/bitsandbytes build works on this Windows laptop. These checks establish the available candidate releases, not a universal “best” ranking: quality on procurement language must be measured separately. The laptop has approximately 16 GB RAM and 4 GB VRAM; translation runs on CPU alongside the existing small retrieval models.

## Runtime and compatibility

`services/nlp/multilingual_config.json` selects the local model path, immutable revision, adapter, device, language tags and inference limits. `MULTILINGUAL_CONFIG` can point elsewhere. `python scripts/provision_translation.py` is a separate **online provisioning** command; runtime never downloads files or calls a translation/embedding API. It verifies every cached file hash before loading. The RoPE assets are already cached on this host and excluded from Git.

The original publisher tokenizer/model loader targets an older Transformers API. The tested local adapter keeps all cached publisher files unchanged, uses the published SentencePiece vocabularies, initializes the pinned architecture, loads weights with `weights_only=True`, adapts the decoder/output weight tie, and performs bounded greedy decoding without the incompatible cache interface. The optional IndicTransToolkit Cython extension could not build without Windows C++ tools. The adapter uses its underlying Indic normalization/tokenization/transliteration library directly for the configured scripts, plus English detokenization. This is a deliberately narrow compatibility implementation, not a claim of complete Toolkit parity. The tested Transformers version is pinned.

The `seq2seq` adapter supports standard Hugging Face encoder-decoder models through local-only loading without custom model code; a model swap also requires the appropriate language-tag map, token limits, and optional target-language token. Provision and evaluate the new cache before selecting it. A missing, incompatible, disabled, or corrupt translation cache does not stop the API: it yields an explicit English-only fallback notice.

## Detection, Hinglish, and audit

The API boundary uses a locally installed `langid` classifier with script checks and an explicit limited Hinglish lexicon. Hindi, Bengali, Marathi and Telugu tags are configured, along with several other Indic languages. This is not a promise of equal quality or reliable language detection for every short phrase. `language_hint` lets the officer resolve uncertainty.

Hinglish is recognized through reviewed romanized Hindi cues; those words are normalized to Devanagari while retaining English terms, then translated through the same local model. The small lexicon is data in `hinglish_lexicon.json`; it is not a general transliteration model. Names, unusual spellings, negation and code switching need review. Unsupported language tags fall back explicitly. The current eight-case evaluation covers Hindi and Hinglish, not the other configured languages.

Original text, detected language, classifier score, hint, intermediate Hinglish normalization, English text, translation status, notices, and model revision are saved inside the complete recommendation audit record. Tender phrase spans refer explicitly to the normalized text; segment pairs preserve the source/English relationship. Numeric-token changes, detected negation loss, oversized segments, and exhausted output budgets reject the translation. In fallback, only retained English/ASCII fragments are searched; no remaining terms means an audited “no confident match,” not an error or fabricated answer. Detected negation is not discarded to create a positive fallback query.

## Measured smoke results

`npm run phase7-demo` translates five Hindi and three Hinglish inputs through the cached model, retrieves the seed records, and verifies original query text in PostgreSQL. The initial run translated all eight, found the expected record in the top five in **8/8**, and ranked it first in **6/8**. Both eye-protection phrasings ranked security glass first and the expected eye-protector record second; their low scores triggered human review. Some correctly ranked Hinglish queries also fell below the provisional threshold. These failures remain in `data/processed/multilingual_demo.json` rather than being hidden by tuning the test phrases.

The generated readable query table is in `docs/multilingual_results.md`. This small authored smoke set does not establish production accuracy or calibrated confidence. Before deployment, evaluate expert-labelled tender phrases by language, numeric preservation, negation, transliteration variants, and abstention. Query translation should stay reversible and inspectable throughout that evaluation.
