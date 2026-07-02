/**
 * Core-math accuracy suite. Runs the REAL src/lib modules (bundled by esbuild
 * into node_modules/.accuracy by the npm "test" script) against hand-computed
 * synthetic cases. Every expectation below was calculated by hand — if any of
 * these drift, the dashboard's numbers are wrong.
 *
 *   npm test
 */
import { reconstructAccount } from '../node_modules/.accuracy/standx.js';
import { computeStats, cumulativeSeries, filterByRange, marketBuckets } from '../node_modules/.accuracy/stats.js';

let pass = 0;
let fail = 0;
const failures = [];

function eq(name, got, want, tol = 1e-9) {
  const ok =
    typeof want === 'number' && typeof got === 'number'
      ? Number.isFinite(want)
        ? Math.abs(got - want) <= tol
        : got === want
      : got === want;
  if (ok) pass++;
  else {
    fail++;
    failures.push(`${name}: got ${got}, want ${want}`);
  }
}

const F = (over) => ({
  created_at: '2026-01-01T00:00:00Z',
  fee_qty: '0',
  id: 'f' + Math.random().toString(36).slice(2),
  is_taker: true,
  pnl: '0',
  price: '100',
  qty: '1',
  side: 'buy',
  symbol: 'TST-USD',
  value: '100',
  ...over,
});

