import type { AccountMeta, Side, Trade } from '../types';

/**
 * StandX account reconstruction.
 *
 * The real StandX export is two files: trade *fills* (executions) and *orders*.
 * Neither contains ready-made "trades" — a position is netted per symbol. So we
 * reconstruct round-trip trades by walking each symbol's fills in time order and
 * cutting a trade every time the net position returns to flat.
 *
 * Totals (PnL, fees, volume) are exact sums over fills; per-trade stats
 * (win rate, best/worst, profit factor) come from the round trips.
 */

type RawRecord = Record<string, unknown>;

const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function indexRecord(raw: RawRecord): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const k in raw) {
    if (Object.prototype.hasOwnProperty.call(raw, k)) m[normKey(k)] = raw[k];
  }
  return m;
}

function pick(idx: Record<string, unknown>, ...aliases: string[]): unknown {
  for (const a of aliases) {
    const v = idx[normKey(a)];
    if (v != null && v !== '') return v;
  }
  return undefined;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.eE+-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toIso(v: unknown): string {
  if (v == null || v === '') return new Date().toISOString();
  if (typeof v === 'number') {
    const ms = v > 1e12 ? v : v * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const s = String(v).trim();
  if (/^\d{10,13}$/.test(s)) {
    const n = parseInt(s, 10);
    return new Date(n > 1e12 ? n : n * 1000).toISOString();
  }
  const t = Date.parse(s);
  return isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
}

// --------------------------------------------------------------------------
// Classification
// --------------------------------------------------------------------------

type Kind = 'fill' | 'order' | 'generic';

function classify(idx: Record<string, unknown>): Kind {
  if ('feeqty' in idx || 'istaker' in idx) return 'fill';
  if ('ordertype' in idx || 'positionid' in idx || ('leverage' in idx && 'status' in idx))
    return 'order';
  // a generic "already a trade" row: has a pnl and a symbol-ish field
  if (('pnl' in idx || 'realizedpnl' in idx || 'profit' in idx) && ('symbol' in idx || 'market' in idx))
    return 'generic';
  return 'generic';
}

interface Fill {
  id: string;
  symbol: string;
  dir: 1 | -1;
  qty: number;
  pnl: number;
  fee: number;
  value: number;
  ts: number;
  taker: boolean;
}

function toFill(idx: Record<string, unknown>, i: number): Fill {
  const side = String(pick(idx, 'side', 'direction') ?? 'buy').toLowerCase();
  const dir: 1 | -1 = side.includes('sell') || side.includes('short') || side === 's' ? -1 : 1;
  const qty = Math.abs(num(pick(idx, 'qty', 'quantity', 'size', 'fillqty', 'amount')));
  const price = num(pick(idx, 'price', 'fillavgprice', 'avgprice'));
  return {
    id: String(pick(idx, 'id', 'tradeid', 'fillid') ?? 'f' + i),
    symbol: String(pick(idx, 'symbol', 'market', 'pair', 'instrument') ?? 'UNKNOWN'),
    dir,
    qty,
    pnl: num(pick(idx, 'pnl', 'realizedpnl', 'profit')),
    fee: Math.abs(num(pick(idx, 'feeqty', 'fee', 'fees', 'commission'))),
    value: num(pick(idx, 'value', 'notional')) || qty * price,
    ts: Date.parse(toIso(pick(idx, 'createdat', 'created_at', 'time', 'timestamp', 'updatedat', 'date'))),
    taker: pick(idx, 'istaker') === true || String(pick(idx, 'istaker') ?? '').toLowerCase() === 'true',
  };
}

// --------------------------------------------------------------------------
// Round-trip reconstruction
// --------------------------------------------------------------------------

const EPS = 1e-6;

function reconstructFromFills(fills: Fill[]): Trade[] {
  const bySym: Record<string, Fill[]> = {};
  for (const f of fills) (bySym[f.symbol] = bySym[f.symbol] || []).push(f);

  const trades: Trade[] = [];
  let tid = 0;

  for (const sym in bySym) {
    const list = bySym[sym].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));
    let net = 0;
    let cur: Trade | null = null;

    const open = (f: Fill): Trade => ({
      id: 't' + tid++,
      symbol: sym,
      side: f.dir > 0 ? 'long' : 'short',
      pnl: 0,
      fee: 0,
      volume: 0,
      qty: 0,
      openAt: new Date(f.ts).toISOString(),
      closedAt: new Date(f.ts).toISOString(),
      fills: 0,
    });

    for (const f of list) {
      if (!cur) cur = open(f);
      cur.pnl += f.pnl;
      cur.fee += f.fee;
      cur.volume += f.value;
      cur.qty += f.qty;
      cur.fills += 1;
      cur.closedAt = new Date(f.ts).toISOString();

      const newNet = net + f.dir * f.qty;
      if (Math.abs(newNet) < EPS) {
        trades.push(cur);
        cur = null;
        net = 0;
      } else if (net !== 0 && Math.sign(newNet) !== Math.sign(net)) {
        // position flipped through zero: close this trade, open a residual one
        trades.push(cur);
        cur = open(f);
        cur.side = newNet > 0 ? 'long' : 'short';
        net = newNet;
      } else {
        net = newNet;
      }
    }
    if (cur) {
      cur.open = true;
      trades.push(cur);
    }
  }

  trades.sort((a, b) => Date.parse(a.closedAt) - Date.parse(b.closedAt));
  return trades;
}

