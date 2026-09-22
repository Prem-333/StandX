import { ArrowLeft, Download, ShieldCheck, Globe2, AlertTriangle, Search, Link2, FileText } from 'lucide-react';
import type { Report } from '../types';
import { StandardCard } from './StandardCard';
import { Certification } from './shared/Certification';

interface ResultsPageProps {
  report: Report;
  apiKey: string;
  onBack: () => void;
  onDownload: () => void;
}

const titleCase = (text: string) => text.replaceAll('_', ' ');

export function ResultsPage({ report, apiKey, onBack, onDownload }: ResultsPageProps) {
  const isReview = report.status.includes('review') || report.status === 'ambiguous';

  return (
    <div className="animate-slide-up">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <p className="section-label mb-2">Specification Review</p>
          <h1 className="text-3xl sm:text-[38px] font-black text-[var(--clr-text)] tracking-tight leading-tight mb-2">
            Recommendations
          </h1>
          <p className="text-[15px] text-[var(--clr-text-muted)] leading-relaxed">
            Review standards, requirements, and the evidence behind each match.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto">
          <button className="btn-secondary interactive-btn inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold" onClick={onDownload}>
            <Download size={14} /> Export evidence
          </button>
          <div className="flex items-center gap-2">
            <span className="chip-teal text-xs font-bold px-3 py-1 rounded-full">
              {report.primary_standards.length} candidate{report.primary_standards.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Back */}
      <button className="inline-flex items-center gap-2 text-[var(--clr-text-muted)] hover:text-[var(--clr-teal)] font-semibold text-[13px] transition-colors mb-5" onClick={onBack}>
        <ArrowLeft size={14} /> Edit specification
      </button>

      {/* Demo warning */}
      {report.synthetic_enabled && (
        <div className="flex items-center gap-3 text-[13px] mb-6 status-banner-warn px-4 py-3.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black chip-amber">DEMO WORKSPACE</span>
          <span className="text-[var(--clr-amber)]">Mock / synthetic results enabled. Fixtures have no legal effect.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-7 items-start">
        {/* ── Results ── */}
        <div className="space-y-5">
          {/* Status banner */}
          <div className={`flex gap-3 p-5 sm:p-6 ${isReview ? 'status-banner-warn' : 'status-banner-success'}`} role="status">
            <ShieldCheck size={24} className="shrink-0 opacity-80" style={{ color: isReview ? 'var(--clr-amber)' : 'var(--clr-teal)' }} />
            <div>
              <strong className="block text-[16px] font-bold mb-1.5" style={{ color: isReview ? 'var(--clr-amber)' : 'var(--clr-teal)' }}>
                {isReview ? 'Human review required' : 'Evidence-backed starting point'}
              </strong>
              <p className="text-[13px] leading-relaxed text-[var(--clr-text-dim)]">{report.message}</p>
              <p className="text-[10px] mt-3 text-[var(--clr-text-muted)] font-bold uppercase tracking-widest">
                All candidates require officer review; a score does not establish legal applicability.
              </p>
            </div>
          </div>

          {/* Cards or empty state */}
          {report.primary_standards.length ? (
            report.primary_standards.map((item, i) => (
              <StandardCard key={`${report.recommendation_id}-${item.record_id}`} item={item} index={i} reportId={report.recommendation_id} apiKey={apiKey} />
            ))
          ) : (
            <section className="card p-14 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[var(--clr-bg-3)] border border-[var(--clr-border)]">
                <Search size={28} className="text-[var(--clr-slate)] opacity-50" />
              </div>
              <h2 className="text-xl font-black text-[var(--clr-text)] mb-2">No candidates to show</h2>
              <p className="text-[13px] text-[var(--clr-text-muted)] max-w-sm mx-auto mb-8 leading-relaxed">
                The local knowledge base did not produce a match. Try a product name, material, or a known IS number.
              </p>
              <button className="btn-primary interactive-btn inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold" onClick={onBack}>
                Revise specification
              </button>
            </section>
          )}
        </div>

        {/* ── Aside ── */}
        <aside className="flex flex-col gap-5 sticky top-20">
          {/* Query panel */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--clr-text)] mb-3">
              <FileText size={14} className="text-[var(--clr-teal)]" /> Your specification
            </h2>
            <div className="p-3.5 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
              <p className="text-[13px] leading-relaxed text-[var(--clr-text-dim)] max-h-[180px] overflow-y-auto whitespace-pre-wrap break-words original-text" lang={report.normalization.detected_language === 'hi' ? 'hi' : undefined}>
                {report.query_text}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              <Globe2 size={12} className="text-[var(--clr-slate)]" />
              {report.normalization.detected_language} · {titleCase(report.normalization.status)}
            </div>

            {report.normalization.normalized_text !== report.query_text && (
              <>
                <h3 className="section-label mt-4 mb-2">Used for retrieval</h3>
                <div className="p-3 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
                  <p className="text-[11px] text-[var(--clr-text-muted)] whitespace-pre-wrap">
                    {report.normalization.normalized_text || 'No English terms available.'}
                  </p>
                </div>
              </>
            )}

            {report.normalization.notices.length > 0 && (
              <div className="mt-3 space-y-2">
                {report.normalization.notices.map((notice, i) => (
                  <p key={i} className="status-banner-warn text-[var(--clr-amber)] text-[11px] p-3 leading-relaxed flex gap-1.5">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {notice}
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* Category rules */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--clr-text)] mb-1">
              <ShieldCheck size={14} className="text-[var(--clr-teal)]" /> Category rules
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] mb-4 leading-relaxed">Dated mappings from the shortlisted records and any category you supplied.</p>
            <Certification rules={report.certification_requirements} />
          </section>

          {/* Coverage warnings */}
          {report.extraction && (report.extraction.manual_review_clauses.length > 0 || report.extraction.omitted_phrases.length > 0) && (
            <section className="card p-5 status-banner-warn border-[#fcd34d]">
              <h2 className="flex items-center gap-2 text-[13px] font-bold mb-2 text-[var(--clr-amber)]">
                <AlertTriangle size={14} /> Coverage needs review
              </h2>
              <p className="text-[12px] text-[var(--clr-text-dim)] leading-relaxed">Some clauses could not be resolved or exceeded the extraction limit.</p>
              <details className="mt-4 group/unhandled">
                <summary className="inline-block text-[var(--clr-amber)] text-xs font-bold cursor-pointer list-none hover:opacity-80">View unhandled clauses ↓</summary>
                <pre className="json-block mt-3">{JSON.stringify(report.extraction, null, 2)}</pre>
              </details>
            </section>
          )}

          {/* Evidence trail */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--clr-text)] mb-1.5">
              <Link2 size={14} className="text-[var(--clr-teal)]" /> Evidence trail saved
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] leading-relaxed mb-3">Input, scores, source records, and rule snapshots are recorded for review.</p>
            <code className="block rounded-lg px-3 py-2.5 text-[10px] font-mono break-all border border-[var(--clr-border)] bg-[var(--clr-bg-3)] text-[var(--clr-teal)]">
              {report.recommendation_id}
            </code>
            <button className="btn-secondary interactive-btn mt-3 flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-[13px] font-semibold" onClick={onDownload}>
              <Download size={14} /> Download full JSON
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
