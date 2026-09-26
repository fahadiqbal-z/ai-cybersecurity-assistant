# AI Cybersecurity Assistant

**A defensive security workspace for understanding, analyzing, documenting and learning.**

Created by **Fahad Iqbal** — B.S. Cybersecurity student; Full-Stack Development · Cybersecurity · AI Engineering · Creative Technology.

The application brings together a security-focused assistant, log interpretation, vulnerability explanations, code review, project checklists, a curated learning library, terminology reference, private history and exportable reports. It is built for **defensive, educational and authorized** use. The interface deliberately avoids faux command terminals, fabricated incident metrics and generic chatbot styling.

> **Important:** AI output is provisional. A severity label is an assessment, not proof of an incident or a complete audit. Never paste secrets or information you are not authorized to process.

## See the application

These are captures of the **running application with a local test account**, not design mockups or claims about real incident data. The screenshots show the unconfigured-AI state honestly; the provider must be configured separately.

| Sign in | Workspace overview |
|:--:|:--:|
| ![Actual sign-in screen](docs/screenshots/login.png) | ![Actual security workspace with local test checklist](docs/screenshots/overview.png) |

![Actual local term reference screen](docs/screenshots/term-index.png)

Screenshots can be regenerated from a running local instance with `SCREENSHOT_EMAIL` and `SCREENSHOT_PASSWORD` using `npm run screenshots`. Do not use a real account or publish screenshots containing sensitive data.

## Features

| Area | What actually works |
|---|---|
| **Ask the analyst** | Multi-turn conversations, simple and technical explanations, defensive next steps, limitations and related terminology. Conversations save to the account automatically; rename/delete them from the thread or history. |
| **Log analysis** | Paste authentication, web, firewall or application excerpts. Receive structured observations, evidence, cautious severity/confidence, explanations, actions and explicit limitations. |
| **Vulnerability brief** | Explain an issue by root cause, impact, detection concepts, prevention, secure pattern and common mistakes. |
| **Secure code review** | Review Python, JavaScript, TypeScript, C++, Java, PHP or SQL excerpts with potential findings and a permanent "not a complete audit" qualification. |
| **Checklists** | Generate prioritized defensive tasks with AI **or start a blank checklist without AI**. Check/uncheck, add, edit and delete items, rename/delete the list, export Markdown or JSON. |
| **Learning & terms** | 12 curated progressive-disclosure guides across 10 areas; a locally searchable 28-term technical reference. No AI request is made when reading these. |
| **History & reports** | Search, filter, view, rename and delete personal records; convert saved analyses into report snapshots with Markdown/JSON export. No pretend PDF generator. |
| **Account** | Real registration, login/logout, password reset via SMTP (or explicitly opted-in dev console links), profile name/password updates and account deletion. |

All buttons above call implemented routes or perform real local UI operations. **Without an AI key**, AI actions explain why they are unavailable; nothing is fabricated.

## Technology & architecture

