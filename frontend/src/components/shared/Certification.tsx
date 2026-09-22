import { ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import type { Rule } from '../../types';
import { publicUrl } from '../../api';

const titleCase = (text: string) => text.replaceAll('_', ' ');

export function Certification({ rules }: { rules: Rule[] }) {
  if (!rules.length) {
    return (
      <p className="text-xs text-[var(--clr-text-muted)] italic">
        Certification applicability unknown · no verified mapping for this record.
      </p>
    );
  }

  const uniqueRules = Array.from(new Map(rules.map((r) => [r.id, r])).values());

  return (
    <div className="space-y-2">
      {uniqueRules.map((rule, index) => (
        <details className="group rule" key={`${rule.id}-${index}`}>
          <summary className="flex items-center gap-2.5 list-none cursor-pointer p-2.5 -ml-2 rounded-xl hover:bg-[var(--clr-bg-3)] transition-colors">
            <span
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                rule.stale || rule.requirement === 'unknown'
                  ? 'chip-muted'
                  : rule.requirement === 'voluntary'
                  ? 'chip-indigo badge-voluntary'
                  : 'chip-teal'
              }`}
            >
              <ShieldCheck size={11} />
              {rule.scheme === 'HALLMARKING' ? 'Hallmark' : rule.scheme} · {titleCase(rule.requirement)}
            </span>
            <span className="text-[11px] text-[var(--clr-text-muted)] flex-1">As verified {rule.as_verified_on}</span>
            <ChevronDown size={13} className="text-[var(--clr-text-muted)] group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
          </summary>

          <div className="mt-2 ml-2 pl-4 border-l-2 border-[var(--clr-teal)] border-opacity-30 text-[13px] leading-relaxed text-[var(--clr-text-dim)] space-y-3 pb-1">
            <div>
              <p className="font-bold text-[var(--clr-text)]">{rule.scheme_name || rule.scheme}</p>
              <p className="text-[11px] text-[var(--clr-text-muted)] font-medium mt-0.5 uppercase tracking-wide">
                Category: {titleCase(rule.product_category)}
              </p>
            </div>
            <p>
              {rule.stale
                ? 'Evidence is stale; verify the current rule.'
                : rule.applies_to_supplied_context === null
                ? 'Product scope and exemptions still need review.'
                : rule.applies_to_supplied_context === false
                ? 'Supplied scope does not match this rule; this does not establish an exemption.'
                : 'Supplied assertions match the rule; legal applicability still needs review.'}
            </p>
            <div className="space-y-1">
              <p>{rule.notice}</p>
              {rule.scope_note && <p className="text-[var(--clr-text-muted)] italic text-[12px]">{rule.scope_note}</p>}
            </div>
            <p className="text-[11px] text-[var(--clr-text-muted)] bg-[var(--clr-bg-3)] inline-block px-2.5 py-1 rounded-lg border border-[var(--clr-border)]">
              Triggered by: <span className="font-bold text-[var(--clr-text)]">{String(rule.trigger.value || rule.product_category)}</span>
              {rule.trigger.record_id ? ` · KB record ${String(rule.trigger.record_id)}` : ''}
            </p>
            {(rule.missing_conditions?.length ?? 0) > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {rule.missing_conditions?.map((c) => <li key={c.description}>{c.description}</li>)}
              </ul>
            )}
            {rule.evidence.map((e, i) => (
              <div key={i} className="bg-[var(--clr-bg-3)] p-3 rounded-xl border border-[var(--clr-border)]">
                <a href={publicUrl(e.url)} target="_blank" rel="noopener noreferrer"
                  className="text-[var(--clr-teal)] hover:text-[var(--clr-teal-dark)] font-semibold inline-flex items-center gap-1 text-xs hover:underline">
                  {e.locator} <ExternalLink size={11} />
                </a>
                <p className="text-[var(--clr-text-muted)] mt-1.5 text-[11px]">{e.summary}</p>
              </div>
            ))}
            <details className="mt-1 group/json">
              <summary className="text-[var(--clr-text-muted)] text-[11px] font-semibold cursor-pointer list-none hover:text-[var(--clr-teal)] transition-colors inline-block py-1">
                Complete rule and limitations ↓
              </summary>
              <pre className="json-block mt-2">{JSON.stringify(rule, null, 2)}</pre>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}
