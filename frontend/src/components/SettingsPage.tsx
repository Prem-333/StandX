import { useResource, ResourceState } from "./shared/Resource";
type System = {
  visible_records: number;
  verified_records: number;
  synthetic_records: number;
  include_synthetic: boolean;
  confidence_threshold: number;
  graph_backend: string;
  models: Record<string, string>;
  ranking_adjustments: string;
  notice: string;
  kb_fingerprint: string;
};
export function SettingsPage({
  apiKey,
  setApiKey,
  proxyAuth,
}: {
  apiKey: string;
  setApiKey: (v: string) => void;
  proxyAuth: boolean;
}) {
  const state = useResource<System>("/v1/system", apiKey);
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="section-label">Active configuration</span>
        <h1 className="text-headline-xl mt-2">Settings</h1>
        <p className="mt-2 text-on-surface-variant">
          Inspect the running backend. Model and corpus changes require an
          administrator and an offline index rebuild.
        </p>
      </div>
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-3">Connection</h2>
        {proxyAuth ? (
          <p className="text-sm text-on-surface-variant">
            The local demo proxy supplies a temporary API key. The secret never
            enters browser code.
          </p>
        ) : (
          <label className="text-sm font-semibold">
            API key
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full mt-2 rounded-lg p-3 border border-outline-variant bg-surface-container-lowest"
            />
            <span className="block mt-2 text-xs font-normal text-on-surface-variant">
              Applied immediately. Held in memory for this tab; not saved in
              browser storage.
            </span>
          </label>
        )}
      </section>
      <ResourceState {...state} />
      {state.data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ["Visible records", state.data.visible_records],
              ["BIS metadata observations", state.data.verified_records],
              ["MOCK / SYNTHETIC", state.data.synthetic_records],
            ].map(([label, n]) => (
              <section key={label} className="card p-5">
                <span className="text-sm text-on-surface-variant">{label}</span>
                <strong className="block text-3xl mt-3">{n}</strong>
              </section>
            ))}
          </div>
          <section className="card p-6 space-y-4">
            <h2 className="font-bold text-lg">Runtime snapshot</h2>
            <dl className="grid sm:grid-cols-[200px_1fr] gap-3 text-sm">
              <dt>Synthetic records</dt>
              <dd>
                {state.data.include_synthetic
                  ? "Enabled · demo only"
                  : "Excluded"}
              </dd>
              <dt>Relevance threshold</dt>
              <dd>{state.data.confidence_threshold} · uncalibrated</dd>
              <dt>Graph backend</dt>
              <dd>{state.data.graph_backend}</dd>
              <dt>Ranking adjustments</dt>
              <dd>{state.data.ranking_adjustments}</dd>
              {Object.entries(state.data.models).map(([k, v]) => (
                <div className="contents" key={k}>
                  <dt>{k.replaceAll("_", " ")}</dt>
                  <dd className="font-mono break-all">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-on-surface-variant border-t border-surface-container pt-4">
              {state.data.notice}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
