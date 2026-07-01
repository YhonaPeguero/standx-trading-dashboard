import type { Lang, Range, Stats, Trade } from '../types';
import { strings } from '../i18n';
import { fmtRatio, fmtUsd } from './format';

/** Shape of the downloadable JSON export. (No wallet/account identifiers.) */
export function buildExport(trades: Trade[], stats: Stats, range: Range) {
  return {
    generatedAt: new Date().toISOString(),
    range,
    stats: {
      realizedPnl: stats.net,
      netAfterFees: stats.afterFees,
      totalFees: stats.fees,
      totalVolume: stats.volume,
      trades: stats.count,
      winRatePct: stats.winRate,
      wins: stats.wins,
      losses: stats.losses,
      profitFactor: Number.isFinite(stats.profitFactor) ? stats.profitFactor : null,
      avgWin: stats.avgWin,
      avgLoss: stats.avgLoss,
      bestTrade: stats.best,
      worstTrade: stats.worst,
      from: stats.first,
      to: stats.last,
    },
    trades,
  };
}

/** Plain-text summary for the clipboard. */
export function buildSummary(stats: Stats, lang: Lang): string {
  const t = strings(lang);
  return [
    'StandX — ' + t.overview,
    '',
    t.netPnl + ': ' + fmtUsd(stats.net, true),
    t.afterFees + ': ' + fmtUsd(stats.afterFees, true),
    t.winRate + ': ' + stats.winRate.toFixed(1) + '%  (' + stats.wins + 'W / ' + stats.losses + 'L)',
    t.profitFactor + ': ' + fmtRatio(stats.profitFactor),
    t.metricTrades + ': ' + stats.count,
    t.metricFees + ': ' + fmtUsd(stats.fees, false),
    t.bestTrade + ': ' + fmtUsd(stats.best, true),
    t.worstTrade + ': ' + fmtUsd(stats.worst, true),
  ].join('\n');
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
