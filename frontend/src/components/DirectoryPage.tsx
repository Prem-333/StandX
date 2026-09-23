import React, { useState } from 'react';

const STANDARDS = [
  {
    id: 'IS 9550 : 2024',
    category: 'Mechanical',
    catColor: 'bg-secondary',
    rev: 'Rev 3',
    title: 'Bright steel bars — Specification',
    desc: 'Specifies the chemical, dimensional tolerances and mechanical requirements for cold finished bright steel bars for general engineering applications.',
    clauses: '14 Clauses • 6 Tables',
    ics: '77.140.60',
    status: 'Current In-Force',
    statusColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'IS 1448 [P:10] : 2023',
    category: 'Chemical',
    catColor: 'bg-outline',
    rev: 'Test Method',
    title: 'Methods of test for petroleum and its products',
    desc: 'Determination of kinematic viscosity and calculation of dynamic viscosity.',
    clauses: '9 Clauses • 2 Tables',
    ics: '75.080',
    status: 'Under Review',
    statusColor: 'bg-outline text-on-surface-variant',
  },
  {
    id: 'IS 456 : 2000',
    category: 'Civil Eng.',
    catColor: 'bg-secondary',
    rev: 'Rev 4 (Amd 5)',
    title: 'Plain and Reinforced Concrete — Code of Practice',
    desc: 'General structural use of plain and reinforced concrete. Covers materials, design, detailing, and workmanship standards.',
    clauses: '42 Clauses • 28 Tables',
    ics: '91.100.30',
    status: 'Current In-Force',
    statusColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'IS 2062 : 2011',
    category: 'Mechanical',
    catColor: 'bg-secondary',
    rev: 'Rev 7',
    title: 'Hot Rolled Medium and High Tensile Structural Steel',
    desc: 'Specification for hot rolled structural steel for use in structural and general engineering applications.',
    clauses: '11 Clauses • 8 Tables',
    ics: '77.140.01',
    status: 'Current In-Force',
    statusColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'IS 1786 : 2008',
    category: 'Mechanical',
    catColor: 'bg-secondary',
    rev: 'Rev 4',
    title: 'High Strength Deformed Steel Bars and Wires',
    desc: 'Specification for high strength deformed steel bars and wires for concrete reinforcement.',
    clauses: '12 Clauses • 5 Tables',
    ics: '77.140.15',
    status: 'Current In-Force',
    statusColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
  {
    id: 'IS 16221 : Part 2 : 2015',
    category: 'Electrical',
    catColor: 'bg-secondary',
    rev: 'Part 2',
    title: 'Safety of Power Converters for Photovoltaic',
    desc: 'Particular requirements for inverters. Essential safety requirements for power electronic conversion equipment.',
    clauses: '21 Clauses • 11 Tables',
    ics: '27.160',
    status: 'Current In-Force',
    statusColor: 'bg-on-tertiary-container text-on-tertiary-container',
  },
];

const CATEGORIES = ['All Categories', 'Mechanical', 'Civil Eng.', 'Electrical', 'Chemical', 'Textiles', 'Food & Agri'];

export function DirectoryPage() {
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [inspectItem, setInspectItem] = useState<typeof STANDARDS[0] | null>(null);

  return (
    <div className="flex flex-col w-full">
      {/* System Status Banner */}
      <div className="w-full glass-panel px-space-md py-2.5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-sm mb-space-lg animate-fade-in-up stagger-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-fixed text-secondary">
            <span className="material-symbols-outlined text-[14px]">database</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-label-code-sm font-semibold uppercase tracking-wider text-secondary">Offline Indexed</span>
            <span className="text-outline-variant text-label-code-sm">•</span>
            <span className="text-body-sm text-on-surface font-medium">18,420 Indian Standards synced from Bureau of Indian Standards gazette & e-BIS portal</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm self-end md:self-auto">
          <span className="text-label-code-sm text-on-surface-variant">Last Full Sync: <strong className="text-on-surface">Today, 04:30 IST</strong></span>
          <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-label-code-sm font-semibold shadow-xs">SHA-256 Verified</span>
        </div>
      </div>

      {/* Page Header & Metrics Strip */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-label-lg uppercase tracking-wider text-outline">Statutory Repositories</span>
            <span className="text-outline-variant">/</span>
            <span className="text-label-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded font-medium">Local Fixture DB</span>
          </div>
          <h1 className="text-headline-xl text-primary tracking-tight">
            Standards <span className="text-secondary">Directory</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mt-1">
            Comprehensive offline repository of BIS technical specifications, test methodologies, gazette amendments, and Mandatory Quality Control Orders (QCO).
          </p>
        </div>
        
        {/* Quick Stats Bento Strip */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1 animate-fade-in-up stagger-2">
          <div className="glass-panel p-3 rounded-lg min-w-[130px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Mandatory QCO</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-headline-md text-primary font-bold">1,142</span>
              <span className="text-label-code-sm text-error font-medium">Strict</span>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-lg min-w-[130px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Active Amdts</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-headline-md text-primary font-bold">4,820</span>
              <span className="text-label-code-sm text-on-tertiary-container font-medium">2024</span>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-lg min-w-[140px] flex flex-col justify-between card-lift">
            <span className="text-label-lg uppercase text-outline">Index Latency</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-headline-md text-secondary font-bold">0.18ms</span>
              <span className="text-label-code-sm text-outline font-normal">Indexed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Structured Filter Surface */}
      <div className="glass-panel p-space-md rounded-xl space-y-space-md mb-space-lg animate-fade-in-up stagger-3">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">search</span>
          <input 
            type="text"
            className="w-full h-11 pl-11 pr-28 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all"
            placeholder="Search by IS number (e.g. IS 9550, IS 456), ICS code, title keyword, or technical committee..."
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-label-code-sm uppercase bg-surface-container text-on-surface-variant rounded">ESC Clear</span>
            <kbd className="px-2 py-0.5 rounded bg-surface text-outline text-label-code-sm shadow-xs font-semibold">⌘K</kbd>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-label-lg transition-colors flex items-center gap-1.5 shadow-sm ${activeCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-md flex-wrap self-end lg:self-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded accent-secondary cursor-pointer" defaultChecked />
              <span className="text-body-sm text-on-surface">Active In-Force Only</span>
            </label>
            <div className="h-4 w-[1px] bg-surface-container-highest hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-label-code-sm text-outline uppercase">Sort</span>
              <select className="h-8 px-2.5 py-1 rounded bg-surface-container-low text-on-surface text-body-sm focus:outline-none cursor-pointer">
                <option>Most Referenced</option>
                <option>Standard Code (Asc)</option>
                <option>Standard Code (Desc)</option>
                <option>Latest Gazette Year</option>
                <option>Mandatory QCO Priority</option>
              </select>
            </div>
            <div className="flex items-center p-0.5 rounded bg-surface-container-low">
              <button className="p-1 rounded bg-surface-container-lowest text-primary shadow-xs" title="Grid View">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button className="p-1 rounded text-outline hover:text-on-surface transition-colors" title="Dense Table View">
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-lg">
        {STANDARDS.filter(s => activeCategory === 'All Categories' || s.category === activeCategory).map((s, idx) => (
          <div key={idx} className="group glass-panel rounded-xl p-space-md card-lift flex flex-col justify-between relative overflow-hidden animate-fade-in-up stagger-4" style={{ animationDelay: `${idx * 0.05 + 0.3}s` }}>
            <div className={`absolute top-0 left-0 h-1 w-full ${s.catColor}`}></div>
            <div>
              <div className="flex items-start justify-between gap-2 mb-space-sm pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-label-code font-bold text-primary tracking-tight">{s.id}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-code-sm bg-surface-container text-on-surface-variant font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.catColor}`}></span>
                    {s.category}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label-code-sm uppercase bg-surface-container-low text-on-surface font-semibold">
                  {s.rev}
                </span>
              </div>
              <h3 className="text-headline-sm text-on-surface group-hover:text-secondary transition-colors mb-space-xs leading-snug">
                {s.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-space-md">
                {s.desc}
              </p>
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-container-low mb-space-md">
                <div className="flex flex-col">
                  <span className="text-label-code-sm text-outline uppercase">Clauses / Tables</span>
                  <span className="text-label-code text-on-surface font-semibold">{s.clauses}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-code-sm text-outline uppercase">ICS Code</span>
                  <span className="text-label-code text-on-surface font-semibold">{s.ics}</span>
                </div>
              </div>
            </div>
            <div className="pt-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.statusColor.split(' ')[0]}`}></span>
                <span className={`text-label-code-sm ${s.statusColor.split(' ')[1]} font-semibold uppercase tracking-wider`}>{s.status}</span>
              </div>
              <button 
                className="inline-flex items-center gap-1 text-primary hover:text-secondary text-label-code-sm font-semibold transition-colors"
                onClick={() => setInspectItem(s)}
              >
                <span>Inspect Metadata</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="glass-panel p-space-md rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md animate-fade-in-up stagger-4">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <span>Showing <strong className="text-on-surface font-semibold">1 — 6</strong> of <strong className="text-on-surface font-semibold">18,420</strong> active standards</span>
          <span className="text-outline-variant">•</span>
          <span className="text-label-code-sm text-outline">Page 1 of 3,070</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-8 px-3 rounded bg-surface-container-low text-outline cursor-not-allowed text-label-lg flex items-center gap-1" disabled>
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            <span>Previous</span>
          </button>
          <div className="flex items-center gap-1 mx-1">
            <button className="w-8 h-8 rounded bg-primary text-on-primary text-label-code font-bold">1</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface text-label-code transition-colors">2</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface text-label-code transition-colors">3</button>
            <span className="px-1 text-outline text-label-code">...</span>
            <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface text-label-code transition-colors">3070</button>
          </div>
          <button className="h-8 px-3 rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors text-label-lg flex items-center gap-1">
            <span>Next</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Deep Inspect Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-space-md flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <div>
                  <div className="text-label-code font-bold text-primary">{inspectItem.id}</div>
                  <div className="text-label-code-sm text-on-surface-variant">Technical Committee: MTD 04</div>
                </div>
              </div>
              <button 
                className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                onClick={() => setInspectItem(null)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-space-md max-h-[716px] overflow-y-auto">
              <div>
                <span className="text-label-code-sm text-outline uppercase">Title Specification</span>
                <h4 className="text-headline-sm text-on-surface mt-1">{inspectItem.title}</h4>
              </div>
              <div className="grid grid-cols-3 gap-space-sm">
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-label-code-sm text-outline uppercase block">Publication</span>
                  <span className="text-label-code font-semibold text-on-surface">January 2024</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-label-code-sm text-outline uppercase block">Gazette Notified</span>
                  <span className="text-label-code font-semibold text-on-tertiary-container">Yes (Phase 2)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-label-code-sm text-outline uppercase block">Harmonized</span>
                  <span className="text-label-code font-semibold text-on-surface">ISO 683-1 Eqv</span>
                </div>
              </div>
              <div>
                <span className="text-label-code-sm text-outline uppercase block mb-1">Standard Cross-References & Clauses</span>
                <div className="p-3 rounded-lg bg-surface text-label-code text-on-surface space-y-1">
                  <div>• Clause 4.2.1 — Tensile Strength Range: 450 to 780 MPa</div>
                  <div>• Clause 6.1 — Surface Roughness (Ra): ≤ 1.6 μm for cold drawn</div>
                  <div>• Clause 9.3 — Decarburization depth limitation</div>
                  <div>• Table 4 — Permissible dimensional deviations (h9, h11 tolerance classes)</div>
                </div>
              </div>
            </div>
            <div className="p-space-md bg-surface-container-low flex items-center justify-between">
              <span className="text-label-code-sm text-on-surface-variant">Digital Signature: Valid SHA-256 (BIS-CERT-2024)</span>
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-lg transition-colors"
                  onClick={() => setInspectItem(null)}
                >
                  Dismiss
                </button>
                <button className="px-3.5 py-1.5 rounded bg-primary text-on-primary text-label-lg transition-colors flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export Gazette JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
