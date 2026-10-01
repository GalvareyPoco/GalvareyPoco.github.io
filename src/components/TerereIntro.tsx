import { useCallback, useEffect, useRef, useState } from "react";

// First-visit intro: hold to pour water from the jarra into the guampa, then hold to sip it through the bombilla.
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
};

export const INTRO_KEY = "terere-v1";
type Phase = "pour" | "drink" | "done" | "leaving";

const POUR_MS = 1500; // full guampa while the stream runs
const SIP_MS = 1800; // empty guampa while sipping
const TILT_POUR = 0.82; // tilt at which water starts to flow

export default function TerereIntro({ labels }: { labels: IntroLabels }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("pour");
  const [time, setTime] = useState(0);
  // Animation state lives in refs and is mirrored into one state object per frame.
  const [view, setView] = useState({ tilt: 0, level: 0, holding: false });
  const sim = useRef({ tilt: 0, level: 0, holding: false, phase: "pour" as Phase });
  const raf = useRef(0);
  const actionBtn = useRef<HTMLButtonElement>(null);

  const reset = () => {
    sim.current = { tilt: 0, level: 0, holding: false, phase: "pour" };
    setView({ tilt: 0, level: 0, holding: false });
    setPhase("pour");
  };

  useEffect(() => {
    setOpen(document.documentElement.hasAttribute("data-intro"));
    const replay = () => {
      reset();
      document.documentElement.setAttribute("data-intro", "");
      setOpen(true);
    };
    window.addEventListener("terere:replay", replay);
    return () => window.removeEventListener("terere:replay", replay);
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}
    sim.current.phase = "leaving";
    setPhase("leaving");
    setTimeout(() => {
      document.documentElement.removeAttribute("data-intro");
      setOpen(false);
      window.dispatchEvent(new Event("intro:done"));
    }, 900);
  }, []);

  // One loop drives the jarra tilt, the pour and the sip.
  useEffect(() => {
    if (!open) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const s = sim.current;
      if (s.phase === "pour") {
        // Ease the jarra toward tilted while held, back upright when released.
        const target = s.holding ? 1 : 0;
        s.tilt += (target - s.tilt) * Math.min(1, dt / 140);
        if (s.holding && s.tilt > TILT_POUR) s.level = Math.min(1, s.level + dt / POUR_MS);
        if (s.level >= 1) {
          s.holding = false;
          s.phase = "drink";
          setTimeout(() => setPhase("drink"), 450);
        }
      } else {
        s.tilt += (0 - s.tilt) * Math.min(1, dt / 140);
        if (s.phase === "drink" && s.holding) {
          s.level = Math.max(0, s.level - dt / SIP_MS);
          if (s.level === 0) {
            s.holding = false;
            s.phase = "done";
            setPhase("done");
            setTimeout(close, 1500);
          }
        }
      }
      setView({ tilt: s.tilt, level: s.level, holding: s.holding });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open, close]);

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

  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if ((e.key === " " || e.key === "Enter") && !e.repeat && document.activeElement === actionBtn.current) {
        e.preventDefault();
        press();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    actionBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [open, close]);

  if (!open) return <div className="intro-root" hidden />;

  const tc = (() => {
    const f = Math.floor((time / 1000) * 24);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  })();

  const { tilt, level, holding } = view;
  const pouring = phase === "pour" && holding && tilt > TILT_POUR;
  const sipping = phase === "drink" && holding;
  const step = phase === "pour" ? 1 : 2;
  const title = phase === "pour" ? labels.title : phase === "drink" ? labels.drinkTitle : labels.done;
  const progress = phase === "pour" ? level : 1 - level;
  const canAct = phase === "pour" || phase === "drink";

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
        <span>ASUNCIÓN · PY</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[8vh] items-start justify-between px-4 pt-2 font-mono text-[10px] text-slate-500 sm:px-8 sm:text-xs">
        <span className="hidden sm:inline">{labels.keys}</span>
        <span className="sm:hidden" />
        <button onClick={close} className="rounded border border-white/15 px-3 py-1 text-slate-300 transition hover:border-white/50 hover:text-white">
          {labels.skip} ⏭
        </button>
      </div>

      <div className="relative flex h-[84vh] w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#10201a_0%,#030405_70%)] px-4">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <p className="relative font-mono text-xs tracking-[0.3em] text-accent uppercase">
          {labels.kicker} · {step}/2
        </p>
        <h2 key={phase} className="relative mt-3 max-w-xl animate-[fadeUp_.5s_ease] text-center font-display text-2xl font-bold sm:text-4xl" aria-live="polite">
          {title}
        </h2>
        <p className={`relative mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base ${phase === "pour" ? "" : "invisible"}`}>{labels.body}</p>

        {/* The whole scene is a hold target too, so it works wherever the thumb lands. */}
        <div
          className="relative mt-2 touch-none select-none"
          onPointerDown={(e) => {
            if (!canAct) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            press();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Scene tilt={tilt} level={level} pouring={pouring} sipping={sipping} done={phase === "done" || phase === "leaving"} />
        </div>

        <div className="relative mt-2 flex h-16 flex-col items-center">
          {canAct && (
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
                {phase === "pour" ? labels.pour : labels.drink} {phase === "pour" ? "💧" : "🧉"}
              </span>
            </button>
          )}
          {canAct && <p className="mt-2 font-mono text-[11px] text-slate-500">{labels.hint}</p>}
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}

/** Guampa (horn cup with metal rim, leather wrap and bombilla) and a terere jarra with ice and yuyos. */
function Scene({ tilt, level, pouring, sipping, done }: { tilt: number; level: number; pouring: boolean; sipping: boolean; done: boolean }) {
  const pct = Math.round(level * 100);
  return (
    <svg viewBox="0 0 400 320" className="h-[44vh] max-h-[380px] w-auto" aria-hidden="true">
      <defs>
        <linearGradient id="t-horn" x1="0" x2="1">
          <stop offset="0" stopColor="#2a1a0d" />
          <stop offset="0.25" stopColor="#7a5230" />
          <stop offset="0.45" stopColor="#c9a27a" />
          <stop offset="0.6" stopColor="#8a5d35" />
          <stop offset="1" stopColor="#24160b" />
        </linearGradient>
        <linearGradient id="t-leather" x1="0" x2="1">
          <stop offset="0" stopColor="#2b1608" />
          <stop offset="0.45" stopColor="#6b3a17" />
          <stop offset="1" stopColor="#24120a" />
        </linearGradient>
        <linearGradient id="t-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#5b6472" />
          <stop offset="0.35" stopColor="#e5e9f0" />
          <stop offset="0.6" stopColor="#9aa3b2" />
          <stop offset="1" stopColor="#3f4652" />
        </linearGradient>
        <radialGradient id="t-water" cx="0.4" cy="0.4">
          <stop offset="0" stopColor="#d9fbe9" />
          <stop offset="1" stopColor="#6ee7b7" />
        </radialGradient>
        <filter id="t-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Table and shadows */}
      <line x1="10" y1="292" x2="390" y2="292" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx="135" cy="292" rx="44" ry="4" fill="#000" opacity="0.5" />
      <ellipse cx="285" cy="292" rx="56" ry="5" fill="#000" opacity="0.5" />

      {/* HUD level meter */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#94a3b8">
        <text x="40" y="146">H₂O</text>
        <rect x="44" y="152" width="8" height="120" rx="2" fill="none" stroke="var(--color-accent)" strokeOpacity="0.5" />
        <rect x="46" y={154 + 116 * (1 - level)} width="4" height={116 * level} fill="var(--color-accent)" />
        <text x="40" y="286">{pct}%</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#94a3b8">
        <text x="330" y="40">TEMP <tspan fill="var(--color-accent-2)">3°C</tspan></text>
        <text x="330" y="54">ICE <tspan fill="var(--color-accent-2)">OK</tspan></text>
        <text x="330" y="68">YUYO <tspan fill="var(--color-accent-2)">✓</tspan></text>
      </g>

      {/* Bombilla: alpaca straw leaning left, flattened mouthpiece. Drawn before the cup so the cup hides its lower half. */}
      <path d="M142 230 L122 100 Q119 86 106 82" fill="none" stroke="url(#t-metal)" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="117.5" y="112" width="8" height="5" rx="1.5" fill="#cbd5e1" transform="rotate(-9 121 114)" />
      {sipping &&
        [0, 1, 2].map((i) => (
          <circle key={i} r="1.8" fill="#a7f3d0">
            <animateMotion dur="0.6s" begin={`${i * 0.2}s`} repeatCount="indefinite" path="M139 146 L122 100 Q119 86 106 82" />
          </circle>
        ))}

      {/* Guampa body: horn with a leather wrap, metal rim (virola) and metal foot */}
      <path d="M99 150 C101 200 103 245 108 280 L162 280 C167 245 169 200 171 150 Z" fill="url(#t-horn)" />
      <path d="M100.6 186 C101.7 210 102.8 232 104 252 L166 252 C167.2 232 168.3 210 169.4 186 Z" fill="url(#t-leather)" />
      <path d="M102 191 L168 191 M104.5 247 L165.5 247" stroke="#e7c9a0" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
      <path d="M118 212 l17 14 l17 -14 M118 226 l17 -14 l17 14" stroke="#e7c9a0" strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M104 160 C110 165 160 165 166 160" stroke="#f5e1c8" strokeWidth="1" opacity="0.25" fill="none" />
      <path d="M104 276 L166 276 L168 288 Q135 294 102 288 Z" fill="url(#t-metal)" />
      {/* Opening: yerba, with water over it as it fills */}
      <ellipse cx="135" cy="148" rx="36" ry="6" fill="#3f6212" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={i} cx={108 + i * 7.5} cy={146 + (i % 3)} r="1.6" fill={i % 2 ? "#84cc16" : "#365314"} />
      ))}
      <ellipse cx="135" cy="148" rx="36" ry="6" fill="url(#t-water)" opacity={level * 0.85} />
      {level > 0.05 && <ellipse cx="124" cy="146.5" rx="10" ry="1.6" fill="#fff" opacity={level * 0.6} />}
      {/* Front lip of the rim covers the bombilla where it enters */}
      <path d="M97 148 A38 8 0 0 0 173 148 L173 154 A38 8 0 0 1 97 154 Z" fill="url(#t-metal)" />
      <path d="M97 148 A38 8 0 0 1 173 148" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Water stream and splash while pouring */}
      {pouring && (
        <g filter="url(#t-glow)">
          <path d="M155 109 C153 122 151 134 149 147" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.25s" repeatCount="indefinite" />
          </path>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={142 + i * 6} cy="146" r="1.4" fill="#d9fbe9">
              <animate attributeName="cy" values="147;139;147" dur={`${0.35 + i * 0.1}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* Jarra: metal pitcher with leather forro (flag stripe), spout, handle, ice and yuyos.
          Tilts toward the guampa so the spout ends right above its opening. */}
      <g transform={`translate(${-25 * tilt} ${-88 * tilt}) rotate(${-50 * tilt} 285 200)`}>
        {/* yuyos and ice peeking out of the top */}
        <path d="M270 128 C266 112 262 104 254 98 M290 128 C292 110 300 100 308 96 M281 128 C281 114 279 106 276 98" stroke="#15803d" strokeWidth="2" fill="none" />
        {[
          [254, 98, -30],
          [262, 106, 20],
          [308, 96, 30],
          [300, 104, -20],
          [276, 98, 0],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="3.2" fill={i % 2 ? "#22c55e" : "#16a34a"} transform={`rotate(${r} ${x} ${y})`} />
        ))}
        <rect x="262" y="116" width="14" height="14" rx="3" fill="#e0f2fe" opacity="0.85" transform="rotate(12 269 123)" />
        <rect x="292" y="118" width="13" height="13" rx="3" fill="#e0f2fe" opacity="0.75" transform="rotate(-10 298 124)" />
        {/* handle */}
        <path d="M330 148 C364 148 368 204 335 238" fill="none" stroke="url(#t-metal)" strokeWidth="10" strokeLinecap="round" />
        {/* body */}
        <path d="M240 130 L330 130 L336 282 Q285 292 234 282 Z" fill="url(#t-metal)" />
        <path d="M238.2 176 L331.8 176 L334.4 246 L235.6 246 Z" fill="url(#t-leather)" />
        <path d="M238.5 181 L331.5 181 M236 241 L334 241" stroke="#e7c9a0" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
        <rect x="237.3" y="203" width="95.4" height="4.5" fill="#d52b1e" />
        <rect x="237.1" y="207.5" width="95.8" height="4.5" fill="#f8fafc" />
        <rect x="236.9" y="212" width="96.2" height="4.5" fill="#0038a8" />
        <path d="M250 136 L252 278" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" />
        {/* rim and spout */}
        <ellipse cx="285" cy="130" rx="45" ry="6" fill="#1e293b" stroke="url(#t-metal)" strokeWidth="3" />
        <path d="M243 126 L214 110 Q212 116 238 138 Z" fill="url(#t-metal)" />
      </g>

      {done && (
        <text x="150" y="76" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="22" fill="var(--color-accent)" filter="url(#t-glow)" transform="rotate(-8 150 76)">
          *sluuurp*
        </text>
      )}
    </svg>
  );
}
