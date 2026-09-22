import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  FileText, UploadCloud, FileCheck2, X, ArrowRight,
  LockKeyhole, Loader2, AlertTriangle, Settings2,
  ChevronDown, BookOpen, FolderOpen, Sparkles,
} from 'lucide-react';
import type { Language, Report } from '../types';
import { request } from '../api';

interface InputPageProps {
  apiKey: string;
  demo: boolean;
  onResult: (r: Report) => void;
}

const categories = [
  ['', 'Not specified'],
  ['bright_steel_bars', 'Bright steel bars'],
  ['laptop_notebook_tablet', 'Laptops / notebooks / tablets'],
  ['gold_jewellery_artefacts', 'Gold jewellery / artefacts'],
  ['silver_jewellery_artefacts', 'Silver jewellery / artefacts'],
] as const;

const LANG_OPTIONS = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['hi-Latn', 'Hinglish'],
] as const;

const PLACEHOLDERS: Record<Language, string> = {
  en: 'Describe the product, material, intended use, and any known IS references…',
  hi: 'उत्पाद, सामग्री और उपयोग का विवरण लिखें…',
  'hi-Latn': 'Aapko kya procure karna hai? Product aur material ka detail likhiye…',
};

const SAMPLES = [
  { label: 'Bright steel bars', sub: 'Verified BIS metadata · ISI rule', value: 'IS 9550:2024', lang: 'en' as Language, product: 'bright_steel_bars', demo: false },
  { label: 'Bedside table in Hindi', sub: 'Local translation and retrieval', value: 'लकड़ी की बेडसाइड मेज', lang: 'hi' as Language, product: '', demo: false },
  { label: 'Street-lighting fixture', sub: 'Mock / Synthetic · superseded edition', value: 'IS-SEED-1001:2020', lang: 'en' as Language, product: '', demo: true },
];

