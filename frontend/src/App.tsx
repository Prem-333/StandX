import { useEffect, useState } from 'react';
import { request } from './api';
import type { Report } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InputPage } from './components/InputPage';
import { ResultsPage } from './components/ResultsPage';
import { HistoryPage } from './components/HistoryPage';
import { DirectoryPage } from './components/DirectoryPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';

type Screen = 'input' | 'results' | 'history' | 'directory' | 'reports' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [report, setReport] = useState<Report | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState(false);
  const [demo, setDemo] = useState(false);
  const [proxyAuth, setProxyAuth] = useState(false);
  const [ready, setReady] = useState(false);

  // Detect demo context and proxy auth
  useEffect(() => {
    fetch('/demo-context')
      .then((r) => r.json())
      .then((c) => {
        setDemo(c.demo);
        setProxyAuth(c.authenticated_proxy);
        setConnection(!c.authenticated_proxy);
      })
      .catch(() => setConnection(true))
      .finally(() => setReady(true));
  }, []);

  // Check API health whenever key or ready state changes
  useEffect(() => {
    if (!ready) return;
    let active = true;
    request('/v1/health', apiKey)
      .then(() => { if (active) setConnected(true); })
      .catch(() => { if (active) setConnected(false); });
    return () => { active = false; };
  }, [apiKey, ready]);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  function handleResult(r: Report) {
    setReport(r);
    setConnected(true);
    setScreen('results');
  }

  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `standards-report-${report.recommendation_id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex min-h-screen font-sans relative" style={{ fontFamily: '"Inter", sans-serif' }}>
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
      <div className="pl-64 flex-1 min-w-0">
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
          <div className="fixed top-14 left-64 right-0 z-30 bg-surface-container-high/80 backdrop-blur-sm px-5 py-2 flex items-center justify-between gap-3 border-b border-surface-container shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-bold tracking-wider uppercase shrink-0">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Demo
              </div>
              <p className="text-[12px] text-on-surface-variant truncate">
                Phase 2 sample — <span className="font-semibold text-on-surface">MOCK / SYNTHETIC</span> statutory references. Inference executes air-gapped on-device.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-outline text-[11px] shrink-0">
              <span className="font-mono">BIS-ACT-SEC14</span>
              <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-on-surface transition-colors">info</span>
            </div>
          </div>
        )}

        {/* Page content — pt accounts for header (56px) + optional demo banner (36px) */}
        <main
          id="main"
          className={`relative bg-transparent min-h-screen w-full px-6 py-5 animate-fade-in-up stagger-1 ${demo ? 'pt-[92px]' : 'pt-[70px]'}`}
        >
          {screen === 'history'   && <HistoryPage />}
          {screen === 'directory' && <DirectoryPage />}
          {screen === 'reports'   && <ReportsPage />}
          {screen === 'settings'  && <SettingsPage apiKey={apiKey} setApiKey={setApiKey} />}
          {screen === 'input'     && (
            <InputPage
              apiKey={apiKey}
              demo={demo}
              onResult={handleResult}
            />
          )}
          {screen === 'results' && report && (
            <ResultsPage
              report={report}
              apiKey={apiKey}
              onBack={() => setScreen('input')}
              onDownload={download}
            />
          )}
        </main>
      </div>
    </div>
  );
}
