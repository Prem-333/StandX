import {
  AlertTriangle,
  ShieldCheck,
  Layers3,
  Link2,
  ChevronDown,
} from "lucide-react";
import type { Standard } from "../types";
import { Provenance, EvidenceList, synthetic } from "./shared/EvidenceList";
import { VersionBadge } from "./shared/VersionBadge";
import { Certification } from "./shared/Certification";
import { AlliedGroups } from "./shared/AlliedGroups";
import { Feedback } from "./Feedback";

interface StandardCardProps {
  item: Standard;
  index: number;
  reportId: string;
  apiKey: string;
  allowFeedback?: boolean;
}

export function StandardCard({
  item,
  index,
  reportId,
  apiKey,
  allowFeedback = true,
}: StandardCardProps) {
  const version = item.version_status;
  const exact = item.confidence_basis === "identifier_identity_only";
  const scorePercent = Math.round(Math.max(0, Math.min(100, item.score * 100)));
  const scoreColor =
    scorePercent >= 80 ? "#069669" : scorePercent >= 55 ? "#1d4ed8" : "#d97706";

  return (
    <article
      className="card card-hover flex flex-col animate-slide-up"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
        borderLeft: "3px solid #1d4ed8",
      }}
      aria-label={`Recommendation ${index + 1}: ${item.is_number}`}
    >
      <div className="p-5 sm:p-6 flex-1">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black font-mono text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
                boxShadow: "0 2px 8px rgba(30,58,95,0.2)",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-[24px] font-black text-on-surface tracking-tight">
              {item.is_number}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <Provenance source={item.source} />
              <VersionBadge version={version} source={item.source} />
              {!item.meets_confidence_threshold && (
                <span className="chip-amber inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold">
                  Human review required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <p className="text-[15px] leading-relaxed text-on-surface-variant mb-4 max-w-3xl">
          {item.title}
        </p>

        {/* Warnings */}
        {item.warnings.map((w) => (
          <div
            key={w.code}
            className="flex gap-2.5 status-banner-error text-[14px] p-3.5 mb-4"
            role="alert"
          >
            <AlertTriangle
              size={15}
              className="shrink-0 mt-0.5"
              style={{ color: "#ba1a1a" }}
            />
            <p className="leading-relaxed" style={{ color: "#ba1a1a" }}>
              {w.message}
            </p>
          </div>
        ))}

        {/* Score panel */}
        <div className="rounded-xl p-4 mb-6 border border-surface-container bg-surface-container-low/40">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              {exact ? "Exact identifier match" : "Relevance Score"}
            </span>
            <div className="score-track h-2 flex-1 max-w-[180px] ml-auto">
              <div
                className="score-fill h-full"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <strong
              className="text-[14px] font-black w-9 text-right tabular-nums"
              style={{ color: scoreColor }}
            >
              {scorePercent}%
            </strong>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-3">
            {exact
              ? "Identity match only; applicability is not confirmed."
              : "Uncalibrated relevance score, not probability of correctness."}
          </p>
          <div className="pt-3.5 border-t border-surface-container text-[14px] text-on-surface-variant leading-relaxed">
            <p className="max-w-3xl">{item.rationale}</p>
            {(item.matched_phrases?.length ?? 0) > 0 && (
              <p className="text-[12px] text-on-surface-variant mt-2.5 font-medium bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-surface-container inline-block">
                Matched:{" "}
                <span className="font-bold text-secondary">
                  {item.matched_phrases?.map((p) => p.phrase).join(" · ")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Certification + Allied */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          <div>
            <h3 className="flex items-center gap-2 section-label mb-3 pb-2 border-b border-surface-container">
              <ShieldCheck size={11} className="text-secondary" /> Certification
            </h3>
            <Certification rules={item.certification_requirements} />
            {synthetic(item.source) &&
              item.certification?.schemes.map((s) => (
                <p
                  key={s.id}
                  className="mt-3 text-[12px] chip-amber px-3 py-2 rounded-lg inline-block"
                >
                  MOCK / SYNTHETIC: {s.name} · {s.requirement} in fixture only.
                  No legal effect.
                </p>
              ))}
          </div>
          <div>
            <h3 className="flex items-center gap-2 section-label mb-3 pb-2 border-b border-surface-container">
              <Layers3 size={11} className="text-secondary" /> Allied Standards
            </h3>
            <AlliedGroups groups={item.allied_standards} />
          </div>
        </div>

        {/* Evidence */}
        <details className="group/evidence mt-7 pt-4 border-t border-surface-container">
          <summary className="inline-flex items-center gap-2 text-[13px] font-bold text-on-surface-variant cursor-pointer list-none px-3 py-1.5 rounded-lg border border-surface-container bg-surface-container-low hover:border-secondary/30 hover:text-secondary transition-all">
            <Link2 size={11} className="text-secondary" />
            Evidence & version history
            <ChevronDown
              size={11}
              className="ml-1 group-open/evidence:rotate-180 transition-transform duration-200"
            />
          </summary>
          <div className="pl-1 mt-3 animate-fade-in">
            <EvidenceList items={item.evidence} />
            <div className="flex flex-wrap gap-5 text-[13px] mt-4 p-4 rounded-xl border border-surface-container bg-surface-container-low/40">
              <div>
                <dt className="text-on-surface-variant mb-1 text-[12px] uppercase tracking-wide font-semibold">
                  Amendments reported
                </dt>
                <dd className="font-bold text-secondary">
                  {version.amendments_reported ?? "Unknown"}
                </dd>
              </div>
              <div className="w-px bg-surface-container hidden sm:block" />
              <div>
                <dt className="text-on-surface-variant mb-1 text-[12px] uppercase tracking-wide font-semibold">
                  Unresolved amendments
                </dt>
                <dd className="font-bold text-secondary">
                  {version.unresolved_amendments ?? "Unknown"}
                </dd>
              </div>
            </div>
            {version.supersession_path &&
              version.supersession_path.length > 1 && (
                <p className="text-[12px] text-on-surface-variant break-words mt-3 px-1">
                  Supersession chain:{" "}
                  <span className="font-semibold text-secondary">
                    {version.supersession_path.join(" → ")}
                  </span>
                </p>
              )}
          </div>
        </details>
      </div>

      {allowFeedback && <Feedback item={item} reportId={reportId} apiKey={apiKey} />}
    </article>
  );
}
