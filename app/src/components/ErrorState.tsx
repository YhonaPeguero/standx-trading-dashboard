import type { Strings } from '../i18n';
import type { ErrorType } from '../types';

interface Props {
  t: Strings;
  errorType: ErrorType;
  onReset: () => void;
}

export default function ErrorState({ t, errorType, onReset }: Props) {
  const format = errorType === 'format';

  const icon = format ? '⚠' : '○';
  const iconBg = format ? 'rgba(247,107,107,0.1)' : 'rgba(255,255,255,0.04)';
  const iconBorder = format ? 'rgba(247,107,107,0.3)' : 'rgba(255,255,255,0.1)';
  const title = format ? t.errFormatTitle : t.errEmptyTitle;
  const body = format ? t.errFormatBody : t.errEmptyBody;

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '90px 0',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
        }}
      >
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <h2 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 9px', letterSpacing: '-0.02em' }}>{title}</h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14.5, margin: '0 0 24px', maxWidth: 420 }}>{body}</p>
      <button className="try-btn" onClick={onReset}>
        {t.tryAgain}
      </button>
    </div>
  );
}