export function InputPage({ apiKey, demo, onResult }: InputPageProps) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [tender, setTender] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [context, setContext] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function chooseFile(candidate?: File) {
    if (!candidate) return;
    setError('');
    if (!/\.(pdf|docx)$/i.test(candidate.name)) { setError('Choose a PDF or DOCX tender document.'); return; }
    if (candidate.size > 5 * 1024 * 1024) { setError('The upload limit is 5 MiB. Choose a smaller document.'); return; }
    setFile(candidate);
  }

  function loadSample(s: typeof SAMPLES[0]) {
    if (!demo && s.demo) return;
    setText(s.value); setLanguage(s.lang); setCategory(s.product);
    setContext({}); setFile(null); setTender(false); setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!file && !text.trim()) { setError('Paste a specification or upload a tender document.'); return; }
    setBusy(true); setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    try {
      let body: FormData | string;
      if (file) {
        body = new FormData();
        body.append('file', file);
        body.append('top_k', '5');
        body.append('language_hint', language);
        if (category) body.append('product_category', category);
        body.append('certification_context', JSON.stringify(context));
      } else {
        body = JSON.stringify({ text, language_hint: language, top_k: 5, tender, product_category: category || null, certification_context: context });
      }
      const result = await request<Report>('/v1/recommend', apiKey, { method: 'POST', body });
      onResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      clearInterval(id); setBusy(false);
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Page heading */}
      <div className="mb-8">
        <p className="section-label mb-2">Tender Workspace</p>
        <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">
          Find the{' '}
          <span className="hero-word-1">right standard</span>,{' '}
          <span className="hero-word-2">faster.</span>
        </h1>
        <p className="text-[15px] text-[var(--clr-text-muted)] max-w-xl leading-relaxed">
          Turn procurement requirements into an evidence-backed BIS standards shortlist.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-7 items-start">
        {/* ── Main form ── */}
        <form className="card overflow-hidden" onSubmit={submit} aria-busy={busy}>
          {/* Form header */}
          <div className="px-6 sm:px-7 py-4 border-b border-[var(--clr-border)] bg-[var(--clr-bg-3)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--clr-text)] font-bold text-[14px]">
              <FileText size={15} className="text-[var(--clr-teal)]" />
              <h2>Your specification</h2>
            </div>
            <span className="section-label">Step 1 of 2</span>
          </div>

          <div className="p-6 sm:p-7">
            {/* Language row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label htmlFor="specification" className="text-sm font-bold text-[var(--clr-text)]">
                What are you procuring?
              </label>
              <div
                className="flex p-1 rounded-lg gap-1 border border-[var(--clr-border)] bg-[var(--clr-bg-3)]"
                role="group"
                aria-label="Input language"
              >
                {LANG_OPTIONS.map(([code, label]) => (
                  <button
                    type="button"
                    key={code}
                    aria-pressed={language === code}
                    className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                    style={language === code
                      ? { background: 'var(--clr-teal)', color: '#fff' }
                      : { color: 'var(--clr-text-muted)' }
                    }
                    onClick={() => setLanguage(code)}
                    disabled={busy}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              id="specification"
              lang={language === 'hi' ? 'hi' : 'en'}
              value={text}
              disabled={Boolean(file) || busy}
              onChange={(e) => setText(e.target.value)}
              maxLength={100000}
              className="textarea-field w-full min-h-[190px] py-3.5 px-4"
              placeholder={PLACEHOLDERS[language]}
            />
            <div className="flex justify-between items-center gap-3 mt-2">
              <span className="text-[11px] text-[var(--clr-text-muted)]">
                {file ? 'The uploaded file will be used instead of pasted text.' : 'Product names and intended use help find better matches.'}
              </span>
              <span className="text-[10px] font-bold text-[var(--clr-text-muted)] tabular-nums">
                {text.length.toLocaleString()} / 100,000
              </span>
            </div>

            {/* Tender toggle */}
            <label className="flex items-center gap-3 mt-6 text-[13px] font-medium text-[var(--clr-text-dim)] cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--clr-teal)' }}
                checked={tender || Boolean(file)}
                disabled={Boolean(file) || busy}
                onChange={(e) => setTender(e.target.checked)}
              />
              This is a tender with multiple products or paragraphs
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="divider flex-1" />
              <span className="text-[10px] font-bold text-[var(--clr-text-muted)] tracking-widest uppercase px-1">
                or upload a tender
              </span>
              <div className="divider flex-1" />
            </div>

            {/* Drop zone */}
            <div
              className={`drop-zone dropzone p-7 flex flex-col items-center justify-center text-center cursor-pointer ${dragging ? 'dragging' : ''} ${file ? 'has-file flex-row text-left justify-start gap-4 p-5' : ''}`}
              onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragging(false);
                if (!busy) {
                  if (e.dataTransfer.files.length > 1) setError('Upload one tender document at a time.');
                  else chooseFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => !file && !busy && inputRef.current?.click()}
            >
              <input
                ref={inputRef} type="file" accept=".pdf,.docx"
                aria-label="Upload tender document" className="sr-only" tabIndex={-1}
                onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ''; }}
                disabled={busy}
              />
              {file ? (
                <>
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 bg-[var(--clr-teal-light)]">
                    <FileCheck2 size={20} className="text-[var(--clr-teal)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-bold text-[var(--clr-text)] truncate">{file.name}</strong>
                    <p className="text-[11px] text-[var(--clr-text-muted)] mt-0.5">{(file.size / 1024).toFixed(1)} KiB · ready to read locally</p>
                  </div>
                  <button type="button" className="btn-ghost interactive-btn p-2 rounded-lg ml-auto flex-shrink-0" onClick={(e) => { e.stopPropagation(); setFile(null); }} disabled={busy} aria-label="Remove uploaded file">
                    <X size={17} />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud size={26} className="text-[var(--clr-teal)] mb-3 opacity-70" />
                  <p className="text-[13px] font-semibold text-[var(--clr-text-dim)]">
                    Drag your document here, or{' '}
                    <button type="button" className="text-[var(--clr-teal)] hover:underline font-bold focus:outline-none" disabled={busy} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                      browse files
                    </button>
                  </p>
                  <p className="text-[11px] text-[var(--clr-text-muted)] mt-1.5">PDF or DOCX · up to 5 MiB · selectable text required</p>
                </>
              )}
            </div>

            {/* Certification scope */}
            <details className="mt-7 group/scope">
              <summary className="flex items-center gap-2 text-[13px] font-semibold text-[var(--clr-text-dim)] cursor-pointer list-none hover:text-[var(--clr-teal)] transition-colors">
                <Settings2 size={14} className="text-[var(--clr-text-muted)]" />
                Certification scope <span className="text-[var(--clr-text-muted)] font-normal ml-1">(optional)</span>
                <ChevronDown size={14} className="ml-auto text-[var(--clr-text-muted)] group-open/scope:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="mt-5 pt-5 border-t border-[var(--clr-border)]">
                <label className="block text-xs font-bold text-[var(--clr-text)] mb-2" htmlFor="product-category">Product category — officer supplied</label>
                <select id="product-category" className="input-field w-full sm:max-w-sm py-2.5 pl-3 pr-8 text-[13px]" value={category} disabled={busy} onChange={(e) => { setCategory(e.target.value); setContext({}); }}>
                  {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <p className="text-[11px] text-[var(--clr-text-muted)] mt-2 leading-relaxed">Only a small, dated category subset is mapped. An absent rule does not mean exempt.</p>
                {category && (
                  <div className="mt-5 space-y-3 p-5 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)] animate-scale-in">
                    {[
                      ['domestic_supply', 'Domestic supply in India'],
                      ['exemption_claimed', 'An exemption is claimed'],
                      ...(category === 'gold_jewellery_artefacts' ? [['district_in_current_annexure', 'District is in the current gold-hallmarking annexure']] : []),
                    ].map(([key, label]) => (
                      <label key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[var(--clr-text-dim)]">
                        {label}
                        <select className="input-field py-1.5 pl-3 pr-8 text-xs sm:w-40" value={key in context ? String(context[key]) : ''} onChange={(e) => setContext((c) => { const next = { ...c }; if (e.target.value === '') delete next[key]; else next[key] = e.target.value === 'true'; return next; })}>
                          <option value="">Not confirmed</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </details>

            {/* Error */}
            {error && (
              <div className="mt-6 flex gap-3 p-4 status-banner-error text-[var(--clr-red)] text-[13px] animate-slide-up" role="alert">
                <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-7 py-4 border-t border-[var(--clr-border)] bg-[var(--clr-bg-3)] flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--clr-text-muted)]">
              <LockKeyhole size={12} className="text-[var(--clr-teal)]" /> Local processing · metadata only
            </p>
            <button
              className="btn-primary interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2.5 text-[14px] font-bold"
              disabled={busy || (!text.trim() && !file)} type="submit"
            >
              {busy ? (<><Loader2 size={16} className="animate-spin" /> Finding standards… {seconds}s</>) : (<>Find standards <ArrowRight size={16} /></>)}
            </button>
          </div>

          {busy && (
            <div className="px-6 py-2.5 border-t border-[var(--clr-border)] bg-[var(--clr-teal-light)] text-[11px] font-bold tracking-widest uppercase text-center text-[var(--clr-teal-dark)]" role="status">
              Reading specification · Checking local KB · Saving evidence trail
            </div>
          )}
        </form>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-5">
          {/* Hero card */}
          <section className="card p-6" style={{ borderTop: '3px solid var(--clr-teal)' }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--clr-teal-light)] mb-5">
              <Sparkles size={19} className="text-[var(--clr-teal)]" />
            </div>
            <h2 className="text-[17px] font-black leading-tight mb-2 text-[var(--clr-text)]">Smarter procurement<br />starts here.</h2>
            <p className="text-[13px] text-[var(--clr-text-muted)] leading-relaxed mb-6">Get a shortlist you can inspect, question, and trace back to its BIS source.</p>
            <ol className="space-y-4">
              {[['Describe your requirement','Paste text or upload your tender.'],['Review the evidence','Check versions, allied standards, and certification scope.'],['Make the final call','Confirm or correct each suggestion.']].map(([t, d], i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black shrink-0 mt-0.5 bg-[var(--clr-teal-light)] text-[var(--clr-teal-dark)]">{i + 1}</span>
                  <div>
                    <strong className="block text-[13px] font-bold text-[var(--clr-text)] mb-0.5">{t}</strong>
                    <p className="text-[11px] text-[var(--clr-text-muted)]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Samples */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--clr-text)] mb-1">
              <FolderOpen size={14} className="text-[var(--clr-teal)]" /> Try a sample
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] mb-4">Use an existing KB record to explore the workflow.</p>
            <div className="space-y-2">
              {SAMPLES.filter((s) => !s.demo || demo).map((s, i) => (
                <button key={i} disabled={busy} onClick={() => loadSample(s)}
                  className="interactive-btn group flex items-center justify-between text-left w-full p-3.5 rounded-xl border border-[var(--clr-border)] hover:border-[var(--clr-teal)] hover:bg-[var(--clr-bg-hover)] transition-all disabled:opacity-50">
                  <div>
                    <span className="block text-[13px] font-semibold text-[var(--clr-text)]">{s.label}</span>
                    <span className={`block text-[10px] font-bold tracking-wide uppercase mt-0.5 ${s.demo ? 'text-[var(--clr-amber)]' : 'text-[var(--clr-text-muted)]'}`}>{s.sub}</span>
                  </div>
                  <ArrowRight size={14} className="text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </section>

          <p className="flex items-start gap-2 text-[11px] text-[var(--clr-text-muted)] px-1 leading-relaxed">
            <BookOpen size={13} className="shrink-0 mt-0.5 text-[var(--clr-teal)]" />
            This workspace uses public metadata. It does not reproduce standards full text.
          </p>
        </div>
      </div>
    </div>
  );
}
