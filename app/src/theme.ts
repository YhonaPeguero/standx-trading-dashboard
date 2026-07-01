// Color tokens mirrored from styles.css, for inline styles that depend on
// runtime state (e.g. PnL sign). Palette sourced from StandX's own shipped
// products — see the design-token audit in project memory.
export const C = {
  bg: '#050a08',
  surface: '#0b1311',
  surface2: '#101918',
  surface3: '#172420',
  inset: '#060b09',
  line: '#16211d',
  line2: '#223530',
  text: '#edf2ef',
  text2: '#adbab3',
  text3: '#7d8b84',
  text4: '#5a665f',
  pos: '#00ff87',
  posInk: '#04160d',
  posDim: '#00964f',
  neg: '#ff5c6c',
  posSoft: 'rgba(0,255,135,0.12)',
  negSoft: 'rgba(255,92,108,0.12)',

  // legacy aliases used around the codebase
  ink: '#edf2ef',
  muted: '#adbab3',
  muted2: '#7d8b84',
  muted3: '#7d8b84',
  green: '#00ff87',
  greenInk: '#04160d',
  red: '#ff5c6c',
} as const;
