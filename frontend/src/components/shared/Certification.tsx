import { ShieldCheck } from 'lucide-react';
import type { Rule } from '../../types';

export function Certification({ rules }: { rules: Rule[] }) {
  if (!rules?.length) {
    return <p className="text-[12px] text-on-surface-variant italic">No certification rules matched.</p>;
  }
  return (
    <ul className="space-y-2">
      {rules.map((r) => {
        const isMandatory = r.requirement?.toLowerCase().includes('mandatory') ||
                            r.legal_applicability_confirmed === true;
        return (
          <li key={r.id} className="rule text-[12px] leading-relaxed">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <ShieldCheck size={11} className="text-secondary opacity-80" />
              <strong className="font-bold text-on-surface">{r.scheme_name || r.scheme}</strong>
              {isMandatory ? (
                <span className="chip-navy rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">Mandatory</span>
              ) : (
                <span className="badge-voluntary">Voluntary</span>
              )}
            </div>
            <p className="text-on-surface-variant leading-snug">{r.requirement}</p>
            {r.as_verified_on && (
              <p className="text-[10px] font-semibold mt-0.5 text-secondary opacity-80">
                Verified on: {r.as_verified_on}
              </p>
            )}
            {r.scope_note && (
              <p className="text-[11px] text-on-surface-variant italic mt-0.5">{r.scope_note}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
