interface Props {
  series: number[];
  color: string;
  /** sparkline variant for the share card: shorter, no baseline/marker */
  compact?: boolean;
  /** overrides the compact height (story-format share card) */
  heightPx?: number;
  gradientId: string;
  ariaLabel?: string;
}

const W = 1000;
const H = 260;
const PAD_T = 18;
const PAD_B = 18;

/** Monotone cubic interpolation (Fritsch–Carlson) → smooth, no overshoot. */
function smoothPath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (n === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  const dx: number[] = [];
  const dy: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    dy[i] = pts[i + 1].y - pts[i].y;
    slope[i] = dy[i] / dx[i];
  }
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) m[i] = 0;
    else m[i] = (slope[i - 1] + slope[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / slope[i];
      const b = m[i + 1] / slope[i];
      const h = a * a + b * b;
      if (h > 9) {
        const t = 3 / Math.sqrt(h);
        m[i] = t * a * slope[i];
        m[i + 1] = t * b * slope[i];
      }
    }
  }

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i].x + dx[i] / 3;
    const c1y = pts[i].y + (m[i] * dx[i]) / 3;
    const c2x = pts[i + 1].x - dx[i] / 3;
    const c2y = pts[i + 1].y - (m[i + 1] * dx[i]) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${pts[i + 1].x.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`;
  }
  return d;
}

export default function CumulativeChart({ series, color, compact = false, heightPx, gradientId, ariaLabel }: Props) {
  const n = series.length;
  const vals = series.concat([0]);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const span = maxV - minV || 1;
  const X = (i: number) => (n > 1 ? (i / (n - 1)) * W : W / 2);
  const Y = (v: number) => PAD_T + (1 - (v - minV) / span) * (H - PAD_T - PAD_B);

  const pts = series.map((v, i) => ({ x: X(i), y: Y(v) }));
  const line = smoothPath(pts);
  const area = n ? `${line} L ${W} ${H} L 0 ${H} Z` : '';
  const zeroY = Y(0);
  const lastY = n ? Y(series[n - 1]) : H / 2;
  const endTopPct = (lastY / H) * 100;

  const height = heightPx ?? (compact ? 70 : 210);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={compact ? 0.28 : 0.22} />
            <stop offset="0.7" stopColor={color} stopOpacity="0.02" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {!compact && (
          <line
            x1="0"
            y1={zeroY}
            x2={W}
            y2={zeroY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path className="chart-area" d={area} fill={`url(#${gradientId})`} />
        <path
          className="chart-line"
          d={line}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={compact ? 2.4 : 2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {!compact && n > 0 && (
        <span
          aria-hidden="true"
          className="chart-dot"
          style={{
            position: 'absolute',
            right: 0,
            top: `${endTopPct}%`,
            width: 9,
            height: 9,
            marginTop: -4.5,
            marginRight: -1,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 0 4px ${color}22, 0 0 12px ${color}aa`,
          }}
        />
      )}
    </div>
  );
}
