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
  { id: 'input', label: 'New Spec', icon: FileText, section: 'workspace' },
  { id: 'results', label: 'Results', icon: ClipboardList, section: 'workspace' },
  { id: 'history', label: 'History', icon: History, section: 'workspace' },
  { id: 'directory', label: 'Directory', icon: Library, section: 'workspace' },
  { id: 'reports', label: 'Reports', icon: PieChart, section: 'workspace' },
] as const;

const SYS_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;

export function Sidebar({ screen, setScreen, resultCount, connected }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 glass-panel z-20">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 flex-shrink-0 border-b border-[var(--clr-border)]">
        <button
          onClick={() => setScreen('input')}
          className="flex items-center gap-3 group w-full text-left"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00c4a0 0%, #6366f1 100%)',
              boxShadow: 'var(--glow-teal)',
            }}
          >
            <BookOpen size={19} className="text-white relative z-10" />
          </div>
          <div>
            <p className="font-black text-[17px] tracking-tight text-white leading-none font-display">
              Stand<span className="gradient-text-teal">X</span>
            </p>
            <p className="text-[9px] font-bold tracking-[0.22em] text-[var(--clr-text-muted)] uppercase mt-1">
              BIS Procurement AI
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 text-[9px] font-black tracking-[0.2em] text-[var(--clr-text-muted)] uppercase mb-2">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${screen === id ? 'active' : ''} ${
                  id === 'results' && resultCount === null
                    ? 'opacity-40 cursor-not-allowed'
                    : ''
                }`}
                onClick={() => {
                  if (id === 'results' && resultCount === null) return;
                  setScreen(id as Screen);
                }}
                disabled={id === 'results' && resultCount === null}
              >
                <Icon size={16} className="nav-icon flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {id === 'results' && resultCount !== null && (
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md"
                    style={{
                      background: screen === 'results' ? 'var(--clr-teal)' : 'rgba(0,196,160,0.15)',
                      color: screen === 'results' ? '#030a14' : 'var(--clr-teal)',
                    }}
                  >
                    {resultCount}
                  </span>
                )}
                {screen === id && (
                  <ChevronRight size={13} className="text-[var(--clr-teal)] opacity-60" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[9px] font-black tracking-[0.2em] text-[var(--clr-text-muted)] uppercase mb-2">
            System
          </p>
          <nav aria-label="System navigation" className="space-y-0.5">
            {SYS_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${screen === id ? 'active' : ''}`}
                onClick={() => setScreen(id as Screen)}
              >
                <Icon size={16} className="nav-icon flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Status footer */}
      <div className="p-4 border-t border-[var(--clr-border)]">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-3"
          style={{ background: 'rgba(0,196,160,0.06)', border: '1px solid rgba(0,196,160,0.12)' }}
        >
          <Cpu size={15} className="text-[var(--clr-teal)] flex-shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[var(--clr-text)] truncate">
              Local workspace
            </span>
            <span className="text-[9px] font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide truncate">
              Models run on-device
            </span>
          </div>
          <div className="relative flex-shrink-0">
            <div
              className={connected ? 'pulse-dot-teal' : 'pulse-dot-amber'}
              title={connected ? 'API connected' : 'API not connected'}
            />
          </div>
          <LockKeyhole size={13} className="text-[var(--clr-text-muted)] flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
