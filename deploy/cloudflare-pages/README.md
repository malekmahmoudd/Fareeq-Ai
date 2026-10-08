# FareeqAI Pages delivery

Public entry point: `https://fareeqai.pages.dev`.

This is a Pages advanced-mode delivery proxy, not a static export or a native
Next.js deployment to Pages. The existing dynamic Next.js app stays on Netlify.
The proxy serves that frontend through Cloudflare and sends `/api` requests
directly to the DockHosting API. Netlify's regional connection timeouts were
reproduced on Wi-Fi/mobile data and match reports on Netlify's support forum.

There are no private credentials in the package. Authentication cookies and
authorization reach only the backend; the frontend receives only locale, accessibility
and data-saver preferences. Original API Origin headers are preserved. Configure
DockHosting `FRONTEND_URL=https://fareeqai.pages.dev` for the strict origin check.
Preview addresses refuse API requests and redirect page reads to the public
origin. All responses disable caching so dynamic page nonces and private API
responses cannot be shared between users. SSE bodies are passed through without
buffering. The 35-second timeout applies to response headers only.

Local regression: `node deploy/tests/cloudflare-pages-check.mjs`.

Upload only `_worker.js` and `index.html` in a zip with both at its root.
Cloudflare's dashboard supports `_worker.js` via Direct Upload. This project
does not have automatic Git deployment; each change to this delivery proxy needs
another explicit upload. Next.js source changes still deploy through Netlify.
Do not upload this README, tests, `.env` files or credentials.

Pages Free Functions share the Workers request allowance. Verify account limits
and live transport before launch. This proxy remains dependent on Netlify for
the frontend and does not remove the backend host's free-plan sleep limits. Cold API
wake, cookies, real AI, persistence and document processing remain launch gates.

References:
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/functions/advanced-mode/
- https://developers.cloudflare.com/pages/framework-guides/nextjs/
