import { useState } from 'react';
import { Search, ArrowRight, X, ExternalLink, ShieldCheck, Link2 } from 'lucide-react';

const dummyStandards = [
  { is: 'IS 9550 : 2024',           title: 'Bright steel bars — Specification',                              tag: 'Mechanical', scheme: 'ISI', req: 'Mandatory', year: 2024, committee: 'MTD 4', pages: 28   },
  { is: 'IS 1448 : Part 10 : 2013', title: 'Methods of Test for Petroleum and its Products',                tag: 'Chemical',   scheme: '—',   req: 'Voluntary', year: 2013, committee: 'PCD 2', pages: 64   },
  { is: 'IS 10001 : 2020',          title: 'Performance requirements for Electric Vehicles',                 tag: 'Electrical', scheme: 'ISI', req: 'Mandatory', year: 2020, committee: 'ETD 9', pages: 42   },
  { is: 'IS 2720 : Part 4 : 1985',  title: 'Methods of test for soils: Grain size analysis',                tag: 'Civil',      scheme: '—',   req: 'Advisory',  year: 1985, committee: 'CED 43', pages: 20  },
  { is: 'IS 456 : 2000',            title: 'Plain and Reinforced Concrete — Code of Practice',              tag: 'Civil',      scheme: 'ISI', req: 'Mandatory', year: 2000, committee: 'CED 2', pages: 114  },
  { is: 'IS 302 : Part 1 : 2008',   title: 'Safety of household and similar electrical appliances',         tag: 'Electrical', scheme: 'ISI', req: 'Mandatory', year: 2008, committee: 'ETD 22', pages: 186 },
];

const TAG_CHIPS: Record<string, string> = {
  Mechanical: 'chip-teal',
  Chemical:   'chip-indigo',
  Electrical: 'chip-amber',
  Civil:      'chip-green',
  Textiles:   'chip-muted',
};

const FILTERS = ['All Categories', 'Mechanical', 'Electrical', 'Civil', 'Textiles', 'Chemical'];

export function DirectoryPage() {
  const [filter, setFilter]           = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected]       = useState<typeof dummyStandards[0] | null>(null);

  const filtered = dummyStandards.filter((s) => {
    const matchCat    = filter === 'All Categories' || s.tag === filter;
    const matchSearch = !searchQuery ||
      s.is.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <p className="section-label mb-2">Knowledge Base</p>
        <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">Standards Directory</h1>
        <p className="text-[15px] text-[var(--clr-text-muted)] leading-relaxed">Browse and search the complete local repository of metadata records.</p>
      </div>

      {/* Search + filters */}
      <div className="card p-5 mb-7">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--clr-slate)] opacity-60 z-10" size={16} />
          <input
            type="text"
            className="input-field w-full pl-10 pr-4 py-2.5 text-[14px]"
            placeholder="Search by IS number, title, or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className="interactive-btn px-3.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border"
              style={filter === tag
                ? { background: 'var(--clr-teal)', color: '#fff', borderColor: 'var(--clr-teal)' }
                : { background: 'var(--clr-bg-3)', color: 'var(--clr-text-muted)', borderColor: 'var(--clr-border)' }
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((std, i) => (
          <div
            key={std.is}
            className="card card-hover p-5 flex flex-col cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${(i % 6) * 40}ms`, animationFillMode: 'both' }}
            onClick={() => setSelected(std)}
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className="text-[12px] font-black text-[var(--clr-teal)] font-mono">{std.is}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TAG_CHIPS[std.tag] || 'chip-muted'}`}>{std.tag}</span>
            </div>
            <p className="text-[13px] text-[var(--clr-text-dim)] leading-relaxed mb-5 flex-1">{std.title}</p>
            <div className="pt-3.5 border-t border-[var(--clr-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] transition-colors">
              <span>View metadata</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--clr-text-muted)] text-sm">No standards found matching your criteria.</div>
      )}

      {/* Metadata detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.35)' }}
          onClick={() => setSelected(null)}
        >
          <div className="card w-full max-w-lg p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-black text-[var(--clr-teal)] font-mono">{selected.is}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TAG_CHIPS[selected.tag] || 'chip-muted'}`}>{selected.tag}</span>
                </div>
                <h2 className="text-[16px] font-black text-[var(--clr-text)] leading-snug">{selected.title}</h2>
              </div>
              <button className="btn-ghost interactive-btn p-2 rounded-lg flex-shrink-0" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Year', selected.year],
                ['Committee', selected.committee],
                ['Certification', <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-[var(--clr-teal)]" /> {selected.scheme}</span>],
                ['Requirement', selected.req],
                ['Pages (approx.)', selected.pages],
                ['Source', 'BIS public metadata'],
              ].map(([label, val]) => (
                <div key={String(label)} className="p-3 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
                  <dt className="section-label mb-1">{label}</dt>
                  <dd className="text-[12px] font-bold text-[var(--clr-teal)]">{val as React.ReactNode}</dd>
                </div>
              ))}
            </dl>

            <div className="flex gap-2">
              <a
                href={`https://www.bis.gov.in/`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary interactive-btn flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold"
              >
                <ExternalLink size={14} /> BIS Portal
              </a>
              <button className="btn-primary interactive-btn flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold" onClick={() => setSelected(null)}>
                <Link2 size={14} /> Use in spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
