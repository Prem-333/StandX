import type { Rule } from "../../types";
import { publicUrl } from "../../api";
export function Certification({ rules }: { rules: Rule[] }) {
  if (!rules?.length)
    return (
      <p className="text-xs text-on-surface-variant">
        No verified rule mapping in this snapshot. Certification applicability
        is unknown.
      </p>
    );
  return (
    <div className="space-y-3">
      {rules.map((r) => (
        <details
          key={r.id}
          className="rule rounded-lg border border-surface-container p-3 text-xs"
        >
          <summary className="cursor-pointer">
            <span
              className={`${r.requirement === "mandatory" ? "chip-amber" : r.requirement === "voluntary" ? "badge-voluntary chip-teal" : "chip-navy"} inline-block rounded px-2 py-1 font-bold`}
            >
              {r.scheme} · {r.requirement.replaceAll("_", " ")}
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-on-surface-variant">
            <p className="font-semibold">As verified {r.as_verified_on}</p>
            {r.stale && (
              <p role="alert" className="text-error font-bold">
                This rule is overdue for review. Reverify before relying on it.
              </p>
            )}
            <p>Product scope and exemptions still need review.</p>
            <p>
              {r.applies_to_supplied_context === false
                ? "The supplied context does not meet this rule’s recorded conditions."
                : r.applies_to_supplied_context === true
                  ? "Recorded conditions match the supplied assertions; legal applicability remains unconfirmed."
                  : "Applicability is undetermined from the supplied context."}
            </p>
            {[r.notice, r.scope_note, r.limitation, r.transition_notice]
              .filter(Boolean)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            {r.missing_conditions?.map((c, i) => (
              <p key={i}>Review: {c.description}</p>
            ))}
            <p>Category: {r.product_category.replaceAll("_", " ")}</p>
            <details>
              <summary className="cursor-pointer text-secondary">
                Rule trigger
              </summary>
              <pre className="json-block mt-2">
                {JSON.stringify(r.trigger, null, 2)}
              </pre>
            </details>
            {r.evidence.map((ev, i) => (
              <div key={i} className="pt-2 border-t border-surface-container">
                {publicUrl(ev.url) ? (
                  <a
                    href={publicUrl(ev.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary underline"
                  >
                    {ev.locator || "Official source"}
                  </a>
                ) : (
                  <span>Source URL unavailable</span>
                )}
                <p className="mt-1">{ev.summary}</p>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
