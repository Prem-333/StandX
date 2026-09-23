import { useEffect, useState } from "react";
import { request } from "../../api";

export function useResource<T>(path: string, key: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    setData(null);
    request<T>(path, key)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [path, key, revision]);
  return { data, error, busy, retry: () => setRevision((v) => v + 1) };
}
export function ResourceState({
  busy,
  error,
  retry,
}: {
  busy: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <>
      {busy && (
        <p role="status" className="card p-6 text-on-surface-variant">
          Loading records from the local API…
        </p>
      )}
      {error && (
        <div role="alert" className="status-banner-error p-5">
          <p>{error}</p>
          <button
            className="btn-secondary rounded-lg mt-3 px-4 py-2"
            onClick={retry}
          >
            Try again
          </button>
        </div>
      )}
    </>
  );
}
export function Pagination({
  total,
  offset,
  onChange,
}: {
  total: number;
  offset: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 text-sm mt-5">
      <span>
        {total
          ? `${offset + 1}–${Math.min(offset + 20, total)} of ${total}`
          : "0 records"}
      </span>
      <div className="flex gap-2">
        <button
          disabled={!offset}
          className="btn-secondary rounded-lg px-4 py-2 disabled:opacity-40"
          onClick={() => onChange(Math.max(0, offset - 20))}
        >
          Previous
        </button>
        <button
          disabled={offset + 20 >= total}
          className="btn-secondary rounded-lg px-4 py-2 disabled:opacity-40"
          onClick={() => onChange(offset + 20)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
