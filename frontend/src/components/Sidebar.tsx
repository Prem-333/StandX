import React from 'react';

type Screen = 'input' | 'results' | 'history' | 'directory' | 'reports' | 'settings';

interface SidebarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  resultCount: number | null;
  connected: boolean;
}

const WORKSPACE_ITEMS: { key: Screen; label: string; icon: string }[] = [
  { key: 'input',     label: 'New Spec',               icon: 'post_add' },
  { key: 'results',   label: 'Results & Verification', icon: 'check_circle' },
  { key: 'history',   label: 'History',                icon: 'history' },
  { key: 'directory', label: 'Standards Directory',    icon: 'menu_book' },
  { key: 'reports',   label: 'Compliance Reports',     icon: 'analytics' },
];

const SYSTEM_ITEMS: { key: Screen; label: string; icon: string }[] = [
  { key: 'settings', label: 'Settings', icon: 'tune' },
];

export function Sidebar({ screen, setScreen, resultCount, connected }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-surface-container/40 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-surface-container/40 shrink-0">
          <div className="w-7 h-7 shrink-0 rounded-lg glow-button flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] tracking-tight text-gradient font-extrabold leading-none whitespace-nowrap">StandX</span>
              <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-surface-container text-secondary font-bold leading-none shrink-0">BIS</span>
            </div>
            <span className="text-[10px] text-on-surface-variant leading-none font-medium mt-0.5 whitespace-nowrap">Procurement Intel</span>
          </div>
        </div>

        {/* Workspace Nav */}
        <div className="px-3 pt-4">
          <span className="text-[9px] uppercase tracking-widest text-outline font-bold block mb-1.5 px-1">Workspace</span>
          <nav className="space-y-0.5">
            {WORKSPACE_ITEMS.map(({ key, label, icon }) => {
              const isActive = screen === key;
              const disabled = key === 'results' && resultCount === null;

              const baseClass = "glass-nav-item w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-[13px]";
              const activeClass = isActive
                ? "bg-secondary/10 text-secondary font-semibold shadow-sm border border-secondary/20"
                : "text-on-surface-variant hover:text-on-surface";
              const disabledClass = disabled ? " opacity-40 cursor-not-allowed" : "";

              return (
                <button
                  key={key}
                  className={`${baseClass} ${activeClass}${disabledClass}`}
                  onClick={() => { if (!disabled) setScreen(key); }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] shrink-0">{icon}</span>
                    <span className="leading-none">{label}</span>
                  </div>
                  {key === 'results' && resultCount !== null && (
                    <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {resultCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Nav */}
        <div className="px-3 pt-5">
          <span className="text-[9px] uppercase tracking-widest text-outline font-bold block mb-1.5 px-1">System</span>
          <nav className="space-y-0.5">
            {SYSTEM_ITEMS.map(({ key, label, icon }) => {
              const isActive = screen === key;
              const baseClass = "glass-nav-item w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px]";
              const activeClass = isActive
                ? "bg-secondary/10 text-secondary font-semibold shadow-sm border border-secondary/20"
                : "text-on-surface-variant hover:text-on-surface";

              return (
                <button
                  key={key}
                  className={`${baseClass} ${activeClass}`}
                  onClick={() => setScreen(key)}
                >
                  <span className="material-symbols-outlined text-[17px] shrink-0">{icon}</span>
                  <span className="leading-none">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Status Pill */}
      <div className="p-3">
        <div className="p-2.5 rounded-lg bg-surface-container-low shadow-[inset_0_1px_2px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline text-[14px]">encrypted</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface">Local Workspace</span>
            </div>
            {connected ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-on-tertiary-container"></span>
              </span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
            )}
          </div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-tight font-medium">Models Run On-Device</div>
        </div>
      </div>
    </aside>
  );
}
