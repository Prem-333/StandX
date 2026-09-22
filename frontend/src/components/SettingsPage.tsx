import { useState } from 'react';
import { LockKeyhole, SlidersHorizontal, ShieldCheck, Cpu, Save } from 'lucide-react';

interface SettingsPageProps {
  apiKey: string;
  setApiKey: (k: string) => void;
}

export function SettingsPage({ apiKey, setApiKey }: SettingsPageProps) {
  const [mockData, setMockData]   = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [saved, setSaved]         = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="px-6 py-4 border-b border-[var(--clr-border)] bg-[var(--clr-bg-3)] flex items-center gap-2.5">
      <Icon size={15} className="text-[var(--clr-teal)]" />
      <h2 className="text-sm font-bold text-[var(--clr-text)]">{title}</h2>
    </div>
  );

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="section-label mb-2">Configuration</p>
        <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">Settings</h1>
        <p className="text-[15px] text-[var(--clr-text-muted)] leading-relaxed">Manage your API key, model preferences, and workspace options.</p>
      </div>

      <div className="space-y-4">
        {/* API key */}
        <section className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <SectionHeader icon={LockKeyhole} title="API Connection" />
          <div className="p-6 sm:p-7">
            <label className="block text-sm font-bold text-[var(--clr-text)] mb-1.5">Local API Key</label>
            <p className="text-[12px] text-[var(--clr-text-muted)] mb-4 leading-relaxed">Required to connect to the local backend. Stays in memory only — never stored in the browser.</p>
            <div className="flex gap-2.5 max-w-md">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-field flex-1 py-2.5 px-3.5 text-sm font-mono"
                placeholder="••••••••••••••••"
              />
              <button className="btn-primary interactive-btn rounded-lg px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2" onClick={handleSave}>
                {saved ? 'Saved ✓' : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="card overflow-hidden animate-slide-up" style={{ animationDelay: '70ms', animationFillMode: 'both' }}>
          <SectionHeader icon={SlidersHorizontal} title="Workspace Preferences" />
          <div className="p-6 sm:p-7 space-y-5">
            {[
              { key: 'mock',   title: 'Enable Mock / Synthetic Data', desc: 'Include fixtures in search results for demo purposes.', value: mockData, toggle: () => setMockData(!mockData) },
              { key: 'strict', title: 'Strict Compliance Mode',        desc: 'Only return exact identifier matches.',                  value: strictMode, toggle: () => setStrictMode(!strictMode) },
            ].map((pref, idx, arr) => (
              <div key={pref.key}>
                <div className="flex items-center justify-between gap-4 cursor-pointer group" onClick={pref.toggle}>
                  <div>
                    <h3 className="text-[13px] font-bold text-[var(--clr-text)] group-hover:text-[var(--clr-teal)] transition-colors">{pref.title}</h3>
                    <p className="text-[11px] text-[var(--clr-text-muted)] mt-0.5 leading-relaxed">{pref.desc}</p>
                  </div>
                  <div className={`toggle ${pref.value ? 'on' : ''}`}><div className="toggle-thumb" /></div>
                </div>
                {idx < arr.length - 1 && <div className="divider mt-5" />}
              </div>
            ))}
          </div>
        </section>

        {/* System info */}
        <section className="card overflow-hidden animate-slide-up" style={{ animationDelay: '140ms', animationFillMode: 'both' }}>
          <SectionHeader icon={Cpu} title="System Information" />
          <div className="p-6 sm:p-7">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Architecture',    value: 'FastAPI + Qdrant + Neo4j'  },
                { label: 'Embedding model', value: 'Granite 97M (local)'        },
                { label: 'Reranker',        value: 'MiniLM cross-encoder'       },
                { label: 'Translation',     value: 'IndicTrans2 (offline)'      },
              ].map((info) => (
                <div key={info.label} className="p-3.5 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
                  <p className="section-label mb-1">{info.label}</p>
                  <p className="text-[12px] font-bold text-[var(--clr-teal)]">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security notice */}
        <section className="card overflow-hidden animate-slide-up status-banner-success" style={{ animationDelay: '210ms', animationFillMode: 'both' }}>
          <div className="p-5 flex items-start gap-4">
            <ShieldCheck size={19} className="text-[var(--clr-teal)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-[var(--clr-text)]">On-premises deployment</p>
              <p className="text-[11px] text-[var(--clr-text-muted)] mt-1 leading-relaxed">All data remains on your device. No cloud API calls. Models and embedding inference run locally. Audit trails persist to local PostgreSQL-compatible storage.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
