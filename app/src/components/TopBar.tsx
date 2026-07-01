import type { CSSProperties } from 'react';
import type { Lang } from '../types';
import type { Strings } from '../i18n';
import Mascot from './Mascot';

interface Props {
  lang: Lang;
  onSetLang: (l: Lang) => void;
  showDisconnect: boolean;
  onReset: () => void;
  t: Strings;
}

const langPill = (active: boolean): CSSProperties => ({
  background: active ? 'var(--surface-2)' : 'transparent',
  color: active ? 'var(--text)' : 'var(--text-3)',
  border: 'none',
  borderRadius: 7,
  padding: '5px 11px',
  fontFamily: 'var(--mono)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background .15s, color .15s',
});

export default function TopBar({ lang, onSetLang, showDisconnect, onReset, t }: Props) {
  return (
    <header
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(150deg,#132119,#080f0b)',
            border: '1px solid rgba(0,255,135,0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0,255,135,0.14) inset',
            flexShrink: 0,
          }}
        >
          <Mascot pose="mark" size={23} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.01em', fontSize: 15, textTransform: 'uppercase' }}>StandX</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{t.brandTag}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          role="group"
          aria-label="Language / Idioma"
          style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 9, padding: 3 }}
        >
          <button style={langPill(lang === 'es')} onClick={() => onSetLang('es')} aria-pressed={lang === 'es'} lang="es">
            ES
          </button>
          <button style={langPill(lang === 'en')} onClick={() => onSetLang('en')} aria-pressed={lang === 'en'} lang="en">
            EN
          </button>
        </div>
        {showDisconnect && (
          <button className="ghost-btn" onClick={onReset} aria-label={t.startOver}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pos)', boxShadow: '0 0 7px var(--pos)' }} />
            {t.startOver}
          </button>
        )}
      </div>
    </header>
  );
}
