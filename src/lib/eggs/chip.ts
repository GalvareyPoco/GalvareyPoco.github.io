// Tiny chiptune voice for the arcade and 8-bit eggs: square-wave notes and noise bursts with WebAudio.
// Follows the same mute setting as the tereré intro.
import { SOUND_KEY } from "../../components/terere/sound";

let ctx: AudioContext | null = null;

function audio() {
  try {
    if (localStorage.getItem(SOUND_KEY) === "off") return null;
  } catch {}
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One note. `slide` bends the pitch to that frequency by the end. */
export function note(freq: number, dur = 0.1, { at = 0, type = "square" as OscillatorType, vol = 0.06, slide = 0 } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Short noise burst, for explosions. */
export function boom(dur = 0.25, vol = 0.12) {
  const c = audio();
  if (!c) return;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(c.destination);
  src.start();
}

/** A melody as [frequency, beats] pairs; 0 is a rest. */
export function tune(notes: [number, number][], beat = 0.11) {
  let at = 0;
  for (const [f, b] of notes) {
    if (f) note(f, b * beat * 0.9, { at });
    at += b * beat;
  }
}
