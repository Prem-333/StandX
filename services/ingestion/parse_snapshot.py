"""Parse already captured BIS public metadata HTML. This module has no network code."""
from html.parser import HTMLParser
from pathlib import Path
import re


class Tables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.tables = []

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            parent = self.stack[-1] if self.stack else None
            label = parent['row'][0] if parent and parent['row'] else ''
            self.stack.append({'rows': [], 'row': None, 'cell': None, 'label': label})
        elif self.stack:
            t = self.stack[-1]
            if tag == 'tr':
                if t['row'] is not None:
                    t['rows'].append(t['row'])
                t['row'] = []
            elif tag in ('th', 'td'):
                t['cell'] = []
            elif tag == 'br' and t['cell'] is not None:
                t['cell'].append('\n')

    def handle_data(self, data):
        if self.stack and self.stack[-1]['cell'] is not None:
            self.stack[-1]['cell'].append(data)

    def handle_endtag(self, tag):
        if not self.stack:
            return
        t = self.stack[-1]
        if tag in ('th', 'td') and t['cell'] is not None:
            value = ' '.join(''.join(t['cell']).split())
            if t['row'] is not None:
                t['row'].append(value)
            t['cell'] = None
        elif tag == 'tr' and t['row'] is not None:
            t['rows'].append(t['row'])
            t['row'] = None
        elif tag == 'table':
            self.tables.append(self.stack.pop())


def parse(path):
    parser = Tables()
    parser.feed(Path(path).read_text(encoding='utf-8'))
    fields, references = {}, []
    for table in parser.tables:
        rows = table['rows']
        for row in rows:
            if len(row) == 1 and row[0].endswith(':'):
                fields[row[0].rstrip(':').strip()] = ''
            if len(row) == 2 and not row[0].isdigit() and row[0] != 'SNo':
                fields[row[0].rstrip(':').strip()] = row[1]
        if rows and any('SNo' in cell for cell in rows[0]):
            references.append({'label': table['label'], 'rows': rows})
    return fields, references


if __name__ == '__main__':
    import sys, json
    print(json.dumps(parse(sys.argv[1]), indent=2, ensure_ascii=False))
