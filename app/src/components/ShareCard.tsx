import { useEffect, useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import type { CSSProperties } from 'react';
import type { Lang, Stats } from '../types';
import type { Strings } from '../i18n';
import { C } from '../theme';
import { fmtCompact, fmtDate, fmtRatio, fmtUsd } from '../lib/format';
import CumulativeChart from './charts/CumulativeChart';
import CornerBrackets from './CornerBrackets';
import { IconCheck, IconDownload, IconImage, IconUpload, IconX } from './icons';
import Mascot from './Mascot';

interface Props {
  t: Strings;
  lang: Lang;
  stats: Stats;
  series: number[];
  onClose: () => void;
  onNotice: (msg: string, kind?: 'success' | 'error') => void;
}

type FieldKey = 'winRate' | 'profitFactor' | 'trades' | 'best' | 'volume' | 'chart';
type BgPresetId = 'emerald' | 'crimson' | 'violet' | 'gold' | 'minimal';

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  winRate: true,
  profitFactor: true,
  trades: false,
  best: false,
  volume: false,
  chart: true,
};

interface BgPreset {
  id: BgPresetId;
  accent: string;
  swatch: string;
  cardBg: string;
}

const BG_PRESETS: BgPreset[] = [
  {
    id: 'emerald',
    accent: '#00ff87',
    swatch: 'radial-gradient(120% 140% at 75% -10%, #00ff87 0%, #0b1311 62%)',
    cardBg: 'radial-gradient(440px 280px at 90% -10%, rgba(0,255,135,0.16), transparent 60%)',
  },
  {
    id: 'crimson',
    accent: '#ff5c6c',
    swatch: 'radial-gradient(120% 140% at 75% -10%, #ff5c6c 0%, #0b1311 62%)',
    cardBg: 'radial-gradient(440px 280px at 90% -10%, rgba(255,92,108,0.16), transparent 60%)',
  },
  {
    id: 'violet',
    accent: '#a78bfa',
    swatch: 'radial-gradient(120% 140% at 75% -10%, #a78bfa 0%, #0b1311 62%)',
    cardBg: 'radial-gradient(440px 280px at 90% -10%, rgba(167,139,250,0.18), transparent 60%)',
  },
  {
    id: 'gold',
    accent: '#f5c542',
    swatch: 'radial-gradient(120% 140% at 75% -10%, #f5c542 0%, #0b1311 62%)',
    cardBg: 'radial-gradient(440px 280px at 90% -10%, rgba(245,197,66,0.16), transparent 60%)',
  },
  {
    id: 'minimal',
    accent: '#8d9b93',
    swatch: '#111a17',
    cardBg: 'linear-gradient(200deg, rgba(255,255,255,0.05), transparent 45%)',
  },
];

