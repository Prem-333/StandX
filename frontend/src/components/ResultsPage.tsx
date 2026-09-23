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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <span className="section-label block mb-2">Specification Review</span>
          <h1 className="text-headline-xl text-on-surface font-extrabold tracking-tight mb-1.5">
            Recommendations
          </h1>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Review standards, requirements, and the evidence behind each match.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto shrink-0">
          <button
            className="btn-secondary interactive-btn inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold"
            onClick={onDownload}
          >
            <Download size={13} /> Export evidence
          </button>
          <div className="flex items-center gap-2">
            <span className="chip-teal text-[11px] font-bold px-3 py-1 rounded-full">
              {report.primary_standards.length} candidate{report.primary_standards.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Back */}
      <button
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary font-semibold text-[13px] transition-colors mb-5"
        onClick={onBack}
      >
        <ArrowLeft size={14} /> Edit specification
      </button>

      {/* Demo warning */}
      {report.synthetic_enabled && (
        <div className="flex items-center gap-3 text-[13px] mb-5 status-banner-warn px-4 py-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black chip-amber">DEMO WORKSPACE</span>
          <span className="text-amber-700">Mock / synthetic results enabled. Fixtures have no legal effect.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Results ── */}
        <div className="space-y-4">
          {/* Status banner */}
          <div
            className={`flex gap-3 p-4 sm:p-5 ${isReview ? 'status-banner-warn' : 'status-banner-success'}`}
            role="status"
          >
            <ShieldCheck
              size={20}
              className="shrink-0 opacity-80 mt-0.5"
              style={{ color: isReview ? 'var(--amber)' : 'var(--forest)' }}
            />
            <div>
              <strong
                className="block text-[15px] font-bold mb-1"
                style={{ color: isReview ? 'var(--amber)' : 'var(--forest)' }}
              >
                {isReview ? 'Human review required' : 'Evidence-backed starting point'}
              </strong>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">{report.message}</p>
              <p className="text-[10px] mt-2.5 text-on-surface-variant font-bold uppercase tracking-widest opacity-70">
                All candidates require officer review; a score does not establish legal applicability.
              </p>
            </div>
          </div>

          {/* Cards or empty state */}
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
            <section className="card p-12 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-surface-container-low border border-surface-container">
                <Search size={24} className="text-outline opacity-50" />
              </div>
              <h2 className="text-headline-md text-on-surface font-bold mb-1.5">No candidates to show</h2>
              <p className="text-[13px] text-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
                The local knowledge base did not produce a match. Try a product name, material, or a known IS number.
              </p>
              <button
                className="btn-primary interactive-btn inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-[13px] font-bold"
                onClick={onBack}
              >
                Revise specification
              </button>
            </section>
          )}
        </div>

        {/* ── Aside ── */}
        <aside className="flex flex-col gap-4 sticky top-20">
          {/* Query panel */}
          <section className="card p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-on-surface mb-3">
              <FileText size={13} className="text-secondary" /> Your specification
            </h2>
            <div className="p-3 rounded-xl border border-surface-container bg-surface-container-low">
              <p
                className="text-[12px] leading-relaxed text-on-surface-variant max-h-[160px] overflow-y-auto whitespace-pre-wrap break-words"
                lang={report.normalization.detected_language === 'hi' ? 'hi' : undefined}
              >
                {report.query_text}
              </p>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <Globe2 size={11} className="text-outline" />
              {report.normalization.detected_language} · {titleCase(report.normalization.status)}
            </div>

            {report.normalization.normalized_text !== report.query_text && (
              <>
                <h3 className="section-label mt-4 mb-2">Used for retrieval</h3>
                <div className="p-3 rounded-xl border border-surface-container bg-surface-container-low">
                  <p className="text-[11px] text-on-surface-variant whitespace-pre-wrap">
                    {report.normalization.normalized_text || 'No English terms available.'}
                  </p>
                </div>
              </>
            )}

            {report.normalization.notices.length > 0 && (
              <div className="mt-3 space-y-2">
                {report.normalization.notices.map((notice, i) => (
                  <p key={i} className="status-banner-warn text-amber-700 text-[11px] p-3 leading-relaxed flex gap-1.5">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5" /> {notice}
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* Category rules */}
          <section className="card p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-on-surface mb-1">
              <ShieldCheck size={13} className="text-secondary" /> Category rules
            </h2>
            <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
              Dated mappings from the shortlisted records and any category you supplied.
            </p>
            <Certification rules={report.certification_requirements} />
          </section>

          {/* Coverage warnings */}
          {report.extraction && (report.extraction.manual_review_clauses.length > 0 || report.extraction.omitted_phrases.length > 0) && (
            <section className="card p-4 status-banner-warn border-amber-300">
              <h2 className="flex items-center gap-2 text-[13px] font-bold mb-1.5 text-amber-700">
                <AlertTriangle size={13} /> Coverage needs review
              </h2>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                Some clauses could not be resolved or exceeded the extraction limit.
              </p>
              <details className="mt-3 group/unhandled">
                <summary className="inline-block text-amber-700 text-[11px] font-bold cursor-pointer list-none hover:opacity-80">
                  View unhandled clauses ↓
                </summary>
                <pre className="json-block mt-2">{JSON.stringify(report.extraction, null, 2)}</pre>
              </details>
            </section>
          )}

          {/* Evidence trail */}
          <section className="card p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-on-surface mb-1">
              <Link2 size={13} className="text-secondary" /> Evidence trail saved
            </h2>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
              Input, scores, source records, and rule snapshots are recorded for review.
            </p>
            <code className="block rounded-lg px-3 py-2 text-[10px] font-mono break-all border border-surface-container bg-surface-container-low text-secondary">
              {report.recommendation_id}
            </code>
            <button
              className="btn-secondary interactive-btn mt-3 flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-[13px] font-semibold"
              onClick={onDownload}
            >
              <Download size={13} /> Download full JSON
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