function genericTrade(idx: Record<string, unknown>, i: number): Trade {
  const side = String(pick(idx, 'side', 'direction') ?? 'long').toLowerCase();
  const at = toIso(pick(idx, 'closedat', 'closed_at', 'closetime', 'date', 'time', 'timestamp', 'createdat'));
  return {
    id: String(pick(idx, 'id', 'tradeid', 'orderid') ?? 't' + i),
    symbol: String(pick(idx, 'symbol', 'market', 'pair', 'instrument') ?? 'UNKNOWN'),
    side: side.includes('short') || side === 'sell' ? 'short' : 'long',
    pnl: num(pick(idx, 'pnl', 'realizedpnl', 'profit', 'netpnl')),
    fee: Math.abs(num(pick(idx, 'fee', 'fees', 'commission'))),
    volume: Math.abs(num(pick(idx, 'volume', 'notional', 'size', 'value'))),
    qty: Math.abs(num(pick(idx, 'qty', 'quantity', 'size'))),
    openAt: at,
    closedAt: at,
    fills: 1,
  };
}

export interface Account {
  trades: Trade[];
  meta: AccountMeta;
}

/** Build an account (round-trip trades + meta) from raw uploaded records. */
export function reconstructAccount(records: RawRecord[]): Account {
  const fillRecords: Record<string, unknown>[] = [];
  const orderRecords: Record<string, unknown>[] = [];
  const genericRecords: Record<string, unknown>[] = [];

  for (const r of records) {
    const idx = indexRecord(r);
    const kind = classify(idx);
    if (kind === 'fill') fillRecords.push(idx);
    else if (kind === 'order') orderRecords.push(idx);
    else genericRecords.push(idx);
  }

  let trades: Trade[];
  let fillCount = 0;
  let takerPct: number | null = null;

  if (fillRecords.length) {
    // dedupe fills by id, then reconstruct round trips
    const seen = new Set<string>();
    const fills: Fill[] = [];
    fillRecords.forEach((idx, i) => {
      const f = toFill(idx, i);
      if (seen.has(f.id)) return;
      seen.add(f.id);
      fills.push(f);
    });
    fillCount = fills.length;
    const takers = fills.reduce((a, f) => a + (f.taker ? 1 : 0), 0);
    takerPct = fills.length ? takers / fills.length : null;
    trades = reconstructFromFills(fills);
  } else {
    // pre-aggregated rows (generic CSV/JSON) — treat each as a closed trade
    const seen = new Set<string>();
    trades = [];
    genericRecords.forEach((idx, i) => {
      const t = genericTrade(idx, i);
      const key = t.id && t.id !== 't' + i ? `id:${t.id}` : `${t.symbol}|${t.closedAt}|${t.pnl}`;
      if (seen.has(key)) return;
      seen.add(key);
      trades.push(t);
    });
    trades.sort((a, b) => Date.parse(a.closedAt) - Date.parse(b.closedAt));
  }

  // average leverage from filled orders (quantity-weighted)
  let avgLeverage: number | null = null;
  if (orderRecords.length) {
    let wsum = 0;
    let qsum = 0;
    for (const idx of orderRecords) {
      const lev = num(pick(idx, 'leverage'));
      const q = num(pick(idx, 'fillqty', 'qty', 'quantity'));
      const status = String(pick(idx, 'status') ?? '').toLowerCase();
      if (lev > 0 && q > 0 && (status === 'filled' || status === '')) {
        wsum += lev * q;
        qsum += q;
      }
    }
    if (qsum > 0) avgLeverage = wsum / qsum;
  }

  const symbols = new Set(trades.map((t) => t.symbol));

  return {
    trades,
    meta: {
      fills: fillCount,
      takerPct,
      avgLeverage,
      symbols: symbols.size,
    },
  };
}

// --------------------------------------------------------------------------
// Sample data — for the "try with sample data" button
// --------------------------------------------------------------------------

export type Scenario = 'winning' | 'mixed' | 'losing';

/** Deterministic sample round-trip trades for the demo. */
export function generateDemo(scenario: Scenario = 'winning'): Account {
  const winP = scenario === 'losing' ? 0.42 : scenario === 'mixed' ? 0.5 : 0.58;
  let s = 0x9e3779b9 ^ (scenario.length * 1013904223);
  const rnd = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const syms = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'HYPE-USD', 'BNB-USD', 'XAU-USD'];
  const start = Date.parse('2025-11-24T00:00:00Z');
  const end = Date.parse('2026-06-24T00:00:00Z');
  const count = 140;
  const trades: Trade[] = [];
  let totalFills = 0;
  for (let i = 0; i < count; i++) {
    const frac = i / (count - 1);
    const openTs = start + frac * (end - start) + (rnd() - 0.5) * 36e5 * 30;
    const durMin = 15 + rnd() * 240;
    const sym = syms[Math.floor(rnd() * syms.length)];
    const side: Side = rnd() < 0.55 ? 'long' : 'short';
    const volume = Math.round(2000 + rnd() * 40000);
    const win = rnd() < winP;
    const mag = volume * (0.002 + rnd() * 0.02);
    let pnl = win ? mag : -mag * (0.7 + rnd() * 0.8);
    pnl = Math.round(pnl * 100) / 100;
    const fee = Math.round(volume * 0.00045 * 100) / 100;
    const fills = 2 + Math.floor(rnd() * 10);
    totalFills += fills;
    trades.push({
      id: 't' + (100000 + i),
      symbol: sym,
      side,
      pnl,
      fee,
      volume,
      qty: Math.round((volume / 50000) * 1000) / 1000,
      openAt: new Date(openTs).toISOString(),
      closedAt: new Date(openTs + durMin * 60000).toISOString(),
      fills,
    });
  }
  trades.sort((a, b) => Date.parse(a.closedAt) - Date.parse(b.closedAt));
  return {
    trades,
    meta: { fills: totalFills, takerPct: 0.62, avgLeverage: 12, symbols: new Set(trades.map((t) => t.symbol)).size },
  };
}
