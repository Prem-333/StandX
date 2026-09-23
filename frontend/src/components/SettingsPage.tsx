import { useState } from 'react';
import { LockKeyhole, SlidersHorizontal, Cpu, Save, Check, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  apiKey: string;
  setApiKey: (k: string) => void;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="px-5 py-3.5 border-b border-surface-container flex items-center gap-2.5 bg-surface-container-low/60 rounded-t-xl">
      <Icon size={14} className="text-secondary shrink-0" />
      <h2 className="text-[14px] font-bold text-on-surface tracking-tight">{title}</h2>
    </div>
  );
}

export function SettingsPage({ apiKey, setApiKey }: SettingsPageProps) {
  const [mockData,   setMockData]   = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [saved,      setSaved]      = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <span className="section-label">Configuration</span>
        </div>
        <h1 className="text-headline-xl text-on-surface font-extrabold tracking-tight mb-1.5">
          Settings
        </h1>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Manage your API key, model preferences, and workspace options.
        </p>
      </div>

      <div className="space-y-4">
        {/* API key */}
        <section className="glass-panel rounded-xl overflow-hidden animate-fade-in-up stagger-1">
          <SectionHeader icon={LockKeyhole} title="API Connection" />
          <div className="p-5">
            <label className="block text-[14px] font-bold text-on-surface mb-1">Local API Key</label>
            <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed">
              Required to connect to the local backend. Stays in memory only — never stored in the browser.
            </p>
            <div className="flex gap-2.5 max-w-sm">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-field flex-1 py-2.5 px-3.5 text-[14px] font-mono"
                placeholder="••••••••••••••••"
              />
              <button
                className="btn-primary interactive-btn rounded-lg px-4 py-2.5 text-[14px] font-bold inline-flex items-center gap-2 shrink-0"
                onClick={handleSave}
              >
                {saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="glass-panel rounded-xl overflow-hidden animate-fade-in-up stagger-2">
          <SectionHeader icon={SlidersHorizontal} title="Workspace Preferences" />
          <div className="p-5 space-y-4">
            {[
              { key: 'mock',   title: 'Enable Mock / Synthetic Data', desc: 'Include fixtures in search results for demo purposes.',  value: mockData,   toggle: () => setMockData(!mockData)     },
              { key: 'strict', title: 'Strict Compliance Mode',       desc: 'Only return exact identifier matches.',                  value: strictMode, toggle: () => setStrictMode(!strictMode) },
            ].map((pref, idx, arr) => (
              <div key={pref.key}>
                <div
                  className="flex items-center justify-between gap-4 cursor-pointer group py-0.5"
                  onClick={pref.toggle}
                >
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-on-surface group-hover:text-secondary transition-colors">{pref.title}</h3>
                    <p className="text-[13px] text-on-surface-variant mt-0.5 leading-relaxed">{pref.desc}</p>
                  </div>
                  <div className={`toggle shrink-0 ${pref.value ? 'on' : ''}`}>
                    <div className="toggle-thumb" />
                  </div>
                </div>
                {idx < arr.length - 1 && <div className="divider mt-4" />}
              </div>
            ))}
          </div>
        </section>

        {/* System info */}
        <section className="glass-panel rounded-xl overflow-hidden animate-fade-in-up stagger-3">
          <SectionHeader icon={Cpu} title="System Information" />
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Architecture',    value: 'FastAPI + Qdrant + Neo4j'   },
                { label: 'Embedding model', value: 'Granite 97M (local)'        },
                { label: 'Reranker',        value: 'MiniLM cross-encoder'       },
                { label: 'Translation',     value: 'IndicTrans2 (offline)'      },
              ].map((info) => (
                <div key={info.label} className="p-3.5 rounded-xl border border-surface-container bg-surface-container-low/40">
                  <p className="section-label mb-1">{info.label}</p>
                  <p className="text-[14px] font-bold text-secondary">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security notice */}
        <section className="status-banner-success p-4 animate-fade-in-up stagger-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={17} className="text-on-tertiary-container shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold text-on-surface mb-0.5">On-premises deployment</p>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                All data remains on your device. No cloud API calls. Models and embedding inference run locally. Audit trails persist to local PostgreSQL-compatible storage.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
