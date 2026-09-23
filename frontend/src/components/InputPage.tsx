import { useState, useRef } from "react";
import {
  Upload,
  ArrowRight,
  Search,
  FileText,
  X,
  ShieldCheck,
} from "lucide-react";
import { request } from "../api";
import type { Report, Language } from "../types";

export function InputPage({
  apiKey,
  demo,
  onResult,
}: {
  apiKey: string;
  demo: boolean;
  onResult: (r: Report) => void;
}) {
  const [query, setQuery] = useState(""),
    [lang, setLang] = useState<Language>("en");
  const [tender, setTender] = useState(false),
    [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  function choose(f?: File) {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name)) {
      setError("Choose a PDF or DOCX document.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("This file exceeds the 5 MiB upload limit.");
      return;
    }
    if (!f.size) {
      setError("This file is empty.");
      return;
    }
    setError("");
    setFile(f);
  }
  function remove() {
    setFile(null);
    if (picker.current) picker.current.value = "";
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || (!file && !query.trim())) return;
    setBusy(true);
    setError("");
    try {
      let body: FormData | string;
      if (file) {
        body = new FormData();
        body.append("file", file);
        body.append("language_hint", lang);
        body.append("top_k", "5");
        if (category) body.append("product_category", category);
      } else
        body = JSON.stringify({
          text: query.trim(),
          language_hint: lang,
          tender: tender || query.length > 12000,
          top_k: 5,
          ...(category ? { product_category: category } : {}),
        });
      onResult(
        await request<Report>("/v1/recommend", apiKey, {
          method: "POST",
          body,
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process specification.",
      );
    } finally {
      setBusy(false);
    }
  }
  const samples = [
    { label: "Bright steel bars", text: "Bright steel bars for fabrication." },
    {
      label: "Wooden bedside tables",
      text: "Supply wooden bedside tables for hospital wards.",
    },
    {
      label: "Industrial eye protection",
      text: "Eye protectors for industrial workers.",
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">
          Procurement workspace · Step 1 of 2
        </span>
        <h1 className="text-headline-xl text-on-surface mt-2">
          New specification
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          Turn procurement requirements into a shortlist you can inspect. Every
          match links to its source record.
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <form
          onSubmit={submit}
          className="glass-panel rounded-xl p-5 sm:p-7 space-y-6"
          aria-busy={busy}
        >
          <fieldset disabled={busy} className="space-y-6 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="specification"
                className="font-bold text-on-surface"
              >
                What are you procuring?
              </label>
              <div
                aria-label="Input language"
                className="flex rounded-lg bg-surface-container-low p-1 gap-1"
              >
                {(["en", "hi", "hi-Latn"] as const).map((l) => (
                  <button
                    type="button"
                    key={l}
                    aria-pressed={lang === l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-md text-sm focus-ring ${lang === l ? "bg-surface-container-lowest text-secondary shadow-sm font-bold" : "text-on-surface-variant"}`}
                  >
                    {l === "en"
                      ? "English"
                      : l === "hi"
                        ? "हिन्दी"
                        : "Hinglish"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-bright overflow-hidden focus-within:ring-2 focus-within:ring-secondary">
              <textarea
                id="specification"
                disabled={!!file}
                lang={lang === "hi" ? "hi" : "en"}
                maxLength={100000}
                rows={9}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? "उत्पाद, सामग्री और उपयोग का विवरण लिखें…"
                    : lang === "hi-Latn"
                      ? "Product, material aur intended use yahan likhein…"
                      : "Describe the product, material and intended use, or enter an IS number from the knowledge base…"
                }
                className="w-full bg-transparent p-4 text-on-surface resize-y focus:outline-none disabled:opacity-50"
              />
              <div className="flex justify-between gap-2 px-4 py-2 text-xs text-on-surface-variant border-t border-surface-container">
                <span>
                  {file
                    ? "Document will be read by the local API"
                    : "Public metadata matching"}
                </span>
                <span>{query.length.toLocaleString()} / 100,000</span>
              </div>
            </div>
            <label className="flex gap-3 items-start text-sm text-on-surface">
              <input
                type="checkbox"
                checked={tender}
                onChange={(e) => setTender(e.target.checked)}
                className="mt-1 accent-secondary"
              />
              <span>
                <strong>Multi-product tender</strong>
                <span className="block text-on-surface-variant">
                  Extract product phrases and show clauses that still need
                  review.
                </span>
              </span>
            </label>
            <div
              className="dropzone rounded-xl border-2 border-dashed border-outline-variant p-6 text-center bg-surface-container-low/60"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy) choose(e.dataTransfer.files[0]);
              }}
            >
              <Upload size={26} className="mx-auto text-secondary mb-3" />
              <p className="font-semibold text-on-surface">
                Drop a tender PDF or DOCX
              </p>
              <p className="text-sm text-on-surface-variant mt-1 mb-3">
                Up to 5 MiB. Text-based documents; scanned pages require OCR
                before upload.
              </p>
              <label className="btn-secondary inline-block rounded-lg px-4 py-2 cursor-pointer">
                Choose document
                <input
                  ref={picker}
                  aria-label="Upload tender document"
                  type="file"
                  accept=".pdf,.docx"
                  className="sr-only"
                  onChange={(e) => choose(e.target.files?.[0])}
                />
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-3 min-w-0 text-sm">
                  <FileText size={16} className="shrink-0" />
                  <span className="break-all">{file.name}</span>
                  <button
                    type="button"
                    aria-label="Remove uploaded file"
                    className="p-2 focus-ring"
                    onClick={remove}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <details className="rounded-lg bg-surface-container-low p-4">
              <summary className="cursor-pointer font-semibold text-sm">
                Certification scope (optional)
              </summary>
              <label className="block mt-4 text-sm">
                Product category — officer supplied
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full mt-2 p-2 rounded border border-outline-variant bg-surface-container-lowest"
                >
                  <option value="">Infer only from cited KB mappings</option>
                  <option value="bright_steel_bars">Bright steel bars</option>
                  <option value="laptop_notebook_tablet">
                    Laptops, notebooks and tablets
                  </option>
                  <option value="gold_jewellery_artefacts">
                    Gold jewellery and artefacts
                  </option>
                  <option value="silver_jewellery_artefacts">
                    Silver jewellery and artefacts
                  </option>
                </select>
              </label>
              <p className="text-xs text-on-surface-variant mt-3">
                A category selection is your assertion. Scope, dates and
                exemptions still require human review.
              </p>
            </details>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                className="btn-secondary rounded-lg px-4 py-3"
                onClick={() => {
                  setQuery("");
                  remove();
                  setCategory("");
                  setTender(false);
                  setError("");
                }}
              >
                Reset form
              </button>
              <button
                type="submit"
                disabled={busy || (!file && !query.trim())}
                className="glow-button rounded-lg px-5 py-3 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Finding standards…" : "Find Applicable Standards"}
                <ArrowRight size={16} />
              </button>
            </div>
          </fieldset>
          {busy && (
            <div
              role="status"
              className="rounded-lg bg-secondary/10 p-4 text-sm text-on-surface"
            >
              <span className="inline-block w-2 h-2 bg-secondary rounded-full mr-2 motion-safe:animate-pulse" />
              Reading your specification, retrieving metadata and saving the
              evidence trail. Local processing may take a moment.
            </div>
          )}
          {error && (
            <p role="alert" className="status-banner-error p-4 break-words">
              {error}
            </p>
          )}
        </form>
        <aside className="space-y-4">
          <section className="card p-5">
            <Search size={20} className="text-secondary mb-3" />
            <h2 className="font-bold mb-2">Start with a sample</h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Example procurement requests. These are prompts, not verified
              technical specifications.
            </p>
            <div className="space-y-2">
              {samples.map((s) => (
                <button
                  key={s.label}
                  disabled={busy}
                  type="button"
                  onClick={() => {
                    remove();
                    setQuery(s.text);
                  }}
                  className="btn-secondary w-full text-left rounded-lg p-3 text-sm"
                >
                  {s.label}
                  <ArrowRight size={14} className="float-right mt-1" />
                </button>
              ))}
              {demo && (
                <button
                  disabled={busy}
                  type="button"
                  onClick={() => {
                    remove();
                    setQuery("IS-SEED-1001:2020");
                  }}
                  className="w-full text-left p-3 rounded-lg chip-amber text-sm"
                >
                  MOCK / SYNTHETIC supersession example
                </button>
              )}
            </div>
          </section>
          <section className="card p-5">
            <ShieldCheck size={20} className="text-secondary mb-3" />
            <h2 className="font-bold mb-2">Evidence before conclusions</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The current knowledge base is a limited metadata sample. Unknown
              revision status stays unknown. Relevance scores do not establish
              certification or legal applicability.
            </p>
            <p className="text-xs mt-4 text-on-surface-variant">
              No external embedding or translation API is used. Review source
              dates before relying on a result.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
