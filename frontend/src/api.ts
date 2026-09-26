export async function request<T>(
  path: string,
  key: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (key) headers.set("X-API-Key", key);
  if (typeof options.body === "string")
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      signal: AbortSignal.timeout(180000),
    });
  } catch {
    throw new Error(
      "The service did not respond. Check that the backend is running. A timed-out request may still have an audit record; it was not retried automatically.",
    );
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail =
        typeof body.detail === "string"
          ? body.detail
          : JSON.stringify(body.detail);
    } catch {
      /* Plain proxy error. */
    }
    if (response.status === 401)
      throw new Error(
        "API key missing or invalid. Open Connection to enter a valid officer key.",
      );
    if (response.status === 429)
      throw new Error(
        `Request limit reached. Try again in ${response.headers.get("Retry-After") || "60"} seconds.`,
      );
    throw new Error(
      detail ||
        `Service returned ${response.status}. Check the backend and try again.`,
    );
  }
  return response.json();
}
export function publicUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