const PRESET_NAMES: Record<Lang, Record<BgPresetId, string>> = {
  es: { emerald: 'Esmeralda', crimson: 'Carmesí', violet: 'Violeta', gold: 'Dorado', minimal: 'Mínimo' },
  en: { emerald: 'Emerald', crimson: 'Crimson', violet: 'Violet', gold: 'Gold', minimal: 'Minimal' },
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ShareCard({ t, lang, stats, series, onClose, onNotice }: Props) {
  const pos = stats.net >= 0;

  const [handle, setHandle] = useState('');
  const [fields, setFields] = useState<Record<FieldKey, boolean>>({ ...DEFAULT_FIELDS });
  const [bgId, setBgId] = useState<BgPresetId>(pos ? 'emerald' : 'crimson');
  const [customBg, setCustomBg] = useState<{ url: string } | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [format, setFormat] = useState<'post' | 'story'>('post');
  const isStory = format === 'story';
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  // Modal a11y: lock scroll, focus the dialog, trap Tab, close on Escape,
  // and restore focus to whatever was focused before it opened.
  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevFocused?.focus?.();
    };
  }, [onClose]);

  // Custom background is only ever kept in memory as an object URL — never uploaded, never persisted.
  useEffect(() => {
    return () => {
      if (customBg) URL.revokeObjectURL(customBg.url);
    };
  }, [customBg]);

  // The @handle field doubles as a plain-looking text row, so a one-time hint calls out
  // that it's editable. Dismissed on focus, or on its own after a few seconds.
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setShowHint(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  const pnlColor = pos ? C.green : C.red;
  const pnlGlow = pos ? 'rgba(0,255,135,0.4)' : 'rgba(255,92,108,0.38)';

  const dateRangeLabel = stats.first ? `${fmtDate(stats.first, lang)} → ${fmtDate(stats.last!, lang)}` : '';

  const activePreset = BG_PRESETS.find((p) => p.id === bgId) ?? BG_PRESETS[0];
  const usingCustom = customBg != null;
  const accent = usingCustom ? '#00ff87' : activePreset.accent;

  const cardBgStyle: CSSProperties = usingCustom
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(3,8,6,0.3), rgba(3,8,6,0.88) 72%), url("${customBg!.url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `${activePreset.cardBg}, linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 24px 24px, 24px 24px',
      };

  const allCardStats: { key: FieldKey; label: string; value: string; color: string }[] = [
    { key: 'winRate', label: t.winRate, value: stats.winRate.toFixed(1) + '%', color: C.green },
    { key: 'profitFactor', label: t.profitFactor, value: fmtRatio(stats.profitFactor), color: stats.profitFactor >= 1 ? C.green : C.red },
    { key: 'trades', label: t.metricTrades, value: stats.count.toLocaleString('en-US'), color: C.ink },
    { key: 'best', label: t.bestTrade, value: fmtUsd(stats.best, true), color: C.green },
    { key: 'volume', label: t.volume, value: fmtCompact(stats.volume), color: C.ink },
  ];
  const cardStats = allCardStats.filter((s) => fields[s.key]);
  const ncols = Math.min(Math.max(cardStats.length, 1), isStory ? 2 : 3);

  const toggles: { key: FieldKey; label: string }[] = [
    ...allCardStats.map((s) => ({ key: s.key, label: s.label })),
    { key: 'chart', label: t.cardChartLabel },
  ];

  const onHandleInput = (raw: string) => {
    let v = raw.replace(/\s/g, '');
    if (v && v[0] !== '@') v = '@' + v.replace(/@/g, '');
    setHandle(v.slice(0, 22));
  };

  const pickBgFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotice(t.bgInvalidFile, 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onNotice(t.bgTooLarge, 'error');
      return;
    }
    if (customBg) URL.revokeObjectURL(customBg.url);
    setCustomBg({ url: URL.createObjectURL(file) });
  };

  const selectPreset = (id: BgPresetId) => {
    setBgId(id);
    if (customBg) {
      URL.revokeObjectURL(customBg.url);
      setCustomBg(null);
    }
  };

  const getCardNode = () => {
    const node = document.getElementById('share-card');
    if (!node) onNotice(t.pngError, 'error');
    return node;
  };

  // story targets ≥1080px wide (300 × 3.6); post stays at 2.5 (460 → 1150px)
  const exportRatio = isStory ? 3.6 : 2.5;

  const downloadCard = () => {
    const node = getCardNode();
    if (!node) return;
    toPng(node, { pixelRatio: exportRatio, backgroundColor: '#0b1311' })
      .then((url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stand-stats.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        onNotice(t.pngDownloaded);
      })
      .catch(() => onNotice(t.pngError, 'error'));
  };

  const copyImage = () => {
    const node = getCardNode();
    if (!node) return;
    if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
      onNotice(t.copyImageUnsupported, 'error');
      return;
    }
    // clipboard.write() must be called synchronously within the click's user-activation
    // window, so the pending blob is handed to ClipboardItem as a promise rather than
    // awaited first — awaiting toBlob() before calling write() loses the activation and
    // the browser silently rejects the write.
    const blobPromise = toBlob(node, { pixelRatio: exportRatio, backgroundColor: '#0b1311' }).then((blob) => {
      if (!blob) throw new Error('no blob');
      return blob;
    });
    navigator.clipboard
      .write([new window.ClipboardItem({ 'image/png': blobPromise })])
      .then(() => onNotice(t.imageCopied))
      .catch(() => onNotice(t.pngError, 'error'));
  };

  const shareToX = () => {
    const lead = handle.trim() ? handle.trim() + ' — ' : '';
    const text =
      lead +
      t.shareTextPnl +
      ' ' +
      fmtUsd(stats.net, true) +
      ' · ' +
      stats.winRate.toFixed(0) +
      '% ' +
      t.winRate +
      ' (' +
      stats.count +
      ' ' +
      t.tradesWord +
      ') 📈\n\nstandx.com';
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
  };

  const toggleStyle = (on: boolean): CSSProperties => ({
    background: on ? 'rgba(0,255,135,0.13)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${on ? 'rgba(0,255,135,0.35)' : 'rgba(255,255,255,0.1)'}`,
    color: on ? '#00ff87' : '#7d8b84',
    borderRadius: 9,
    padding: '6px 11px',
    fontSize: 11.5,
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div
      onClick={onClose}
      className="fade-up"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3,8,6,0.82)',
        backdropFilter: 'blur(7px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        zIndex: 60,
        padding: '30px 20px',
        overflow: 'auto',
      }}
    >
      <button
        ref={closeBtnRef}
        className="close-btn"
        aria-label={t.cardClose}
        onClick={onClose}
        style={{ position: 'fixed', top: 20, right: 22, zIndex: 3 }}
      >
        ✕
      </button>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.shareCard}
        onClick={(e) => e.stopPropagation()}
        className="dialog-in"
        style={{ position: 'relative', width: 'min(94vw, 800px)', display: 'flex', flexDirection: 'column', gap: 22 }}
      >
        <div className="share-studio">
          {/* controls */}
          <div className="share-controls">
            <div>
              <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.18, margin: '0 0 8px' }}>
                {t.shareHeadline}
                <br />
                <span style={{ color: 'var(--pos)' }}>{t.shareHeadlineAccent}.</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, margin: 0 }}>{t.shareSub}</p>
            </div>

            <div>
              <span className="ctrl-label">{t.bgSectionLabel}</span>
              <div className="bg-swatch-row">
                {BG_PRESETS.map((p) => {
                  const active = !usingCustom && bgId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={'bg-swatch' + (active ? ' active' : '')}
                      style={{ background: p.swatch }}
                      aria-label={PRESET_NAMES[lang][p.id]}
                      aria-pressed={active}
                      title={PRESET_NAMES[lang][p.id]}
                      onClick={() => selectPreset(p.id)}
                    >
                      {active && (
                        <span className="bg-swatch-check">
                          <IconCheck size={10} color="#04160d" width={3.6} />
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={'bg-swatch bg-swatch-upload' + (usingCustom ? ' active' : '')}
                  onClick={() => bgFileRef.current?.click()}
                  aria-label={t.bgUploadLabel}
                  aria-pressed={usingCustom}
                  title={t.bgUploadLabel}
                >
                  {usingCustom ? (
                    <>
                      <img src={customBg!.url} alt="" className="bg-swatch-img" />
                      <span className="bg-swatch-check">
                        <IconCheck size={10} color="#04160d" width={3.6} />
                      </span>
                    </>
                  ) : (
                    <IconUpload size={14} color="var(--text-3)" />
                  )}
                </button>
                <input
                  ref={bgFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    pickBgFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div>
              <span className="ctrl-label">{t.formatLabel}</span>
              <div style={{ display: 'flex', gap: 7 }}>
                <button style={toggleStyle(!isStory)} onClick={() => setFormat('post')} aria-pressed={!isStory}>
                  {t.formatPost}
                </button>
                <button style={toggleStyle(isStory)} onClick={() => setFormat('story')} aria-pressed={isStory}>
                  {t.formatStory}
                </button>
              </div>
            </div>

            <div>
              <span className="ctrl-label">{t.cardShowLabel}</span>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {toggles.map((o) => {
                  const on = fields[o.key];
                  return (
                    <button key={o.key} style={toggleStyle(on)} onClick={() => setFields((f) => ({ ...f, [o.key]: !f[o.key] }))} aria-pressed={on}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* preview */}
          <div className="share-preview">
            <div style={{ position: 'relative' }}>
              {/* on-screen only flourish — not part of the captured #share-card, so the export stays clean */}
              <Mascot
                pose={pos ? 'hype' : 'skeptical'}
                size={pos ? 70 : 41}
                pop
                float
                delay={0.3}
                style={{ position: 'absolute', top: -26, right: -12, zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))' }}
              />

              {/* handle hint — also lives outside #share-card so it never ends up in the export */}
              {showHint && !isStory && (
                <div className="handle-hint" role="tooltip">
                  {t.handleHint}
                </div>
              )}

              {/* the captured card */}
              <div
                id="share-card"
                className="share-card"
                style={{
                  width: isStory ? 305 : 460,
                  minHeight: isStory ? 542 : undefined,
                  display: isStory ? 'flex' : undefined,
                  flexDirection: isStory ? 'column' : undefined,
                  justifyContent: isStory ? 'space-between' : undefined,
                  backgroundColor: '#0b1311',
                  border: `1px solid ${hexToRgba(accent, 0.24)}`,
                  borderRadius: isStory ? 20 : 24,
                  padding: isStory ? '26px 24px 20px' : '30px 30px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 0 70px -22px ${hexToRgba(accent, 0.45)}`,
                  ...cardBgStyle,
                }}
              >
                <CornerBrackets color={hexToRgba(accent, 0.85)} />

                {/* header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <span style={{ fontWeight: 800, letterSpacing: '0.01em', fontSize: 15, textTransform: 'uppercase' }}>StandX</span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      color: accent,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      background: hexToRgba(accent, 0.1),
                      border: `1px solid ${hexToRgba(accent, 0.25)}`,
                      borderRadius: 7,
                      padding: '4px 9px',
                    }}
                  >
                    Perps
                  </span>
                </div>

                {/* handle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: 'linear-gradient(145deg,#1c2a23,#0f1411)',
                      border: `1.5px solid ${hexToRgba(accent, 0.5)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 0 16px -5px ${hexToRgba(accent, 0.6)}`,
                    }}
                  >
                    <Mascot pose="mark" size={24} />
                  </div>
                  <input
                    value={handle}
                    onChange={(e) => onHandleInput(e.target.value)}
                    onFocus={() => setShowHint(false)}
                    placeholder={t.handlePlaceholder}
                    spellCheck={false}
                    autoComplete="off"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#edf2ef',
                      fontFamily: 'var(--sans)',
                      fontSize: 20,
                      fontWeight: 700,
                      width: '100%',
                      padding: 0,
                      letterSpacing: '-0.01em',
                    }}
                  />
                </div>

                {/* hero pnl */}
                <div style={{ fontSize: 12.5, color: '#adbab3', fontWeight: 600, marginBottom: 5 }}>{t.netPnl}</div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: isStory ? 34 : 46,
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: pnlColor,
                    lineHeight: 1,
                    textShadow: `0 0 36px ${pnlGlow}`,
                  }}
                >
                  {fmtUsd(stats.net, true)}
                </div>

                {/* sparkline */}
                {fields.chart && (
                  <CumulativeChart series={series} color={pnlColor} compact heightPx={isStory ? 150 : undefined} gradientId="cardgrad" />
                )}

                {/* stats row */}
                {cardStats.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ncols},1fr)`, gap: 10, marginTop: 20 }}>
                    {cardStats.map((cs) => (
                      <div
                        key={cs.key}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 13,
                          padding: '13px 14px',
                        }}
                      >
                        <div style={{ fontSize: 11, color: '#7d8b84', fontWeight: 600, marginBottom: 6 }}>{cs.label}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: cs.color }}>{cs.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 20,
                    paddingTop: 15,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: accent, fontWeight: 600 }}>standx.com</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#7d8b84' }}>{dateRangeLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="share-actions">
          <button className="action-btn primary" onClick={downloadCard}>
            <span className="action-icon">
              <IconDownload size={16} color="#04160d" width={2.4} />
            </span>
            <span className="action-text">
              <strong>{t.downloadPng}</strong>
              <em>{t.downloadPngSub}</em>
            </span>
          </button>
          <button className="action-btn" onClick={copyImage}>
            <span className="action-icon">
              <IconImage size={16} color="var(--pos)" width={2} />
            </span>
            <span className="action-text">
              <strong>{t.copyImage}</strong>
              <em>{t.copyImageSub}</em>
            </span>
          </button>
          <button className="action-btn" onClick={shareToX}>
            <span className="action-icon">
              <IconX size={14} />
            </span>
            <span className="action-text">
              <strong>{t.shareX}</strong>
              <em>{t.shareXSub}</em>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
