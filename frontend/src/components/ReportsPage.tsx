import type { Report } from "../types";
import { Provenance } from "./shared/EvidenceList";
export function ReportsPage({
  report,
  onDownload,
  onReview,
}: {
  report: Report | null;
  onDownload: () => void;
  onReview: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Review and export</span>
        <h1 className="text-headline-xl mt-2">Evidence report</h1>
        <p className="mt-2 text-on-surface-variant">
          An export of retrieved metadata and recorded decisions for human
          review. This is not a compliance certificate.
        </p>
      </div>
      {!report ? (
        <section className="card p-8">
          <h2 className="font-bold text-lg">No report selected</h2>
          <p className="mt-2 text-on-surface-variant">
            Run a specification or open a saved request from Audit history.
          </p>
        </section>
      ) : (
        <>
          <section className="card p-6 space-y-4">
            <div className="flex flex-wrap gap-3 justify-between">
              <h2 className="font-bold text-lg">Current report</h2>
              <time className="text-sm text-on-surface-variant">
                {new Date(report.timestamp).toLocaleString()}
              </time>
            </div>
            <p className="whitespace-pre-wrap break-words max-h-48 overflow-auto">
              {report.query_text}
            </p>
            <p className="text-sm text-on-surface-variant">{report.message}</p>
            <div className="flex flex-wrap gap-3">
              <button
                className="btn-primary rounded-lg px-5 py-3"
                onClick={onDownload}
              >
                Export evidence JSON
              </button>
              <button
                className="btn-secondary rounded-lg px-5 py-3"
                onClick={onReview}
              >
                Review recommendations
              </button>
            </div>
          </section>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ["Candidates", report.primary_standards.length],
              [
                "Synthetic candidates",
                report.primary_standards.filter(
                  (r) => r.source === "synthetic_seed",
                ).length,
              ],
              [
                "Version warnings",
                report.primary_standards.reduce(
                  (n, r) => n + r.warnings.length,
                  0,
                ),
              ],
            ].map(([label, n]) => (
              <div className="card p-5" key={label}>
                <span className="text-sm text-on-surface-variant">{label}</span>
                <strong className="block text-3xl mt-2">{n}</strong>
              </div>
            ))}
          </div>
          <section className="card p-6">
            <h2 className="font-bold mb-4">Referenced standards</h2>
            {report.primary_standards.map((r) => (
              <div
                key={r.record_id}
                className="py-3 border-t border-surface-container"
              >
                <div className="flex flex-wrap gap-2">
                  <strong>{r.is_number}</strong>
                  <Provenance source={r.source} />
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  {r.title}
                </p>
              </div>
            ))}
            <dl className="text-xs text-on-surface-variant mt-5 space-y-2">
              <dt>Audit record ID</dt>
              <dd className="font-mono break-all">
                {report.recommendation_id}
              </dd>
              <dt>Knowledge base snapshot fingerprint</dt>
              <dd className="font-mono break-all">{report.kb_fingerprint}</dd>
            </dl>
            <p className="text-xs text-on-surface-variant mt-4">
              The fingerprint identifies the KB snapshot; it is not a digital
              signature. Keep the full JSON for source and rule evidence.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
