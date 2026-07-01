interface Props {
  text: string;
}

export default function Toast({ text }: Props) {
  return (
    <div
      className="fade-up"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#101918',
        border: '1px solid rgba(0,255,135,0.28)',
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
      <span style={{ color: '#00ff87' }}>✓</span>
      {text}
    </div>
  );
}
