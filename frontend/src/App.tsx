import { useEffect, useState } from "react";
import { request } from "./api";
import type { Report } from "./types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { InputPage } from "./components/InputPage";
import { ResultsPage } from "./components/ResultsPage";
import { HistoryPage } from "./components/HistoryPage";
import { DirectoryPage } from "./components/DirectoryPage";
import { ReportsPage } from "./components/ReportsPage";
import { SettingsPage } from "./components/SettingsPage";

type Screen =
  "input" | "results" | "history" | "directory" | "reports" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("input");
  const [report, setReport] = useState<Report | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState(false);
  const [demo, setDemo] = useState(false);
  const [proxyAuth, setProxyAuth] = useState(false);
  const [ready, setReady] = useState(false);
  const [hostingNotice, setHostingNotice] = useState<string | null>(null);
  const [uploadLimit, setUploadLimit] = useState(5 * 1024 * 1024);

  // Detect demo context and proxy auth
  useEffect(() => {
    fetch("/demo-context")
      .then((r) => r.json())
      .then((c) => {
        setDemo(c.demo);
        setProxyAuth(c.authenticated_proxy);
        setConnection(!c.authenticated_proxy && c.backend_configured !== false);
        setHostingNotice(c.notice || null);
        if (c.max_upload_bytes) setUploadLimit(c.max_upload_bytes - 16_384);
      })
      .catch(() => setConnection(true))
      .finally(() => setReady(true));
  }, []);

  // Check API health whenever key or ready state changes
  useEffect(() => {
    if (!ready) return;
    let active = true;
    request("/v1/health", apiKey)
      .then(() => {
        if (active) setConnected(true);
      })
      .catch(() => {
        if (active) setConnected(false);
      });
    return () => {
      active = false;
    };
  }, [apiKey, ready]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setScreen("directory");
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  function handleResult(r: Report) {
    setReport(r);
    setConnected(true);
    setScreen("results");
  }

  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `standards-report-${report.recommendation_id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex min-h-screen font-sans relative">
      {/* Skip to content */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-xl font-bold btn-primary"
        href="#main"
      >
        Skip to content
      </a>

      {/* Sidebar */}
      <Sidebar
        screen={screen}
        setScreen={setScreen}
        resultCount={report ? report.primary_standards.length : null}
        connected={connected}
      />

      {/* Main area */}
      <div className="md:pl-64 flex-1 min-w-0">
        <Header
          screen={screen}
          setScreen={setScreen}
          connected={connected}
          connection={connection}
          setConnection={setConnection}
          apiKey={apiKey}
          setApiKey={setApiKey}
          proxyAuth={proxyAuth}
        />

        {/* Demo warning banner */}
        {demo && (
          <div className="fixed top-14 left-0 md:left-64 right-0 z-30 bg-surface-container-high/80 backdrop-blur-sm px-5 py-2 flex items-center justify-between gap-3 border-b border-surface-container shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-bold tracking-wider uppercase shrink-0">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="hidden sm:inline">DEMO WORKSPACE</span>
                <span className="sm:hidden">MOCK / SYNTHETIC ENABLED</span>
              </div>
              <p className="hidden sm:block text-[13px] text-on-surface-variant truncate">
                Limited metadata sample ·{" "}
                <span className="font-semibold text-on-surface">
                  MOCK / SYNTHETIC
                </span>{" "}
                fixtures enabled.
              </p>
            </div>
          </div>
        )}

        {/* Page content — pt accounts for header (56px) + optional demo banner (36px) */}
        <main
          id="main"
          className={`relative bg-transparent min-h-screen w-full px-4 sm:px-6 pb-28 py-5 animate-fade-in-up stagger-1 ${demo ? "pt-[92px]" : "pt-[70px]"}`}
        >
          {hostingNotice && (
            <section
              role="status"
              className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-4 text-sm text-on-surface"
            >
              <strong className="block mb-1">Backend not connected</strong>
              {hostingNotice} Your specification stays in this tab until you
              submit it.
            </section>
          )}
          {screen === "history" && (
            <HistoryPage apiKey={apiKey} onOpen={handleResult} />
          )}
          {screen === "directory" && <DirectoryPage apiKey={apiKey} />}
          {screen === "reports" && (
            <ReportsPage
              report={report}
              onDownload={download}
              onReview={() => setScreen("results")}
            />
          )}
          {screen === "settings" && (
            <SettingsPage
              apiKey={apiKey}
              setApiKey={setApiKey}
              proxyAuth={proxyAuth}
            />
          )}
          <div hidden={screen !== "input"}>
            <InputPage
              apiKey={apiKey}
              demo={demo}
              onResult={handleResult}
              uploadLimit={uploadLimit}
            />
          </div>
          {screen === "results" && report && (
            <ResultsPage
              report={report}
              apiKey={apiKey}
              onBack={() => setScreen("input")}
              onDownload={download}
            />
          )}
        </main>
      </div>
    </div>
  );
}
