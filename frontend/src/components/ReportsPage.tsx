import { Download, FileText, BarChart3, Check, PieChart } from 'lucide-react';

const STATS = [
  { title: 'Total Specs Checked',    value: '142', sub: '+12% from last month',            icon: FileText,   color: 'var(--clr-teal)',   bg: 'var(--clr-teal-light)'   },
  { title: 'Avg Relevance Score',    value: '87%', sub: 'Based on top 3 candidates',       icon: BarChart3,  color: 'var(--clr-indigo)',  bg: 'var(--clr-indigo-light)' },
  { title: 'Officer Confirmations',  value: '94%', sub: 'Recommendations marked correct',  icon: Check,      color: 'var(--clr-green)',   bg: 'var(--clr-green-light)'  },
];

const DOMAIN_DATA = [
  { label: 'Mechanical', count: 45, pct: 86 },
  { label: 'Electrical', count: 38, pct: 73 },
  { label: 'Civil',      count: 31, pct: 59 },
  { label: 'Chemical',   count: 18, pct: 34 },
  { label: 'Textiles',   count: 10, pct: 19 },
];

export function ReportsPage() {
  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <p className="section-label mb-2">Analytics</p>
          <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">Compliance Reports</h1>
          <p className="text-[15px] text-[var(--clr-text-muted)] leading-relaxed">Generate actionable insights based on officer feedback and usage.</p>
        </div>
        <button className="btn-primary interactive-btn self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold" onClick={() => window.print()}>
          <Download size={14} /> Export PDF Summary
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <div key={stat.title} className="card p-5 flex flex-col animate-slide-up" style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both', borderTop: `3px solid ${stat.color}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                <stat.icon size={17} style={{ color: stat.color }} />
              </div>
              <h3 className="section-label">{stat.title}</h3>
            </div>
            <p className="text-4xl font-black tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[11px] text-[var(--clr-text-muted)] mt-1.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card p-6 sm:p-7 mb-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--clr-text)] mb-6">
          <BarChart3 size={15} className="text-[var(--clr-teal)]" /> Queries by domain
        </h2>
        <div className="space-y-4">
          {DOMAIN_DATA.map((d, i) => (
            <div key={d.label} className="animate-slide-up" style={{ animationDelay: `${i * 60 + 200}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-[var(--clr-text-dim)]">{d.label}</span>
                <span className="text-[11px] font-bold text-[var(--clr-teal)] tabular-nums">{d.count}</span>
              </div>
              <div className="score-track h-2">
                <div className="score-fill h-full" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder */}
      <div className="card p-12 flex flex-col items-center justify-center min-h-[200px] text-center border-dashed border-2">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[var(--clr-bg-3)]">
          <PieChart size={22} className="text-[var(--clr-slate)] opacity-50" />
        </div>
        <h3 className="text-[13px] font-bold text-[var(--clr-text)] mb-1">Detailed charts coming soon</h3>
        <p className="text-[11px] text-[var(--clr-text-muted)] max-w-xs leading-relaxed">Rich visualisations of standard distribution, certification triggers, and category frequency.</p>
      </div>
    </div>
  );
}
