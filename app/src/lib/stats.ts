import type { Range, Stats, Trade } from '../types';

const DAY = 864e5;

/** Filter the (chronologically ascending) trade list by the selected range. */
export function filterByRange(all: Trade[], range: Range): Trade[] {
  if (!all.length) return [];
  if (range === 'all') return all;
  const end = Date.parse(all[all.length - 1].closedAt);
  let from: number;
  if (range === 'd30') from = end - 30 * DAY;
  else if (range === 'd90') from = end - 90 * DAY;
  else if (range === 'ytd') from = Date.UTC(new Date(end).getUTCFullYear(), 0, 1);
  else from = -Infinity;
  return all.filter((x) => Date.parse(x.closedAt) >= from);
}

const EMPTY: Stats = {
  net: 0,
  afterFees: 0,
  fees: 0,
  volume: 0,
  count: 0,
  winRate: 0,
  wins: 0,
  losses: 0,
  profitFactor: 0,
  grossProfit: 0,
  grossLoss: 0,
  avgWin: 0,
  avgLoss: 0,
  best: 0,
  worst: 0,
  bestSym: '',
  worstSym: '',
  streak: 0,
  streakWin: true,
  first: null,
  last: null,
};

export function computeStats(f: Trade[]): Stats {
  if (!f.length) return { ...EMPTY };

  // Totals over ALL trades in range (incl. the still-open one) so they match
  // the raw account numbers.
  let net = 0;
  let fees = 0;
  let volume = 0;
  let firstT = Infinity;
  let lastT = -Infinity;
  for (const t of f) {
    net += t.pnl;
    fees += t.fee;
    volume += t.volume;
    firstT = Math.min(firstT, Date.parse(t.openAt));
    lastT = Math.max(lastT, Date.parse(t.closedAt));
  }

  // Per-trade stats over CLOSED round trips only.
  const closed = f.filter((t) => !t.open);
  let wins = 0;
  let lossCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let best = -Infinity;
  let worst = Infinity;
  let bestSym = '';
  let worstSym = '';
  for (const t of closed) {
    if (t.pnl > 0) {
      wins++;
      grossProfit += t.pnl;
    } else if (t.pnl < 0) {
      lossCount++;
      grossLoss += -t.pnl;
    }
    if (t.pnl > best) {
      best = t.pnl;
      bestSym = t.symbol;
    }
    if (t.pnl < worst) {
      worst = t.pnl;
      worstSym = t.symbol;
    }
  }
  const count = closed.length;

  let streak = 0;
  let streakWin = true;
  if (closed.length) {
    streakWin = closed[closed.length - 1].pnl >= 0;
    for (let i = closed.length - 1; i >= 0; i--) {
      const w = closed[i].pnl >= 0;
      if (w === streakWin) streak++;
      else break;
    }
  }

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  return {
    net,
    afterFees: net - fees,
    fees,
    volume,
    count,
    winRate: count ? (wins / count) * 100 : 0,
    wins,
    losses: count - wins,
    profitFactor,
    grossProfit,
    grossLoss,
    avgWin: wins ? grossProfit / wins : 0,
    avgLoss: lossCount ? -grossLoss / lossCount : 0,
    best: best === -Infinity ? 0 : best,
    worst: worst === Infinity ? 0 : worst,
    bestSym,
    worstSym,
    streak,
    streakWin,
    first: firstT === Infinity ? null : new Date(firstT).toISOString(),
    last: lastT === -Infinity ? null : new Date(lastT).toISOString(),
  };
}

/** Running cumulative realized-PnL series, one point per trade. */
export function cumulativeSeries(f: Trade[]): number[] {
  const series: number[] = [];
  let run = 0;
  for (const x of f) {
    run += x.pnl;
    series.push(run);
  }
  return series;
}

export interface MonthBucket {
  mo: number;
  yr: number;
  net: number;
}

/** Per-month realized PnL buckets, sorted chronologically. */
export function monthlyBuckets(f: Trade[]): MonthBucket[] {
  const map: Record<string, MonthBucket> = {};
  for (const x of f) {
    const d = new Date(x.closedAt);
    const k = d.getUTCFullYear() + '-' + d.getUTCMonth();
    if (!map[k]) map[k] = { net: 0, mo: d.getUTCMonth(), yr: d.getUTCFullYear() };
    map[k].net += x.pnl;
  }
  return Object.values(map).sort((a, b) => a.yr - b.yr || a.mo - b.mo);
}

export interface MarketBucket {
  symbol: string;
  pnl: number;
  trades: number;
  volume: number;
}

/** Per-market realized PnL, sorted by absolute PnL impact. */
export function marketBuckets(f: Trade[]): MarketBucket[] {
  const map: Record<string, MarketBucket> = {};
  for (const x of f) {
    if (!map[x.symbol]) map[x.symbol] = { symbol: x.symbol, pnl: 0, trades: 0, volume: 0 };
    map[x.symbol].pnl += x.pnl;
    map[x.symbol].volume += x.volume;
    if (!x.open) map[x.symbol].trades += 1;
  }
  return Object.values(map).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
}
