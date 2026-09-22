import { Layers3, ChevronDown } from 'lucide-react';
import type { Allied } from '../../types';
import { Provenance, EvidenceList } from './EvidenceList';

const relationshipNames: Record<string, string> = {
  TEST_METHOD_FOR: 'Test methods',
  TERMINOLOGY_FOR: 'Terminology',
  SAFETY_STANDARD_FOR: 'Safety standards',
  INSTALLATION_STANDARD_FOR: 'Installation standards',
  NORMATIVE_REFERENCE: 'Normative references',
  UNTYPED_REFERENCE: 'Other references · untyped',
  SAME_COMMITTEE: 'Same committee · weak association',
};

const titleCase = (text: string) => text.replaceAll('_', ' ');

export function AlliedGroups({ groups }: { groups: Record<string, Allied[]> }) {
  const populated = Object.entries(groups).filter(([, rows]) => rows.length);
  if (!populated.length) {
    return (
      <p className="text-xs text-[var(--clr-text-muted)] italic">
        No evidenced allied standards in this KB snapshot.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {populated.map(([relation, rows]) => (
        <details key={relation} className="group allied-group">
          <summary className="flex items-center gap-2.5 py-2 px-2 -ml-2 rounded-xl text-xs font-semibold text-[var(--clr-text-dim)] cursor-pointer list-none hover:bg-[var(--clr-bg-3)] hover:text-[var(--clr-teal)] transition-colors">
            <Layers3 size={13} className="text-[var(--clr-slate)] flex-shrink-0" />
            <span>{relationshipNames[relation] || titleCase(relation)}</span>
            <span className="chip-teal px-1.5 py-0.5 rounded text-[10px] font-bold ml-1">{rows.length}</span>
            <ChevronDown size={13} className="ml-auto text-[var(--clr-text-muted)] group-open:rotate-180 transition-transform duration-200" />
          </summary>
          <div className="mt-2 ml-2 pl-4 border-l-2 border-[var(--clr-teal)] border-opacity-20 space-y-3">
            {rows.map((row) => (
              <div key={row.record_id} className="relative allied-item">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[var(--clr-teal)] opacity-40 ring-2 ring-white" />
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[13px] font-bold text-[var(--clr-teal)]">{row.is_number}</span>
                  <Provenance source={row.source} />
                </div>
                <p className="text-[12px] text-[var(--clr-text-dim)] leading-relaxed max-w-2xl">{row.title}</p>
                <details className="mt-1.5 group/citation">
                  <summary className="text-[var(--clr-text-muted)] text-[11px] font-semibold cursor-pointer list-none hover:text-[var(--clr-teal)] transition-colors inline-block py-0.5">
                    Record citation & relationship evidence ↓
                  </summary>
                  <div className="pl-2 border-l border-[var(--clr-border)] mt-2">
                    <EvidenceList items={row.evidence} />
                    <pre className="json-block mt-3">{JSON.stringify(row.evidence_path || [], null, 2)}</pre>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
