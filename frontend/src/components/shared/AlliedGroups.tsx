import { Layers3, ChevronDown } from "lucide-react";
import type { Allied } from "../../types";
import { Provenance, EvidenceList } from "./EvidenceList";

const relationshipNames: Record<string, string> = {
  TEST_METHOD_FOR: "Test methods",
  TERMINOLOGY_FOR: "Terminology",
  SAFETY_STANDARD_FOR: "Safety standards",
  INSTALLATION_STANDARD_FOR: "Installation standards",
  NORMATIVE_REFERENCE: "Normative references",
  UNTYPED_REFERENCE: "Other references · untyped",
  SAME_COMMITTEE: "Same committee · weak association",
};

const titleCase = (t: string) => t.replaceAll("_", " ");

export function AlliedGroups({ groups }: { groups: Record<string, Allied[]> }) {
  const populated = Object.entries(groups).filter(([, rows]) => rows.length);
  if (!populated.length) {
    return (
      <p className="text-[12px] text-on-surface-variant italic">
        No evidenced allied standards in this KB snapshot.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {populated.map(([relation, rows]) => (
        <details key={relation} className="group allied-group">
          <summary className="flex items-center gap-2.5 py-1.5 px-2 -ml-2 rounded-lg text-[12px] font-semibold text-on-surface-variant cursor-pointer list-none hover:bg-surface-container-low transition-colors">
            <Layers3
              size={12}
              className="flex-shrink-0 text-secondary opacity-70"
            />
            <span>{relationshipNames[relation] || titleCase(relation)}</span>
            <span className="chip-navy px-1.5 py-0.5 rounded text-[10px] font-bold ml-1">
              {rows.length}
            </span>
            <ChevronDown
              size={12}
              className="ml-auto text-on-surface-variant group-open:rotate-180 transition-transform duration-200"
            />
          </summary>
          <div className="mt-2 ml-2 pl-4 border-l-2 border-secondary/20 space-y-3">
            {rows.map((row) => (
              <div key={row.record_id} className="relative allied-item">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full ring-2 ring-white bg-secondary opacity-40" />
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[13px] font-bold text-secondary">
                    {row.is_number}
                  </span>
                  <Provenance source={row.source} />
                </div>
                <p className="text-[12px] text-on-surface-variant leading-relaxed max-w-2xl">
                  {row.title}
                </p>
                <details className="mt-1.5">
                  <summary className="text-on-surface-variant text-[11px] font-semibold cursor-pointer list-none hover:text-secondary transition-colors inline-block py-0.5">
                    Record citation & relationship evidence ↓
                  </summary>
                  <div className="pl-2 border-l border-surface-container mt-2">
                    <EvidenceList items={row.evidence} />
                    <pre className="json-block mt-3">
                      {JSON.stringify(row.evidence_path || [], null, 2)}
                    </pre>
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
