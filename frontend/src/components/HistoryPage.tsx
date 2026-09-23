import { useState } from "react";
import { request } from "../api";
import type { Report } from "../types";
import { useResource, ResourceState, Pagination } from "./shared/Resource";
type History = {
  total: number;
  items: {
    recommendation_id: string;
    timestamp: string;
    query_text: string;
    status: string;
    candidate_count: number;
  }[];
};
export function HistoryPage({
  apiKey,
  onOpen,
}: {
  apiKey: string;
  onOpen: (r: Report) => void;
}) {
  const [offset, setOffset] = useState(0),
    [opening, setOpening] = useState(""),
    [error, setError] = useState("");
  const state = useResource<History>(
    `/v1/history?limit=20&offset=${offset}`,
    apiKey,
  );
  async function open(id: string) {
    setOpening(id);
    setError("");
    try {
      onOpen(await request<Report>("/v1/history/" + id, apiKey));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOpening("");
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Saved evidence</span>
        <h1 className="text-headline-xl mt-2">Audit history</h1>
        <p className="mt-2 text-on-surface-variant">
          Your recorded requests, scores and evidence snapshots. Open a report
          without rerunning inference.
        </p>
      </div>
      <ResourceState {...state} />
      {error && (
        <p role="alert" className="status-banner-error p-4">
          {error}
        </p>
      )}
      {state.data && (
        <>
          <div className="card divide-y divide-surface-container">
            {!state.data.items.length && (
              <div className="p-8 text-center">
                <h2 className="font-bold text-lg">No saved requests yet</h2>
                <p className="mt-2 text-on-surface-variant">
                  Run your first specification to create a durable evidence
                  trail. Legacy records without an identified owner are not
                  shown.
                </p>
              </div>
            )}
            {state.data.items.map((row) => (
              <button
                key={row.recommendation_id}
                disabled={!!opening}
                onClick={() => open(row.recommendation_id)}
                className="w-full p-5 text-left hover:bg-surface-container-low focus-ring block"
              >
                <div className="flex flex-wrap justify-between gap-2 text-xs text-on-surface-variant">
                  <time>{new Date(row.timestamp).toLocaleString()}</time>
                  <span>
                    {row.candidate_count} candidates ·{" "}
                    {row.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="font-semibold mt-2 break-words">
                  {row.query_text}
                </p>
                <code className="block break-all text-xs text-outline mt-2">
                  {row.recommendation_id}
                </code>
                <span className="block text-sm text-secondary mt-3">
                  {opening === row.recommendation_id
                    ? "Opening…"
                    : "Open saved report →"}
                </span>
              </button>
            ))}
          </div>
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
