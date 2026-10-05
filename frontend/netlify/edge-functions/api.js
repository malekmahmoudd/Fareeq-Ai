/* global Netlify */
// Same-origin API transport for Netlify. Standard rewrites stop after 26 seconds;
// return the upstream body directly so SSE remains a stream, never cached.
export default async function api(request) {
  let backend;
  try {
    backend = new URL(Netlify.env.get("BACKEND_URL"));
    if (backend.protocol !== "https:" || backend.username || backend.password ||
        backend.pathname !== "/" || backend.search || backend.hash) throw new Error();
  } catch {
    return Response.json({ detail: "The service is not configured yet." }, { status: 503 });
  }
  const source = new URL(request.url);
  const destination = new URL(source.pathname + source.search, backend);
  const headers = new Headers(request.headers);
  for (const name of ["host", "connection", "transfer-encoding", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto"]) headers.delete(name);
  // Origin and cookies stay intact; backend CSRF/account checks remain decisive.
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });
  if (request.signal.aborted) abort.abort();
  const timer = setTimeout(() => abort.abort(), 35000);
  try {
    const upstream = await fetch(destination, {
      method: request.method, headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual", signal: abort.signal,
    });
    clearTimeout(timer); // Header deadline only; do not truncate the streaming body.
    const outgoing = new Headers(upstream.headers);
    outgoing.set("Cache-Control", "no-store");
    outgoing.set("X-Content-Type-Options", "nosniff");
    outgoing.set("X-Frame-Options", "DENY");
    outgoing.set("Referrer-Policy", "same-origin");
    return new Response(upstream.body, { status: upstream.status, headers: outgoing });
  } catch {
    return Response.json({ detail: "The service is starting or temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "10" } });
  } finally {
    clearTimeout(timer);
  }
}
export const config = { path: "/api/*" };
