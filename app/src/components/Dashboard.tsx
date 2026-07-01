import type { CSSProperties } from 'react';
import type { AccountMeta, Lang, Range, Stats, Trade } from '../types';
import type { Strings } from '../i18n';
import { C } from '../theme';
import { fmtCompact, fmtDate, fmtRatio, fmtUsd } from '../lib/format';
import { cumulativeSeries, marketBuckets } from '../lib/stats';
import { useCountUp } from '../hooks/useCountUp';
import CumulativeChart from './charts/CumulativeChart';
import Donut from './charts/Donut';
import { IconCopy, IconDownload, IconShare, IconShield } from './icons';

interface Props {
  t: Strings;
  lang: Lang;
  trades: Trade[];
  stats: Stats;
  meta: AccountMeta | null;
  range: Range;
  setRange: (r: Range) => void;
  onOpenShare: () => void;
  onDownloadJson: () => void;
  onCopySummary: () => void;
}

const card: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-lg)',
};
const label: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
};
const RANGES: Range[] = ['all', 'd30', 'd90', 'ytd'];

export default function Dashboard({ t, lang, trades, stats, meta, range, setRange, onOpenShare, onDownloadJson, onCopySummary }: Props) {
  const pos = stats.net >= 0;
  const pnlColor = pos ? C.pos : C.neg;
  const afterPos = stats.afterFees >= 0;
  const pfGood = stats.profitFactor >= 1;
  const animatedNet = useCountUp(stats.net);

  const series = cumulativeSeries(trades);
  const markets = marketBuckets(trades).slice(0, 6);
  const maxMarket = Math.max(1, ...markets.map((m) => Math.abs(m.pnl)));
  const dateRangeLabel = stats.first ? `${fmtDate(stats.first, lang)} → ${fmtDate(stats.last!, lang)}` : '';
  const recent = trades.slice().reverse().slice(0, 8);

  const metaParts: string[] = [];
  if (meta?.fills) metaParts.push(`${meta.fills.toLocaleString('en-US')} fills`);
  if (meta?.avgLeverage) metaParts.push(`${Math.round(meta.avgLeverage)}× ${t.avgLeverage}`);
  if (meta?.takerPct != null) metaParts.push(`${Math.round(meta.takerPct * 100)}% ${t.taker}`);

  const kpis: { label: string; value: string; sub: string; color?: string }[] = [
    { label: t.winRate, value: stats.winRate.toFixed(1) + '%', sub: `${stats.wins}W / ${stats.losses}L` },
    { label: t.profitFactor, value: fmtRatio(stats.profitFactor), sub: t.profitFactorSub, color: pfGood ? C.pos : C.neg },
    { label: t.metricTrades, value: stats.count.toLocaleString('en-US'), sub: t.tradesSub },
    { label: t.metricFees, value: fmtUsd(stats.fees, false), sub: t.feesSub },
    { label: t.volume, value: fmtCompact(stats.volume), sub: t.volumeSub },
  ];

  const reveal = (i: number): CSSProperties => ({ animationDelay: `${i * 0.05}s` });

  return (
    <div style={{ paddingTop: 14 }}>
      {/* controls */}
      <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.overview}</h2>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '4px 10px' }}>
            {dateRangeLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="seg" role="group" aria-label={t.metricRange}>
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} aria-pressed={range === r}>
                {t.ranges[r]}
              </button>
            ))}
          </div>
          <button className="share-btn" onClick={onOpenShare}>
            <IconShare /> {t.shareCard}
          </button>
          <button className="tool-btn" onClick={onDownloadJson} aria-label={t.downloadJson}>
            <IconDownload />
          </button>
          <button className="tool-btn" onClick={onCopySummary} aria-label={t.copySummary}>
            <IconCopy />
          </button>
        </div>
      </div>

      {metaParts.length > 0 && (
        <div className="reveal" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-4)', marginBottom: 18, ...reveal(1) }}>
          {metaParts.join('  ·  ')}
        </div>
      )}

      {/* HERO BAND */}
      <div
        className="grid-hero reveal"
        style={{ ...card, display: 'grid', gridTemplateColumns: '0.92fr 1.5fr', gap: 26, padding: 26, marginBottom: 14, ...reveal(2) }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={label}>{t.netPnl}</span>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                color: pnlColor,
                background: pos ? 'var(--pos-soft)' : 'var(--neg-soft)',
                borderRadius: 6,
                padding: '2px 8px',
                fontWeight: 600,
              }}
            >
              {pos ? '▲ ' + t.gain : '▼ ' + t.loss}
            </span>
          </div>
          <div>
            <div className="pnl-hero-value" style={{ fontFamily: 'var(--mono)', fontSize: 46, fontWeight: 700, letterSpacing: '-0.035em', color: pnlColor, lineHeight: 1 }}>
              {fmtUsd(animatedNet, true)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{t.afterFees}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13.5, fontWeight: 700, color: afterPos ? C.pos : C.neg }}>
                {fmtUsd(stats.afterFees, true)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={label}>{t.cumPnl}</span>
          </div>
          <CumulativeChart
            key={range}
            series={series}
            color={pnlColor}
            gradientId="pnlgrad"
            ariaLabel={`${t.cumPnl}: ${fmtUsd(stats.net, true)} ${dateRangeLabel}`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-4)', marginTop: 6 }}>
            <span>{stats.first ? fmtDate(stats.first, lang) : ''}</span>
            <span>{stats.last ? fmtDate(stats.last, lang) : ''}</span>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip reveal" style={{ marginBottom: 14, ...reveal(3) }}>
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color ?? 'var(--text)' }}>
              {k.value}
            </div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* win/loss + by market */}
      <div className="grid-2 reveal" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 14, marginBottom: 14, ...reveal(4) }}>
        {/* win / loss + highlights */}
        <div style={{ ...card, padding: '20px 22px' }}>
          <span style={label}>{t.winLossDist}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}>
            <Donut
              key={range}
              wins={stats.wins}
              count={stats.count}
              centerLabel={stats.winRate.toFixed(0) + '%'}
              caption={t.winRate}
              ariaLabel={`${t.winRate} ${stats.winRate.toFixed(1)}% — ${stats.wins} ${t.wins}, ${stats.losses} ${t.losses}`}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-3)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: C.pos }} />
                  {t.wins}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 19, fontWeight: 700 }}>{stats.wins}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-3)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: C.neg }} />
                  {t.losses}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 19, fontWeight: 700 }}>{stats.losses}</span>
              </div>
            </div>
          </div>
          {/* highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <Highlight label={t.bestTrade} value={fmtUsd(stats.best, true)} color={C.pos} note={stats.bestSym.replace('-USD', '')} />
            <Highlight label={t.worstTrade} value={fmtUsd(stats.worst, true)} color={C.neg} note={stats.worstSym.replace('-USD', '')} />
            <Highlight
              label={t.streak}
              value={String(stats.streak)}
              color={stats.streakWin ? C.pos : C.neg}
              note={stats.streakWin ? t.winStreak : t.lossStreak}
            />
          </div>
        </div>

        {/* by market */}
        <div style={{ ...card, padding: '20px 22px' }}>
          <span style={label}>{t.markets}</span>
          <div key={range} style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 18 }}>
            {markets.map((m) => {
              const mPos = m.pnl >= 0;
              return (
                <div key={m.symbol} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 96px', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>{m.symbol.replace('-USD', '')}</span>
                  <div style={{ height: 7, background: 'var(--inset)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max((Math.abs(m.pnl) / maxMarket) * 100, 2).toFixed(1)}%`,
                        background: mPos ? C.pos : C.neg,
                        opacity: 0.85,
                        borderRadius: 4,
                        transformOrigin: 'left',
                        animation: 'growW .6s cubic-bezier(0.22,1,0.36,1) both',
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, color: mPos ? C.pos : C.neg, textAlign: 'right' }}>
                    {fmtUsd(m.pnl, true)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* recent trades */}
      <div className="reveal" style={{ ...card, overflow: 'hidden', ...reveal(5) }}>
        <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700 }}>{t.recentTrades}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-4)' }}>
            {stats.count.toLocaleString('en-US')} {t.tradesWord}
          </span>
        </div>
        <div className="table-scroll">
          <div className="table-inner">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 0.8fr 1fr 1fr 1.2fr',
                padding: '0 22px 10px',
                fontSize: 11,
                color: 'var(--text-4)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span>{t.colMarket}</span>
              <span>{t.colSide}</span>
              <span style={{ textAlign: 'right' }}>{t.colSize}</span>
              <span style={{ textAlign: 'right' }}>{t.colPnl}</span>
              <span style={{ textAlign: 'right' }}>{t.colDate}</span>
            </div>
            {recent.map((r) => (
              <div key={r.id} className="trade-row" style={{ gridTemplateColumns: '1.4fr 0.8fr 1fr 1fr 1.2fr' }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)' }}>{r.symbol.replace('-USD', '')}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em', color: r.side === 'long' ? C.pos : C.neg }}>
                  {r.side === 'long' ? 'LONG' : 'SHORT'}
                </span>
                <span style={{ fontFamily: 'var(--mono)', textAlign: 'right', color: 'var(--text-2)' }}>{fmtCompact(r.volume)}</span>
                <span style={{ fontFamily: 'var(--mono)', textAlign: 'right', fontWeight: 600, color: r.pnl >= 0 ? C.pos : C.neg }}>{fmtUsd(r.pnl, true)}</span>
                <span style={{ fontFamily: 'var(--mono)', textAlign: 'right', color: 'var(--text-3)', fontSize: 12 }}>{fmtDate(r.closedAt, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-4)', margin: '24px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <IconShield size={12} color="var(--text-4)" width={2} />
        {t.footerSecurity}
      </p>
    </div>
  );
}

function Highlight({ label, value, color, note }: { label: string; value: string; color: string; note: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 4, fontFamily: 'var(--mono)' }}>{note}</div>
    </div>
  );
}
