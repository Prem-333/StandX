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
      <div className="flex-1 lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
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
          <div
            className="px-5 sm:px-8 py-2.5 flex flex-wrap items-center gap-3 text-xs border-b border-[var(--clr-border)] status-banner-warn"
            style={{ borderRadius: 0 }}
          >
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-widest chip-amber">
              DEMO WORKSPACE
            </span>
            <span className="font-medium text-[var(--clr-amber)]">
              Phase 2 sample includes{' '}
              <strong className="font-black">MOCK / SYNTHETIC</strong> standards. Fixtures have no legal effect.
            </span>
          </div>
        )}

        {/* Page content */}
        <main
          id="main"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-8 sm:py-10 relative z-10"
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
