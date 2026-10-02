import { useCallback, useEffect, useRef, useState } from "react";
import Scene, { type SceneState } from "./terere/Scene";
import { createSound, type TerereSound } from "./terere/sound";
import { GUAMPA_SVG } from "../lib/guampa";

// First-visit intro, a tereré round in three steps:
// 1. tap the mortero to crush the yuyos, which fly into the jarra
// 2. drag the jarra (or hold) to pour; the stream gets stronger the more you tilt
// 3. hold to sip through the bombilla until it slurps, then pick "another round" or "gracias" to enter
// An inline script in the layout sets html[data-intro] on first visits (never with reduced motion),
// which makes this overlay visible before hydration. "terere" in the terminal replays it.

export type IntroLabels = {
  kicker: string;
  title: string;
  body: string;
  pour: string;
  drinkTitle: string;
  drink: string;
  done: string;
  skip: string;
  keys: string;
  hint: string;
  crushTitle: string;
  crushBody: string;
  crush: string;
  rondaTitle: string;
  rondaBody: string;
  again: string;
  thanks: string;
  sound: string;
  hintCrush: string;
  hintDrink: string;
};

export const INTRO_KEY = "terere-v1";
type Phase = "crush" | "pour" | "drink" | "slurp" | "ronda" | "leaving";

const HITS = 4; // pestle hits to crush the yuyos
const POUR_MS = 1600; // full guampa at full flow
const SIP_MS = 1900; // empty guampa while sipping
const FLOW_FROM = 0.55; // tilt where water starts to come out

type Drag = { x: number; y: number; tilt: number; at: number; moved: boolean };
type Sim = Omit<SceneState, "sipping" | "slurp"> & { holding: boolean; drag: Drag | null; target: number; phase: Phase };
const fresh = (): Sim => ({ tilt: 0, flow: 0, level: 0, crush: 0, pound: 0, fly: 0, yuyoIn: false, holding: false, drag: null, target: 0, phase: "crush" });

