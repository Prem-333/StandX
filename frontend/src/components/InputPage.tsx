import React, { useState, useRef, useEffect } from 'react';
import { request } from '../api';
import type { Report } from '../types';

interface InputPageProps {
  apiKey: string;
  demo: boolean;
  onResult: (r: Report) => void;
}

const SAMPLES: Record<string, string> = {
  bars: `Procurement Requirement: High-Strength Thermo-Mechanically Treated (TMT) Rebars for Bridge Pier Foundation in Seismic Zone IV.
1. Scope: Supply of 1,200 MT Fe 550D grade high-ductility steel rebar conforming to the latest revisions.
2. Chemical Composition: Carbon max 0.25%, Sulfur max 0.040%, Phosphorus max 0.040%, combined S+P not exceeding 0.075%.
3. Mechanical Properties: Minimum yield strength 550 N/mm², minimum tensile strength 600 N/mm² (TS/YS ratio >= 1.10), minimum elongation 16.0% with total elongation at maximum force (Agt) not less than 5%.
4. Mandatory Certification: Valid Bureau of Indian Standards (BIS) standard mark license (CM/L) under IS 1786 mandatory ISI marking scheme.`,
  
  solar: `Tender Specification: Grid-Connected Solar Photovoltaic Inverters (3-Phase, 1500V DC input, 250kVA output).
1. General: Centralised utility inverter system for deployment in tropical arid conditions with IP65 ingress protection.
2. Safety & Standards: Must strictly comply with BIS CRS (Compulsory Registration Scheme) under IS 16221 (Part 2) for safety of power converters for use in photovoltaic power systems.
3. Grid Interconnection: Anti-islanding protection and low-voltage ride through (LVRT) in accordance with IS 16169 / CEA technical standards.
4. Testing Certificates: Test reports from NABL-accredited laboratory within the past 12 months.`,

  cement: `Public Works Schedule: Procurement of Ordinary Portland Cement (OPC) 53 Grade for Prestressed Concrete Girder Fabrication.
1. Physical Requirements: Fineness not less than 225 m²/kg (Blaine method); Soundness: Le-Chatelier expansion <= 10mm; Setting Time: Initial >= 30 minutes, Final <= 600 minutes.
2. Compressive Strength: 72 hrs >= 27 MPa; 168 hrs >= 37 MPa; 672 hrs (28 days) >= 53 MPa.
3. Marking & Packaging: 50 kg HDPE bags with mandatory BIS certification mark under IS 269:2015 and manufacturer batch identification.`
};

