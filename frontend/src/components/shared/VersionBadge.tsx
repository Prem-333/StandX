import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { Version } from "../../types";
import { synthetic } from "./EvidenceList";
export function VersionBadge({
  version,
  source,
}: {
  version: Version;
  source: string;
}) {
  const outdated =
    version.status === "superseded" || version.status === "withdrawn";
  const label =
    version.status === "withdrawn"
      ? "Withdrawn"
      : version.status === "superseded"
        ? `Superseded by ${version.final_current_standard || "an unverified successor"}`
        : version.is_latest_revision === true
          ? `Latest Version${synthetic(source) ? " · fixture" : ""}`
          : "Latest version unverified";
  const Icon = outdated
    ? AlertTriangle
    : version.is_latest_revision === true
      ? CheckCircle2
      : HelpCircle;
  return (
    <span
      className={`${outdated ? "chip-amber" : version.is_latest_revision === true ? "chip-teal" : "chip-navy"} inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold break-words`}
    >
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  );
}