export default function TerereIntro({ labels }: { labels: IntroLabels }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhaseState] = useState<Phase>("crush");
  const [time, setTime] = useState(0);
  const [view, setView] = useState<Sim>(fresh);
  const [soundOn, setSoundOn] = useState(true);
  const sim = useRef<Sim>(fresh());
  const sound = useRef<TerereSound | null>(null);
  const raf = useRef(0);
  const actionBtn = useRef<HTMLButtonElement>(null);
  const sceneBox = useRef<HTMLDivElement>(null);

  const setPhase = (p: Phase) => {
    sim.current.phase = p;
    setPhaseState(p);
  };

  useEffect(() => {
    sound.current = createSound();
    setSoundOn(sound.current.enabled);
    setOpen(document.documentElement.hasAttribute("data-intro"));
    const replay = () => {
      sim.current = fresh();
      setView(fresh());
      setPhaseState("crush");
      document.documentElement.setAttribute("data-intro", "");
      setOpen(true);
    };
    window.addEventListener("terere:replay", replay);
    return () => {
      window.removeEventListener("terere:replay", replay);
      sound.current?.dispose();
    };
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}
    sound.current?.dispose();
    setPhase("leaving");
    setTimeout(() => {
      document.documentElement.removeAttribute("data-intro");
      setOpen(false);
      window.dispatchEvent(new Event("intro:done"));
    }, 900);
  }, []);

  const hit = () => {
    const s = sim.current;
    if (s.phase !== "crush" || s.fly > 0) return;
    s.crush = Math.min(1, s.crush + 1 / HITS);
    s.pound = 1;
    sound.current?.thump();
    navigator.vibrate?.(12);
    if (s.crush >= 1) s.fly = 0.001;
  };

  const again = () => {
    const s = sim.current;
    s.level = 0;
    s.holding = false;
    setPhase("pour");
  };

  // One loop drives the pestle, the flying yuyos, the jarra, the pour and the sip.
  useEffect(() => {
    if (!open) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const s = sim.current;
      s.pound = Math.max(0, s.pound - dt / 320);
      if (s.fly > 0) {
        s.fly = Math.min(1, s.fly + dt / 800);
        if (s.fly >= 1) {
          s.fly = 0;
          s.yuyoIn = true;
          sound.current?.clink();
          setPhase("pour");
        }
      }
      // Jarra: follows the drag, or tips over while held (a press on the scene that doesn't move counts as holding).
      let target = 0;
      if (s.phase === "pour") {
        if (s.drag) target = s.drag.moved ? s.target : now - s.drag.at > 200 ? 1 : s.tilt;
        else if (s.holding) target = 1;
      }
      s.tilt += (target - s.tilt) * Math.min(1, dt / (s.drag?.moved ? 60 : 160));
      s.flow = s.phase === "pour" ? Math.max(0, Math.min(1, (s.tilt - FLOW_FROM) / (1 - FLOW_FROM))) : 0;
      if (s.phase === "pour") {
        s.level = Math.min(1, s.level + (dt / POUR_MS) * s.flow);
        sound.current?.pour.set(s.flow);
        if (s.level >= 1) {
          s.holding = false;
          s.drag = null;
          sound.current?.pour.set(0);
          s.phase = "drink";
          setTimeout(() => setPhase("drink"), 350);
        }
      } else sound.current?.pour.set(0);
      if (s.phase === "drink") {
        sound.current?.sip.set(s.holding ? 0.8 : 0);
        if (s.holding) {
          s.level = Math.max(0, s.level - dt / SIP_MS);
          if (s.level === 0) {
            s.holding = false;
            sound.current?.sip.set(0);
            sound.current?.slurp();
            navigator.vibrate?.([20, 40, 20]);
            setPhase("slurp");
            setTimeout(() => setPhase("ronda"), 1100);
          }
        }
      } else sound.current?.sip.set(0);
      setView({ ...s });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open]);

  // Film timecode in the corner.
  useEffect(() => {
    if (!open) return;
    const start = performance.now();
    const id = setInterval(() => setTime(performance.now() - start), 1000 / 24);
    return () => clearInterval(id);
  }, [open]);

  const press = () => {
    const s = sim.current;
    if (s.phase === "pour" || s.phase === "drink") s.holding = true;
  };
  const release = () => {
    sim.current.holding = false;
  };

  // Keyboard: space/enter on the focused action button holds; esc skips.
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      const p = sim.current.phase;
      if ((p === "pour" || p === "drink") && (e.key === " " || e.key === "Enter") && document.activeElement === actionBtn.current) {
        e.preventDefault();
        if (!e.repeat) press();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [open, close]);

  // Keep focus on the main control as the steps change.
  useEffect(() => {
    if (open && phase !== "leaving") requestAnimationFrame(() => actionBtn.current?.focus({ preventScroll: true }));
  }, [open, phase]);

  if (!open) return <div className="intro-root" hidden />;

  const tc = (() => {
    const f = Math.floor((time / 1000) * 24);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  })();

  const { holding } = view;
  const step = phase === "crush" ? 1 : phase === "pour" ? 2 : 3;
  const title = { crush: labels.crushTitle, pour: labels.title, drink: labels.drinkTitle, slurp: labels.done, ronda: labels.rondaTitle, leaving: labels.rondaTitle }[phase];
  const body = { crush: labels.crushBody, pour: labels.body, drink: "", slurp: "", ronda: labels.rondaBody, leaving: labels.rondaBody }[phase];
  const hint = phase === "crush" ? labels.hintCrush : phase === "pour" ? labels.hint : phase === "drink" ? labels.hintDrink : "";
  const progress = phase === "crush" ? view.crush : phase === "pour" ? view.level : 1 - view.level;
  const hold = phase === "pour" || phase === "drink";

  // Pointer on the scene: tap the mortero, drag the jarra, or hold anywhere to pour/sip.
  const sceneDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.phase === "crush") return hit();
    if (!hold) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (s.phase === "pour") s.drag = { x: e.clientX, y: e.clientY, tilt: s.tilt, at: performance.now(), moved: false };
    else press();
  };
  const sceneMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (!s.drag || !sceneBox.current) return;
    // Dragging left or up tips the jarra over the guampa.
    const dx = s.drag.x - e.clientX;
    const dy = s.drag.y - e.clientY;
    if (!s.drag.moved && Math.hypot(dx, dy) > 8) s.drag.moved = true;
    const w = sceneBox.current.getBoundingClientRect().width;
    s.target = Math.max(0, Math.min(1, s.drag.tilt + (dx + dy * 0.6) / (w * 0.35)));
  };
  const sceneUp = () => {
    sim.current.drag = null;
    release();
  };

  return (
    <div
      className={`intro-root fixed inset-0 z-[100] flex-col items-center justify-center bg-black text-white transition-all duration-[900ms] ${
        phase === "leaving" ? "pointer-events-none scale-105 opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={labels.kicker}
    >
      {/* Letterbox bars and HUD */}
      <div className="absolute inset-x-0 top-0 flex h-[8vh] items-end justify-between px-4 pb-2 font-mono text-[10px] text-slate-500 sm:px-8 sm:text-xs">
        <span>
          <span className="animate-pulse text-red-500">●</span> REC {tc}
        </span>
        <button
          onClick={() => setSoundOn(sound.current?.toggle() ?? false)}
          className="rounded border border-white/15 px-2 py-0.5 uppercase transition hover:border-white/50 hover:text-white"
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊" : "🔇"} {labels.sound}
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[8vh] items-start justify-between px-4 pt-2 font-mono text-[10px] text-slate-500 sm:px-8 sm:text-xs">
        <span className="hidden sm:inline">{labels.keys}</span>
        <span className="sm:hidden">ASUNCIÓN · PY</span>
        <button onClick={close} className="rounded border border-white/15 px-3 py-1 text-slate-300 transition hover:border-white/50 hover:text-white">
          {labels.skip} ⏭
        </button>
      </div>

      <div className="relative flex h-[84vh] w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#1d1a10_0%,#030405_70%)] px-4">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        {/* step dots */}
        <div className="relative flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-accent uppercase">
          {labels.kicker}
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1.5 w-6 rounded-full transition-colors ${n < step ? "bg-accent" : n === step ? "animate-pulse bg-accent/70" : "bg-white/15"}`} />
          ))}
        </div>
        <h2 key={phase} className="relative mt-3 max-w-xl animate-[fadeUp_.5s_ease] text-center font-display text-2xl font-bold text-balance sm:text-4xl" aria-live="polite">
          {title}
        </h2>
        <p className={`relative mt-2 min-h-[1.5em] max-w-md text-center text-sm text-slate-400 sm:text-base ${body ? "" : "invisible"}`}>{body || "·"}</p>

        <div
          ref={sceneBox}
          className={`relative mt-1 touch-none select-none ${phase === "crush" ? "cursor-pointer" : phase === "pour" ? "cursor-grab active:cursor-grabbing" : ""}`}
          onPointerDown={sceneDown}
          onPointerMove={sceneMove}
          onPointerUp={sceneUp}
          onPointerCancel={sceneUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Scene {...view} sipping={phase === "drink" && holding} slurp={phase === "slurp" || phase === "ronda"} />
        </div>

        <div className="relative mt-2 flex min-h-16 flex-col items-center">
          {phase === "crush" && (
            <button
              ref={actionBtn}
              onClick={hit}
              className="relative overflow-hidden rounded-xl border border-accent/70 bg-ink-900 px-8 py-3.5 font-mono text-sm font-semibold text-white shadow-lg shadow-accent/20 transition select-none hover:border-accent active:scale-95"
            >
              <span className="absolute inset-y-0 left-0 bg-accent/35 transition-[width]" style={{ width: `${progress * 100}%` }} />
              <span className="relative">{labels.crush} 🌿</span>
            </button>
          )}
          {hold && (
            <button
              ref={actionBtn}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                press();
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative touch-none overflow-hidden rounded-xl border px-8 py-3.5 font-mono text-sm font-semibold select-none transition ${
                holding ? "scale-95 border-accent bg-ink-900 text-white" : "border-accent/70 bg-ink-900 text-white shadow-lg shadow-accent/20 hover:border-accent"
              }`}
            >
              <span className="absolute inset-y-0 left-0 bg-accent/35" style={{ width: `${progress * 100}%` }} />
              <span className="relative">
                {phase === "pour" ? labels.pour : labels.drink} {phase === "pour" ? "💧" : <span dangerouslySetInnerHTML={{ __html: GUAMPA_SVG }} />}
              </span>
            </button>
          )}
          {(phase === "ronda" || phase === "leaving") && (
            <div className="flex animate-[fadeUp_.4s_ease] flex-wrap justify-center gap-3">
              <button onClick={again} className="rounded-xl border border-white/20 px-6 py-3 font-mono text-sm text-slate-200 transition hover:border-white/50 hover:text-white">
                🔁 {labels.again}
              </button>
              <button
                ref={actionBtn}
                onClick={close}
                className="rounded-xl bg-accent px-6 py-3 font-mono text-sm font-semibold text-ink-950 shadow-lg shadow-accent/30 transition hover:brightness-110"
              >
                {labels.thanks} 🙏
              </button>
            </div>
          )}
          {hint && <p className="mt-2 font-mono text-[11px] text-slate-500">{hint}</p>}
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
