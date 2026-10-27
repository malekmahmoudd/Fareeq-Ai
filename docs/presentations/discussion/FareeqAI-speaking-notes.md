# FareeqAI technical discussion

Eight slides, about four minutes. Scripts are also embedded in PowerPoint speaker notes.

## Slide 1 — FareeqAI

- A personal AI team: Leo and nine specialists.
- Chat, ask questions about documents and save useful replies.
- Use memories, goals and plans to continue work over time.

**Remember:** The website and Android app share the same backend.

**Say this (20–30 seconds):** FareeqAI helps people work with specialized AI teammates for areas such as careers, studying, writing and fitness. Users can start as guests, chat with a teammate, upload documents and organize goals or plans. The website and Android application connect to the same backend, so registered users can access their saved work across clients.

## Slide 2 — Technology stack

- TypeScript: Next.js / React for web, Expo / React Native for mobile.
- Python: FastAPI serves requests. Pydantic validates input.
- PostgreSQL stores data. SQLAlchemy accesses it. Alembic updates tables.

**Remember:** Groq generates replies. Docker packages the API. Expo EAS builds Android.

**Say this (20–30 seconds):** React gives us reusable interface components, while Expo simplifies mobile development and Android builds. FastAPI organizes the Python API, and Pydantic validates inputs. PostgreSQL stores related data, with SQLAlchemy for access and Alembic for schema changes. GitHub tracks our code. Cloudflare and Netlify deliver the clients, DockHosting runs the API, and Neon hosts PostgreSQL.

## Slide 3 — System architecture

- Clients collect input and show results. FastAPI handles application logic.
- HTTPS carries requests. SSE streams reply text as it arrives.

**Remember:** One shared API connects both clients to data and the AI provider.

**Say this (20–30 seconds):** The architecture has client interfaces, one shared backend, a database and an external AI provider. Cloudflare routes website pages to Next.js and API requests to FastAPI. FastAPI loads the required information, calls the AI provider and stores the result. SSE means server-sent events: the answer appears progressively instead of waiting for the complete response.

## Slide 4 — Agent runtime

- registry.py loads each teammate’s configuration and prompt.
- AgentRuntime.run_stream() manages one conversation turn.
- It builds context, calls the provider and streams the answer.

**Remember:** Ten teammates use one shared runtime, with different configurations.

**Say this (20–30 seconds):** Each teammate has a configuration describing its role, behavior and prompt. The registry loads these definitions. The shared runtime then manages the conversation, sends the prepared request to the model and returns the answer incrementally. Adding a specialist mainly means adding its configuration. The AI comes from an existing model provider, rather than a model we trained ourselves.

## Slide 5 — Context and memory

- build_context() combines instructions, history, memories and goals.
- Shared memory contains facts permitted for the selected agent.
- Agent memory holds specialist-specific information.

**Remember:** A specialist does not receive another agent’s raw conversation history.

**Say this (20–30 seconds):** Context is the information supplied to the model before it answers. We combine the agent’s instructions with relevant conversation history, memories and goals. Shared facts and specialist-specific memory live separately. The context builder limits what each agent receives. After a reply, optional analysis can extract eligible facts for future conversations. This changes stored context, not the model’s training.

## Slide 6 — Document processing and search

- ingest() extracts text, splits it into chunks and optionally embeds it.
- parse_isolated() reads files in a separate, limited process.
- retrieve() combines BM25 keyword search with optional meaning search.

**Remember:** Relevant passages enter the prompt. Embeddings run locally.

**Say this (20–30 seconds):** When a user uploads a document, we extract its text and divide it into smaller passages called chunks. BM25 finds keyword matches. Optional embeddings, numerical representations of meaning, help find similar ideas. We merge the two rankings and supply relevant passages to the model. This is retrieval-augmented generation, or RAG: answering with retrieved information.

## Slide 7 — Authentication and data isolation

- Guests get separate workspaces. Signing in is optional.
- Browsers use HttpOnly cookies. Native tokens use Expo SecureStore.
- authenticated_id() and session_ok() check identity and sessions.

**Remember:** The backend checks ownership before returning private data.

**Say this (20–30 seconds):** Guest access still creates an isolated identity, so visitors do not share one workspace. Browser sessions use HttpOnly cookies, which page JavaScript cannot read. Android keeps its signed access token in SecureStore, protected device storage. The backend checks the session and record ownership before serving private data. Optional two-factor authentication adds another check during sign-in.

## Slide 8 — End-to-end example: Harvey and a CV

- Upload a CV. The backend validates it and prepares searchable text.
- Ask Harvey to prepare interview questions using the CV.
- The backend checks ownership, retrieves passages and builds context.

**Remember:** The reply streams to the screen and is saved in the database.

**Say this (20–30 seconds):** First, I upload my CV for Harvey and wait until processing finishes. When I ask for interview preparation, the backend validates my session and conversation. It retrieves relevant CV passages and combines them with Harvey’s instructions and permitted context. The AI provider generates a reply, which streams to the screen and is saved. Eligible memory updates can follow afterward.
