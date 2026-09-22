import { useState } from 'react';
import { LockKeyhole, SlidersHorizontal, ShieldCheck, Cpu, Save } from 'lucide-react';

interface SettingsPageProps {
  apiKey: string;
  setApiKey: (k: string) => void;
}

export function SettingsPage({ apiKey, setApiKey }: SettingsPageProps) {
  const [mockData, setMockData] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <div className="mb-10">
        <p className="section-label mb-3">Configuration</p>
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-3 font-display">
          Settings
        </h1>
        <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
          Manage API keys, toggle advanced models, and configure workspace preferences.
        </p>
      </div>

      <div className="space-y-5">
        {/* API key */}
        <section className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <div
            className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center gap-3"
            style={{ background: 'rgba(0,196,160,0.04)' }}
          >
            <LockKeyhole size={16} className="text-[var(--clr-teal)]" />
            <h2 className="text-sm font-bold text-[var(--clr-text)]">API Connection</h2>
          </div>
          <div className="p-6 sm:p-8">
            <label className="block text-sm font-bold text-[var(--clr-text)] mb-2">Local API Key</label>
            <p className="text-xs text-[var(--clr-text-muted)] font-medium mb-5">
              Required to connect to the local backend. Stays in memory only — never stored in the browser.
            </p>
            <div className="flex gap-3 max-w-md">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-dark flex-1 py-2.5 px-4 text-[15px] font-mono"
                placeholder="••••••••••••••••"
              />
              <button
                className="btn-primary interactive-btn rounded-xl px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2"
                onClick={handleSave}
              >
                {saved ? (
                  <>Saved ✓</>
                ) : (
                  <>
                    <Save size={15} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <div
            className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center gap-3"
            style={{ background: 'rgba(0,196,160,0.04)' }}
          >
            <SlidersHorizontal size={16} className="text-[var(--clr-teal)]" />
            <h2 className="text-sm font-bold text-[var(--clr-text)]">Workspace Preferences</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {[
              {
                key: 'mock',
                title: 'Enable Mock / Synthetic Data',
                desc: 'Include fixtures in search results for demo purposes.',
                value: mockData,
                toggle: () => setMockData(!mockData),
              },
              {
                key: 'strict',
                title: 'Strict Compliance Mode',
                desc: 'Only return exact identifier matches.',
                value: strictMode,
                toggle: () => setStrictMode(!strictMode),
              },
            ].map((pref) => (
              <div key={pref.key}>
                <div
                  className="flex items-center justify-between gap-4 cursor-pointer group"
                  onClick={pref.toggle}
                >
                  <div>
                    <h3 className="text-[13px] font-bold text-[var(--clr-text)] group-hover:text-[var(--clr-teal)] transition-colors">
                      {pref.title}
                    </h3>
                    <p className="text-[11px] text-[var(--clr-text-muted)] font-medium mt-1">{pref.desc}</p>
                  </div>
                  <div className={`toggle ${pref.value ? 'on' : ''}`}>
                    <div className="toggle-thumb" />
                  </div>
                </div>
                {pref.key !== 'strict' && <div className="divider mt-6" />}
              </div>
            ))}
          </div>
        </section>

        {/* System info */}
        <section className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
          <div
            className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center gap-3"
            style={{ background: 'rgba(0,196,160,0.04)' }}
          >
            <Cpu size={16} className="text-[var(--clr-teal)]" />
            <h2 className="text-sm font-bold text-[var(--clr-text)]">System Information</h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Architecture', value: 'FastAPI + Qdrant + Neo4j' },
                { label: 'Embedding model', value: 'Granite 97M (local)' },
                { label: 'Reranker', value: 'MiniLM cross-encoder' },
                { label: 'Translation', value: 'IndicTrans2 (offline)' },
              ].map((info) => (
                <div
                  key={info.label}
                  className="p-3 rounded-xl border border-[var(--clr-border)]"
                  style={{ background: 'rgba(7,13,26,0.5)' }}
                >
                  <p className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-wider mb-1">
                    {info.label}
                  </p>
                  <p className="text-[12px] font-bold text-[var(--clr-teal)]">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security info */}
        <section className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          <div
            className="px-6 py-5 flex items-start gap-4 status-banner-success"
            style={{ borderRadius: '20px', border: 'none', borderBottom: '1px solid var(--clr-border)' }}
          >
            <ShieldCheck size={20} className="text-[var(--clr-teal)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-[var(--clr-text)]">On-premises deployment</p>
              <p className="text-[11px] text-[var(--clr-text-muted)] font-medium mt-1 leading-relaxed">
                All data remains on your device. No cloud API calls. Models and embedding inference run locally. Audit trails persist to local PostgreSQL-compatible storage.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
