import type { Version } from '../../types';

interface VersionBadgeProps {
  version: Version;
  source: string;
}

export function VersionBadge({ version, source }: VersionBadgeProps) {
  if (source === 'synthetic' || source === 'mock_fixture') return null;

  const status = version.status?.toLowerCase() ?? '';

  if (status === 'superseded' || status === 'withdrawn') {
    return (
      <span className="chip-amber inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        ⚠ Superseded
      </span>
    );
  }
  if (version.is_latest_revision === true || status === 'current') {
    return (
      <span className="chip-green inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        ✓ Current
      </span>
    );
  }
  return (
    <span className="chip-muted inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
      Version unknown
    </span>
  );
}
