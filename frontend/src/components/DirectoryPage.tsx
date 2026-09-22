import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const dummyStandards = [
  { is: 'IS 9550 : 2024', title: 'Bright steel bars — Specification', tag: 'Mechanical' },
  { is: 'IS 1448 : Part 10 : 2013', title: 'Methods of Test for Petroleum and its Products', tag: 'Chemical' },
  { is: 'IS 10001 : 2020', title: 'Performance requirements for Electric Vehicles', tag: 'Electrical' },
  { is: 'IS 2720 : Part 4 : 1985', title: 'Methods of test for soils: Grain size analysis', tag: 'Civil' },
  { is: 'IS 456 : 2000', title: 'Plain and Reinforced Concrete - Code of Practice', tag: 'Civil' },
  { is: 'IS 302 : Part 1 : 2008', title: 'Safety of household and similar electrical appliances', tag: 'Electrical' },
];

const TAG_COLORS: Record<string, string> = {
  Mechanical: 'chip-teal',
  Chemical: 'chip-indigo',
  Electrical: 'chip-amber',
  Civil: 'chip-green',
  Textiles: 'chip-muted',
};

const FILTERS = ['All Categories', 'Mechanical', 'Electrical', 'Civil', 'Textiles', 'Chemical'];

export function DirectoryPage() {
  const [filter, setFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = dummyStandards.filter((s) => {
    const matchCat = filter === 'All Categories' || s.tag === filter;
    const matchSearch =
      !searchQuery ||
      s.is.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Knowledge Base</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-3 font-display">
            Standards Directory
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
            Browse and search the complete local repository of metadata records.
          </p>
        </div>
      </div>

      {/* Search + filter card */}
      <div className="glass-card p-5 sm:p-6 mb-8">
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--clr-teal)] opacity-60 z-10" size={18} />
          <input
            type="text"
            className="input-dark w-full pl-12 pr-4 py-3 text-[15px] font-medium"
            placeholder="Search by IS number, title, or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className="interactive-btn px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border"
              style={
                filter === tag
                  ? {
                      background: 'var(--clr-teal)',
                      color: '#030a14',
                      borderColor: 'var(--clr-teal)',
                      boxShadow: 'var(--glow-teal)',
                    }
                  : {
                      background: 'rgba(7,13,26,0.5)',
                      color: 'var(--clr-text-muted)',
                      borderColor: 'var(--clr-border)',
                    }
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Standards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((std, i) => (
          <div
            key={std.is}
            className="glass-card hover-card p-6 flex flex-col cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${(i % 6) * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[13px] font-black text-[var(--clr-teal)] font-mono">{std.is}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TAG_COLORS[std.tag] || 'chip-muted'}`}>
                {std.tag}
              </span>
            </div>
            <p className="text-[13px] text-[var(--clr-text-dim)] font-medium leading-relaxed mb-6 flex-1">
              {std.title}
            </p>
            <div className="pt-4 border-t border-[var(--clr-border)] flex items-center justify-between text-[11px] font-semibold text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] transition-colors">
              <span>View metadata</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--clr-text-muted)] text-sm font-medium">
          No standards found matching your criteria.
        </div>
      )}
    </div>
  );
}
