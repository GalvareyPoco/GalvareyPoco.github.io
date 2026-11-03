import { Suspense, lazy, useEffect, useState } from "react";
import type { BadgeInfo } from "./badgeTexture";

// three.js + physics only download once the hero is on screen, and never for reduced motion or no WebGL.
const Lanyard3D = lazy(() => import("./Lanyard3D"));

function readAccents() {
  const s = getComputedStyle(document.documentElement);
  return {
    accent: s.getPropertyValue("--color-accent").trim() || "#34d399",
    accent2: s.getPropertyValue("--color-accent-2").trim() || "#22d3ee",
  };
}

function canUse3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Lanyard({ info, hint }: { info: BadgeInfo; hint: string }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [colors, setColors] = useState<{ accent: string; accent2: string } | null>(null);

  useEffect(() => {
    setColors(readAccents());
    // Keep the first-visit intro smooth: start the heavy download once it's over and the browser is idle.
    const start = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
      idle(() => setEnabled(canUse3D()));
    };
    if (document.documentElement.hasAttribute("data-intro")) window.addEventListener("intro:done", start, { once: true });
    else start();
    const onTheme = () => setColors(readAccents());
    window.addEventListener("themechange", onTheme);
    return () => {
      window.removeEventListener("themechange", onTheme);
      window.removeEventListener("intro:done", start);
    };
  }, []);

  return (
    <div className="relative h-[480px] w-full sm:h-[560px] lg:absolute lg:inset-0 lg:h-auto">
      {/* Static badge: shown before the 3D one is ready, and instead of it when 3D is off. */}
      <div
        aria-hidden={enabled}
        className={`absolute inset-0 flex items-center justify-center lg:left-auto lg:w-1/2 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <StaticBadge info={info} />
      </div>
      {enabled && colors && (
        <Suspense fallback={null}>
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Lanyard3D info={info} accent={colors.accent} accent2={colors.accent2} onReady={() => setTimeout(() => setReady(true), 250)} />
          </div>
        </Suspense>
      )}
      {enabled && (
        <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap lg:bottom-10 lg:left-[72%] font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function StaticBadge({ info }: { info: BadgeInfo }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="h-24 w-6 bg-gradient-to-b from-transparent to-accent/70" />
      <div className="-mt-1 h-4 w-12 rounded-sm bg-slate-300" />
      <div data-tilt="12" className="relative w-60 overflow-hidden rounded-3xl border border-accent/40 bg-ink-900 p-4 shadow-2xl shadow-accent/10 sm:w-72">
        {/* holographic foil */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,color-mix(in_oklab,var(--color-accent)_25%,transparent)_40%,rgb(167_139_250/0.2)_55%,color-mix(in_oklab,var(--color-accent-2)_25%,transparent)_70%,transparent_85%)] mix-blend-screen" />
        <p className="relative text-center font-display text-2xl font-bold text-white">{info.name}</p>
        <p className="relative text-center font-display text-sm text-gradient">{info.role}</p>
        <img src={info.photo} alt="" width="460" height="460" className="relative mt-3 aspect-[4/4.2] w-full rounded-2xl object-cover ring-1 ring-accent/50" />
        <div className="relative mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
          <img src={info.photo} alt="" width="32" height="32" className="h-8 w-8 rounded-full object-cover ring-2 ring-accent" />
          <div className="min-w-0 flex-1 font-mono text-[11px]">
            <p className="text-white">@{info.handle}</p>
            <p className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" aria-hidden="true" />
              {info.status}
            </p>
            {/* The card is too narrow on mobile for a side-by-side pill, so it sits under the status. */}
            <span className="mt-1 inline-block max-w-full truncate rounded-full border border-accent px-2 py-0.5 text-[10px] text-accent">{info.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
