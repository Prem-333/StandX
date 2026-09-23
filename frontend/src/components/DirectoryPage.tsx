import { useEffect, useState } from "react";
import type { Evidence, Version } from "../types";
import { EvidenceList, Provenance } from "./shared/EvidenceList";
import { VersionBadge } from "./shared/VersionBadge";
import { useResource, ResourceState, Pagination } from "./shared/Resource";
type Directory = {
  total: number;
  items: {
    record: {
      record_id: string;
      is_number: string;
      title: string;
      source: string;
      classification: Record<string, string | null>;
    };
    version_status: Version;
    evidence: Evidence[];
  }[];
};
export function DirectoryPage({ apiKey }: { apiKey: string }) {
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const state = useResource<Directory>(
    `/v1/standards?q=${encodeURIComponent(search)}&limit=20&offset=${offset}`,
    apiKey,
  );
  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Knowledge base</span>
        <h1 className="text-headline-xl mt-2">Standards directory</h1>
        <p className="mt-2 text-on-surface-variant">
          Browse the actual local metadata snapshot. Source observations do not
          confirm current publication status.
        </p>
      </div>
      <label className="block text-sm font-semibold">
        Search local standards
        <input
          autoFocus
          type="search"
          value={query}
          maxLength={200}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="IS number or words from the title"
          className="block w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 mt-2 font-normal focus:ring-2 focus:ring-secondary"
        />
      </label>
      <ResourceState {...state} />
      {state.data && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {state.data.items.map(
              ({ record: r, version_status: v, evidence }) => (
                <article className="card p-5 min-w-0" key={r.record_id}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Provenance source={r.source} />
                    <VersionBadge version={v} source={r.source} />
                  </div>
                  <h2 className="font-bold text-lg break-words">
                    {r.is_number}
                  </h2>
                  <p className="text-on-surface-variant mt-2 mb-4">{r.title}</p>
                  <p className="text-xs text-on-surface-variant mb-3">
                    {Object.values(r.classification || {})
                      .filter(Boolean)
                      .join(" / ") || "Classification unknown"}
                  </p>
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold text-secondary">
                      Source record
                    </summary>
                    <div className="mt-3">
                      <EvidenceList items={evidence} />
                    </div>
                  </details>
                </article>
              ),
            )}
          </div>
          {!state.data.total && (
            <p className="card p-8 text-center">
              No records match this search. The sample does not cover every
              Indian Standard.
            </p>
          )}
          <Pagination
            total={state.data.total}
            offset={offset}
            onChange={setOffset}
          />
        </>
      )}
    </div>
  );
}
