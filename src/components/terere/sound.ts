// Tiny synthesized sound effects for the tereré intro (no audio files): mortar thumps, ice clinks,
// a pouring stream, sipping and the final slurp. Everything is built from noise and sine waves with WebAudio.

export const SOUND_KEY = "terere-sound";

export function createSound() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let enabled = true;
  try {
    enabled = localStorage.getItem(SOUND_KEY) !== "off";
  } catch {}

  // Audio can only start after a user gesture; every action in the intro is one.
  const ensure = () => {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const noiseSource = (c: AudioContext) => {
    const src = c.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    return src;
  };

  /** A looping filtered-noise voice whose volume follows set(amount 0..1). */
  const loop = (freq: number, q: number, wobble = 0) => {
    let src: AudioBufferSourceNode | null = null;
    let gain: GainNode | null = null;
    let filter: BiquadFilterNode | null = null;
    let lfo: OscillatorNode | null = null;
    return {
      set(amount: number) {
        const c = amount > 0 ? ensure() : ctx;
        if (!c || !master) return;
        if (!src && amount > 0) {
          src = noiseSource(c);
          filter = c.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = freq;
          filter.Q.value = q;
          gain = c.createGain();
          gain.gain.value = 0;
          src.connect(filter).connect(gain).connect(master);
          if (wobble) {
            // Tremolo for the gurgle of sipping.
            lfo = c.createOscillator();
            const depth = c.createGain();
            lfo.frequency.value = wobble;
            depth.gain.value = freq * 0.35;
            lfo.connect(depth).connect(filter.frequency);
            lfo.start();
          }
          src.start();
        }
        if (gain && c) gain.gain.setTargetAtTime(amount * 0.6, c.currentTime, 0.05);
        if (filter && c && !wobble) filter.frequency.setTargetAtTime(freq * (0.8 + amount * 0.5), c.currentTime, 0.1);
      },
      stop() {
        if (gain && ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        const s = src;
        const l = lfo;
        src = null;
        lfo = null;
        setTimeout(() => {
          s?.stop();
          l?.stop();
        }, 300);
      },
    };
  };

  const pour = loop(1400, 0.8);
  const sip = loop(700, 3, 13);

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
      } catch {}
      if (!enabled) {
        pour.stop();
        sip.stop();
      }
      return enabled;
    },
    /** Wooden pestle hitting the mortar. */
    thump() {
      const c = ensure();
      if (!c || !master) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.2);
      // leafy crunch on top
      const n = noiseSource(c);
      const f = c.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 2500;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.25, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      n.connect(f).connect(ng).connect(master);
      n.start(t);
      n.stop(t + 0.1);
    },
    /** Ice cubes knocking together. */
    clink() {
      const c = ensure();
      if (!c || !master) return;
      [2600, 3400, 2950].forEach((freq, i) => {
        const t = c.currentTime + i * 0.07 + Math.random() * 0.03;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = freq + Math.random() * 200;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g).connect(master!);
        o.start(t);
        o.stop(t + 0.3);
      });
    },
    pour,
    sip,
    /** The last noisy sip when the guampa runs dry. */
    slurp() {
      const c = ensure();
      if (!c || !master) return;
      const t = c.currentTime;
      const n = noiseSource(c);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 4;
      f.frequency.setValueAtTime(400, t);
      f.frequency.exponentialRampToValueAtTime(1800, t + 0.7);
      const g = c.createGain();
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = 22;
      depth.gain.value = 0.35;
      lfo.connect(depth).connect(g.gain);
      g.gain.setValueAtTime(0.5, t);
      g.gain.linearRampToValueAtTime(0, t + 0.8);
      n.connect(f).connect(g).connect(master);
      lfo.start(t);
      n.start(t);
      n.stop(t + 0.85);
      lfo.stop(t + 0.85);
    },
    dispose() {
      pour.stop();
      sip.stop();
    },
  };
}
export type TerereSound = ReturnType<typeof createSound>;