// 1. simple round trip win
{
  const acc = reconstructAccount([
    F({ id: 'a1', side: 'buy', qty: '1', fee_qty: '0.1', value: '100', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'a2', side: 'sell', qty: '1', pnl: '10', fee_qty: '0.1', value: '110', created_at: '2026-01-01T01:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('1 closed trades = 1', s.count, 1);
  eq('1 net = 10', s.net, 10);
  eq('1 afterFees = 9.8', s.afterFees, 9.8);
  eq('1 fees = 0.2', s.fees, 0.2);
  eq('1 volume = 210', s.volume, 210);
  eq('1 winRate = 100', s.winRate, 100);
  eq('1 side long', acc.trades[0].side, 'long');
}

// 2. partial closes accumulate into one round trip
{
  const acc = reconstructAccount([
    F({ id: 'b1', side: 'buy', qty: '2', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'b2', side: 'sell', qty: '1', pnl: '5', created_at: '2026-01-01T01:00:00Z' }),
    F({ id: 'b3', side: 'sell', qty: '1', pnl: '6', created_at: '2026-01-01T02:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('2 one trade', acc.trades.length, 1);
  eq('2 pnl = 11', s.net, 11);
  eq('2 fills = 3', acc.trades[0].fills, 3);
}

// 3. sign flip: close + residual open, sums conserved
{
  const acc = reconstructAccount([
    F({ id: 'c1', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'c2', side: 'sell', qty: '2', pnl: '-3', created_at: '2026-01-01T01:00:00Z' }),
    F({ id: 'c3', side: 'buy', qty: '1', pnl: '2', created_at: '2026-01-01T02:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('3 two trades', acc.trades.length, 2);
  eq('3 net conserved = -1', s.net, -1);
  eq('3 all closed', acc.trades.filter((t) => t.open).length, 0);
  eq('3 residual short', acc.trades[1].side, 'short');
}

// 4. open position: excluded from per-trade stats, included in totals
{
  const acc = reconstructAccount([
    F({ id: 'd1', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'd2', side: 'sell', qty: '1', pnl: '8', created_at: '2026-01-01T01:00:00Z' }),
    F({ id: 'd3', side: 'buy', qty: '3', fee_qty: '0.5', created_at: '2026-01-02T00:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('4 closed = 1', s.count, 1);
  eq('4 open = 1', acc.trades.filter((t) => t.open).length, 1);
  eq('4 open leg fee counted', s.fees, 0.5);
  eq('4 winRate excludes open', s.winRate, 100);
}

// 5. multi-symbol interleaved
{
  const acc = reconstructAccount([
    F({ id: 'e1', symbol: 'AAA-USD', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'e2', symbol: 'BBB-USD', side: 'sell', qty: '2', created_at: '2026-01-01T00:30:00Z' }),
    F({ id: 'e3', symbol: 'AAA-USD', side: 'sell', qty: '1', pnl: '4', created_at: '2026-01-01T01:00:00Z' }),
    F({ id: 'e4', symbol: 'BBB-USD', side: 'buy', qty: '2', pnl: '-7', created_at: '2026-01-01T01:30:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('5 two closed', s.count, 2);
  eq('5 net = -3', s.net, -3);
  eq('5 BBB short', acc.trades.find((t) => t.symbol === 'BBB-USD').side, 'short');
  eq('5 winRate = 50', s.winRate, 50);
  const buckets = marketBuckets(acc.trades);
  eq('5 Σ market pnl == net', buckets.reduce((a, m) => a + m.pnl, 0), -3);
}

// 6. duplicate fill ids deduped
{
  const acc = reconstructAccount([
    F({ id: 'dup', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'dup', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'g2', side: 'sell', qty: '1', pnl: '3', created_at: '2026-01-01T01:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('6 dedupe → 1 closed', s.count, 1);
  eq('6 net = 3', s.net, 3);
  eq('6 meta.fills = 2', acc.meta.fills, 2);
}

// 7. streak + profit factor + best/worst (W W L L L)
{
  const mk = (id, pnl, hour) => [
    F({ id: id + 'o', side: 'buy', qty: '1', created_at: `2026-01-01T0${hour}:00:00Z` }),
    F({ id: id + 'c', side: 'sell', qty: '1', pnl: String(pnl), created_at: `2026-01-01T0${hour}:30:00Z` }),
  ];
  const acc = reconstructAccount([...mk('w1', 5, 0), ...mk('w2', 6, 1), ...mk('l1', -2, 2), ...mk('l2', -1, 3), ...mk('l3', -4, 4)]);
  const s = computeStats(acc.trades);
  eq('7 streak = 3', s.streak, 3);
  eq('7 streak losses', s.streakWin, false);
  eq('7 PF = 11/7', s.profitFactor, 11 / 7, 1e-12);
  eq('7 grossProfit = 11', s.grossProfit, 11);
  eq('7 grossLoss = 7', s.grossLoss, 7);
  eq('7 best = 6', s.best, 6);
  eq('7 worst = -4', s.worst, -4);
  eq('7 avgWin = 5.5', s.avgWin, 5.5);
  eq('7 avgLoss = -7/3', s.avgLoss, -7 / 3, 1e-12);
  const series = cumulativeSeries(acc.trades);
  eq('7 cum last == net', series[series.length - 1], s.net, 1e-12);
}

// 8. decimal-string precision (real export uses strings)
{
  const acc = reconstructAccount([
    F({ id: 'p1', side: 'buy', qty: '0.408', fee_qty: '0.260565120', value: '651.41280', created_at: '2026-01-01T00:00:00Z' }),
    F({ id: 'p2', side: 'sell', qty: '0.408', pnl: '12.345678901', fee_qty: '0.123456789', value: '655.00000', created_at: '2026-01-01T01:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('8 pnl exact', s.net, 12.345678901, 1e-12);
  eq('8 fees exact', s.fees, 0.26056512 + 0.123456789, 1e-12);
  eq('8 volume exact', s.volume, 651.4128 + 655.0, 1e-9);
}

// 9. order rows classified apart: pnl ignored, leverage extracted
{
  const order = {
    created_at: '2026-01-01T00:10:00Z',
    fee: '0',
    fill_avg_price: '100',
    fill_qty: '1',
    id: 900001,
    leverage: '40',
    order_type: 'market',
    pnl: '999',
    position_id: 1,
    price: '100',
    qty: '1',
    side: 'buy',
    status: 'filled',
    symbol: 'TST-USD',
  };
  const acc = reconstructAccount([
    F({ id: 'q1', side: 'buy', qty: '1', created_at: '2026-01-01T00:00:00Z' }),
    order,
    F({ id: 'q2', side: 'sell', qty: '1', pnl: '5', created_at: '2026-01-01T01:00:00Z' }),
  ]);
  const s = computeStats(acc.trades);
  eq('9 order pnl not counted', s.net, 5);
  eq('9 avgLeverage = 40', acc.meta.avgLeverage, 40);
}

// 10. range filter: d30 window measured from last close
{
  const mk = (id, day, pnl) => [
    F({ id: id + 'o', side: 'buy', qty: '1', created_at: `2026-01-${String(day).padStart(2, '0')}T00:00:00Z` }),
    F({ id: id + 'c', side: 'sell', qty: '1', pnl: String(pnl), created_at: `2026-01-${String(day).padStart(2, '0')}T01:00:00Z` }),
  ];
  const acc = reconstructAccount([...mk('r1', 1, 1), ...mk('r2', 15, 2), ...mk('r3', 31, 3)]);
  const d30 = filterByRange(acc.trades, 'd30');
  eq('10 d30 keeps in-window', d30.length, 3); // Jan 1 is exactly 30d before Jan 31 → inclusive
  eq('10 all identity', filterByRange(acc.trades, 'all').length, 3);
}

console.log(`accuracy: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
