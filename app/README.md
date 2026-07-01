# StandX Trading Dashboard

A **fully local** trading-stats dashboard for [StandX](https://standx.com)
perps. You export your trade history from StandX as `.txt` files (the
`query_trades` and `query_orders` responses), drop them in, and the app
**reconstructs your round-trip trades entirely in your browser** to compute
realized PnL, win rate, profit factor, fees, best/worst trades, per-market
breakdown and a shareable PNG card.

**No login, no JWT, no servers.** Your files never leave your device.

Built with React + Vite + TypeScript. Bilingual (ES / EN).

### Design

The palette, background treatment and typography are sourced directly from
StandX's own shipped products, not guessed:

- **Colors**: the moss-tinted dark surface ramp and `#00ff87` brand green come
  from the StandX community hub and SIP guide's real design tokens.
- **Background**: the technical grid + edge vignette mirrors the community
  hub's own background treatment.
- **Type**: [Geist](https://vercel.com/font) / Geist Mono — the same family
  standx.com and the community hub ship — self-hosted locally (no external
  font requests; see [SECURITY.md](SECURITY.md)).

## Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

Build / preview / typecheck:

```bash
npm run build
npm run preview
npm run typecheck
```

## How to use it

1. **Export your data from StandX** (the in-app guide shows this too): open
   DevTools → Network, reload your trade-history page, find the `query_trades` /
   `query_orders` requests, and save each **Response** as a `.txt` file.
2. **Drop the files** onto the upload area (or click to browse). You can add as
   many files as you like — pages are merged and de-duplicated automatically.
3. Click **Generate dashboard**.

Prefer to look around first? Hit **Try with sample data**.

### What it does with the files

StandX returns *fills* (executions) and *orders*, not ready-made trades — a
position is netted per symbol. So [`src/lib/standx.ts`](src/lib/standx.ts)
**reconstructs round-trip trades**: it walks each symbol's fills in time order
and cuts a trade every time the net position returns to flat. Totals (PnL, fees,
volume) are exact sums over fills; per-trade stats (win rate, profit factor,
best/worst) come from the round trips. Average leverage and taker share come
from the orders file when present.

> Note: StandX's data has no funding field, so the dashboard intentionally shows
> only what the export actually supports — no invented metrics.

The reader ([`src/lib/parse.ts`](src/lib/parse.ts)) auto-detects, per file:

- **JSON** — the `{ code, message, result: [...] }` StandX envelope (also
  `data`/`trades`/`orders`, plain arrays, etc.)
- **NDJSON** — one JSON object per line
- **CSV / TSV** — a header row + rows (treated as pre-aggregated trades)

Field names are matched leniently (camelCase, snake_case, and human CSV headers
all work) — the alias lists in `standx.ts` are the one place to tweak if a field
is named unusually.

## Privacy & security

Everything runs client-side; there is **no network call to any data API**. See
[SECURITY.md](SECURITY.md) for the full model (CSP, file-size caps, OWASP review).

## Project layout

```
src/
  App.tsx                 # state machine: upload → parsing → error / dashboard
  i18n.ts                 # ES / EN strings
  theme.ts, styles.css    # design tokens + global styles
  lib/
    parse.ts              # reads & parses uploaded files (JSON/NDJSON/CSV)
    standx.ts             # trade normalization + sample data
    stats.ts              # PnL / win-rate / streak / monthly math
    format.ts, export.ts  # USD/date formatting, JSON + summary export
  components/
    TopBar, EmptyState (uploader), LoadingState, ErrorState,
    Dashboard, ShareCard, Toast
    charts/               # CumulativeChart, Donut, MonthlyBars
```
