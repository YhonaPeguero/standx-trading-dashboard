import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Content-Security-Policy for the PRODUCTION build only (injected as a <meta>).
// We keep it off the dev server so it can't break Vite HMR's inline preamble.
// This app is fully client-side, makes NO API calls, and self-hosts its fonts
// (Geist, bundled via @fontsource) — so there is no external network access at
// all, which makes for the tightest policy possible:
//  - script-src 'self'      → blocks injected/inline scripts (primary XSS defense)
//  - connect-src 'self'     → nothing to reach outside the app's own origin
//  - frame-ancestors 'none' → clickjacking protection
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'standx-inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n  </head>`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: {
    port: 5173,
  },
});
