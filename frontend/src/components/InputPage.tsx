import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck2,
  X,
  Sparkles,
  ArrowRight,
  LockKeyhole,
  Loader2,
  AlertTriangle,
  Settings2,
  ChevronDown,
  BookOpen,
  FolderOpen,
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
  {
    label: 'Bright steel bars',
    sub: 'Verified metadata · ISI category rule',
    value: 'IS 9550:2024',
    lang: 'en' as Language,
    product: 'bright_steel_bars',
    demo: false,
  },
  {
    label: 'Bedside table in Hindi',
    sub: 'Local translation and retrieval',
    value: 'लकड़ी की बेडसाइड मेज',
    lang: 'hi' as Language,
    product: '',
    demo: false,
  },
  {
    label: 'Street-lighting fixture',
    sub: 'Mock / Synthetic · superseded edition',
    value: 'IS-SEED-1001:2020',
    lang: 'en' as Language,
    product: '',
    demo: true,
  },
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
    if (!/\.(pdf|docx)$/i.test(candidate.name)) {
      setError('Choose a PDF or DOCX tender document.');
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setError('The upload limit is 5 MiB. Choose a smaller document.');
      return;
    }
    setFile(candidate);
  }

  function loadSample(s: typeof SAMPLES[0]) {
    if (!demo && s.demo) return;
    setText(s.value);
    setLanguage(s.lang);
    setCategory(s.product);
    setContext({});
    setFile(null);
    setTender(false);
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!file && !text.trim()) {
      setError('Paste a specification or upload a tender document.');
      return;
    }
    setBusy(true);
    setSeconds(0);
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
        body = JSON.stringify({
          text,
          language_hint: language,
          top_k: 5,
          tender,
          product_category: category || null,
          certification_context: context,
        });
      }
      const result = await request<Report>('/v1/recommend', apiKey, {
        method: 'POST',
        body,
      });
      onResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      clearInterval(id);
      setBusy(false);
    }
  }

  return (
    <div className="animate-slide-up hero-bg">
      {/* Decorative background orbs */}
      <div
        className="hero-orb opacity-30"
        style={{ width: 600, height: 400, top: -200, right: -100, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="hero-orb opacity-20"
        style={{ width: 400, height: 400, top: -100, left: -150, background: 'radial-gradient(ellipse, rgba(0,196,160,0.15) 0%, transparent 70%)' }}
      />

      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Tender Workspace</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[var(--clr-text)] tracking-tight leading-[1.05] mb-3 font-display">
            Find the{' '}
            <span className="gradient-text">right standard</span>,<br />
            <span className="text-[var(--clr-text-dim)]">faster.</span>
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
            Turn procurement requirements into an evidence-backed BIS standards shortlist.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 xl:gap-10 items-start relative">
        {/* ── Main form ── */}
        <form
          className="glass-card overflow-hidden"
          onSubmit={submit}
          aria-busy={busy}
        >
          {/* Form header */}
          <div
            className="px-6 sm:px-8 py-4 border-b border-[var(--clr-border)] flex items-center justify-between"
            style={{ background: 'rgba(0,196,160,0.04)' }}
          >
            <div className="flex items-center gap-2 text-[var(--clr-text)] font-bold text-[15px]">
              <FileText size={16} className="text-[var(--clr-teal)]" />
              <h2>Your specification</h2>
            </div>
            <span className="section-label">01 / 02</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Language + label row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <label htmlFor="specification" className="block text-sm font-bold text-[var(--clr-text)]">
                What are you procuring?
              </label>
              <div
                className="flex p-1 rounded-xl gap-1 border border-[var(--clr-border)]"
                style={{ background: 'rgba(7,13,26,0.6)' }}
                role="group"
                aria-label="Input language"
              >
                {LANG_OPTIONS.map(([code, label]) => (
                  <button
                    type="button"
                    key={code}
                    aria-pressed={language === code}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    style={
                      language === code
                        ? {
                            background: 'var(--clr-teal)',
                            color: '#030a14',
                            boxShadow: 'var(--glow-teal)',
                          }
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
              className="textarea-dark w-full min-h-[200px] py-4 px-5 text-[15px]"
              placeholder={PLACEHOLDERS[language]}
            />

            <div className="flex justify-between items-center gap-4 mt-3">
              <span className="text-xs text-[var(--clr-text-muted)] font-medium">
                {file
                  ? 'The uploaded file will be used instead of pasted text.'
                  : 'Product names and intended use help find better matches.'}
              </span>
              <span className="text-[10px] font-bold text-[var(--clr-text-muted)] tabular-nums bg-[var(--clr-bg)] px-2 py-1 rounded-lg border border-[var(--clr-border)]">
                {text.length.toLocaleString()} / 100,000
              </span>
            </div>

            {/* Tender toggle */}
            <label className="flex items-center gap-3 mt-7 text-[13px] font-bold text-[var(--clr-text-dim)] cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--clr-border)] cursor-pointer"
                style={{ accentColor: 'var(--clr-teal)' }}
                checked={tender || Boolean(file)}
                disabled={Boolean(file) || busy}
                onChange={(e) => setTender(e.target.checked)}
              />
              This is a tender with multiple products or paragraphs
            </label>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8 opacity-50">
              <div className="flex-1 divider" />
              <span className="text-[10px] font-bold text-[var(--clr-text-muted)] tracking-widest uppercase">
                or upload a tender
              </span>
              <div className="flex-1 divider" />
            </div>

            {/* Drop zone */}
            <div
              className={`drop-zone dropzone p-8 flex flex-col items-center justify-center text-center cursor-pointer ${dragging ? 'dragging' : ''} ${file ? 'has-file flex-row text-left justify-start gap-5 p-5' : ''}`}
              onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!busy) {
                  if (e.dataTransfer.files.length > 1) setError('Upload one tender document at a time.');
                  else chooseFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => !file && !busy && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                aria-label="Upload tender document"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ''; }}
                disabled={busy}
              />
              {file ? (
                <>
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                    style={{ background: 'rgba(0,196,160,0.12)', border: '1px solid rgba(0,196,160,0.25)' }}
                  >
                    <FileCheck2 size={22} className="text-[var(--clr-teal)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-bold text-[var(--clr-text)] truncate">{file.name}</strong>
                    <p className="text-[11px] text-[var(--clr-text-muted)] mt-1 font-medium">
                      {(file.size / 1024).toFixed(1)} KiB · ready to read locally
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost interactive-btn p-2 rounded-xl ml-auto flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    disabled={busy}
                    aria-label="Remove uploaded file"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5 animate-float"
                    style={{ background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.2)' }}
                  >
                    <UploadCloud size={28} className="text-[var(--clr-teal)]" />
                  </div>
                  <p className="text-[14px] font-bold text-[var(--clr-text-dim)]">
                    Drag your document here, or{' '}
                    <button
                      type="button"
                      className="text-[var(--clr-teal)] hover:underline font-black focus:outline-none"
                      disabled={busy}
                      onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-[11px] text-[var(--clr-text-muted)] mt-2 font-medium tracking-wide">
                    PDF or DOCX · up to 5 MiB · selectable text required
                  </p>
                </>
              )}
            </div>

            {/* Certification scope */}
            <details className="mt-8 group/scope">
              <summary className="flex items-center gap-2 text-[13px] font-bold text-[var(--clr-text-dim)] cursor-pointer list-none hover:text-[var(--clr-teal)] transition-colors">
                <Settings2 size={15} className="text-[var(--clr-teal)]/60" />
                Certification scope{' '}
                <span className="text-[var(--clr-text-muted)] font-medium ml-1">(optional)</span>
                <ChevronDown size={15} className="ml-auto text-[var(--clr-text-muted)] group-open/scope:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="mt-5 pt-5 border-t border-[var(--clr-border)] animate-slide-down">
                <label className="block text-xs font-bold text-[var(--clr-text)] mb-2" htmlFor="product-category">
                  Product category — officer supplied
                </label>
                <select
                  id="product-category"
                  className="input-dark w-full sm:max-w-sm py-2.5 pl-3 pr-10 text-[13px] font-medium"
                  value={category}
                  disabled={busy}
                  onChange={(e) => { setCategory(e.target.value); setContext({}); }}
                >
                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--clr-text-muted)] mt-2.5 font-medium leading-relaxed">
                  Only a small, dated category subset is mapped. An absent rule does not mean exempt.
                </p>

                {category && (
                  <div className="mt-6 space-y-3 p-5 rounded-xl border border-[var(--clr-border)] animate-scale-in"
                    style={{ background: 'rgba(0,196,160,0.04)' }}>
                    {[
                      ['domestic_supply', 'Domestic supply in India'],
                      ['exemption_claimed', 'An exemption is claimed'],
                      ...(category === 'gold_jewellery_artefacts'
                        ? [['district_in_current_annexure', 'District is in the current gold-hallmarking annexure']]
                        : []),
                    ].map(([key, label]) => (
                      <label
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] font-medium text-[var(--clr-text-dim)]"
                        key={key}
                      >
                        {label}
                        <select
                          className="input-dark py-1.5 pl-3 pr-8 text-xs font-medium sm:w-40"
                          value={key in context ? String(context[key]) : ''}
                          onChange={(e) =>
                            setContext((c) => {
                              const next = { ...c };
                              if (e.target.value === '') delete next[key];
                              else next[key] = e.target.value === 'true';
                              return next;
                            })
                          }
                        >
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
              <div
                className="mt-7 flex gap-3 p-4 status-banner-error text-red-300 text-[13px] animate-slide-up"
                role="alert"
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-[var(--clr-red)]" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Form footer */}
          <div
            className="px-6 sm:px-8 py-5 border-t border-[var(--clr-border)] flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ background: 'rgba(0,196,160,0.03)' }}
          >
            <p className="flex items-center gap-2 text-[11px] font-bold text-[var(--clr-text-muted)] tracking-wide uppercase">
              <LockKeyhole size={13} className="text-[var(--clr-teal)]" />
              Local processing · metadata only
            </p>
            <button
              className="btn-primary interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-[14px] font-black"
              disabled={busy || (!text.trim() && !file)}
              type="submit"
            >
              {busy ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Finding standards… {seconds}s
                </>
              ) : (
                <>
                  Find standards
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {busy && (
            <div
              className="px-6 sm:px-8 py-3 border-t border-[var(--clr-border)] text-[11px] font-bold tracking-widest uppercase text-center animate-shimmer"
              style={{ color: 'var(--clr-teal)' }}
              role="status"
            >
              Reading specification · Checking local KB · Saving evidence trail
            </div>
          )}
        </form>

        {/* ── Sidebar panel ── */}
        <div className="flex flex-col gap-6">
          {/* Hero card */}
          <section
            className="rounded-2xl p-7 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0d1b2e 0%, #112240 50%, #0d1b2e 100%)',
              border: '1px solid rgba(0,196,160,0.2)',
              boxShadow: 'var(--glow-teal)',
            }}
          >
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
              style={{ background: 'radial-gradient(ellipse, rgba(0,196,160,0.4) 0%, transparent 70%)' }} />

            <span className="flex items-center justify-center w-11 h-11 rounded-xl mb-6 relative"
              style={{ background: 'rgba(0,196,160,0.15)', border: '1px solid rgba(0,196,160,0.25)' }}>
              <Sparkles size={21} className="text-[var(--clr-teal)]" />
            </span>
            <h2 className="text-xl font-black leading-tight tracking-tight mb-3 text-white font-display">
              Smarter procurement<br />starts here.
            </h2>
            <p className="text-[13px] text-[var(--clr-text-muted)] leading-relaxed font-medium mb-8">
              Get a shortlist you can inspect, question, and trace back to its BIS source.
            </p>
            <ol className="space-y-5">
              {[
                ['Describe your requirement', 'Paste text or upload your tender.'],
                ['Review the evidence', 'Check versions, allied standards, and certification scope.'],
                ['Make the final call', 'Confirm or correct each suggestion.'],
              ].map(([t, d], i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(0,196,160,0.15)',
                      border: '1px solid rgba(0,196,160,0.3)',
                      color: 'var(--clr-teal)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <strong className="block text-[13px] font-bold text-white mb-0.5">{t}</strong>
                    <p className="text-[11px] text-[var(--clr-text-muted)] font-medium">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Sample queries */}
          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--clr-text)] mb-1">
              <FolderOpen size={15} className="text-[var(--clr-teal)]" />
              Try a sample
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] font-medium mb-5">
              Use an existing KB record to explore the workflow.
            </p>
            <div className="space-y-2.5">
              {SAMPLES.filter((s) => !s.demo || demo).map((s, i) => (
                <button
                  key={i}
                  disabled={busy}
                  onClick={() => loadSample(s)}
                  className="interactive-btn group flex items-center justify-between text-left w-full p-4 rounded-xl border border-[var(--clr-border)] hover:border-[var(--clr-teal)]/30 transition-all disabled:opacity-50"
                  style={{ background: 'rgba(7,13,26,0.4)' }}
                >
                  <div>
                    <span className="block text-[13px] font-bold text-[var(--clr-text)]">{s.label}</span>
                    <span
                      className={`block text-[10px] font-bold tracking-wide uppercase mt-1 ${
                        s.demo ? 'text-[var(--clr-saffron)]' : 'text-[var(--clr-text-muted)]'
                      }`}
                    >
                      {s.sub}
                    </span>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-[var(--clr-text-muted)] group-hover:text-[var(--clr-teal)] group-hover:translate-x-1 transition-all"
                  />
                </button>
              ))}
            </div>
          </section>

          <p className="flex items-start gap-2 text-[11px] text-[var(--clr-text-muted)] font-medium px-2 leading-relaxed">
            <BookOpen size={14} className="shrink-0 mt-0.5 text-[var(--clr-teal)] opacity-60" />
            This workspace uses public metadata. It does not reproduce standards full text.
          </p>
        </div>
      </div>
    </div>
  );
}
