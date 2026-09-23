import { ExternalLink } from 'lucide-react';
import type { Evidence } from '../../types';

export function synthetic(source: string): boolean {
  return source === 'synthetic' || source === 'mock_fixture' || source.startsWith('fixture');
}

export function Provenance({ source }: { source: string }) {
  if (synthetic(source)) {
    return (
      <span className="chip-amber inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
        MOCK / SYNTHETIC
      </span>
    );
  }
  return (
    <span className="chip-navy inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
      BIS LIVE
    </span>
  );
}

export function EvidenceList({ items }: { items: Evidence[] }) {
  if (!items?.length) {
    return <p className="text-[12px] text-on-surface-variant italic">No evidence items recorded.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((ev, i) => (
        <li key={i} className="flex flex-col gap-1 text-[12px] leading-relaxed">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip-navy rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">{ev.source}</span>
            {ev.source_url && (
              <a
                href={ev.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:opacity-80 transition-opacity"
              >
                <ExternalLink size={10} /> {ev.display_label || ev.source_url}
              </a>
            )}
          </div>
          {ev.display_label && (
            <p className="text-on-surface-variant pl-2 border-l-2 border-secondary/25 italic leading-snug text-[11px]">
              {ev.display_label}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
