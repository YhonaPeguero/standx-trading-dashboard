import type { Lang } from '../types';
import { strings } from '../i18n';

/** Format a USD amount. `sign` forces a leading +/- for positives. */
export function fmtUsd(n: number, sign = false): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const str = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const pre = sign ? (neg ? '-$' : '+$') : neg ? '-$' : '$';
  return pre + str;
}

/** e.g. "18 Mar 26" — uses localized month names, UTC date parts. */
export function fmtDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const m = strings(lang).months[d.getUTCMonth()];
  return d.getUTCDate() + ' ' + m + ' ' + String(d.getUTCFullYear()).slice(2);
}

/** Compact USD, e.g. $5.3M, $12.4K, $842. */
export function fmtCompact(n: number): string {
  const neg = n < 0;
  const a = Math.abs(n);
  let str: string;
  if (a >= 1e9) str = (a / 1e9).toFixed(1) + 'B';
  else if (a >= 1e6) str = (a / 1e6).toFixed(1) + 'M';
  else if (a >= 1e3) str = (a / 1e3).toFixed(1) + 'K';
  else str = Math.round(a).toString();
  return (neg ? '-$' : '$') + str;
}

/** Profit factor, e.g. "1.42" or "∞". */
export function fmtRatio(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  return n.toFixed(2);
}
