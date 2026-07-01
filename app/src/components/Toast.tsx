interface Props {
  text: string;
  kind?: 'success' | 'error';
}

export default function Toast({ text, kind = 'success' }: Props) {
  const err = kind === 'error';
  return (
    <div
      className="toast-in"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        background: '#101918',
        border: `1px solid ${err ? 'rgba(255,92,108,0.35)' : 'rgba(0,255,135,0.28)'}`,
        color: '#edf2ef',
        borderRadius: 11,
        padding: '11px 18px',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 16px 40px -12px rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        zIndex: 50,
      }}
    >
      <span style={{ color: err ? '#ff5c6c' : '#00ff87' }}>{err ? '✕' : '✓'}</span>
      {text}
    </div>
  );
}
