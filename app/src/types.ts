export type Lang = 'es' | 'en';

export type View = 'empty' | 'loading' | 'error' | 'dashboard';

export type ErrorType = 'empty' | 'format';

export type Range = 'all' | 'd30' | 'd90' | 'ytd';

export type Side = 'long' | 'short';

/**
 * A reconstructed round-trip trade: from when a symbol's net position opens
 * (from flat) until it returns to flat. Aggregates all the fills in between.
 */
export interface Trade {
  id: string;
  symbol: string;
  side: Side;
  /** realized PnL for the round trip (DUSD), gross of fees */
  pnl: number;
  /** fees paid across the round trip (DUSD) */
  fee: number;
  /** notional traded across the round trip (DUSD) */
  volume: number;
  /** base-asset quantity opened */
  qty: number;
  openAt: string;
  closedAt: string;
  /** number of fills that make up this trade */
  fills: number;
  /** true if the position is still open (not yet round-tripped) */
  open?: boolean;
}

/** Account-level context that isn't range-dependent. */
export interface AccountMeta {
  /** total fills/executions across the account */
  fills: number;
  /** share of taker fills, 0..1 (null if unknown) */
  takerPct: number | null;
  /** quantity-weighted average leverage from filled orders (null if no orders) */
  avgLeverage: number | null;
  /** number of distinct markets traded */
  symbols: number;
}

/** Aggregated stats computed over a filtered set of round-trip trades. */
export interface Stats {
  /** realized PnL (Σ pnl) — the headline number */
  net: number;
  /** net of fees (net − fees) */
  afterFees: number;
  fees: number;
  volume: number;
  /** number of closed round-trip trades */
  count: number;
  winRate: number;
  wins: number;
  losses: number;
  profitFactor: number;
  grossProfit: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  best: number;
  worst: number;
  bestSym: string;
  worstSym: string;
  streak: number;
  streakWin: boolean;
  first: string | null;
  last: string | null;
}

export interface LoadProgress {
  files: number;
  rows: number;
}
