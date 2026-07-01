import type { CSSProperties, ReactNode } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  width?: number;
  style?: CSSProperties;
  children: ReactNode;
}

function Svg({ size = 14, color = 'currentColor', width = 2, style, children }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  );
}

export const IconLock = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p} width={p.width ?? 2.2}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const IconArrowRight = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p} width={p.width ?? 2.6}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconShield = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const IconShare = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </Svg>
);

export const IconDownload = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" />
  </Svg>
);

export const IconCopy = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Svg>
);

export const IconTrendUp = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
  </Svg>
);

export const IconBars = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M4 4v16M4 20h16" />
    <path d="M8 16l4-6 4 3 4-7" />
  </Svg>
);

export const IconDollar = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M12 1v22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
);

export const IconFunding = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M5 5l14 14" />
  </Svg>
);

export const IconUpload = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M12 16V4m0 0L7 9m5-5l5 5" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

export const IconFile = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M14 3v5h5" />
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  </Svg>
);

export const IconClose = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const IconTarget = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
);

export const IconActivity = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </Svg>
);

export const IconAlertTriangle = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p} width={p.width ?? 2.2}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0z" />
  </Svg>
);

export const IconExternalLink = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6M10 14 21 3" />
  </Svg>
);

export const IconCheck = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p} width={p.width ?? 3}>
    <path d="M4 12l6 6L20 6" />
  </Svg>
);

export const IconImage = (p: Omit<IconProps, 'children'>) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="9" cy="9" r="1.8" />
    <path d="M21 15l-5.5-5.5L4 21" />
  </Svg>
);

export const IconX = (p: Omit<IconProps, 'children' | 'color'> & { color?: string }) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill={p.color ?? '#edf2ef'} style={p.style}>
    <path d="M18.9 1.6h3.7l-8.1 9.2L24 22.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.9L0 1.6h7.6l5.2 6.9zM17.6 20.2h2L6.5 3.7H4.3z" />
  </svg>
);
