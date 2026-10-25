Cloudflare serves Expo static assets at /mobile/, forwards website requests to Netlify and /api requests to DockHosting. Credentials reach only the API upstream; page responses carry only preference cookies.

Source: `deploy/cloudflare-pages/_worker.js`.
