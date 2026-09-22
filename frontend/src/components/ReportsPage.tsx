import { Download, FileText, BarChart3, Check, PieChart } from 'lucide-react';

const STATS = [
  {
    title: 'Total Specs Checked',
    value: '142',
    sub: '+12% from last month',
    icon: FileText,
    color: 'var(--clr-teal)',
    glow: 'rgba(0,196,160,0.15)',
  },
  {
    title: 'Avg Relevance Score',
    value: '87%',
    sub: 'Based on top 3 candidates',
    icon: BarChart3,
    color: 'var(--clr-indigo)',
    glow: 'rgba(129,140,248,0.15)',
  },
  {
    title: 'Officer Confirmations',
    value: '94%',
    sub: 'Recommendations marked correct',
    icon: Check,
    color: 'var(--clr-green)',
    glow: 'rgba(52,211,153,0.15)',
  },
];

// Simple visual bar chart data
const DOMAIN_DATA = [
  { label: 'Mechanical', count: 45, pct: 86 },
  { label: 'Electrical', count: 38, pct: 73 },
  { label: 'Civil', count: 31, pct: 59 },
  { label: 'Chemical', count: 18, pct: 34 },
  { label: 'Textiles', count: 10, pct: 19 },
];

export function ReportsPage() {
  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Analytics</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-3 font-display">
            Compliance Reports
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
            Generate actionable insights based on officer feedback and system usage.
          </p>
        </div>
        <button
          className="btn-primary interactive-btn self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold"
        >
          <Download size={15} />
          Export PDF Summary
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {STATS.map((stat, i) => (
          <div
            key={stat.title}
            className="glass-card p-6 flex flex-col animate-slide-up relative overflow-hidden"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            {/* Subtle glow bg */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30"
              style={{ background: `radial-gradient(ellipse, ${stat.glow} 0%, transparent 70%)` }}
            />
            <div className="flex items-center gap-3 mb-5 relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.glow}`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <h3 className="text-[11px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
                {stat.title}
              </h3>
            </div>
            <p
              className="text-4xl font-black tracking-tight font-display relative"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-[11px] font-medium text-[var(--clr-text-muted)] mt-2 relative">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Domain distribution */}
      <div className="glass-card p-6 sm:p-8 mb-6">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[var(--clr-text)] mb-6">
          <BarChart3 size={16} className="text-[var(--clr-teal)]" />
          Queries by domain
        </h2>
        <div className="space-y-4">
          {DOMAIN_DATA.map((d, i) => (
            <div key={d.label} className="animate-slide-up" style={{ animationDelay: `${i * 60 + 200}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-[var(--clr-text-dim)]">{d.label}</span>
                <span className="text-[11px] font-bold text-[var(--clr-teal)]">{d.count}</span>
              </div>
              <div className="score-track h-2">
                <div
                  className="score-fill h-full"
                  style={{ width: `${d.pct}%`, animationDelay: `${i * 100 + 400}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for charts */}
      <div
        className="glass-card p-12 flex flex-col items-center justify-center min-h-[220px] text-center"
        style={{ background: 'rgba(0,196,160,0.02)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-float"
          style={{ background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.2)' }}
        >
          <PieChart size={26} className="text-[var(--clr-teal)] opacity-60" />
        </div>
        <h3 className="text-[14px] font-bold text-[var(--clr-text)] mb-2">Detailed charts coming soon</h3>
        <p className="text-[11px] text-[var(--clr-text-muted)] max-w-sm">
          Rich visualizations of standard distribution, certification triggers, and category frequency will appear here.
        </p>
      </div>
    </div>
  );
}