- **Application:** Next.js 16 App Router, React 19, TypeScript, custom CSS, Lucide icons.
- **Server & data:** Next.js Node.js route handlers, parameterized SQL, PostgreSQL in production. Local development defaults to persistent [PGlite](https://pglite.dev/) (embedded PostgreSQL-compatible database) in `.data/pglite` — no Docker needed to try the app.
- **Authentication:** 30-day opaque sessions in HttpOnly, SameSite=Lax cookies. Only keyed HMAC digests are stored server-side. Passwords use salted scrypt, not plaintext or reversible encryption.
- **AI:** A replaceable `AiProvider` adapter using an OpenAI-compatible `/chat/completions` endpoint. Server-only credentials; JSON-mode responses validated with Zod before use or storage.
- **Email:** Nodemailer SMTP for password reset. No client-side email or AI secrets.
- **Tests:** Vitest, Testing Library, PGlite-backed integration tests, Playwright browser tests.

```text
Browser (React pages, same-origin JSON requests)
  ├─ public learning/term reference (curated local data; no AI call)
  └─ private UI ──> Node route handlers ──> auth / ownership / Zod / rate limit
                                  ├─ PostgreSQL (production) or PGlite (local)
                                  ├─ AI service ──> configured HTTPS provider
                                  └─ SMTP ──> one-time reset message
```

The database connection is selected by `DATABASE_URL`. **Production rejects database operations without external PostgreSQL.** PGlite is single-process local development, not a serverless or multi-replica production database. See [architecture](docs/architecture.md).

## Quick start (local, no Docker)

**Requirements:** Node.js 20.9+ (20.20+ recommended), npm, a persistent writable directory. An AI provider key is needed for AI tools; the other features work without one.

```bash
git clone <YOUR-REPOSITORY-URL>
cd ai-cybersecurity-assistant
npm ci
cp .env.example .env.local
```

Edit `.env.local` and set `AUTH_SECRET` to **at least 32 random characters** (for example, run `openssl rand -hex 32` and paste the output). Do not commit it. Keep `DATABASE_URL=` empty for local PGlite. Optionally set `AI_API_KEY` and a compatible `AI_MODEL`. The sample `.env.example` contains **no valid keys**.

```bash
npm run dev
# Open http://localhost:3000 and create a real account.
```

`dev` applies SQL migrations then starts Next.js. PGlite data is in `.data/pglite` and is ignored by Git. To start with a clean local database, **stop the server** and remove `.data/pglite` (this irreversibly deletes local accounts and work).

### PostgreSQL instead of PGlite

Point `DATABASE_URL` at a PostgreSQL database. An optional local-only `compose.yaml` starts PostgreSQL bound to `127.0.0.1:5432`:

```bash
# In an untracked .env file, set a strong POSTGRES_PASSWORD=... (and optional POSTGRES_USER/POSTGRES_DB).
docker compose up -d database
# In .env.local, set DATABASE_URL=postgresql://acs:<URL_ENCODED_PASSWORD>@127.0.0.1:5432/acs
npm run db:migrate
npm run dev
```

Do **not** use the Compose service as your production database. Do not use a weak default password or commit `.env`. Each migration under `database/migrations/` is transactional and recorded in `schema_migrations`; run migrations as **one deployment job**, not simultaneously on multiple replicas.

### AI provider configuration

| Variable | Meaning |
|---|---|
| `AI_API_KEY` | Server-only provider secret; required for AI routes. |
| `AI_BASE_URL` | HTTPS base URL of an OpenAI-compatible chat-completions API; default `https://api.openai.com/v1`. HTTP is accepted **only for localhost in development**. |
| `AI_MODEL` | A model that supports chat completions **and JSON object response format**; default `gpt-4o-mini` (availability/pricing depend on your provider). |

AI input caps: chat 2,000 characters per question, logs 14,000, code 16,000, vulnerability descriptions 500, checklist descriptions 1,200. Up to eight previous chat messages are sent for context. Provider requests time out after 45 seconds; output is capped at 2,400 tokens and schema-checked. Inference costs and provider retention depend on **your** account and provider. See [AI and trust boundaries](docs/architecture.md#ai-trust-boundary).

### Password reset configuration

Set `APP_URL` to the actual public HTTPS origin in production and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`, and, if required by your server, `SMTP_USER` / `SMTP_PASSWORD`. The reset API deliberately returns the same public message whether an email exists or not. Links expire after 30 minutes, are single-use, and revoke all sessions when used.

For a **local-only** reset test with no mail server, set `DEV_RESET_LINK_LOG=true`; the link appears in the server console. This setting does **nothing in production**. Never enable it on a shared development machine. See [deployment](docs/deployment.md).

## Environment variables

Copy [`.env.example`](.env.example); `.env`, `.env.local`, `.env.*` other than the example are Git-ignored.

| Name | Required | Description |
|---|---|---|
| `AUTH_SECRET` | Yes | >=32-character random secret for HMAC digests of tokens and rate-limit buckets. Rotating it invalidates sessions/reset links. |
| `DATABASE_URL` | Production | PostgreSQL connection string. Empty locally selects PGlite. |
| `AI_API_KEY` | For AI tools | Never exposed to browser. |
| `AI_BASE_URL` / `AI_MODEL` | For non-default provider/model | Model must support `response_format: json_object`. |
| `APP_URL` | Reset links, production | Public application origin. In local use `http://localhost:3000`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_FROM` | Production password reset | SMTP connection, sender and TLS mode. |
| `SMTP_USER` / `SMTP_PASSWORD` | As required by SMTP | Server-side credentials. |
| `DEV_RESET_LINK_LOG` | Local opt-in only | Console reset links; disabled in production by code. |
| `POSTGRES_USER` / `POSTGRES_DB` / `POSTGRES_PASSWORD` | Optional Compose only | Local PostgreSQL container; Docker Compose reads an untracked `.env`. |

## Repository map

```text
ai-cybersecurity-assistant/
├── app/                  # Routes, pages, styles, server layouts
│   ├── (auth)/           # Registration, login, recovery
│   ├── (workspace)/      # Private workstation + reference
│   └── api/              # Real authenticated JSON/export routes
├── components/           # Typed interactive UI & views
├── services/ai/          # Safety, prompts, provider contract/adapter
├── lib/                  # Database, auth, validation, repositories, reports
├── database/migrations/  # SQL schema and indexes
├── data/                 # Curated topics and terminology
├── scripts/              # Migrate, prune, capture actual screenshots
├── tests/                # Security/unit/integration tests + browser flows
├── docs/                 # Architecture, deployment, privacy, testing, portfolio
├── proxy.ts              # Per-request nonce CSP for HTML
├── compose.yaml          # Optional local PostgreSQL only
├── SECURITY.md
├── CONTRIBUTING.md
└── .env.example
```

### Tables and ownership

`users` → `sessions`, `password_resets`, `conversations` → `messages`, `analyses`, `reports`, `checklists` → `checklist_items`; plus bounded `rate_limits` and `schema_migrations`. Private reads and writes are scoped by **both resource ID and authenticated user ID**. Reports are snapshots; deleting a source analysis **does not** delete its derived report. Deleting the account cascades to both.

Full schema, example data flows and API inventory: [docs/architecture.md](docs/architecture.md).

## Security and privacy model (brief)

- **Authentication/authorization:** salted scrypt password hashes, keyed digests for opaque tokens, expiring/revocable sessions; scoped SQL on each resource route; cross-account tests.
- **Request boundaries:** server-side Zod input validation, body caps, parameterized SQL, same-origin `Origin` check for mutations, SameSite cookies, no permissive CORS, DB-backed rate limiting on auth/AI/writes, secure response headers and nonce CSP.
- **AI boundaries:** fixed defensive system policy, direct high-confidence harm screening, analyzed content JSON-encoded as untrusted data, validated structured responses, no execution of pasted material, no plaintext AI request logging. These reduce risk; they do not make prompt injection or hallucination impossible.
- **Privacy:** chat messages save automatically. Pasted log/code/issue excerpts are **sent to the configured AI provider** when analyzed, but are only saved to history when you explicitly select Save. Checklists and reports save on creation. A best-effort masker covers common credentials; it cannot guarantee redaction. Profile deletion removes application database rows, **not** previous provider submissions or already taken infrastructure backups.
- **Output:** React escapes AI-supplied text. Exports are attachments with sanitized filenames; no uploaded files or command execution features exist.

See [SECURITY.md](SECURITY.md) and the detailed [privacy notes](docs/privacy.md). This project does **not** claim to be completely secure or a substitute for professional assessment.

## Run checks

```bash
npm run typecheck
npm run lint
npm test                    # Vitest unit/UI/DB/API/security cases
npx playwright install chromium
npm run test:e2e           # Full browser journey; launches dev server if needed
npm run build
npm run audit:deps         # Production dependencies
npm run db:prune           # Expired sessions/reset links/rate-limit buckets
```

On Linux, Playwright may also require `npx playwright install --with-deps chromium`. Browser tests create **temporary real accounts** and delete them at the end. Run E2E on a **fresh local test database**, not against production. See [docs/testing.md](docs/testing.md). The CI workflow runs the checks automatically on PRs.

## Deployment

Use a long-running Node.js host with HTTPS and PostgreSQL. Configure environment variables through a secret manager, run `npm ci`, `npm run build`, `npm run db:migrate` (one job), then `npm run start`. Put the app behind a trusted reverse proxy that overwrites forwarded IP headers, provides TLS and preserves its public host/origin. Configure SMTP before enabling password recovery for real users. Schedule `npm run db:prune`. See the [deployment checklist](docs/deployment.md) for more detail. **Do not deploy PGlite to a serverless or multi-instance production host.**

## Limitations and future directions

- External AI requires a valid key and a compatible JSON-mode model. There is no offline pretend AI. Model output may be wrong, unsafe or incomplete; redaction and prompt-injection defenses are best-effort.
- No email verification, MFA/passkeys, email-change flow or enterprise SSO. Registration permits unverified email ownership; deploy with appropriate access controls and add verification before handling sensitive customers.
- No PDF generator or file uploads. Reports export Markdown/JSON; browser print is available, but is not called a PDF export feature.
- Local PGlite is single-process only; PostgreSQL is required in production. For large multi-user deployments, add background jobs, queueing, retention policies, provider governance and monitoring.
- Rate limiting uses forwarded IPs only when a **trusted reverse proxy overwrites them**; user/email/session buckets provide further limits. It is not DDoS protection. No administrative moderation UI.
- One migration runner at a time. No distributed migration lock; coordinate deployments. No cross-provider AI schema guarantee beyond the documented adapter contract.

Potential improvements: verified email and passkeys, finer-grained retention controls, analysis comparison, integration tests with a live PostgreSQL service, richer AI evaluations and optional report-to-PDF via a proper renderer.

## Author, license & portfolio

**Fahad Iqbal** · B.S. Cybersecurity Student · Full-Stack Developer · Cybersecurity · AI Engineering · Creative Technology.

MIT License — see [LICENSE](LICENSE). Security reports: [SECURITY.md](SECURITY.md). Contributions: [CONTRIBUTING.md](CONTRIBUTING.md).

A truthful case-study draft is in [docs/portfolio-description.md](docs/portfolio-description.md). **GitHub URL and live demo URL are not invented here**; add your actual links after publishing/deployment.
