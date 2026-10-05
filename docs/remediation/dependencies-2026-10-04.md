# Dependency remediation and applicability

Next and eslint-config-next are pinned to 16.3.8; ESLint to 9.39.5; PostCSS to 8.5.28; Tailwind remains on its compatible 3.x line, updated to 3.4.19. npm audit fix refreshed compatible transitive packages. The existing lockfile change was saved before updates. A clean npm ci, typecheck, lint and production build passed.

The critical Next advisory is fixed (upstream patched 16.3.6). No application next/og ImageResponse path was found, but applicability was not used to avoid upgrading. PostCSS, ESLint/plugin-kit and brace-expansion advisories no longer appear in the npm result.

## Remaining build-only advisory

Full npm audit reports seven high findings, all rooted in `braces` GHSA-vfj7-8cjw-p6xm. The affected chain includes micromatch, fast-glob, chokidar, Tailwind, eslint-config-next and its plugin. Upstream lists **no patched version**; npm's suggestions to downgrade Next tooling or migrate Tailwind to v4 do not eliminate every affected tooling chain and introduce unrelated compatibility risk.

This is a recorded applicability exception, not a clean full audit or a blanket high-severity waiver. The failure requires deeply nested untrusted glob/brace patterns. FareeqAI build/lint patterns are maintained in source configuration; browser/API input is not used as build configuration or passed to these packages. Build and CI must only consume reviewed trusted source, in isolated runners without deployment credentials for untrusted pull requests.

The frontend Docker runtime now copies Next's standalone server, static assets and public assets rather than the whole build workspace. Inspection of standalone output confirms the affected build tools are absent. `npm audit --omit=dev` reports **zero advisories**. `npm run check:dependencies` requires zero runtime findings, allows only this exact build advisory, and verifies the standalone output excludes the affected tools. It fails on audit-service errors or any new advisory. Full npm audit remains visible and exits nonzero; no audit data is suppressed.

Recheck this exception on every release and when braces/Next tooling publish a fix. Production sign-off must explicitly acknowledge the build-only exception; it is not evidence of a reachable runtime vulnerability. OS image advisories and future registry updates are separate checks.

Python: pip-audit of backend/requirements.lock found no known vulnerabilities. Image lock verification found 51 locked packages, 52 installed including pip, no missing/wrong/extra runtime packages. All 557 backend tests passed in that image, including OCR and embedding tests.

Sources verified during remediation:
- [Next upstream advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j)
- [braces advisory, no patched version](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- Installed Next documentation: output/standalone, CSS, Turbopack. Standalone behavior was verified by the actual container build and browser journey.
