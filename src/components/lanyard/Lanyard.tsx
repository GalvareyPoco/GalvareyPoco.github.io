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
      <div className="w-56 rotate-[-3deg] rounded-2xl border border-accent/50 bg-ink-900 p-4 shadow-2xl shadow-accent/10 sm:w-64">
        <div className="mb-3 flex justify-between font-mono text-[10px] text-slate-500">
          <span className="text-accent">● DEV PASS</span>
          <span>{info.id}</span>
        </div>
        <img src={info.photo} alt="" width="460" height="460" className="aspect-[4/5] w-full rounded-xl object-cover ring-2 ring-accent/60" />
        <p className="mt-3 font-display text-3xl font-bold text-white uppercase">{info.name}</p>
        <p className="font-display text-sm text-gradient">{info.role}</p>
        <p className="mt-1 font-mono text-[10px] text-slate-500">{info.location}</p>
      </div>
    </div>
  );
}
