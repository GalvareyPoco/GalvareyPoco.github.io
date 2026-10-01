import { useCallback, useEffect, useRef, useState } from "react";

// First-visit intro: pour water from the jarra into the guampa, then hold to drink the tereré.
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
};

export const INTRO_KEY = "terere-v1";
type Phase = "idle" | "pouring" | "drink" | "done" | "leaving";

const POUR_MS = 1800;
const DRINK_MS = 2200;

export default function TerereIntro({ labels }: { labels: IntroLabels }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(0); // water in the guampa, 0..1
  const [sipping, setSipping] = useState(false);
  const [time, setTime] = useState(0);
  const holding = useRef(false);
  const levelRef = useRef(0);
  const raf = useRef(0);
  const actionBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(document.documentElement.hasAttribute("data-intro"));
    const replay = () => {
      setPhase("idle");
      setLevel(0);
      levelRef.current = 0;
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
    setPhase("leaving");
    setTimeout(() => {
      document.documentElement.removeAttribute("data-intro");
      setOpen(false);
      window.dispatchEvent(new Event("intro:done"));
    }, 900);
  }, []);

  // Film timecode in the corner.
  useEffect(() => {
    if (!open) return;
    const start = performance.now();
    const id = setInterval(() => setTime(performance.now() - start), 1000 / 24);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    actionBtn.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    actionBtn.current?.focus();
  }, [phase]);

  const pour = () => {
    if (phase !== "idle") return;
    setPhase("pouring");
    setTimeout(() => {
      levelRef.current = 1;
      setLevel(1);
    }, 650);
    setTimeout(() => setPhase("drink"), 650 + POUR_MS);
  };

  const startSip = () => {
    if (phase !== "drink" || holding.current) return;
    holding.current = true;
    setSipping(true);
    let last = performance.now();
    const tick = (now: number) => {
      if (!holding.current) return;
      levelRef.current = Math.max(0, levelRef.current - (now - last) / DRINK_MS);
      last = now;
      setLevel(levelRef.current);
      if (levelRef.current === 0) {
        stopSip();
        setPhase("done");
        setTimeout(close, 1400);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stopSip = () => {
    holding.current = false;
    setSipping(false);
    cancelAnimationFrame(raf.current);
  };

  if (!open) return <div className="intro-root" hidden />;

  const tc = (() => {
    const f = Math.floor((time / 1000) * 24);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  })();

  const pouring = phase === "pouring";
  const title = phase === "idle" || pouring ? labels.title : phase === "drink" ? labels.drinkTitle : labels.done;
  // Guampa liquid: full sits at y=160, empty below the tip at y=296. Jarra water drops as it pours.
  const guampaY = 296 - level * 136;
  const jarraDrop = phase === "idle" ? 0 : 70;

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
      <div className="absolute inset-x-0 top-0 flex h-[9vh] items-end justify-between px-4 pb-2 font-mono text-[10px] text-slate-500 sm:px-8 sm:text-xs">
        <span>
          <span className="animate-pulse text-red-500">●</span> REC {tc}
        </span>
        <span>ASUNCIÓN · PY</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[9vh] items-start justify-between px-4 pt-2 font-mono text-[10px] text-slate-500 sm:px-8 sm:text-xs">
        <span className="hidden sm:inline">{labels.keys}</span>
        <span className="sm:hidden" />
        <button onClick={close} className="rounded border border-white/15 px-3 py-1 text-slate-300 transition hover:border-white/50 hover:text-white">
          {labels.skip} ⏭
        </button>
      </div>

      <div className="relative flex h-[82vh] w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#0f1a17_0%,#030405_70%)] px-4">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <p className="relative font-mono text-xs tracking-[0.3em] text-accent uppercase">{labels.kicker}</p>
        <h2 className="relative mt-3 max-w-xl text-center font-display text-2xl font-bold sm:text-4xl" aria-live="polite">
          {title}
        </h2>
        {phase === "idle" && <p className="relative mt-3 max-w-md text-center text-sm text-slate-400 sm:text-base">{labels.body}</p>}

        <svg viewBox="0 0 400 310" className="relative mt-4 h-[42vh] max-h-[360px] w-auto" aria-hidden="true">
          <defs>
            <clipPath id="guampa-in">
              <path d="M104 152 C104 212 116 260 134 280 Q142 288 150 280 C166 260 176 212 176 152 Z" />
            </clipPath>
            <clipPath id="jarra-in">
              <path d="M249 128 L331 128 L327 281 Q290 288 253 281 Z" />
            </clipPath>
            <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#a7f3d0" stopOpacity="0.85" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="horn" x1="0" x2="1">
              <stop offset="0" stopColor="#3b2414" />
              <stop offset="0.5" stopColor="#6b4426" />
              <stop offset="1" stopColor="#2e1b0e" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Table */}
          <line x1="20" y1="290" x2="380" y2="290" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />

          {/* Guampa: horn cup, drawn half x-ray so you can see the yerba and water inside */}
          <g>
            <path d="M100 150 C100 212 112 262 132 284 Q142 293 152 284 C170 262 180 212 180 150 Z" fill="url(#horn)" opacity="0.6" />
            <g clipPath="url(#guampa-in)">
              {/* water */}
              <rect
                x="95"
                y="0"
                width="90"
                height="140"
                fill="url(#water)"
                style={{ transform: `translateY(${guampaY}px)`, transition: pouring ? `transform ${POUR_MS}ms ease-in-out` : "none" }}
              />
              {/* yerba */}
              <rect x="95" y="196" width="90" height="100" fill="#4d7c0f" opacity="0.8" />
              {Array.from({ length: 34 }, (_, i) => (
                <circle key={i} cx={106 + ((i * 37) % 68)} cy={200 + ((i * 23) % 80)} r={1.6 + (i % 3)} fill={i % 2 ? "#65a30d" : "#365314"} />
              ))}
              {sipping &&
                [0, 1, 2, 3].map((i) => (
                  <circle key={i} cx={140 + (i % 2) * 6} cy="270" r="2.5" fill="#ecfeff" opacity="0.8">
                    <animate attributeName="cy" from="272" to={guampaY + 4} dur={`${0.5 + i * 0.15}s`} repeatCount="indefinite" />
                  </circle>
                ))}
            </g>
            <path d="M100 150 C100 212 112 262 132 284 Q142 293 152 284 C170 262 180 212 180 150" fill="none" stroke="var(--color-accent)" strokeWidth="2" filter="url(#glow)" />
            {/* leather stitching and metal rim */}
            <path d="M104 178 Q140 186 177 178" fill="none" stroke="#d6b48a" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            <path d="M110 240 Q140 248 170 240" fill="none" stroke="#d6b48a" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            {/* horn rings and the metal tip */}
            <path d="M106 210 Q140 216 174 210 M118 262 Q142 268 164 262" fill="none" stroke="#f5deb3" strokeWidth="1" opacity="0.25" />
            <path d="M128 279 Q142 298 157 279" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="140" cy="150" rx="40" ry="7" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          </g>

          {/* Bombilla */}
          <path d="M143 274 L158 120 Q160 106 172 102" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="143" cy="274" rx="7" ry="4" fill="#cbd5e1" />

          {/* Jarra with ice and yuyos; tips over the guampa while pouring */}
          <g
            style={{
              transformBox: "view-box",
              transformOrigin: "290px 200px",
              transform: pouring ? "translate(-60px,-70px) rotate(-35deg)" : "none",
              transition: "transform 650ms cubic-bezier(.6,.05,.3,1)",
              cursor: phase === "idle" ? "pointer" : "default",
            }}
            onClick={pour}
          >
            <g clipPath="url(#jarra-in)">
              <rect
                x="240"
                y="140"
                width="100"
                height="160"
                fill="url(#water)"
                opacity="0.8"
                style={{ transform: `translateY(${jarraDrop}px)`, transition: `transform ${POUR_MS}ms ease-in-out 650ms` }}
              />
              {[
                [262, 200, 8],
                [292, 225, -12],
                [312, 190, 20],
                [275, 250, -5],
              ].map(([x, y, r], i) => (
                <rect key={i} x={x} y={y} width="18" height="18" rx="3" fill="#f0fdfa" opacity="0.6" transform={`rotate(${r} ${x + 9} ${y + 9})`} />
              ))}
              {[
                [300, 260],
                [270, 230],
                [318, 236],
                [285, 270],
              ].map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y} rx="9" ry="3.5" fill="#15803d" transform={`rotate(${i * 40} ${x} ${y})`} />
              ))}
            </g>
            <path d="M245 125 L335 125 L330 285 Q290 292 250 285 Z" fill="#ffffff" fillOpacity="0.06" stroke="var(--color-accent-2)" strokeWidth="2" filter="url(#glow)" />
            <path d="M245 125 L230 114" stroke="var(--color-accent-2)" strokeWidth="2" strokeLinecap="round" />
            <path d="M335 145 Q364 150 362 190 Q360 230 332 234" fill="none" stroke="var(--color-accent-2)" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* Water stream from the spout */}
          <line
            x1="134"
            y1="96"
            x2="136"
            y2="158"
            stroke="#a7f3d0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="70"
            strokeDashoffset={pouring && level > 0 ? 0 : 70}
            style={{ transition: "stroke-dashoffset 250ms linear", opacity: pouring ? 0.9 : 0 }}
          />
        </svg>

        <div className="relative mt-6 h-14">
          {(phase === "idle" || pouring) && (
            <button
              ref={actionBtn}
              onClick={pour}
              disabled={pouring}
              className="rounded-xl bg-accent px-7 py-3.5 font-mono text-sm font-semibold text-ink-950 shadow-lg shadow-accent/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {labels.pour} 💧
            </button>
          )}
          {phase === "drink" && (
            <button
              ref={actionBtn}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                startSip();
              }}
              onPointerUp={stopSip}
              onPointerCancel={stopSip}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  startSip();
                }
              }}
              onKeyUp={stopSip}
              onContextMenu={(e) => e.preventDefault()}
              className="relative touch-none overflow-hidden rounded-xl border border-accent bg-ink-900 px-7 py-3.5 font-mono text-sm font-semibold text-white select-none"
            >
              <span className="absolute inset-y-0 left-0 bg-accent/30" style={{ width: `${(1 - level) * 100}%` }} />
              <span className="relative">{labels.drink} 🧉</span>
            </button>
          )}
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
