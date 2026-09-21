"""Bounded local text extraction. Uploaded tenders are not added to the standards KB."""
from io import BytesIO
from zipfile import ZipFile, BadZipFile
from pypdf import PdfReader
from docx import Document

MAX_UPLOAD=5*1024*1024
MAX_TEXT=100000


def extract_document(name,content):
    if len(content)>MAX_UPLOAD:raise ValueError('Upload exceeds 5 MiB')
    suffix=name.lower().rsplit('.',1)[-1]
    if suffix=='pdf':
        if not content.startswith(b'%PDF-'):raise ValueError('Invalid PDF signature')
        import pypdf.filters
        pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=10*1024*1024
        reader=PdfReader(BytesIO(content),strict=True)
        if reader.is_encrypted:raise ValueError('Encrypted PDFs are not supported')
        if len(reader.pages)>100:raise ValueError('PDF exceeds 100 pages')
        pieces=[];size=0
        for page in reader.pages:
            text=page.extract_text() or '';size+=len(text)
            if size>MAX_TEXT:raise ValueError('Extracted text exceeds limit')
            pieces.append(text)
        text='\n'.join(pieces)
    elif suffix=='docx':
        with ZipFile(BytesIO(content)) as archive:
            entries=archive.infolist()
            if len(entries)>2000 or sum(e.file_size for e in entries)>30*1024*1024:
                raise ValueError('DOCX archive exceeds expansion limits')
            if any(e.file_size>10*1024*1024 for e in entries):raise ValueError('DOCX part exceeds limit')
            if 'word/document.xml' not in archive.namelist():raise ValueError('Invalid DOCX package')
        document=Document(BytesIO(content))
        pieces=[p.text for p in document.paragraphs]
        pieces.extend(' | '.join(c.text for c in row.cells) for table in document.tables for row in table.rows)
        text='\n'.join(pieces)
    else:raise ValueError('Only PDF and DOCX tender uploads are accepted')
    if len(text)>MAX_TEXT:raise ValueError('Extracted text exceeds limit')
    if not text.strip():raise ValueError('No extractable text; scanned PDFs require offline OCR before upload')
    return text
