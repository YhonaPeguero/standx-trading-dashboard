import type { Strings } from '../i18n';
import type { LoadProgress } from '../types';
import Mascot from './Mascot';

interface Props {
  t: Strings;
  progress: LoadProgress;
}

const dot = (delay: string): React.CSSProperties => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: '#00ff87',
  animation: `pulseDot 1s infinite ${delay}`,
});

export default function LoadingState({ t, progress }: Props) {
  const label = `${t.readingWord} ${progress.files} · ${progress.rows} ${t.rowsWord}`;
  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '96px 0',
      }}
    >
      <div style={{ position: 'relative', width: 62, height: 62, marginBottom: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,255,135,0.14)', borderRadius: '50%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid transparent',
            borderTopColor: 'var(--pos)',
            borderRadius: '50%',
            animation: 'spin .8s linear infinite',
          }}
        />
        <Mascot pose="mark" size={30} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        {t.loadingTitle}
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 22px', maxWidth: 380 }}>{t.loadingSub}</p>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--pos)',
          background: 'var(--surface)',
          border: '1px solid rgba(0,255,135,0.16)',
          borderRadius: 10,
          padding: '9px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ display: 'flex', gap: 3 }}>
          <span style={dot('0s')} />
          <span style={dot('.2s')} />
          <span style={dot('.4s')} />
        </span>
        {label}
      </div>
    </div>
  );
}
