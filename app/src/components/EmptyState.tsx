import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { Strings } from '../i18n';
import { ACCEPT } from '../lib/parse';
import { IconAlertTriangle, IconArrowRight, IconClose, IconExternalLink, IconFile, IconShare, IconTarget, IconTrendUp, IconUpload } from './icons';
import Mascot from './Mascot';

const featureIcons = [IconTrendUp, IconTarget, IconShare];

interface Props {
  t: Strings;
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClear: () => void;
  onAnalyze: () => void;
  onTryDemo: () => void;
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function EmptyState({ t, files, onAddFiles, onRemoveFile, onClear, onAnalyze, onTryDemo }: Props) {
  const [guideOpen, setGuideOpen] = useState(() => window.innerWidth > 560);
  const [drag, setDrag] = useState(false);
  const [cheer, setCheer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(files.length);

  // the mascot celebrates when files arrive (drop, picker or window-drop)
  useEffect(() => {
    if (files.length > prevCount.current) {
      setCheer(true);
      const timer = window.setTimeout(() => setCheer(false), 1200);
      prevCount.current = files.length;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = files.length;
  }, [files.length]);

  const openPicker = () => inputRef.current?.click();
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onAddFiles(dropped);
  };
  const hasFiles = files.length > 0;

  return (
    <div className="empty-grid" style={{ padding: '28px 0 0' }}>
      <div className="eg-mascot">
        <Mascot pose={cheer ? 'hype' : 'happy'} size={116} pop float className={cheer ? 'mascot-hop' : undefined} style={{ marginBottom: 6 }} />
      </div>

      <div className="eg-head">
        <div
          className="reveal"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--pos)',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          // standx.com
        </div>
        <h1
          className="empty-hero reveal"
          style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.035em', margin: '0 0 22px', maxWidth: 640, animationDelay: '0.05s' }}
        >
          {t.emptyTitle}
        </h1>

        {/* what you'll get */}
        <div className="reveal feature-row" style={{ marginBottom: 34, animationDelay: '0.1s' }}>
          {t.features.map((label, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={i} className="feature-chip">
                <span className="feature-chip-icon">
                  <Icon size={13} color="var(--pos)" width={2.4} />
                </span>
                {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="eg-main">
        <div
          className="eg-card reveal card-glass"
          style={{
            width: '100%',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-xl)',
            padding: 28,
            textAlign: 'left',
            boxShadow: '0 40px 90px -50px rgba(0,0,0,0.95)',
            animationDelay: '0.15s',
          }}
        >
        <div
          className={'dropzone' + (drag ? ' drag' : '')}
          role="button"
          tabIndex={0}
          aria-label={t.dropTitle}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 13,
            padding: '46px 24px',
            background: 'var(--inset)',
            border: '1.5px dashed var(--line-2)',
            borderRadius: 'var(--r-lg)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              background: 'rgba(0,255,135,0.1)',
              border: '1px solid rgba(0,255,135,0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
              boxShadow: '0 0 28px -8px rgba(0,255,135,0.45)',
            }}
          >
            <IconUpload size={24} color="var(--pos)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            {t.dropTitle} <span style={{ color: 'var(--pos)' }}>{t.dropSub}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{t.dropHint}</div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length) onAddFiles(picked);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
        </div>

        {hasFiles && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                {files.length} {files.length === 1 ? t.fileWord : t.filesWord}
              </span>
              <button type="button" className="link-btn" onClick={onClear} style={{ fontSize: 12 }}>
                {t.clearAll}
              </button>
            </div>
            {files.map((f, i) => (
              <div
                key={f.name + i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--inset)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                <IconFile size={15} color="var(--pos)" />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--mono)', flexShrink: 0 }}>{formatBytes(f.size)}</span>
                <button type="button" className="file-remove" aria-label={t.removeFile} onClick={() => onRemoveFile(i)}>
                  <IconClose size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="cta-btn" onClick={onAnalyze} disabled={!hasFiles}>
          {t.cta}
          <IconArrowRight size={17} color="var(--pos-ink)" width={2.6} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <button type="button" className="demo-link" onClick={onTryDemo}>
            {t.tryDemo}
            <IconArrowRight size={13} width={2.6} />
          </button>
        </div>
        </div>

        {/* friendly referral nudge — a secondary beat tied to the upload card */}
        <div className="eg-ref reveal" style={{ animationDelay: '0.22s' }}>
          <a className="referral-card" href="https://standx.com/referral?code=Yhona" target="_blank" rel="noopener noreferrer">
            <Mascot pose="dance" size={34} />
            <span className="referral-text">
              <strong>{t.referralTitle}</strong>
              <em>
                {t.referralCta}
                <IconExternalLink size={11} width={2.4} />
              </em>
            </span>
          </a>
        </div>
      </div>

      {/* privacy + guide (right column on wide screens) */}
      <div className="eg-side reveal" style={{ width: '100%', marginTop: 34, animationDelay: '0.28s' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div className="privacy-badge">
            <span>{t.privacy}</span>
          </div>
        </div>
        <button type="button" className="guide-toggle" onClick={() => setGuideOpen((o) => !o)} aria-expanded={guideOpen}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Mascot pose="dance" size={26} />
            {t.guideToggle}
          </span>
          <span style={{ transform: `rotate(${guideOpen ? '180deg' : '0deg'})`, transition: 'transform .2s', color: 'var(--text-3)' }}>▾</span>
        </button>
        {guideOpen && (
          <div
            className="fade-up"
            style={{
              background: 'var(--inset)',
              border: '1px solid var(--line)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px',
              marginTop: -8,
              padding: '24px 22px 22px',
              textAlign: 'left',
            }}
          >
            {t.guide.map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '10px 0' }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 23,
                    height: 23,
                    borderRadius: 7,
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'var(--pos)',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{text}</span>
                  {i === 0 && (
                    <a
                      href="https://x.com/RyuuDefi/status/2073071852893712804"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="guide-tool-link"
                      style={{ fontSize: 12.5, fontWeight: 600 }}
                    >
                      {t.guideTokenExampleLink}
                      <IconExternalLink size={10} width={2.4} />
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginTop: 14, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 23,
                  height: 23,
                  borderRadius: 7,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconExternalLink size={11} color="var(--pos)" width={2.3} />
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{t.guideToolTitle}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 11 }}>{t.guideToolBody}</div>
                <a
                  href="https://colab.research.google.com/drive/1228IilIN4eY-TkouCZqTsRMUueynjpA9#scrollTo=VdN4c-bUdTdT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="guide-tool-link"
                >
                  {t.guideToolLink}
                  <IconExternalLink size={11} width={2.4} />
                </a>
              </div>
            </div>

            <div className="jwt-warning">
              <IconAlertTriangle size={16} color="#ff5c6c" width={2.2} />
              <span>{t.guideTokenWarning}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
