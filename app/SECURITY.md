# Security model

This dashboard is a **fully client-side** single-page app. There is no backend,
no database, no login, and **no API calls to any data endpoint**. You upload the
`.txt` / `.json` / `.csv` files you exported from StandX, and they are parsed
entirely in your browser.

## Your data never leaves your device

- Files are read with the local `Blob.text()` API ([`src/lib/parse.ts`](src/lib/parse.ts))
  and held only in memory. **Nothing is uploaded anywhere.**
- The app stores nothing persistently — no `localStorage`, `sessionStorage`,
  cookies, or `IndexedDB`. (Verified — the codebase contains none of these.)
- No telemetry, no analytics, no third-party network calls, **no external font
  requests either** — the Geist typeface is self-hosted as static woff2 assets
  (`src/assets/fonts`, OFL-1.1 licensed, Latin/Latin-Extended subsets only), so
  nothing is fetched from Google Fonts, Vercel, or anywhere else at runtime.
- There is **no JWT / token** anywhere in this design — the previous token-based
  flow was removed in favour of local file analysis, eliminating that entire
  class of secret-handling risk.
- The share-card's optional **custom background image** (`ShareCard.tsx`) never
  leaves the browser either: it's read with `URL.createObjectURL`, capped at
  10MB and validated as an image `type` client-side, held only as an in-memory
  object URL, and revoked (`URL.revokeObjectURL`) when replaced or when the
  share dialog closes. The **"Copy image"** button uses the standard Clipboard
  API to place the rendered PNG on your OS clipboard — nothing is sent anywhere.

## Untrusted-input handling (parsing)

Uploaded files are untrusted input, so the parser is defensive:

- Parsed with `JSON.parse` / a hand-rolled CSV reader only — **never** `eval` or
  `Function`.
- Caps against pathological uploads: **25 MB/file**, **50 files**,
  **200,000 records** max.
- Records are normalized by reading known fields only (no object spreading of
  attacker-controlled keys), so there is no prototype-pollution path.
- All parsed values are rendered by React as text and auto-escaped — symbols,
  dates, etc. cannot inject markup.

## Content-Security-Policy

The production build injects a tight CSP (see [`vite.config.ts`](vite.config.ts)):

- `script-src 'self'` — blocks injected/inline scripts, the primary XSS vector.
- `connect-src 'self'` — nothing to reach outside the app's own origin; fonts
  are self-hosted, so there's no third-party host to allowlist at all.
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` —
  anti-clickjacking and base-tag hijacking.

The CSP is intentionally not applied to the Vite dev server (it would break
HMR's inline preamble). In production, also set it as a real response header at
your host/CDN for defense in depth.

## Review against OWASP (web app + API)

| Risk | Status |
| --- | --- |
| **XSS** | React escapes all rendered values; no `dangerouslySetInnerHTML`, `innerHTML`, or `eval`. Parsed file data is rendered as text. CSP `script-src 'self'` as defense-in-depth. |
| **Sensitive data exposure** | No secrets handled at all (no token/login). Trade data stays in memory and is never transmitted. |
| **SSRF / open redirect** | N/A — no server and no data fetches. The only external navigation is the user-initiated "Share on X" link (`rel="noopener,noreferrer"`). |
| **Injection** | No SQL/DB, no template engine, no shell. Files are parsed, not executed. |
| **Untrusted deserialization** | `JSON.parse` only; size/count caps; known-field reads (no prototype pollution). |
| **Vulnerable dependencies** | `npm audit --omit=dev` → **0** production vulnerabilities. One dev-only esbuild advisory (dev-server CORS, GHSA-67mh-4wv8-2f99) remains; it does not ship in the bundle. |
| **Security misconfiguration** | Strict CSP on build; external links use `rel="noopener,noreferrer"`. |
| **Clickjacking** | `frame-ancestors 'none'`. |

## Wallet address is never surfaced

The raw StandX files contain your wallet address (a `user` field on every
record). The reconstruction reads only the trading fields — the wallet is never
parsed into the model, never displayed, and never written to the JSON/summary
exports.

## Residual notes

- The downloadable JSON/PNG exports contain your trade stats — they're generated
  locally and only saved where you choose. Treat them like any personal export.