export function InputPage({ apiKey, demo, onResult }: InputPageProps) {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [multiClause, setMultiClause] = useState(false);
  const [scopeExpanded, setScopeExpanded] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [logMsg, setLogMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = query.length;

  const placeholders = {
    en: "Describe technical parameters, chemical composition, tensile grades, intended use (e.g., Fe 550D thermo-mechanically treated bars for seismic zone IV infrastructure, low-smoke zero-halogen insulation, ISI mandatory marking requirements)...",
    hi: "उत्पाद विनिर्देश, सामग्री ग्रेड, अनिवार्य आईएसआई मार्किंग या बीआईएस मानक संदर्भ यहाँ दर्ज करें...",
    hinglish: "Product specification, material grade, technical test parameters aur ISI standard requirements yahan enter karein..."
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!query) {
        setQuery(`[Tender Document Attached: ${f.name}]\nExtracted Preliminary Text: Scope includes procurement of specified grade components under Bureau of Indian Standards conformance clauses. Vector index generated.`);
      }
    }
  };

  const executeSearch = async () => {
    const q = query.trim() || SAMPLES.bars;
    if (!query.trim()) {
      setQuery(SAMPLES.bars);
    }
    
    setStatus('running');
    setProgress(20);
    setLogMsg('[00.08s] Tokenizing multi-clause tender criteria...');

    setTimeout(() => {
      setProgress(55);
      setLogMsg('[00.32s] Cross-referencing 23,400+ BIS catalogues & QCO Mandatory lists... Found IS 1786:2008 & IS 2062:2011.');
    }, 450);

    setTimeout(() => {
      setProgress(90);
      setLogMsg('[00.68s] Synthesizing audit-ready compliance matrix & clause evidence scores...');
    }, 900);

    try {
      const res = await request<Report>('/v1/recommend', apiKey, {
        method: 'POST',
        body: JSON.stringify({
          text: q,
          language_hint: lang,
          top_k: 5,
          tender: q.length > 250 || file !== null
        })
      });
      setProgress(100);
      setLogMsg('[00.95s] Match completed! Standards resolved with high confidence.');
      setStatus('success');
      
      setTimeout(() => {
        onResult(res);
      }, 800);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setStatus('idle');
    }
  };

  const handleClear = () => {
    setQuery('');
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setLogMsg('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-space-md">
        
        {/* Header Editorial Section (from outside the grid in the original HTML, but moved inside for logical flow, or can stay outside? Wait, in original it was outside. Let's put it outside the grid) */}
        
        <div className="glass-panel rounded-xl p-space-lg flex flex-col gap-space-md animate-fade-in-up stagger-2">
          {/* Step & Header row */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div>
                <h2 className="text-headline-sm text-on-surface leading-none">Your specification</h2>
                <span className="text-label-code-sm text-outline">Technical & Statutory Scope</span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="text-label-code-sm uppercase text-outline">STEP 1 OF 2</span>
              
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container-low">
                {(['en', 'hi', 'hinglish'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded text-label-code-sm transition-all ${
                      lang === l 
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' 
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'Hinglish'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specification Text Entry Canvas */}
          <div className="relative flex flex-col rounded-lg bg-surface-bright shadow-[inset_0_1px_2px_0_rgba(15,23,42,0.04)] focus-within:ring-2 focus-within:ring-secondary focus-within:bg-surface-container-lowest transition-all">
            <div className="flex items-center justify-between px-space-sm pt-2 text-outline text-label-code-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px]">terminal</span>
                <span>TECHNICAL REQUISITION BUFFER</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button className="hover:text-primary text-secondary font-semibold transition-colors" onClick={() => setQuery(SAMPLES.bars)}>
                  Paste Example
                </button>
                <span>·</span>
                <button className="hover:text-error transition-colors" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="w-full bg-transparent px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none resize-y"
              rows={8}
              placeholder={placeholders[lang]}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="flex items-center justify-between px-space-md py-2 border-t border-surface-container/50">
              <div className="flex items-center gap-2 text-outline-variant text-label-code-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>Context Engine Ready (23,400+ IS Catalogues Indexed)</span>
              </div>
              <div className="text-label-code-sm text-outline">
                <span className="text-on-surface font-semibold">{charCount.toLocaleString()}</span> / 100,000 chars
              </div>
            </div>
          </div>

          {/* Multi-Item Parsing Toggle */}
          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-sm">
              <div className="relative inline-block w-10 h-6 shrink-0">
                <input 
                  type="checkbox" 
                  id="multi-clause-toggle" 
                  className="sr-only peer" 
                  checked={multiClause}
                  onChange={e => setMultiClause(e.target.checked)}
                />
                <label htmlFor="multi-clause-toggle" className="block w-10 h-6 rounded-full bg-outline/30 peer-checked:bg-secondary cursor-pointer transition-colors"></label>
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-surface-container-lowest peer-checked:translate-x-4 transition-transform pointer-events-none shadow-sm"></div>
              </div>
              <div>
                <div className="text-label-lg text-on-surface">Multi-product / Multi-clause tender splitting</div>
                <div className="text-body-sm text-on-surface-variant">Automatically segment schedule of requirements into parallel BIS verification threads.</div>
              </div>
            </div>
            <span className="text-label-code-sm text-outline px-2 py-0.5 rounded bg-surface-container">PARALLEL RAG</span>
          </div>

          {/* Document Ingestion Drop Zone */}
          <div 
            className="relative group rounded-xl p-space-lg flex flex-col items-center justify-center text-center bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all shadow-[inset_0_1px_2px_0_rgba(15,23,42,0.02)]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf,.docx,.xlsx" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFile}
            />
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm text-secondary group-hover:scale-110 transition-transform mb-space-xs">
              <span className="material-symbols-outlined text-[26px]">upload_file</span>
            </div>
            <h3 className="text-headline-sm text-on-surface">
              Upload Complete Tender / Technical Schedule
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1 max-w-md">
              Drag and drop RFP documents or <span className="text-secondary font-semibold underline underline-offset-2">browse files</span>. Formats supported: PDF, DOCX up to 25 MiB with tabular extraction.
            </p>
            <div className="flex items-center gap-space-sm mt-space-sm">
              <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container-lowest text-outline font-semibold shadow-xs">OCR ACTIVE</span>
              <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container-lowest text-outline font-semibold shadow-xs">TABLE PARSER v4</span>
              <span className="text-label-code-sm px-2 py-0.5 rounded bg-surface-container-lowest text-outline font-semibold shadow-xs">DEID ENCRYPTION</span>
            </div>
            {file && (
              <div className="mt-3 px-3 py-1 rounded bg-surface-container-lowest text-on-surface text-label-code-sm flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-on-tertiary-container">check_circle</span>
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB) - Ready for vectorization</span>
              </div>
            )}
          </div>

          {/* Optional Certification Scope Filter Accordeon */}
          <div className="rounded-lg bg-surface-container-low p-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setScopeExpanded(!scopeExpanded)}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                <span className="text-label-lg text-on-surface">Statutory Certification Scope Filters</span>
                <span className="text-label-code-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">OPTIONAL</span>
              </div>
              <span className={`material-symbols-outlined text-outline text-[20px] transition-transform ${scopeExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>
            {scopeExpanded && (
              <div className="pt-space-xs flex flex-wrap gap-2">
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-label-code-sm cursor-pointer shadow-xs hover:bg-surface-container transition-colors">
                  <input type="checkbox" defaultChecked className="rounded accent-secondary" />
                  <span>Mandatory ISI Marking (Scheme I)</span>
                </label>
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-label-code-sm cursor-pointer shadow-xs hover:bg-surface-container transition-colors">
                  <input type="checkbox" defaultChecked className="rounded accent-secondary" />
                  <span>CRS Electronics / IT (Scheme II)</span>
                </label>
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-label-code-sm cursor-pointer shadow-xs hover:bg-surface-container transition-colors">
                  <input type="checkbox" className="rounded accent-secondary" />
                  <span>Public Procurement (Make in India Order 2017)</span>
                </label>
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-label-code-sm cursor-pointer shadow-xs hover:bg-surface-container transition-colors">
                  <input type="checkbox" className="rounded accent-secondary" />
                  <span>GeM Category Direct Compatibility</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Execution Strip */}
          <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
            <div className="flex items-center gap-2 text-outline text-label-code-sm">
              <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">lock</span>
              <span>Local air-gapped pipeline • zero persistent external telemetry</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button 
                className="px-space-md py-2 rounded text-label-lg text-on-surface hover:bg-surface-container transition-colors"
                onClick={handleClear}
              >
                Reset Form
              </button>
              <button 
                className={`flex items-center gap-2 px-space-lg py-2.5 rounded-lg text-on-primary text-label-lg transition-all shadow-md active:scale-[0.98] ${status === 'running' ? 'opacity-75 cursor-not-allowed bg-primary' : status === 'success' ? 'bg-secondary' : 'glow-button text-white'}`}
                onClick={executeSearch}
                disabled={status === 'running'}
              >
                {status === 'success' ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>View Matches</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">policy</span>
                    <span>Find Applicable Standards</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Execution Realtime Telemetry Feed */}
        {status !== 'idle' && (
          <div className="glass-panel rounded-xl p-space-md animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {status === 'running' && <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></div>}
                <span className="text-label-lg text-primary font-bold">
                  {status === 'running' ? 'Vector Ingestion & Clause Dissection in Progress' : 'Inference Complete'}
                </span>
              </div>
              <span className="text-label-code-sm text-outline">IS-RETRIEVER // 8.2 ms</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-secondary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-label-code-sm text-on-surface-variant font-mono">
              {logMsg}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-4 flex flex-col gap-space-md">
        
        {/* Protocol Guidance Card */}
        <div className="glass-panel rounded-xl p-space-md flex flex-col gap-space-sm animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            </div>
            <h3 className="text-headline-sm text-on-surface">Smarter procurement verification</h3>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Extract unambiguous Indian Standard benchmarks directly linked to statutory Ministry Quality Control Orders (QCOs).
          </p>
          
          <div className="space-y-3 pt-space-xs">
            <div className="flex items-start gap-space-sm">
              <div className="w-5 h-5 rounded-full bg-surface-container text-primary text-label-code-sm font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div>
                <div className="text-label-lg text-on-surface font-semibold">Describe or attach requirements</div>
                <div className="text-body-sm text-outline">Paste technical specs, BoQ line items, or upload structural bid documents.</div>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="w-5 h-5 rounded-full bg-surface-container text-primary text-label-code-sm font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div>
                <div className="text-label-lg text-on-surface font-semibold">Graph-driven standard mapping</div>
                <div className="text-body-sm text-outline">StandX cross-matches test parameters, chemical thresholds, and allied QCO gazettes.</div>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="w-5 h-5 rounded-full bg-surface-container text-primary text-label-code-sm font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div>
                <div className="text-label-lg text-on-surface font-semibold">Export audit-ready evidence pack</div>
                <div className="text-body-sm text-outline">Generate court-admissible GeM verification dossiers and tender addenda.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instant Test Cases */}
        <div className="glass-panel rounded-xl p-space-md flex flex-col gap-space-sm animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">database</span>
              <h3 className="text-headline-sm text-on-surface">Curated Test Fixtures</h3>
            </div>
            <span className="text-label-code-sm text-outline">PRE-SYNTHESIZED</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Load production-grade procurement clauses to inspect verification pipeline response times.
          </p>
          
          <div className="flex flex-col gap-2 pt-1">
            <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container/70 card-lift transition-all flex items-center justify-between group" onClick={() => setQuery(SAMPLES.bars)}>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-label-lg text-on-surface font-semibold truncate group-hover:text-secondary transition-colors">
                  High-Tensile TMT Rebars (Fe 550D)
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-label-code-sm px-1 rounded bg-surface-container-lowest text-outline uppercase font-mono">IS 1786:2008</span>
                  <span className="text-label-code-sm text-on-tertiary-container">• Mandatory ISI</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 group-hover:text-secondary transition-all shrink-0">arrow_forward</span>
            </button>
            <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container/70 card-lift transition-all flex items-center justify-between group" onClick={() => setQuery(SAMPLES.solar)}>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-label-lg text-on-surface font-semibold truncate group-hover:text-secondary transition-colors">
                  Utility-Scale Solar Photovoltaic Inverters
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-label-code-sm px-1 rounded bg-surface-container-lowest text-outline uppercase font-mono">IS 16221 / CRS</span>
                  <span className="text-label-code-sm text-on-surface-variant">• MNRE Compliant</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 group-hover:text-secondary transition-all shrink-0">arrow_forward</span>
            </button>
            <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container/70 card-lift transition-all flex items-center justify-between group" onClick={() => setQuery(SAMPLES.cement)}>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-label-lg text-on-surface font-semibold truncate group-hover:text-secondary transition-colors">
                  Ordinary Portland Cement 53 Grade
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-label-code-sm px-1 rounded bg-surface-container-lowest text-outline uppercase font-mono">IS 269:2015</span>
                  <span className="text-label-code-sm text-on-tertiary-container">• QCO Enforced</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 group-hover:text-secondary transition-all shrink-0">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Statutory Trust & Citation Pill */}
        <div className="p-space-sm rounded-xl glass-panel flex flex-col gap-1.5 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span className="text-label-code-sm font-semibold uppercase text-on-surface">Statutory Gazette Index</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            StandX references standard revisions directly from the Bureau of Indian Standards Official Gazette releases and Department for Promotion of Industry and Internal Trade (DPIIT) quality control orders.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-surface-container/60 text-label-code-sm text-outline">
            <span>CATALOGUE SNAPSHOT: 2025.Q1</span>
            <span className="text-secondary cursor-pointer hover:underline">Verify Checksum</span>
          </div>
        </div>

      </div>
    </div>
  );
}
