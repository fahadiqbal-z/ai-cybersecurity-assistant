# Security policy

AI Cybersecurity Assistant is intended for **defensive, educational and authorized** use. It does not authorize testing systems you do not own or have permission to assess, and it does not claim to be immune to attack.

## Report a vulnerability privately

**Do not post exploit details, secrets or user data in a public issue.** Once this project is published, use the GitHub repository's **Security → Advisories → Report a vulnerability** private reporting flow (the repository maintainer must enable private vulnerability reporting). If it is unavailable, contact the maintainer through a private channel listed on the actual published repository. No email address or response-time promise is fabricated here.

A useful report contains affected version/commit, environment, a minimal *non-destructive* reproduction, security impact and recommended mitigation. Do not access real user data, disrupt service, or run destructive tests. The maintainer should confirm scope, coordinate a fix, test it, and publish an advisory when appropriate. There is no bug bounty or promised SLA.

## Threat model and implemented boundaries

| Concern | Implemented control | Remaining limitation |
|---|---|---|
| Account takeover | Salted scrypt password hashing, opaque random session tokens, HMAC digests in DB, HttpOnly/Secure-in-production/SameSite=Lax cookies, expiry, revoke on reset/password change | No MFA, passkeys, verified email or breached-password screening. Host must terminate TLS correctly. |
| Cross-account access | Authenticated route handlers and owner-scoped resource queries, including item edits/exports; test coverage for guessed IDs | Future routes must preserve these checks. Do not treat a UI-only check as authorization. |
| CSRF / cross-site data | `Origin` verification on every mutation, SameSite cookies, no wildcard CORS, no GET mutations | Requires correct public origin/host behind a trusted proxy. Unsafe third-party browser extensions are out of scope. |
| Injection / XSS | Bounded Zod inputs, parameterized SQL, React text rendering, attachment-only exports and sanitized filenames, nonce CSP for scripts | Markdown exports are user-controlled documents; receivers should not treat them as trusted HTML. CSP permits inline styles for Next/controlled UI. |
| Abusive requests | DB-backed atomic buckets for login, register, reset, AI and writes, plus input/output limits | Not network-level DDoS protection. IP scopes assume a proxy overwrites `X-Forwarded-For`. |
| Secrets | Environment-only credentials; HMAC token digests; no AI prompt/response content in application logs; no client-side AI key | External provider and hosting logs/backup retention require independent governance. Console reset links are allowed only with explicit dev opt-in. |
| Prompt injection | Fixed system boundary; untrusted logs/code/descriptions sent as JSON-encoded data; no execution tools; structured output validation | Model behavior is probabilistic; this is not a formal prompt-injection guarantee. Human verification is required. |
| Harmful use | Narrow direct-request screening plus provider system policy against phishing, credential theft, malware, unauthorized access, evasion, persistence and destructive payloads | Pattern screening is not comprehensive; safety policy can over-/under-block. Monitor and improve with evaluation, not blind trust. |

## Operational requirements

1. Set a unique `AUTH_SECRET` (>=32 random characters). Rotating it invalidates existing sessions and reset links.
2. Use an HTTPS public origin and configure `APP_URL`; protect SMTP, PostgreSQL and AI secrets with a deployment secret manager.
3. Provide a trusted reverse proxy that overwrites forwarded IP headers and host/origin as appropriate; review `proxy.ts` CSP on any new integration.
4. Use PostgreSQL with least-privilege credentials in production. PGlite is a local single-process development database. Back up PostgreSQL and test restoration; document your backup retention/deletion policy.
5. Run migrations once per deployment, scan dependencies (`npm run audit:deps`), and run tests. Schedule `npm run db:prune` for expired session/reset/rate-limit records.
6. Configure SMTP for production reset. `DEV_RESET_LINK_LOG` never takes effect in production, but must not be used on shared dev hosts.
7. Verify AI provider privacy, retention and model suitability before submitting real material. Redaction patterns are **not** a secret scanner.
8. Monitor production API error rates, auth anomalies and resource consumption using your hosting platform without logging raw submitted content.

## Known limits

No email verification or MFA; no user-controlled retention window other than deletion; no formal security audit or penetration test; no SIEM integration; no guarantee against hallucinations or prompt injection; no network-level bot/DDoS solution. Markdown/JSON exports are not digitally signed. The optional local Compose file is not a production hardening guide.

See [docs/privacy.md](docs/privacy.md) and [docs/deployment.md](docs/deployment.md) for data lifecycle and operational assumptions.
