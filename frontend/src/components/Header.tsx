import React from 'react';

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
  input:     'New Specification',
  results:   'Verification Results',
  history:   'Audit History',
  directory: 'Standards Directory',
  reports:   'Compliance Reports',
  settings:  'Settings',
};

export function Header({ screen, setScreen, connected, connection, setConnection, apiKey, setApiKey, proxyAuth }: HeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-64 right-0 h-14 glass-panel border-b border-surface-container/40 z-40 flex items-center justify-between px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-medium text-outline tracking-wide uppercase hidden sm:block">StandX</span>
          <span className="text-outline text-[11px] hidden sm:block">/</span>
          <span className="text-[13px] font-semibold text-on-surface tracking-tight truncate">{SCREEN_LABELS[screen]}</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Connection status button */}
          <button
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-[11px] font-medium hover:bg-surface-container transition-colors"
            onClick={() => setConnection(!connection)}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-on-tertiary-container' : 'bg-error'}`}></span>
            <span className="font-mono">{connected ? 'API Connected' : 'Check Connection'}</span>
          </button>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[15px]">search</span>
            <span className="text-[13px] hidden md:inline text-on-surface-variant">Search BIS standards</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline shadow-sm uppercase font-mono hidden lg:block">⌘K</kbd>
          </div>

          {/* Avatar */}
          <button
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center hover:scale-105 transition-transform shrink-0"
            onClick={() => setScreen('settings')}
            title="Settings"
          >
            <span className="material-symbols-outlined text-on-primary-container text-[16px]">person</span>
          </button>
        </div>
      </header>

      {/* Connection panel */}
      {connection && (
        <section className="fixed top-14 left-64 right-0 z-30 px-5 py-3.5 flex flex-wrap items-center gap-4 border-b border-surface-container shadow-md bg-surface-container-lowest">
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-[14px] font-bold text-on-surface mb-0.5">Local API Connection</h2>
            <p className="text-[12px] text-on-surface-variant">
              {proxyAuth
                ? 'The demo proxy supplies a temporary local key — never sent to the browser.'
                : 'Enter your API key. It stays in memory for this tab only.'}
            </p>
          </div>
          {!proxyAuth && (
            <label className="flex items-center gap-2.5 text-[13px] font-semibold text-on-surface">
              API key{' '}
              <input
                type="password"
                autoComplete="off"
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-[13px] text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 w-52 transition-all"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
          )}
          <button
            className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors ml-auto"
            onClick={() => setConnection(false)}
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </section>
      )}
    </>
  );
}
