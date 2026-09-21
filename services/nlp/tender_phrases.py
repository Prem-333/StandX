"""Conservative local phrase extraction with exact character spans, no generative facts.

Title n-grams anchor known products. Unmatched clauses remain retrieval queries;
negated clauses are retained for manual review rather than turned into purchases.
"""
import re
import unicodedata

WORD = re.compile(r'[^\s,.;:()\[\]{}!?/\\—–-]+')
BOILERPLATE = {'the','a','an','for','of','to','in','and','or','with','shall','be',
               'supply','procure','provide','purchase','required','specification',
               'specifications','part','revision','first','second','third','test','method'}


def normalize(word):
    word = unicodedata.normalize('NFKC', word).casefold()
    # Conservative English plural handling; Indic strings pass through unchanged.
    if word.isascii() and word.isalpha() and len(word) > 4 and word.endswith('s') and not word.endswith('ss'):
        return word[:-1]
    return word


def extract_phrases(text, records, max_phrases=50):
    vocabulary = set()
    for record in records:
        words = [normalize(m.group()) for m in WORD.finditer(record['title'])]
        for size in range(2, 7):
            for start in range(len(words)-size+1):
                phrase = tuple(words[start:start+size])
                if all(w not in BOILERPLATE and not w.isdigit() for w in phrase):
                    vocabulary.add(phrase)
    phrases = []; skipped = []; seen = {}
    # Keep original offsets. Coordinated procurement items become separate clauses.
    boundary = re.compile(r'[;\n.!?]+|\s+(?:and|or)\s+', re.I)
    starts = [0]; ends = []
    for match in boundary.finditer(text):
        ends.append(match.start()); starts.append(match.end())
    ends.append(len(text))
    for start, end in zip(starts, ends):
        clause = text[start:end]
        if not clause.strip():
            continue
        if re.search(r'\b(?:no|not|without|exclude|excluded|excluding)\b', clause, re.I):
            skipped.append({'text':clause.strip(), 'start':start, 'end':end,
                            'reason':'negation_requires_human_review'})
            continue
        words = list(WORD.finditer(clause)); normalized = [normalize(m.group()) for m in words]
        hits = []
        for i in range(len(words)):
            for size in range(6, 1, -1):
                if tuple(normalized[i:i+size]) in vocabulary and i+size <= len(words):
                    hits.append((i, size)); break
        chosen = []; occupied = set()
        for i, size in sorted(hits, key=lambda h:(-h[1], h[0])):
            positions = set(range(i, i+size))
            if not positions & occupied:
                chosen.append((words[i].start()+start, words[i+size-1].end()+start, 'metadata_title_phrase'))
                occupied.update(positions)
        if not chosen:
            left = len(clause)-len(clause.lstrip()); right = len(clause.rstrip())
            chosen = [(start+left, start+right, 'unmatched_clause_for_review')]
        for a, b, method in sorted(chosen):
            phrase_text = text[a:b]
            key = ' '.join(normalize(m.group()) for m in WORD.finditer(phrase_text))
            occurrence = {'start':a, 'end':b, 'clause_start':start, 'clause_end':end,
                          'context':clause.strip()}
            if key in seen:
                seen[key]['occurrences'].append(occurrence)
                continue
            item = {'text':phrase_text, 'method':method, 'occurrences':[occurrence]}
            seen[key] = item; phrases.append(item)
    omitted = phrases[max_phrases:]
    return {'phrases':phrases[:max_phrases], 'omitted_phrases':omitted, 'manual_review_clauses':skipped,
            'method':'metadata_title_ngrams_and_clause_fallback',
            'limitations':'Heuristic product phrase extraction, not full tender interpretation. Review original clauses for quantities, qualifiers, negation, and multilingual requirements.'}
