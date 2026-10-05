// Pages delivery for the existing Next.js origin. No production secrets here.
const FRONTEND = "https://fareeqai.netlify.app";
const BACKEND = "https://fareeqai-api.malekmahmoud.blitz.cloud";
const PUBLIC = "https://fareeqai.pages.dev";
const preferences = new Set(["fareeq_locale", "fareeq_saver", "fareeq_a11y"]);

export default {
  async fetch(request) {
    const source = new URL(request.url);
    const api = source.pathname === "/api" || source.pathname.startsWith("/api/");
    // Preview addresses must not become alternate authentication origins.
    if (source.origin !== PUBLIC) {
      if (api || !["GET", "HEAD"].includes(request.method)) {
        return Response.json({ detail: "Request origin is not allowed" }, { status: 403 });
      }
      const canonical = new URL(PUBLIC);
      canonical.pathname = source.pathname;
      canonical.search = source.search;
      return Response.redirect(canonical.toString(), 307);
    }
    if (!api && !["GET", "HEAD"].includes(request.method)) {
      return new Response("Method not allowed", { status: 405 });
    }
    const destination = new URL(api ? BACKEND : FRONTEND);
    // Assign path rather than resolve it, so //host paths cannot change upstream.
    destination.pathname = source.pathname;
    destination.search = source.search;
    const headers = new Headers(request.headers);
    for (const name of ["host", "connection", "transfer-encoding", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "forwarded"]) headers.delete(name);
    if (!api) {
      // Next only needs presentation preferences; never send API sessions to it.
      const cookies = (headers.get("cookie") || "").split(";").map(v => v.trim())
        .filter(v => preferences.has(v.split("=")[0]));
      headers.delete("cookie");
      headers.delete("authorization");
      if (cookies.length) headers.set("cookie", cookies.join("; "));
    }
    const controller = new AbortController();
    request.signal.addEventListener("abort", () => controller.abort(), { once: true });
    if (request.signal.aborted) controller.abort();
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      const upstream = await fetch(destination, {
        method: request.method, headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual", signal: controller.signal,
      });
      clearTimeout(timer); // Header timeout only: SSE bodies remain streamed.
      // Hosting start/error gates are HTML, never an application API response.
      if (api && (upstream.headers.has("X-Blitz-Gate") ||
          (upstream.headers.get("content-type") || "").includes("text/html"))) {
        await upstream.body?.cancel();
        return Response.json({ detail: "The service is temporarily unavailable. Please try again shortly." },
          { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "10",
            ...(upstream.headers.has("X-Blitz-Gate") ? { "X-Fareeq-Wake": "1" } : {}) } });
      }
      const outgoing = new Headers(upstream.headers);
      if (!api) outgoing.delete("set-cookie");
      const location = outgoing.get("location");
      if (location) {
        const redirect = new URL(location, destination);
        if ([FRONTEND, BACKEND].includes(redirect.origin)) {
          const canonical = new URL(PUBLIC);
          canonical.pathname = redirect.pathname;
          canonical.search = redirect.search;
          canonical.hash = redirect.hash;
          outgoing.set("location", canonical.toString());
        }
      }
      outgoing.set("Cache-Control", "no-store");
      outgoing.set("X-Content-Type-Options", "nosniff");
      outgoing.set("X-Frame-Options", "DENY");
      outgoing.set("Referrer-Policy", "same-origin");
      outgoing.set("Strict-Transport-Security", "max-age=31536000");
      return new Response(upstream.body, { status: upstream.status, headers: outgoing });
    } catch {
      return Response.json({ detail: "The service is temporarily unavailable. Please try again shortly." },
        { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "10" } });
    } finally { clearTimeout(timer); }
  },
};
