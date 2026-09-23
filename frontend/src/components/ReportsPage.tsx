import React from 'react';

export function ReportsPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Regulatory Notice Banner (Demo Workspace State) */}
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm px-space-md py-2.5 rounded-lg bg-surface-container-high/60 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-space-sm">
          <span className="text-label-code-sm uppercase px-2 py-0.5 rounded bg-primary text-on-primary font-bold tracking-wider">Demo Workspace</span>
          <p className="text-body-sm text-on-surface">
            Live Phase 2 audit benchmark includes <span className="font-semibold text-primary">Mock / Synthetic Gazette records</span>. Evaluated fixtures carry regulatory guidance without statutory enforcement liability.
          </p>
        </div>
        <div className="flex items-center gap-space-xs text-label-code-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
          <span>Gazette Sync: Today, 04:30 IST</span>
        </div>
      </div>

      {/* Page Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-lg uppercase tracking-wider text-outline">Analytics & Intelligence</span>
            <span className="text-outline-variant font-label-code">•</span>
            <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold">Q3 Fiscal Audit</span>
          </div>
          <h1 className="text-headline-xl text-primary tracking-tight">
            Compliance <span className="text-secondary">Reports & Analytics</span>
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1.5 leading-relaxed">
            Actionable institutional intelligence based on procurement evaluations, BIS adoption rates, and officer verification signals across 14 central ministry departments.
          </p>
        </div>
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-space-sm shrink-0">
          <button className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all shadow-sm text-label-lg cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-secondary">account_balance</span>
            <span>Generate Gazette Audit</span>
          </button>
          <button className="flex items-center gap-2 px-space-md py-2.5 rounded-lg glow-button text-on-primary transition-all shadow-md text-label-lg cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Executive PDF Summary</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg animate-fade-in-up stagger-1">
        {/* KPI 1 */}
        <div className="relative overflow-hidden rounded-xl glass-panel card-lift p-space-lg">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[19px]">description</span>
              </div>
              <span className="text-label-lg uppercase tracking-wider text-outline">Total Specs Checked</span>
            </div>
            <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold">+12% MoM</span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-1">
            <span className="text-headline-xl text-primary tracking-tight font-extrabold">142</span>
            <span className="text-body-sm text-on-surface-variant font-medium">procurement packages</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant pt-2">
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">verified</span>
            <span className="text-label-code-sm">98.4% on-device air-gapped reliability</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-surface-container-low/50 rounded-full blur-2xl pointer-events-none"></div>
        </div>
        {/* KPI 2 */}
        <div className="relative overflow-hidden rounded-xl glass-panel card-lift p-space-lg">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[19px]">query_stats</span>
              </div>
              <span className="text-label-lg uppercase tracking-wider text-outline">Avg Relevance Score</span>
            </div>
            <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold">Top 3 Rank</span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-1">
            <span className="text-headline-xl text-secondary tracking-tight font-extrabold">87%</span>
            <span className="text-body-sm text-on-surface-variant font-medium">semantic match threshold</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant pt-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">bolt</span>
            <span className="text-label-code-sm">Cross-encoder reranked over candidate standards</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
        </div>
        {/* KPI 3 */}
        <div className="relative overflow-hidden rounded-xl glass-panel card-lift p-space-lg">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-tertiary-container">
                <span className="material-symbols-outlined text-[19px]">task_alt</span>
              </div>
              <span className="text-label-lg uppercase tracking-wider text-outline">Officer Confirmations</span>
            </div>
            <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container text-on-tertiary-container font-semibold">Benchmark</span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-1">
            <span className="text-headline-xl text-primary tracking-tight font-extrabold">94%</span>
            <span className="text-body-sm text-on-surface-variant font-medium">marked fully accurate</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant pt-2">
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">done_all</span>
            <span className="text-label-code-sm">621 of 660 candidate standards accepted without edit</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* Middle Analytics Section: Split 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg animate-fade-in-up stagger-2">
        {/* Domain Breakdown (Card 1) */}
        <div className="lg:col-span-7 rounded-xl glass-panel p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                </div>
                <div>
                  <h2 className="text-headline-sm text-primary leading-tight">Queries by Engineering Domain</h2>
                  <span className="text-label-code-sm text-outline">Distribution across 142 reviewed tender schedules</span>
                </div>
              </div>
              <span className="text-label-code-sm px-2 py-1 rounded bg-surface-container-low text-on-surface font-semibold">142 Total</span>
            </div>
            {/* Progress Metrics Stack */}
            <div className="space-y-space-md mt-4">
              {/* 1. Mechanical */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-semibold text-primary">Mechanical Engineering</span>
                    <span className="text-label-code-sm text-outline px-1.5 rounded bg-surface-container-low">IS 1786 / IS 2062</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-code font-bold text-primary">45</span>
                    <span className="text-label-code-sm text-outline">(32%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-low overflow-hidden">
                  <div className="h-full bg-primary rounded transition-all duration-700" style={{ width: '32%' }}></div>
                </div>
              </div>
              {/* 2. Electrical */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-semibold text-primary">Electrical & Electronics</span>
                    <span className="text-label-code-sm text-outline px-1.5 rounded bg-surface-container-low">IS 732 / IS 694</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-code font-bold text-primary">38</span>
                    <span className="text-label-code-sm text-outline">(27%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-low overflow-hidden">
                  <div className="h-full bg-secondary rounded transition-all duration-700" style={{ width: '27%' }}></div>
                </div>
              </div>
              {/* 3. Civil */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-semibold text-primary">Civil & Infrastructure</span>
                    <span className="text-label-code-sm text-outline px-1.5 rounded bg-surface-container-low">IS 456 / IS 269</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-code font-bold text-primary">31</span>
                    <span className="text-label-code-sm text-outline">(22%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-low overflow-hidden">
                  <div className="h-full bg-primary-container rounded transition-all duration-700" style={{ width: '22%' }}></div>
                </div>
              </div>
              {/* 4. Chemical */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-semibold text-primary">Chemical & Petrochemicals</span>
                    <span className="text-label-code-sm text-outline px-1.5 rounded bg-surface-container-low">IS 5182 / IS 1448</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-code font-bold text-primary">18</span>
                    <span className="text-label-code-sm text-outline">(13%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-low overflow-hidden">
                  <div className="h-full bg-outline rounded transition-all duration-700" style={{ width: '13%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Card */}
        <div className="lg:col-span-5 rounded-xl glass-panel p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">show_chart</span>
                </div>
                <div>
                  <h2 className="text-headline-sm text-primary leading-tight">Verification Trends</h2>
                  <span className="text-label-code-sm text-outline">Q3 Pipeline Throughput</span>
                </div>
              </div>
            </div>
            
            {/* Simple Bar Chart Placeholder */}
            <div className="h-48 mt-4 flex items-end justify-between gap-2 px-2 border-b border-surface-container">
              {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full bg-surface-container-high rounded-t flex flex-col justify-end group">
                  <div className="w-full bg-secondary rounded-t transition-all group-hover:bg-primary" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-label-code-sm text-outline">
              <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gazette Amendments Alert Ledger (Bottom Section) */}
      <div className="glass-panel rounded-xl border border-surface-container overflow-hidden mb-space-lg animate-fade-in-up stagger-3">
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-error">campaign</span>
            <h3 className="text-headline-sm text-primary">Active Gazette Amendments & QCO Notifications</h3>
          </div>
          <button className="text-label-code-sm font-semibold text-secondary hover:underline flex items-center gap-1">
            <span>View All Releases</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-low text-label-code-sm text-outline uppercase tracking-wider">
                <th className="px-space-md py-3 font-semibold">Standard Reference</th>
                <th className="px-space-md py-3 font-semibold">Title & Scope of Revision</th>
                <th className="px-space-md py-3 font-semibold">Ministry / Authority</th>
                <th className="px-space-md py-3 font-semibold">Compliance Status</th>
                <th className="px-space-md py-3 font-semibold">Effective Date</th>
                <th className="px-space-md py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors group">
                <td className="px-space-md py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-label-code font-bold text-primary group-hover:text-secondary transition-colors">IS 269:2015 (Amd. 3)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">Civil</span>
                  </div>
                </td>
                <td className="px-space-md py-3.5">
                  <div className="text-body-md font-semibold text-primary">Ordinary Portland Cement Specifications</div>
                  <div className="text-body-sm text-on-surface-variant truncate max-w-md">Updated compressive strength test regimes & mandatory geo-tagging packaging norms.</div>
                </td>
                <td className="px-space-md py-3.5 text-body-sm text-on-surface">
                  Ministry of Commerce & Industry (DPIIT)
                </td>
                <td className="px-space-md py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-tertiary-container text-label-code-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                    Mandatory QCO Enforced
                  </span>
                </td>
                <td className="px-space-md py-3.5 text-label-code-sm text-outline">
                  15 Jan 2025
                </td>
                <td className="px-space-md py-3.5 text-right">
                  <button className="px-2 py-1 rounded bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary transition-all text-label-code-sm font-semibold">
                    Inspect Spec
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors group">
                <td className="px-space-md py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-label-code font-bold text-primary group-hover:text-secondary transition-colors">IS 17017 (Part 2):2024</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">EV / Auto</span>
                  </div>
                </td>
                <td className="px-space-md py-3.5">
                  <div className="text-body-md font-semibold text-primary">Electric Vehicle Conductive Charging Systems</div>
                  <div className="text-body-sm text-on-surface-variant truncate max-w-md">Interoperability and communication protocols for DC fast-charging infrastructure.</div>
                </td>
                <td className="px-space-md py-3.5 text-body-sm text-on-surface">
                  Ministry of Heavy Industries (MHI)
                </td>
                <td className="px-space-md py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-secondary text-label-code-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Transition Window Active
                  </span>
                </td>
                <td className="px-space-md py-3.5 text-label-code-sm text-outline">
                  01 Apr 2025
                </td>
                <td className="px-space-md py-3.5 text-right">
                  <button className="px-2 py-1 rounded bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary transition-all text-label-code-sm font-semibold">
                    Inspect Spec
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors group">
                <td className="px-space-md py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-label-code font-bold text-primary group-hover:text-secondary transition-colors">IS 1786:2008 (Rev. 4)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">Metallurgy</span>
                  </div>
                </td>
                <td className="px-space-md py-3.5">
                  <div className="text-body-md font-semibold text-primary">High Strength Deformed Steel Bars (TMT)</div>
                  <div className="text-body-sm text-on-surface-variant truncate max-w-md">Mandatory inclusion of micro-alloy limits for seismic zone IV & V structures.</div>
                </td>
                <td className="px-space-md py-3.5 text-body-sm text-on-surface">
                  Ministry of Steel
                </td>
                <td className="px-space-md py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-tertiary-container text-label-code-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                    Mandatory QCO Enforced
                  </span>
                </td>
                <td className="px-space-md py-3.5 text-label-code-sm text-outline">
                  01 Oct 2024
                </td>
                <td className="px-space-md py-3.5 text-right">
                  <button className="px-2 py-1 rounded bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary transition-all text-label-code-sm font-semibold">
                    Inspect Spec
                  </button>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors group">
                <td className="px-space-md py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-label-code font-bold text-primary group-hover:text-secondary transition-colors">IS 13252 (Part 1):2010</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">IT & Telecom</span>
                  </div>
                </td>
                <td className="px-space-md py-3.5">
                  <div className="text-body-md font-semibold text-primary">Information Technology Equipment Safety</div>
                  <div className="text-body-sm text-on-surface-variant truncate max-w-md">Enhanced electromagnetic emission criteria under CRO (Compulsory Registration).</div>
                </td>
                <td className="px-space-md py-3.5 text-body-sm text-on-surface">
                  Ministry of Electronics & IT (MeitY)
                </td>
                <td className="px-space-md py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-label-code-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                    CRS Registered
                  </span>
                </td>
                <td className="px-space-md py-3.5 text-label-code-sm text-outline">
                  18 Dec 2024
                </td>
                <td className="px-space-md py-3.5 text-right">
                  <button className="px-2 py-1 rounded bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary transition-all text-label-code-sm font-semibold">
                    Inspect Spec
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Audit Footer Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm p-space-md rounded-xl bg-surface-container-low text-on-surface-variant text-label-code-sm mb-space-lg">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">encrypted</span>
          <span>Cryptographic Hash: <code className="text-primary font-bold">SHA-256 / 8f9b...e21c</code></span>
          <span className="text-outline">•</span>
          <span>BIS e-Gazette Gateway Status: <strong className="text-on-tertiary-container font-semibold">Synchronized</strong></span>
        </div>
        <div className="flex items-center gap-space-md text-on-surface-variant">
          <span>Signed by StandX Local Kernel</span>
          <button className="text-secondary hover:underline font-bold">Verify Signature</button>
        </div>
      </div>
      
    </div>
  );
}
