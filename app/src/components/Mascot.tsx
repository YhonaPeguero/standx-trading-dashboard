import type { CSSProperties } from 'react';
import markUrl from '../assets/mascot/mascot-mark.webp';
import happyUrl from '../assets/mascot/mascot-happy.webp';
import hypeUrl from '../assets/mascot/mascot-hype.webp';
import skepticalUrl from '../assets/mascot/mascot-skeptical.webp';
import danceUrl from '../assets/mascot/mascot-dance.webp';

export type MascotPose = 'mark' | 'happy' | 'hype' | 'skeptical' | 'dance';

const SOURCES: Record<MascotPose, string> = {
  mark: markUrl,
  happy: happyUrl,
  hype: hypeUrl,
  skeptical: skepticalUrl,
  dance: danceUrl,
};

interface Props {
  pose: MascotPose;
  size?: number;
  alt?: string;
  pop?: boolean;
  float?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Mascot({ pose, size = 96, alt = '', pop = false, float = false, delay, className = '', style }: Props) {
  return (
    <span
      className={[pop ? 'mascot-pop' : '', className].filter(Boolean).join(' ') || undefined}
      style={{
        display: 'inline-block',
        lineHeight: 0,
        animationDelay: pop && delay ? `${delay}s` : undefined,
        ...style,
      }}
    >
      <img
        src={SOURCES[pose]}
        alt={alt}
        draggable={false}
        className={float ? 'mascot-float' : undefined}
        style={{ width: size, height: 'auto', display: 'block', userSelect: 'none' }}
      />
    </span>
  );
}
