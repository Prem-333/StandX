import { useState } from 'react';
import { Filter, ArrowRight, X } from 'lucide-react';

const dummyHistory = [
  { id: 'REC-7489', query: 'Bright steel bars', date: '2026-09-21', status: 'Completed', matches: 3 },
  { id: 'REC-7488', query: 'Street-lighting fixture', date: '2026-09-20', status: 'Pending Review', matches: 5 },
  { id: 'REC-7487', query: 'Gold jewellery artefacts', date: '2026-09-18', status: 'Completed', matches: 1 },
  { id: 'REC-7485', query: 'Laptop notebook tablet', date: '2026-09-15', status: 'No Matches', matches: 0 },
];

const STATUS_CHIP: Record<string, string> = {
  Completed: 'chip-teal',
  'Pending Review': 'chip-amber',
  'No Matches': 'chip-muted',
};

interface HistoryRow {
  id: string; query: string; date: string; status: string; matches: number;
}

export function HistoryPage() {
  const [selected, setSelected] = useState<HistoryRow | null>(null);
  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <p className="section-label mb-2">Audit Trail</p>
          <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">Query History</h1>
          <p className="text-[15px] text-[var(--clr-text-muted)] leading-relaxed">Review past specifications, officer decisions, and retrieved evidence.</p>
        </div>
        <button className="interactive-btn self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-lg btn-secondary px-4 py-2.5 text-[13px] font-semibold">
          <Filter size={14} /> Filter records
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Total Queries', value: '48', color: 'var(--clr-teal)' },
          { label: 'Confirmed',     value: '39', color: 'var(--clr-green)' },
          { label: 'Pending',       value: '9',  color: 'var(--clr-amber)' },
        ].map((stat, i) => (
          <div key={stat.label} className="card p-4 sm:p-5 flex flex-col gap-1 animate-slide-up" style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both' }}>
            <p className="section-label">{stat.label}</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.35)' }} onClick={() => setSelected(null)}>
          <div className="card w-full max-w-lg p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-label mb-1">Record Detail</p>
                <h2 className="text-xl font-black text-[var(--clr-text)]">{selected.query}</h2>
              </div>
              <button className="btn-ghost interactive-btn p-2 rounded-lg" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <dl className="space-y-3 text-sm">
              {[['Record ID', <code className="font-mono text-[var(--clr-teal)]">{selected.id}</code>], ['Date', selected.date], ['Matches', <span className="chip-teal px-2 py-0.5 rounded font-bold">{selected.matches}</span>], ['Status', <span className={`inline-flex items-center rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_CHIP[selected.status] || 'chip-muted'}`}>{selected.status}</span>]].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between items-center py-2.5 border-b border-[var(--clr-border)] last:border-0">
                  <dt className="text-[var(--clr-text-muted)] font-medium">{label}</dt>
                  <dd className="font-semibold text-[var(--clr-text)]">{val as React.ReactNode}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[11px] text-[var(--clr-text-muted)] mt-4 leading-relaxed">Full evidence trail and officer decisions are stored in the local audit database.</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Query</th>
                <th>Date</th>
                <th>Matches</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyHistory.map((row, i) => (
                <tr key={row.id} className="group cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 50 + 100}ms`, animationFillMode: 'both' }} onClick={() => setSelected(row)}>
                  <td><code className="font-mono text-[11px] text-[var(--clr-text-muted)]">{row.id}</code></td>
                  <td><span className="text-sm font-semibold text-[var(--clr-text)]">{row.query}</span></td>
                  <td><span className="text-xs text-[var(--clr-text-muted)]">{row.date}</span></td>
                  <td>
                    <span className="chip-teal text-xs font-bold px-2 py-0.5 rounded">{row.matches}</span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_CHIP[row.status] || 'chip-muted'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] text-xs font-bold transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 pr-1" onClick={e => { e.stopPropagation(); setSelected(row); }}>
                      View <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-3)] flex justify-between items-center text-xs text-[var(--clr-text-muted)]">
          <span>Showing 4 of 48 records</span>
          <div className="flex gap-2">
            <button className="interactive-btn btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold opacity-40 cursor-not-allowed">Previous</button>
            <button className="interactive-btn btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
