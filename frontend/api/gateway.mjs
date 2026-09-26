const MAX_BYTES = 4_000_000;
function error(detail, status) {
  return Response.json({ detail }, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Only the server administrator sets this origin. Never accept a target URL
// from a request and never follow redirects. Public demo credentials stay server-side.
export async function forward(request, origin = process.env.STANDX_API_ORIGIN, send = fetch,
                              demoKey = process.env.STANDX_DEMO_API_KEY) {
  if (!origin) return error('The recommendation backend is not configured. This deployment currently provides the frontend preview only.', 503);
  let target;
  try {
    target = new URL(origin);
    if (target.protocol !== 'https:' || target.username || target.password || target.pathname !== '/' || target.search || target.hash)
      throw new Error('Invalid origin');
  } catch { return error('The backend connection is misconfigured. Contact the administrator.', 503); }
  const incoming = new URL(request.url);
  let path = incoming.searchParams.get('route') || incoming.pathname.replace(/^\/v1\//, '');
  try { path = decodeURIComponent(path); } catch { return error('Invalid route.', 400); }
  const method = request.method.toUpperCase();
  const allowed = method === 'GET'
    ? /^(health|system|standards|standards\/.+|certifications\/[^/]+|history(?:\/[^/]+)?)$/
    : method === 'POST' ? /^(recommend|feedback)$/ : /(?!) /;
  if (!allowed.test(path) || /[\\?#%]|\.\./.test(path)) return error('Route not found.', 404);
  if (method === 'POST' && request.headers.get('origin') && request.headers.get('origin') !== incoming.origin)
    return error('Origin not allowed.', 403);
  // A public demo never exposes the shared actor's previous audit records or feedback.
  if (demoKey && (path === 'history' || path.startsWith('history/') || path === 'feedback'))
    return error('History and officer feedback are unavailable in the public demo. Download your current result to keep it.', 403);
  const key = demoKey || request.headers.get('x-api-key');
  if (!key) return error('Enter your officer API key to connect to the backend.', 401);
  target.pathname = '/v1/' + path;
  for (const [name, value] of incoming.searchParams) {
    if (['limit', 'offset', 'q', 'max_hops', 'domestic_supply', 'exemption_claimed', 'district_in_current_annexure'].includes(name)) target.searchParams.append(name, value);
  }
  const headers = new Headers({ Accept: 'application/json' });
  if (key) headers.set('X-API-Key', key);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  let body;
  if (method === 'POST') {
    if (Number(request.headers.get('content-length')) > MAX_BYTES) return error('Hosted uploads are limited to 4 MB including form fields.', 413);
    const chunks = [];
    let length = 0;
    const reader = request.body?.getReader();
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > MAX_BYTES) { await reader.cancel(); return error('Hosted uploads are limited to 4 MB including form fields.', 413); }
        chunks.push(value);
      }
    }
    body = Buffer.concat(chunks);
  }
  try {
    const upstream = await send(target, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(170_000) });
    if (upstream.status >= 300 && upstream.status < 400) return error('Backend redirects are not permitted. Contact the administrator.', 502);
    if (!upstream.headers.get('content-type')?.includes('application/json')) return error('The backend returned an invalid response.', 502);
    const out = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    for (const name of ['retry-after', 'x-request-id']) {
      if (upstream.headers.has(name)) out.set(name, upstream.headers.get(name));
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch { return error('The backend did not respond. The request was not retried; a timed-out request may still have an audit record.', 502); }
}

export default { fetch: (request) => forward(request) };
