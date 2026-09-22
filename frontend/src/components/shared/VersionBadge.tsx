import { AlertTriangle, Check } from 'lucide-react';
import type { Version } from '../../types';
import { synthetic } from './EvidenceList';

export function VersionBadge({ version, source }: { version: Version; source: string }) {
  if (version.status === 'superseded') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold chip-red">
        <AlertTriangle size={11} />
        Superseded{version.final_current_standard ? ` → ${version.final_current_standard}` : ' · replacement unknown'}
      </span>
    );
  }
  if (version.status === 'withdrawn') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold chip-red">
        <AlertTriangle size={11} /> Withdrawn
      </span>
    );
  }
  if (version.is_latest_revision === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold chip-green">
        <Check size={11} /> Latest Version{synthetic(source) ? ' · fixture' : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold chip-muted">
      Latest version unverified
    </span>
  );
}
