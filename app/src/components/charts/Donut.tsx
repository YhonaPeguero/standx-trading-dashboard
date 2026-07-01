interface Props {
  wins: number;
  count: number;
  centerLabel: string;
  caption: string;
  ariaLabel?: string;
}

const R = 84;
const C = 2 * Math.PI * R;
const SW = 16;

export default function Donut({ wins, count, centerLabel, caption, ariaLabel }: Props) {
  const winFrac = count ? wins / count : 0;
  const winLen = winFrac * C;
  const lossLen = (1 - winFrac) * C;

  return (
    <div role="img" aria-label={ariaLabel} style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
      <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: 130, height: 130, transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW} />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="#ff5c6c"
          strokeOpacity="0.85"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={`${lossLen.toFixed(1)} ${C.toFixed(1)}`}
          strokeDashoffset={(-winLen).toFixed(1)}
        />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="#00ff87"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={`${winLen.toFixed(1)} ${C.toFixed(1)}`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          {centerLabel}
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{caption}</span>
      </div>
    </div>
  );
}
