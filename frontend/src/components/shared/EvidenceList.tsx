import type { Evidence } from '../../types';
import { publicUrl } from '../../api';
import { Link2, ExternalLink } from 'lucide-react';

const synthetic = (source: string) =>
  source === 'synthetic_seed' || source === 'synthetic';

function Provenance({ source }: { source: string }) {
  if (synthetic(source)) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase chip-amber">
        Mock / Synthetic
      </span>
    );
  }
  if (source === 'bis_public_metadata_verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase chip-teal">
        BIS public metadata
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase chip-muted">
      Source unverified
    </span>
  );
}

export function EvidenceList({ items }: { items: Evidence[] }) {
  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-[var(--clr-border)]">
      {items.map((item) => (
        <div key={item.record_id} className="text-xs">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <strong className="font-bold text-[13px] text-[var(--clr-teal)]">{item.is_number}</strong>
            <Provenance source={item.source} />
          </div>
          <div className="text-[var(--clr-text-muted)] flex items-center gap-2 flex-wrap text-[11px]">
            <span>KB record</span>
            <code className="font-mono bg-[var(--clr-bg-3)] border border-[var(--clr-border)] px-1.5 py-0.5 rounded text-[10px] text-[var(--clr-text-dim)]">
              {item.record_id}
            </code>
            {item.fetched_at && (
              <span>· {synthetic(item.source) ? 'Fixture date' : 'Fetched'} {item.fetched_at.slice(0, 10)}</span>
            )}
          </div>
          {publicUrl(item.source_url) && (
            <a
              className="mt-2 text-[var(--clr-teal)] hover:text-[var(--clr-teal-dark)] font-semibold inline-flex items-center gap-1 transition-colors text-[11px] hover:underline"
              href={publicUrl(item.source_url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Public metadata source <ExternalLink size={11} />
            </a>
          )}
          {item.snapshot_sha256 && (
            <div className="mt-1.5 truncate text-[10px] text-[var(--clr-text-muted)] font-mono opacity-60" title={item.snapshot_sha256}>
              SHA-256: {item.snapshot_sha256}
            </div>
          )}
          {synthetic(item.source) && (
            <p className="mt-1 text-[11px] chip-amber px-2 py-1 rounded inline-block font-medium">
              Fixture only. No BIS standard or legal claim.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export { Provenance };
export { synthetic };
