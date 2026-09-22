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
        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest min-w-0">
          <span className="hidden sm:inline truncate">Workspace</span>
          <ChevronRight size={11} className="text-[var(--clr-text-muted)] opacity-40 flex-shrink-0 hidden sm:inline" />
          <span className="text-[var(--clr-teal)] truncate">{SCREEN_LABELS[screen]}</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Connection status pill */}
          <button
            className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase rounded-full px-3 py-1.5 border transition-all"
            style={{
              background: connected
                ? 'rgba(52,211,153,0.08)'
                : 'rgba(251,146,60,0.08)',
              borderColor: connected
                ? 'rgba(52,211,153,0.2)'
                : 'rgba(251,146,60,0.2)',
              color: connected ? 'var(--clr-green)' : 'var(--clr-saffron)',
            }}
            onClick={() => setConnection(!connection)}
            aria-expanded={connection}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: connected ? 'var(--clr-green)' : 'var(--clr-saffron)',
                boxShadow: connected ? '0 0 6px rgba(52,211,153,0.6)' : '0 0 6px rgba(251,146,60,0.6)',
              }}
            />
            <span className="hidden sm:inline">
              {connected ? 'API Connected' : 'Check Connection'}
            </span>
            <Globe2 size={12} className="opacity-60" />
          </button>

          {/* Officer avatar */}
          <button
            onClick={() => setScreen('settings')}
            aria-label="Settings"
            className="interactive-btn flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black tracking-wider text-[#030a14] transition-all"
            style={{
              background: 'linear-gradient(135deg, #00c4a0, #6366f1)',
              boxShadow: 'var(--glow-teal)',
            }}
          >
            PO
          </button>
        </div>
      </header>

      {/* Connection panel */}
      {connection && (
        <section
          className="px-5 sm:px-8 py-4 flex flex-wrap items-center gap-4 animate-slide-down border-b border-[var(--clr-border)]"
          style={{ background: 'rgba(7,13,26,0.95)' }}
          aria-label="Connection settings"
        >
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-sm font-bold mb-0.5 text-[var(--clr-text)]">Local API Connection</h2>
            <p className="text-[11px] text-[var(--clr-text-muted)]">
              {proxyAuth
                ? 'The demo proxy supplies a temporary local key. It is never sent to the browser.'
                : 'Enter your API key. It stays in memory for this tab only.'}
            </p>
          </div>
          {!proxyAuth && (
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--clr-text)]">
              API key{' '}
              <input
                type="password"
                autoComplete="off"
                className="input-dark py-2 px-4 text-sm w-56"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
          )}
          <button
            className="btn-ghost interactive-btn p-2 rounded-xl ml-auto"
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
