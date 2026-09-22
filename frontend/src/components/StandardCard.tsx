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

  const scoreColor =
    scorePercent >= 80
      ? 'var(--clr-teal)'
      : scorePercent >= 55
      ? 'var(--clr-indigo)'
      : 'var(--clr-saffron)';

  return (
    <article
      className="glass-card hover-card flex flex-col animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
      aria-label={`Recommendation ${index + 1}: ${item.is_number}`}
    >
      <div className="p-6 sm:p-8 flex-1">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black font-mono"
              style={{
                background: `rgba(0,196,160,0.12)`,
                color: 'var(--clr-teal)',
                border: '1px solid rgba(0,196,160,0.25)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--clr-text)] tracking-tight font-display gradient-text-teal">
              {item.is_number}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:ml-1">
              <Provenance source={item.source} />
              <VersionBadge version={version} source={item.source} />
              {!item.meets_confidence_threshold && (
                <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold chip-amber">
                  Human review required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Title ── */}
        <p className="text-[15px] leading-relaxed text-[var(--clr-text-dim)] font-medium mb-6 max-w-3xl">
          {item.title}
        </p>

        {/* ── Warnings ── */}
        {item.warnings.map((w) => (
          <div
            key={w.code}
            className="flex gap-3 status-banner-error text-[var(--clr-red)] text-[13px] p-4 mb-6"
            role="alert"
          >
            <AlertTriangle size={17} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{w.message}</p>
          </div>
        ))}

        {/* ── Score ── */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: 'rgba(7,13,26,0.5)',
            border: '1px solid var(--clr-border)',
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[10px] font-bold text-[var(--clr-text-muted)] uppercase tracking-widest">
              {exact ? 'Exact identifier match' : 'Relevance Score'}
            </span>
            <div className="flex-1 h-2 score-track max-w-[200px] ml-auto">
              <div
                className="score-fill h-full"
                style={{ width: `${scorePercent}%`, boxShadow: `0 0 12px ${scoreColor}40` }}
              />
            </div>
            <strong className="text-sm font-black w-10 text-right" style={{ color: scoreColor }}>
              {scorePercent}%
            </strong>
          </div>
          <p className="text-[11px] text-[var(--clr-text-muted)]">
            {exact
              ? 'Identity match only; applicability is not confirmed.'
              : 'Uncalibrated relevance score, not probability of correctness.'}
          </p>
          <div className="mt-5 pt-5 border-t border-[var(--clr-border)] text-[13px] text-[var(--clr-text-dim)] leading-relaxed">
            <p className="max-w-3xl">{item.rationale}</p>
            {(item.matched_phrases?.length ?? 0) > 0 && (
              <p className="text-[11px] text-[var(--clr-text-muted)] mt-4 font-medium bg-[var(--clr-bg)] px-3 py-2 rounded-lg border border-[var(--clr-border)] inline-block">
                Matched phrases:{' '}
                <span className="text-[var(--clr-teal)]">
                  {item.matched_phrases?.map((p) => p.phrase).join(' · ')}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ── Certification + Allied ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mt-8">
          <div>
            <h3 className="flex items-center gap-2 section-label mb-5 pb-3 border-b border-[var(--clr-border)]">
              <ShieldCheck size={13} /> Certification
            </h3>
            <Certification rules={item.certification_requirements} />
            {synthetic(item.source) &&
              item.certification?.schemes.map((s) => (
                <p
                  key={s.id}
                  className="mt-4 text-[11px] font-medium chip-amber px-3 py-2 rounded-xl"
                >
                  MOCK / SYNTHETIC: {s.name} · {s.requirement} in fixture only. No legal effect.
                </p>
              ))}
          </div>
          <div>
            <h3 className="flex items-center gap-2 section-label mb-5 pb-3 border-b border-[var(--clr-border)]">
              <Layers3 size={13} /> Allied Standards
            </h3>
            <AlliedGroups groups={item.allied_standards} />
          </div>
        </div>

        {/* ── Evidence trail ── */}
        <details className="group/evidence mt-10 pt-6 border-t border-[var(--clr-border)]">
          <summary className="inline-flex items-center gap-2 text-xs font-bold text-[var(--clr-text-dim)] hover:text-[var(--clr-teal)] transition-colors cursor-pointer list-none bg-[var(--clr-bg-2)] px-4 py-2.5 rounded-xl border border-[var(--clr-border)] hover:border-[var(--clr-teal)]/30">
            <Link2 size={13} className="text-[var(--clr-teal)]" />
            Evidence & version history
            <ChevronDown
              size={13}
              className="ml-1 group-open/evidence:rotate-180 transition-transform duration-200"
            />
          </summary>
          <div className="pl-1 mt-4 animate-fade-in">
            <EvidenceList items={item.evidence} />
            <div
              className="flex flex-wrap gap-6 text-xs mt-6 p-5 rounded-xl border border-[var(--clr-border)]"
              style={{ background: 'rgba(7,13,26,0.4)' }}
            >
              <div>
                <dt className="text-[var(--clr-text-muted)] mb-1 font-medium">Amendments reported</dt>
                <dd className="font-bold text-[var(--clr-teal)] text-[13px]">
                  {version.amendments_reported ?? 'Unknown'}
                </dd>
              </div>
              <div className="w-px bg-[var(--clr-border)] hidden sm:block" />
              <div>
                <dt className="text-[var(--clr-text-muted)] mb-1 font-medium">Unresolved amendments</dt>
                <dd className="font-bold text-[var(--clr-teal)] text-[13px]">
                  {version.unresolved_amendments ?? 'Unknown'}
                </dd>
              </div>
            </div>
            {version.supersession_path && version.supersession_path.length > 1 && (
              <p className="text-[11px] text-[var(--clr-text-muted)] font-medium break-words mt-4 px-2">
                Supersession chain:{' '}
                <span className="text-[var(--clr-teal)]">
                  {version.supersession_path.join(' → ')}
                </span>
              </p>
            )}
          </div>
        </details>
      </div>

      <Feedback item={item} reportId={reportId} apiKey={apiKey} />
    </article>
  );
}
