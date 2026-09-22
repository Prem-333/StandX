"""Bounded local text extraction with hardened sanitisation.

Uploaded tenders are never added to the standards KB.

Hardening (Phase 11):
  - Magic-byte validation for PDF and DOCX before parsing
  - DOCX zip-bomb guard (entry count, uncompressed total, per-part size)
  - Post-extraction text sanitisation: strip C0/C1 control chars,
    null bytes, and surrogate code points before the text reaches any
    downstream model or database column
  - Extracted text length re-checked after sanitisation (sanitisation
    can shorten text but never extend it)
  - Explicit encoding errors='replace' when decoding PDF text to prevent
    UnicodeDecodeError from crashing the request
"""
import re
import unicodedata
from io import BytesIO
from zipfile import ZipFile, BadZipFile
from pypdf import PdfReader
from docx import Document

MAX_UPLOAD = 5 * 1024 * 1024   # 5 MiB raw upload limit
MAX_TEXT   = 100_000            # characters of extracted text

# ---------------------------------------------------------------------------
# Sanitisation
# ---------------------------------------------------------------------------

# Control characters that are NOT whitespace (tab/LF/CR are fine).
# Includes C0 (0x00-0x1F except 0x09,0x0A,0x0D), DEL (0x7F),
# C1 (0x80-0x9F), and Unicode surrogates (0xD800-0xDFFF).
_CONTROL_RE = re.compile(
    r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\x80-\x9F\uD800-\uDFFF]'
)

# Sequences of 3+ whitespace-only lines collapsed to a single blank line.
_BLANK_RUNS_RE = re.compile(r'\n(\s*\n){2,}')


def _sanitise(text: str) -> str:
    """Strip control characters, null bytes, surrogates, and excessive blank
    lines from extracted text before it reaches any model or DB column.

    This is a defence-in-depth measure; it does not validate semantic content.
    """
    # Replace surrogates and control chars with a space rather than empty
    # string so that word boundaries are preserved for tokenisers.
    text = _CONTROL_RE.sub(' ', text)
    # Normalise to NFC to avoid decomposed combining marks confusing tokenisers.
    text = unicodedata.normalize('NFC', text)
    # Collapse multiple blank lines.
    text = _BLANK_RUNS_RE.sub('\n\n', text)
    return text.strip()


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def _validate_size(content: bytes):
    if len(content) > MAX_UPLOAD:
        raise ValueError(f'Upload exceeds {MAX_UPLOAD // 1024 // 1024} MiB limit')


def _check_text_length(text: str, label: str = ''):
    if len(text) > MAX_TEXT:
        raise ValueError(f'Extracted text exceeds {MAX_TEXT:,} character limit{label}')


def _extract_pdf(content: bytes) -> str:
    # Magic-byte check before handing to pypdf.
    if not content.startswith(b'%PDF-'):
        raise ValueError('Invalid PDF: missing %PDF- header signature')
    # Cap zlib decompression output to prevent zip-bomb style inflation.
    import pypdf.filters
    pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH = 10 * 1024 * 1024

    try:
        reader = PdfReader(BytesIO(content), strict=True)
    except Exception as exc:
        raise ValueError(f'PDF could not be parsed: {exc}') from exc

    if reader.is_encrypted:
        raise ValueError('Encrypted PDFs are not supported; decrypt before upload')
    if len(reader.pages) > 100:
        raise ValueError('PDF exceeds 100-page limit')

    pieces: list[str] = []
    total_chars = 0
    for page in reader.pages:
        # extract_text may return bytes-like objects with bad encodings in
        # some PDFs; errors='replace' prevents a crash.
        raw = page.extract_text() or ''
        if isinstance(raw, bytes):
            raw = raw.decode('utf-8', errors='replace')
        total_chars += len(raw)
        if total_chars > MAX_TEXT:
            raise ValueError('Extracted PDF text exceeds character limit')
        pieces.append(raw)

    return '\n'.join(pieces)


def _extract_docx(content: bytes) -> str:
    # DOCX is a ZIP; validate the zip before opening.
    if not content[:4] == b'PK\x03\x04':
        raise ValueError('Invalid DOCX: missing ZIP PK header signature')

    try:
        with ZipFile(BytesIO(content)) as archive:
            entries = archive.infolist()
            if len(entries) > 2000:
                raise ValueError('DOCX contains too many ZIP entries (> 2000)')
            total_uncompressed = sum(e.file_size for e in entries)
            if total_uncompressed > 30 * 1024 * 1024:
                raise ValueError('DOCX uncompressed size exceeds 30 MiB limit')
            if any(e.file_size > 10 * 1024 * 1024 for e in entries):
                raise ValueError('A single DOCX part exceeds 10 MiB limit')
            if 'word/document.xml' not in archive.namelist():
                raise ValueError('Invalid DOCX package: word/document.xml missing')
    except BadZipFile as exc:
        raise ValueError(f'Upload is not a valid ZIP/DOCX file: {exc}') from exc

    try:
        document = Document(BytesIO(content))
    except Exception as exc:
        raise ValueError(f'DOCX could not be parsed: {exc}') from exc

    pieces = [p.text for p in document.paragraphs]
    pieces.extend(
        ' | '.join(c.text for c in row.cells)
        for table in document.tables
        for row in table.rows
    )
    return '\n'.join(pieces)


def extract_document(name: str, content: bytes) -> str:
    """Extract and sanitise text from a PDF or DOCX upload.

    Returns a clean UTF-8 string ready for NLP processing.
    Raises ValueError for any format, size, or sanity-check violation.
    """
    _validate_size(content)

    suffix = name.lower().rsplit('.', 1)[-1] if '.' in name else ''
    if suffix == 'pdf':
        raw_text = _extract_pdf(content)
    elif suffix == 'docx':
        raw_text = _extract_docx(content)
    else:
        raise ValueError(
            'Only PDF (.pdf) and Word (.docx) tender uploads are accepted; '
            f'received extension: {suffix!r}'
        )

    # Sanitise before length check so the limit applies to clean text.
    text = _sanitise(raw_text)
    _check_text_length(text, ' after sanitisation')

    if not text.strip():
        raise ValueError(
            'No extractable text found. '
            'Scanned PDFs require offline OCR before upload. '
            'Password-protected documents must be decrypted first.'
        )

    return text
