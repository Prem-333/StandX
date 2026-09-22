import { Filter, ArrowRight } from 'lucide-react';

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

export function HistoryPage() {
  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Audit Trail</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-3 font-display">
            Query History
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
            Review past specifications, officer decisions, and retrieved evidence.
          </p>
        </div>
        <button className="interactive-btn self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl btn-ghost px-5 py-2.5 text-[13px] font-bold">
          <Filter size={15} />
          Filter records
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Queries', value: '48', color: 'var(--clr-teal)' },
          { label: 'Confirmed', value: '39', color: 'var(--clr-green)' },
          { label: 'Pending', value: '9', color: 'var(--clr-saffron)' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card p-4 sm:p-5 flex flex-col gap-1 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            <p className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black font-display" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
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
                <tr
                  key={row.id}
                  className="group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 60 + 100}ms`, animationFillMode: 'both' }}
                >
                  <td>
                    <code className="font-mono text-[11px] text-[var(--clr-text-muted)]">{row.id}</code>
                  </td>
                  <td>
                    <span className="text-sm font-bold text-[var(--clr-text)]">{row.query}</span>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-[var(--clr-text-muted)]">{row.date}</span>
                  </td>
                  <td>
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(0,196,160,0.1)', color: 'var(--clr-teal)', border: '1px solid rgba(0,196,160,0.2)' }}
                    >
                      {row.matches}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_CHIP[row.status] || 'chip-muted'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] text-xs font-bold transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1">
                      View <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="px-5 py-4 border-t border-[var(--clr-border)] flex justify-between items-center text-xs font-medium text-[var(--clr-text-muted)]"
          style={{ background: 'rgba(0,196,160,0.02)' }}
        >
          <span>Showing 4 of 48 records</span>
          <div className="flex gap-2">
            <button className="interactive-btn px-3 py-1.5 rounded-lg border border-[var(--clr-border)] text-[var(--clr-text-muted)] opacity-40 cursor-not-allowed text-xs font-bold">Previous</button>
            <button className="interactive-btn btn-ghost px-3 py-1.5 rounded-lg text-xs font-bold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
