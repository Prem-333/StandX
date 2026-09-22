import {
  BookOpen,
  FileText,
  ClipboardList,
  History,
  Library,
  PieChart,
  Settings2,
  LockKeyhole,
  Cpu,
  ChevronRight,
} from 'lucide-react';

type Screen = 'input' | 'results' | 'history' | 'directory' | 'reports' | 'settings';

interface SidebarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  resultCount: number | null;
  connected: boolean;
}

const NAV_ITEMS = [
  { id: 'input',     label: 'New Spec',   icon: FileText },
  { id: 'results',   label: 'Results',    icon: ClipboardList },
  { id: 'history',   label: 'History',    icon: History },
  { id: 'directory', label: 'Directory',  icon: Library },
  { id: 'reports',   label: 'Reports',    icon: PieChart },
] as const;

const SYS_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;

export function Sidebar({ screen, setScreen, resultCount, connected }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 sidebar-panel z-20">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex-shrink-0 border-b border-[var(--clr-border)]">
        <button
          onClick={() => setScreen('input')}
          className="flex items-center gap-3 group w-full text-left"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
          >
            <BookOpen size={19} className="text-white" />
          </div>
          <div>
            <p className="font-black text-[17px] tracking-tight text-[var(--clr-text)] leading-none">
              Stand<span className="gradient-text-teal">X</span>
            </p>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[var(--clr-text-muted)] uppercase mt-1">
              BIS Procurement AI
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 section-label mb-2">Workspace</p>
          <nav aria-label="Main navigation" className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${screen === id ? 'active' : ''} ${
                  id === 'results' && resultCount === null ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  if (id === 'results' && resultCount === null) return;
                  setScreen(id as Screen);
                }}
                disabled={id === 'results' && resultCount === null}
              >
                <Icon size={16} className="nav-icon flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {id === 'results' && resultCount !== null && (
                  <span className="chip-teal text-[10px] font-black px-2 py-0.5 rounded-md">
                    {resultCount}
                  </span>
                )}
                {screen === id && (
                  <ChevronRight size={13} className="text-[var(--clr-teal)] opacity-50" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 section-label mb-2">System</p>
          <nav aria-label="System navigation" className="space-y-0.5">
            {SYS_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${screen === id ? 'active' : ''}`}
                onClick={() => setScreen(id as Screen)}
              >
                <Icon size={16} className="nav-icon flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Status footer */}
      <div className="p-4 border-t border-[var(--clr-border)]">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-3 bg-[var(--clr-bg-3)]"
          style={{ border: '1px solid var(--clr-border)' }}
        >
          <Cpu size={14} className="text-[var(--clr-teal)] flex-shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[var(--clr-text-dim)] truncate">Local workspace</span>
            <span className="text-[9px] font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide truncate">
              Models run on-device
            </span>
          </div>
          <div className={connected ? 'status-dot-green' : 'status-dot-amber'} title={connected ? 'API connected' : 'Not connected'} />
          <LockKeyhole size={12} className="text-[var(--clr-text-muted)] flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
