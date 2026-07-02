import type { CSSProperties } from 'react';

interface Props {
  color: string;
  inset?: number;
  size?: number;
}

/** HUD-style corner accents. Parent needs position: relative. */
export default function CornerBrackets({ color, inset = 13, size = 15 }: Props) {
  const base: CSSProperties = { position: 'absolute', width: size, height: size, opacity: 0.6, pointerEvents: 'none' };
  const b = `2px solid ${color}`;
  return (
    <>
      <span style={{ ...base, top: inset, left: inset, borderTop: b, borderLeft: b, borderTopLeftRadius: 4 }} />
      <span style={{ ...base, top: inset, right: inset, borderTop: b, borderRight: b, borderTopRightRadius: 4 }} />
      <span style={{ ...base, bottom: inset, left: inset, borderBottom: b, borderLeft: b, borderBottomLeftRadius: 4 }} />
      <span style={{ ...base, bottom: inset, right: inset, borderBottom: b, borderRight: b, borderBottomRightRadius: 4 }} />
    </>
  );
}
