# Interactive FareeqAI architecture map

Generated from checked-in source on 25 October 2026 using [oh-my-mermaid](https://github.com/oh-my-mermaid/oh-my-mermaid) 0.2.0 and its `omm-scan` skill. This documents source/configuration; it is not a new production audit or a claim that every configured service is enabled live.

## Open the viewer

From the repository root:

```sh
npm install -g oh-my-mermaid@0.2.0
omm setup codex
omm view --port 4317
```

Open http://localhost:4317. Leave the viewer process running while exploring; stop it with Ctrl+C. Run it from this repository so it reads this project's `.omm/`. The tool may choose the next port if the requested port is occupied; use the URL it prints. The upstream viewer listens on the machine's default interfaces, so use it on a trusted development machine/network rather than deploying it as a public service.

Codex registration is user-level: `~/.agents/skills/oh-my-mermaid` points to the global npm package's skill directory. Another machine needs the same install/setup steps. Start a fresh Codex chat if newly installed skills do not appear immediately.

## What's mapped

| Perspective | Coverage |
| --- | --- |
| [Overall architecture](../.omm/overall-architecture/description.md) | Web and Expo/Safari clients, Pages routing, shared API and persistence. Expand web/mobile/backend and the shared agent engine. |
| [Request lifecycle](../.omm/request-lifecycle/description.md) | Admission, session/usage checks, owned conversation, scoped context, provider stream, persistence and post-reply learning. |
| [Document pipeline](../.omm/document-pipeline/description.md) | Bounded uploads, processing state, isolated parser/OCR, chunks, optional local embeddings and visible-document retrieval. |
| [External integrations](../.omm/external-integrations/description.md) | Cloudflare, Netlify, DockHosting, Neon, configured LLM provider, EAS and build-time model assets. |

The map contains eight diagrams and 49 documented node appearances, including nested views. Select items in the sidebar to read descriptions, source paths, constraints and concerns; zoom into grouped regions to see their children. The viewer refreshes when `.omm/` changes. Raw Mermaid files also render in compatible Markdown/Mermaid tools.

## Refresh after changes

Use `/omm-scan` in a coding tool that has loaded the installed skill, or ask it to refresh the affected FareeqAI architecture views. The CLI provides storage/viewing/validation; it does not autonomously infer source architecture. The AI scan must read current code and update the relevant fields.

```sh
omm list
omm tree overall-architecture
omm validate
omm validate overall-architecture/backend
omm read request-lifecycle description
```

Keep IDs aligned with child-directory names and every edge labeled. Every node needs a description; avoid changing unchanged fields. Commit reviewed `.omm/` updates alongside architectural changes. Existing prose architecture notes can be older; current code and the current hosting runbook take precedence.

## Verification and limits

- All eight diagrams passed CLI validation. Node/directory correspondence, descriptions and edge endpoints were independently checked across all diagrams.
- Version 0.2.0's CLI node-count heuristic misreads some labeled-edge text as additional nodes. It warns about size on the document/request views even though they contain 8/10 declared nodes respectively. The actual viewer uses a different parser; diagrams and nested documentation loaded in the browser. Backend validation may similarly warn about its eight nodes. These are heuristic warnings, not syntax failures.
- No application dependencies, runtime code, UI design or deployed services were changed. The tool is installed globally as development tooling, not shipped inside the web/native clients.
- No `.env` contents, account credentials, user conversations, database contents or signing files were added to this map. Cloud login/link/push was not configured; there is no new paid service or cloud synchronization.
- Document processing remains an in-process background task, not a durable queue. Process restart marks interrupted uploads failed for user retry. Embeddings/OCR run locally; ready passages can be sent with chat context to the configured LLM provider.
