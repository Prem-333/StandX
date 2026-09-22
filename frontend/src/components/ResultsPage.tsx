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
  const isReview =
    report.status.includes('review') || report.status === 'ambiguous';

  return (
    <div className="animate-slide-up">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Specification Review</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--clr-text)] tracking-tight leading-tight mb-3 font-display">
            Recommendations
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--clr-text-muted)] font-medium leading-relaxed">
            Review standards, related requirements, and the evidence behind each match.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 self-start sm:self-auto">
          <button
            className="btn-ghost interactive-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold"
            onClick={onDownload}
          >
            <Download size={15} />
            Export evidence
          </button>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(0,196,160,0.1)',
                border: '1px solid rgba(0,196,160,0.2)',
                color: 'var(--clr-teal)',
              }}
            >
              {report.primary_standards.length} candidate
              {report.primary_standards.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        className="inline-flex items-center gap-2 text-[var(--clr-text-muted)] hover:text-[var(--clr-teal)] font-bold text-[13px] transition-colors py-2 mb-6"
        onClick={onBack}
      >
        <ArrowLeft size={15} />
        Edit specification
      </button>

      {/* Demo warning */}
      {report.synthetic_enabled && (
        <div className="flex items-center gap-4 text-[13px] mb-7 status-banner-warn px-5 py-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest chip-amber">
            DEMO WORKSPACE
          </span>
          <span className="font-medium text-[var(--clr-saffron)]">
            Mock / synthetic results are enabled for this response. Fixtures have no legal effect.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 xl:gap-10 items-start">
        {/* ── Main results ── */}
        <div className="space-y-6">
          {/* Status banner */}
          <div
            className={`flex gap-4 p-6 sm:p-7 ${isReview ? 'status-banner-warn' : 'status-banner-success'}`}
            role="status"
          >
            <ShieldCheck
              size={26}
              className="shrink-0 opacity-80"
              style={{ color: isReview ? 'var(--clr-saffron)' : 'var(--clr-teal)' }}
            />
            <div>
              <strong
                className="block text-lg font-black mb-2 tracking-tight"
                style={{ color: isReview ? 'var(--clr-saffron)' : 'var(--clr-teal)' }}
              >
                {isReview ? 'Human review required' : 'Evidence-backed starting point'}
              </strong>
              <p className="text-[14px] leading-relaxed font-medium text-[var(--clr-text-dim)]">
                {report.message}
              </p>
              <p className="text-[10px] mt-4 text-[var(--clr-text-muted)] font-bold uppercase tracking-widest">
                All candidates require officer review; a score does not establish legal applicability.
              </p>
            </div>
          </div>

          {/* Results */}
          {report.primary_standards.length ? (
            report.primary_standards.map((item, i) => (
              <StandardCard
                key={`${report.recommendation_id}-${item.record_id}`}
                item={item}
                index={i}
                reportId={report.recommendation_id}
                apiKey={apiKey}
              />
            ))
          ) : (
            <section className="glass-card p-14 text-center flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-7"
                style={{ background: 'rgba(0,196,160,0.08)', border: '1px solid rgba(0,196,160,0.15)' }}
              >
                <Search size={34} className="text-[var(--clr-teal)] opacity-50" />
              </div>
              <h2 className="text-2xl font-black text-[var(--clr-text)] mb-3 tracking-tight font-display">
                No candidates to show
              </h2>
              <p className="text-[14px] text-[var(--clr-text-muted)] max-w-md mx-auto mb-9 leading-relaxed font-medium">
                The local knowledge base did not produce a match. Try a product name, material, or a known IS number.
              </p>
              <button
                className="btn-primary interactive-btn inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold"
                onClick={onBack}
              >
                Revise specification
              </button>
            </section>
          )}
        </div>

        {/* ── Aside ── */}
        <aside className="flex flex-col gap-6 sticky top-24">
          {/* Query panel */}
          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--clr-text)] mb-4">
              <FileText size={15} className="text-[var(--clr-teal)]" />
              Your specification
            </h2>
            <div
              className="p-4 rounded-xl border border-[var(--clr-border)]"
              style={{ background: 'rgba(7,13,26,0.5)' }}
            >
              <p
                className="text-[13px] leading-relaxed text-[var(--clr-text-dim)] font-medium max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words original-text"
                lang={report.normalization.detected_language === 'hi' ? 'hi' : undefined}
              >
                {report.query_text}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              <Globe2 size={13} className="text-[var(--clr-teal)] opacity-60" />
              {report.normalization.detected_language} · {titleCase(report.normalization.status)}
            </div>

            {report.normalization.normalized_text !== report.query_text && (
              <>
                <h3 className="section-label mt-5 mb-2">Used for retrieval</h3>
                <div
                  className="p-3 rounded-xl border border-[var(--clr-border)]"
                  style={{ background: 'rgba(7,13,26,0.4)' }}
                >
                  <p className="text-xs text-[var(--clr-text-muted)] whitespace-pre-wrap font-medium">
                    {report.normalization.normalized_text || 'No English terms available.'}
                  </p>
                </div>
              </>
            )}

            {report.normalization.notices.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {report.normalization.notices.map((notice, i) => (
                  <p
                    key={i}
                    className="status-banner-warn text-[var(--clr-saffron)] text-[11px] font-medium p-3 leading-relaxed flex gap-2"
                  >
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    {notice}
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* Category rules */}
          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--clr-text)] mb-1">
              <ShieldCheck size={15} className="text-[var(--clr-teal)]" />
              Category rules
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] mb-5 font-medium leading-relaxed">
              Dated mappings from the shortlisted records and any category you supplied.
            </p>
            <Certification rules={report.certification_requirements} />
          </section>

          {/* Coverage warnings */}
          {report.extraction &&
            (report.extraction.manual_review_clauses.length > 0 ||
              report.extraction.omitted_phrases.length > 0) && (
              <section className="glass-card p-6 status-banner-warn">
                <h2 className="flex items-center gap-2 text-[14px] font-bold mb-3" style={{ color: 'var(--clr-saffron)' }}>
                  <AlertTriangle size={15} />
                  Coverage needs review
                </h2>
                <p className="text-[13px] text-[var(--clr-text-dim)] leading-relaxed font-medium">
                  Some clauses could not be resolved or exceeded the extraction limit.
                </p>
                <details className="mt-5 group/unhandled">
                  <summary className="inline-block text-[var(--clr-saffron)] text-xs font-bold cursor-pointer list-none hover:opacity-80 chip-amber px-3 py-1.5 rounded-lg transition-colors">
                    View unhandled clauses
                  </summary>
                  <pre className="json-block mt-4">{JSON.stringify(report.extraction, null, 2)}</pre>
                </details>
              </section>
            )}

          {/* Evidence trail */}
          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--clr-text)] mb-2">
              <Link2 size={15} className="text-[var(--clr-teal)]" />
              Evidence trail saved
            </h2>
            <p className="text-[11px] text-[var(--clr-text-muted)] font-medium leading-relaxed mb-4">
              Original input, scores, source records, and rule snapshots are recorded for review.
            </p>
            <code
              className="block rounded-xl px-3 py-2.5 text-[10px] font-mono break-all"
              style={{ background: 'rgba(7,13,26,0.7)', border: '1px solid var(--clr-border)', color: 'var(--clr-teal)' }}
            >
              {report.recommendation_id}
            </code>
            <button
              className="btn-ghost interactive-btn mt-4 flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-[13px] font-bold"
              onClick={onDownload}
            >
              Download full JSON
              <Download size={15} className="text-[var(--clr-teal)]" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
