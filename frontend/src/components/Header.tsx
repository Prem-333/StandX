import { ChevronRight, Globe2, X } from 'lucide-react';

type Screen = 'input' | 'results' | 'history' | 'directory' | 'reports' | 'settings';

interface HeaderProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  connected: boolean;
  connection: boolean;
  setConnection: (v: boolean) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  proxyAuth: boolean;
}

const SCREEN_LABELS: Record<Screen, string> = {
  input: 'New Specification',
  results: 'Recommendations',
  history: 'History',
  directory: 'Directory',
  reports: 'Reports',
  settings: 'Settings',
};

export function Header({
  screen,
  setScreen,
  connected,
  connection,
  setConnection,
  apiKey,
  setApiKey,
  proxyAuth,
}: HeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-30 h-14 topbar px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-semibold text-[var(--clr-text-muted)] uppercase tracking-widest min-w-0">
          <span className="hidden sm:inline truncate text-[var(--clr-text-muted)]">Workspace</span>
          <ChevronRight size={11} className="opacity-40 flex-shrink-0 hidden sm:inline" />
          <span className="text-[var(--clr-teal)] font-bold truncate">{SCREEN_LABELS[screen]}</span>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Connection pill */}
          <button
            className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase rounded-full px-3 py-1.5 border transition-all"
            style={connected
              ? { background: 'var(--clr-green-light)', borderColor: '#86efac', color: 'var(--clr-green)' }
              : { background: 'var(--clr-amber-light)', borderColor: '#fcd34d', color: 'var(--clr-amber)' }
            }
            onClick={() => setConnection(!connection)}
            aria-expanded={connection}
          >
            <span className={connected ? 'status-dot-green' : 'status-dot-amber'} />
            <span className="hidden sm:inline">{connected ? 'API Connected' : 'Check Connection'}</span>
            <Globe2 size={11} className="opacity-60" />
          </button>

          {/* Avatar */}
          <button
            onClick={() => setScreen('settings')}
            aria-label="Settings"
            className="interactive-btn flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black tracking-wider text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
          >
            PO
          </button>
        </div>
      </header>

      {/* Connection panel */}
      {connection && (
        <section
          className="px-5 sm:px-8 py-4 flex flex-wrap items-center gap-4 animate-slide-down border-b border-[var(--clr-border)] bg-[var(--clr-bg-3)]"
          aria-label="Connection settings"
        >
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-sm font-bold mb-0.5 text-[var(--clr-text)]">Local API Connection</h2>
            <p className="text-[11px] text-[var(--clr-text-muted)]">
              {proxyAuth
                ? 'The demo proxy supplies a temporary local key — never sent to the browser.'
                : 'Enter your API key. It stays in memory for this tab only.'}
            </p>
          </div>
          {!proxyAuth && (
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--clr-text-dim)]">
              API key{' '}
              <input
                type="password"
                autoComplete="off"
                className="input-field py-2 px-4 text-sm w-56"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
          )}
          <button
            className="btn-ghost interactive-btn p-2 rounded-lg ml-auto"
            onClick={() => setConnection(false)}
            aria-label="Close connection settings"
          >
            <X size={16} />
          </button>
        </section>
      )}
    </>
  );
}
