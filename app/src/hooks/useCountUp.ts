import { useEffect, useRef, useState } from 'react';

const reduced =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/**
 * Animate a number from 0 → target on mount / when target changes.
 * Returns the current interpolated value (jumps straight to target when the
 * user prefers reduced motion).
 */
export function useCountUp(target: number, duration = 850): number {
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef<number>();

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const from = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    // Safety net: if rAF is throttled (e.g. backgrounded tab), still land the
    // correct value so the number is never stuck mid-animation.
    const safety = window.setTimeout(() => setValue(target), duration + 250);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.clearTimeout(safety);
    };
  }, [target, duration]);

  return value;
}
