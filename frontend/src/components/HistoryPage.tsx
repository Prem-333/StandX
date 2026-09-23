import React, { useState } from 'react';

const RECORDS = [
  {
    id: 'REC-8924',
    code: 'IS 1786',
    title: 'High-strength deformed steel bars for seismic infrastructure',
    desc: 'BoQ line items evaluated against 550D grade parameter compliance',
    date: '2026-10-24',
    time: '14:32:05 IST',
    matches: 2,
    flagged: false,
    verdict: 'FULL COMPLIANCE',
    verdictColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'REC-8923',
    code: 'IS 269',
    title: 'Ordinary Portland Cement 53 Grade tender batch',
    desc: 'Cross-checked chemical and physical requirements under QCO mandatory status',
    date: '2026-10-24',
    time: '11:15:42 IST',
    matches: 1,
    flagged: true,
    verdict: 'PARTIAL MATCH',
    verdictColor: 'bg-outline text-on-surface-variant',
  },
  {
    id: 'REC-8801',
    code: 'IS 16221',
    title: 'Solar Photovoltaic Inverters (250kVA)',
    desc: 'MNRE scheme safety verifications against localized CRS standards',
    date: '2026-10-23',
    time: '16:45:10 IST',
    matches: 3,
    flagged: false,
    verdict: 'FULL COMPLIANCE',
    verdictColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'REC-7485',
    code: 'IS 13252 (Pt 1)',
    title: 'Ruggedized laptop notebook tablet for defense procurement',
    desc: 'Information technology equipment safety requirements under MIL-STD testing',
    date: '2026-09-15',
    time: '09:02:11 IST',
    matches: 0,
    flagged: true,
    verdict: 'NO EXACT MATCHES',
    verdictColor: 'bg-outline text-on-surface-variant',
  },
];

export function HistoryPage() {
  const [search, setSearch] = useState('');

  const filtered = RECORDS.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      
      {/* Page Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-label-lg uppercase tracking-wider text-outline">Workspace</span>
            <span className="text-outline-variant">/</span>
            <span className="text-label-code-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-medium">Session Ledger</span>
          </div>
          <h1 className="text-headline-xl text-primary tracking-tight">
            Audit <span className="text-secondary">History</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mt-1">
            Immutable log of all technical specifications evaluated against the StandX intelligence pipeline.
          </p>
        </div>
        
        {/* Quick Insights Bento */}
        <div className="flex items-stretch gap-3 animate-fade-in-up stagger-2">
          <div className="glass-panel p-3 rounded-lg min-w-[120px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Evaluated</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-headline-md text-primary font-bold">48</span>
              <span className="text-label-code-sm text-outline font-medium">Records</span>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-lg min-w-[120px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Compliance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-headline-md text-on-tertiary-container font-bold">92%</span>
              <span className="text-label-code-sm text-outline font-medium">Avg</span>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-lg min-w-[120px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Flagged</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-headline-md text-error font-bold">4</span>
              <span className="text-label-code-sm text-outline font-medium">Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Data Surface */}
      <div className="glass-panel rounded-xl overflow-hidden mb-space-lg animate-fade-in-up stagger-3">
        {/* Action & Filter Strip */}
        <div className="p-space-md border-b border-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-secondary/50 transition-all"
              placeholder="Search by tender title, IS code, or record ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1.5 text-label-code-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Filter Ledger</span>
            </button>
            <button className="h-9 px-3 rounded-lg glow-button text-on-primary transition-all flex items-center gap-1.5 text-label-code-sm font-semibold shadow-sm ml-auto sm:ml-0">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Audit Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-surface-container-low">
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider whitespace-nowrap">Session ID</th>
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider">Evaluation Context</th>
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider whitespace-nowrap">Match Yield</th>
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider whitespace-nowrap">Aggregate Verdict</th>
                <th className="py-2.5 px-space-md text-label-code-sm text-outline font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors group">
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-label-code font-bold text-secondary">{row.id}</span>
                      <button className="text-outline hover:text-on-surface transition-colors" title="Copy Record Hash">
                        <span className="material-symbols-outlined text-[15px]">content_copy</span>
                      </button>
                    </div>
                    <span className="text-label-code-sm text-outline block mt-0.5">{row.code}</span>
                  </td>
                  <td className="py-3.5 px-space-md max-w-sm">
                    <span className="text-headline-sm text-on-surface block font-bold group-hover:text-secondary transition-colors">
                      {row.title}
                    </span>
                    <span className="text-body-sm text-on-surface-variant truncate block">
                      {row.desc}
                    </span>
                  </td>
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <span className="text-label-code text-on-surface block font-medium">{row.date}</span>
                    <span className="text-label-code-sm text-outline">{row.time}</span>
                  </td>
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-surface-container-high text-outline font-label-code font-semibold">
                        {row.matches} Exact
                      </span>
                      {row.flagged && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                          <span className="text-label-code-sm text-error font-medium">Flagged</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-label-code-sm font-semibold tracking-wide ${row.verdictColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.verdictColor.split(' ')[0]}`}></span>
                      {row.verdict}
                    </span>
                  </td>
                  <td className="py-3.5 px-space-md whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface transition-colors" title="View Audit Trail">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className={`p-1.5 rounded hover:bg-surface-container-high transition-colors ${row.matches === 0 ? 'text-outline opacity-40 cursor-not-allowed' : 'text-secondary'}`} title="Download Compliance Certificate">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </button>
                      <button className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors" title="Re-evaluate Engine">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Pagination */}
        <div className="bg-surface-container-low px-space-md py-3 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm text-outline text-body-sm">
            <span>Showing <strong className="text-on-surface font-semibold">1-{filtered.length}</strong> of <strong className="text-on-surface font-semibold">48</strong> evaluated records</span>
            <span className="text-surface-dim">|</span>
            <span className="text-label-code-sm text-on-surface-variant">Page 1 of 12</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-outline opacity-50 cursor-not-allowed text-body-sm font-medium shadow-sm" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Previous</span>
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-code-sm font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-label-code-sm font-medium shadow-sm">2</button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-label-code-sm font-medium shadow-sm">3</button>
            <span className="px-1 text-outline font-label-code">...</span>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-label-code-sm font-medium shadow-sm">12</button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors text-body-sm font-medium shadow-sm">
              <span>Next</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic Architecture Footer Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs animate-fade-in-up stagger-4">
        <div className="p-space-md rounded-xl glass-panel flex items-start gap-space-md">
          <div className="p-2.5 rounded-lg bg-surface-container-low text-secondary">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-headline-sm text-on-surface font-semibold">Statutory Authority Guarantee</h4>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Matches are corroborated strictly against Bureau of Indian Standards (BIS) Gazette notifications, QCO revisions, and testing manual tolerances. All automated verdicts preserve a human-in-the-loop validation signoff.
            </p>
          </div>
        </div>
        <div className="p-space-md rounded-xl glass-panel flex items-start gap-space-md">
          <div className="p-2.5 rounded-lg bg-surface-container-low text-on-tertiary-container">
            <span className="material-symbols-outlined text-[24px]">security</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-headline-sm text-on-surface font-semibold">Zero-Exfiltration Local Execution</h4>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Tender specifications and sensitive procurement clauses remain encrypted within your air-gapped premise. Embedding computations run via hardware-accelerated local ONNX runtimes.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
