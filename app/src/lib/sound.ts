/**
 * Soft interaction sounds, synthesized with WebAudio — no audio files, no
 * network requests (CSP-safe), and the mute preference lives only in memory
 * (this app persists nothing, by design).
 *
 * Every tone is a short enveloped oscillator at very low gain: feedback you
 * feel more than hear.
 */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  if (!ctx) ctx = new AudioContext();
  // Browsers suspend contexts created outside a gesture; every play() call
  // happens inside one, so resume is always allowed here.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note {
  freq: number;
  /** seconds after call */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
}

function play(notes: Note[]) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  for (const n of notes) {
    const t0 = now + (n.at ?? 0);
    const dur = n.dur ?? 0.06;
    const peak = n.gain ?? 0.025;

    const osc = ac.createOscillator();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, t0);

    const g = ac.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}

/** Subtle blip for taps on buttons/links. */
export function tap() {
  play([{ freq: 660, dur: 0.05, gain: 0.018 }]);
}

/** Two rising notes for a completed action (download, copy…). */
export function success() {
  play([
    { freq: 523.25, dur: 0.09, gain: 0.028 },
    { freq: 783.99, at: 0.07, dur: 0.14, gain: 0.028 },
  ]);
}

/** Low soft buzz for a failed action. */
export function error() {
  play([
    { freq: 220, dur: 0.12, type: 'triangle', gain: 0.03 },
    { freq: 174.61, at: 0.09, dur: 0.16, type: 'triangle', gain: 0.03 },
  ]);
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}
