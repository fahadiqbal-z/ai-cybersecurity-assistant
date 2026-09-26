# Contributing

Thank you for considering a contribution. This project is a defensive cybersecurity learning and analysis application. Please keep changes **authorized, educational and privacy-aware**.

## Before you start

- For security vulnerabilities, **do not open a public issue**; follow [SECURITY.md](SECURITY.md).
- For features or documentation, open an issue or discussion explaining the user problem and proposed scope before a large PR.
- Do not submit real credentials, live incident data, sensitive customer logs or executable offensive payloads as fixtures. Use fictional, non-operational examples.
- Do not add fake dashboards, simulated authentication, hardcoded AI outputs in runtime code or inactive "Coming Soon" actions.

## Development

1. Install Node.js 20.9+ and run `npm ci`.
2. Copy `.env.example` to `.env.local`; set a local `AUTH_SECRET`. Leave `DATABASE_URL` empty for local PGlite or point it to a throwaway PostgreSQL database.
3. Run `npm run dev`. The dev command applies migrations automatically.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run audit:deps` before proposing a PR.
5. For browser tests install Chromium (`npx playwright install chromium`; on Linux also install system dependencies when prompted) and run `npm run test:e2e` with a fresh **test** database.

## Code conventions

- Validate untrusted input on the server and keep UI + API validation aligned in `lib/validation.ts`.
- Scope private SQL reads/writes by `user_id` in the query. Add a cross-account regression test for new private resources.
- Do not import server secrets, DB access or the AI provider into Client Components.
- AI prompts should keep policy, the user's direct request and analyzed content distinct. Validate structured responses *before persistence*; display uncertainty and limitations.
- Render untrusted text, not HTML. If rich content is proposed, include a threat model and a maintained sanitization strategy.
- Include useful loading, success, error and empty states, keyboard behavior, labels and reduced-motion support.
- Keep reference material factually cautious and defensive. Avoid procedural instructions for unauthorized activity.
- Put schema changes in a new numbered SQL migration; never rewrite an applied migration.
- Explain privacy implications in the PR: provider payloads, logs, persisted fields, retention and deletion.

## Pull requests

Keep PRs focused. Describe the user-facing change, API/schema impact, security/privacy implications, tests run and screenshots **captured from a running app** if UI changed. CI must pass. Dependencies should have a justified purpose and a clean audit. The project is MIT-licensed; by contributing, you agree to that license.
