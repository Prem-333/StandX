import {
  FilePlus,
  CheckCircle2,
  History,
  BookOpen,
  FileChartColumn,
  Settings,
  Shield,
} from "lucide-react";
type Screen =
  "input" | "results" | "history" | "directory" | "reports" | "settings";
const items = [
  { key: "input", label: "New Spec", icon: FilePlus },
  { key: "results", label: "Recommendations", icon: CheckCircle2 },
  { key: "history", label: "History", icon: History },
  { key: "directory", label: "Standards Directory", icon: BookOpen },
  { key: "reports", label: "Evidence Reports", icon: FileChartColumn },
  { key: "settings", label: "Settings", icon: Settings },
] as const;
export function Sidebar({
  screen,
  setScreen,
  resultCount,
  connected,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  resultCount: number | null;
  connected: boolean;
}) {
  return (
    <aside className="fixed bottom-0 left-0 w-full md:top-0 md:h-screen md:w-64 bg-surface-container-lowest md:glass-panel border-t md:border-t-0 md:border-r border-surface-container z-50 flex md:flex-col md:justify-between">
      <div className="min-w-0 w-full">
        <div className="hidden md:flex h-20 px-6 items-center gap-3 border-b border-surface-container">
          <div className="glow-button p-2 rounded-xl text-white">
            <Shield size={22} />
          </div>
          <div>
            <span className="font-extrabold text-xl text-gradient">StandX</span>
            <span className="block text-xs text-on-surface-variant">
              Procurement standards assistant
            </span>
          </div>
        </div>
        <p className="hidden md:block px-6 pt-6 pb-3 text-xs uppercase tracking-widest text-outline font-bold">
          Workspace
        </p>
        <nav
          aria-label="Workspace"
          className="flex md:flex-col gap-1 p-1 md:p-2 md:px-3"
        >
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              disabled={key === "results" && resultCount === null}
              aria-current={screen === key ? "page" : undefined}
              onClick={() => setScreen(key)}
              className={`flex flex-1 md:flex-none min-w-0 flex-col md:flex-row items-center gap-1 md:gap-3 px-1 md:px-3 py-2 md:py-3 rounded-lg text-[10px] md:text-sm focus-ring disabled:opacity-40 ${screen === key ? "bg-secondary/10 text-secondary font-semibold" : "text-on-surface-variant hover:bg-surface-container-low"}`}
            >
              <Icon size={19} />
              <span className="hidden md:inline whitespace-nowrap">
                {label}
              </span>
              <span className="md:hidden">
                {
                  {
                    input: "New",
                    results: "Results",
                    history: "History",
                    directory: "Directory",
                    reports: "Reports",
                    settings: "Settings",
                  }[key]
                }
              </span>
              {key === "results" && resultCount !== null && (
                <span className="hidden md:inline ml-auto rounded-full bg-secondary/10 px-2 text-xs">
                  {resultCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="hidden md:block p-5 text-xs text-on-surface-variant">
        <p className="font-semibold mb-2">
          {connected ? "API connected" : "API unavailable"}
        </p>
        <p>
          Independent prototype. Public metadata and explicitly labelled
          fixtures.
        </p>
      </div>
    </aside>
  );
}
