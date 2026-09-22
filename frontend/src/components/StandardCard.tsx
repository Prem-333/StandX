import { AlertTriangle, ShieldCheck, Layers3, Link2, ChevronDown } from 'lucide-react';
import type { Standard } from '../types';
import { Provenance, EvidenceList, synthetic } from './shared/EvidenceList';
import { VersionBadge } from './shared/VersionBadge';
import { Certification } from './shared/Certification';
import { AlliedGroups } from './shared/AlliedGroups';
import { Feedback } from './Feedback';

interface StandardCardProps {
  item: Standard;
  index: number;
  reportId: string;
  apiKey: string;
}

export function StandardCard({ item, index, reportId, apiKey }: StandardCardProps) {
  const version = item.version_status;
  const exact = item.confidence_basis === 'identifier_identity_only';
  const scorePercent = Math.round(Math.max(0, Math.min(100, item.score * 100)));
  const scoreColor = scorePercent >= 80 ? 'var(--clr-teal)' : scorePercent >= 55 ? 'var(--clr-indigo)' : 'var(--clr-amber)';

  return (
    <article
      className="card card-hover flex flex-col animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
      aria-label={`Recommendation ${index + 1}: ${item.is_number}`}
    >
      <div className="p-6 sm:p-7 flex-1">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Index badge */}
            <span className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black font-mono bg-[var(--clr-teal-light)] text-[var(--clr-teal-dark)] flex-shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--clr-text)] tracking-tight">
              {item.is_number}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <Provenance source={item.source} />
              <VersionBadge version={version} source={item.source} />
              {!item.meets_confidence_threshold && (
                <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold chip-amber">
                  Human review required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Title ── */}
        <p className="text-[14px] leading-relaxed text-[var(--clr-text-dim)] mb-5 max-w-3xl">{item.title}</p>

        {/* ── Warnings ── */}
        {item.warnings.map((w) => (
          <div key={w.code} className="flex gap-2.5 status-banner-error text-[var(--clr-red)] text-[13px] p-4 mb-5" role="alert">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{w.message}</p>
          </div>
        ))}

        {/* ── Score panel ── */}
        <div className="rounded-xl p-4 mb-7 border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              {exact ? 'Exact identifier match' : 'Relevance Score'}
            </span>
            <div className="score-track h-2 flex-1 max-w-[180px] ml-auto">
              <div className="score-fill h-full" style={{ width: `${scorePercent}%` }} />
            </div>
            <strong className="text-sm font-black w-9 text-right tabular-nums" style={{ color: scoreColor }}>
              {scorePercent}%
            </strong>
          </div>
          <p className="text-[11px] text-[var(--clr-text-muted)] mb-4">
            {exact ? 'Identity match only; applicability is not confirmed.' : 'Uncalibrated relevance score, not probability of correctness.'}
          </p>
          <div className="pt-4 border-t border-[var(--clr-border)] text-[13px] text-[var(--clr-text-dim)] leading-relaxed">
            <p className="max-w-3xl">{item.rationale}</p>
            {(item.matched_phrases?.length ?? 0) > 0 && (
              <p className="text-[11px] text-[var(--clr-text-muted)] mt-3 font-medium bg-[var(--clr-bg-2)] px-2.5 py-1.5 rounded-lg border border-[var(--clr-border)] inline-block">
                Matched:{' '}
                <span className="text-[var(--clr-teal)] font-bold">
                  {item.matched_phrases?.map((p) => p.phrase).join(' · ')}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ── Certification + Allied ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-6">
          <div>
            <h3 className="flex items-center gap-2 section-label mb-4 pb-2.5 border-b border-[var(--clr-border)]">
              <ShieldCheck size={12} className="text-[var(--clr-teal)]" /> Certification
            </h3>
            <Certification rules={item.certification_requirements} />
            {synthetic(item.source) &&
              item.certification?.schemes.map((s) => (
                <p key={s.id} className="mt-3 text-[11px] chip-amber px-3 py-2 rounded-lg inline-block">
                  MOCK / SYNTHETIC: {s.name} · {s.requirement} in fixture only. No legal effect.
                </p>
              ))}
          </div>
          <div>
            <h3 className="flex items-center gap-2 section-label mb-4 pb-2.5 border-b border-[var(--clr-border)]">
              <Layers3 size={12} className="text-[var(--clr-teal)]" /> Allied Standards
            </h3>
            <AlliedGroups groups={item.allied_standards} />
          </div>
        </div>

        {/* ── Evidence ── */}
        <details className="group/evidence mt-8 pt-5 border-t border-[var(--clr-border)]">
          <summary className="inline-flex items-center gap-2 text-xs font-bold text-[var(--clr-text-muted)] hover:text-[var(--clr-teal)] transition-colors cursor-pointer list-none bg-[var(--clr-bg-3)] px-3.5 py-2 rounded-lg border border-[var(--clr-border)] hover:border-[var(--clr-teal)]">
            <Link2 size={12} className="text-[var(--clr-teal)]" />
            Evidence & version history
            <ChevronDown size={12} className="ml-1 group-open/evidence:rotate-180 transition-transform duration-200" />
          </summary>
          <div className="pl-1 mt-3 animate-fade-in">
            <EvidenceList items={item.evidence} />
            <div className="flex flex-wrap gap-5 text-xs mt-5 p-4 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-3)]">
              <div>
                <dt className="text-[var(--clr-text-muted)] mb-1">Amendments reported</dt>
                <dd className="font-bold text-[var(--clr-teal)]">{version.amendments_reported ?? 'Unknown'}</dd>
              </div>
              <div className="w-px bg-[var(--clr-border)] hidden sm:block" />
              <div>
                <dt className="text-[var(--clr-text-muted)] mb-1">Unresolved amendments</dt>
                <dd className="font-bold text-[var(--clr-teal)]">{version.unresolved_amendments ?? 'Unknown'}</dd>
              </div>
            </div>
            {version.supersession_path && version.supersession_path.length > 1 && (
              <p className="text-[11px] text-[var(--clr-text-muted)] break-words mt-3 px-1">
                Supersession chain: <span className="text-[var(--clr-teal)] font-semibold">{version.supersession_path.join(' → ')}</span>
              </p>
            )}
          </div>
        </details>
      </div>

      <Feedback item={item} reportId={reportId} apiKey={apiKey} />
    </article>
  );
}
