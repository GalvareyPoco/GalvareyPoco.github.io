import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import type { JourneyStop } from "../data/journey";

// Scroll-driven globe: as each place scrolls to the middle of the screen, the globe turns to it.
// The globe can also be dragged. Uses cobe (~5 KB WebGL globe).

const toAngles = ([lat, lon]: [number, number]) => [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180] as const;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.2, 0.83, 0.6];
}

export default function Journey({ stops, dragHint }: { stops: JourneyStop[]; dragHint: string }) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // Which stop is in the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            activeRef.current = i;
            setActive(i);
          }
        }
      },
      { rootMargin: "-50% 0px -40% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    let accent = hexToRgb(css.getPropertyValue("--color-accent"));
    let accent2 = hexToRgb(css.getPropertyValue("--color-accent-2"));
    const dpr = Math.min(window.devicePixelRatio, 2);
    let size = el.offsetWidth;
    let [phi, theta] = toAngles(stops[0].location);
    let drag = 0;
    let dragging: number | null = null;
    let visible = true;

    const markers = () =>
      stops.map((s, i) => ({
        location: s.location,
        size: i === activeRef.current ? 0.1 : 0.05,
        color: i === activeRef.current ? accent : accent2,
        id: s.id,
      }));
    const globe = createGlobe(el, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.16, 0.2, 0.26],
      markerColor: accent,
      glowColor: [0.12, 0.16, 0.2],
      markers: markers(),
      arcs: stops.slice(1).map((s) => ({ from: stops[0].location, to: s.location, id: `${stops[0].id}-${s.id}` })),
      arcColor: accent,
      arcWidth: 0.6,
      arcHeight: 0.35,
      markerElevation: 0.02,
    });

    let raf = 0;
    const frame = () => {
      const [tp, tt] = toAngles(stops[activeRef.current].location);
      // Turn the short way round.
      let dp = tp - phi;
      dp = Math.atan2(Math.sin(dp), Math.cos(dp));
      const k = reduced ? 1 : 0.06;
      phi += dp * k;
      theta += (tt * 0.8 - theta) * k;
      if (dragging === null) drag *= reduced ? 0 : 0.96;
      if (visible) globe.update({ phi: phi + drag, theta, markers: markers(), markerColor: accent, arcColor: accent });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const onResize = () => {
      size = el.offsetWidth;
      globe.update({ width: size * dpr, height: size * dpr });
    };
    const onTheme = () => {
      const s = getComputedStyle(document.documentElement);
      accent = hexToRgb(s.getPropertyValue("--color-accent"));
      accent2 = hexToRgb(s.getPropertyValue("--color-accent-2"));
    };
    const down = (e: PointerEvent) => {
      dragging = e.clientX - drag * 200;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (dragging !== null) drag = (e.clientX - dragging) / 200;
    };
    const up = () => {
      dragging = null;
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    addEventListener("resize", onResize);
    addEventListener("themechange", onTheme);
    requestAnimationFrame(() => (el.style.opacity = "1"));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      globe.destroy();
      removeEventListener("resize", onResize);
      removeEventListener("themechange", onTheme);
    };
  }, [stops]);

  const stop = stops[active];
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="sticky top-16 z-0 h-[min(88vw,380px)] self-start sm:top-20 sm:h-[460px] lg:top-24 lg:h-[540px]">
        <div className="relative mx-auto aspect-square h-full max-w-full">
          <div className="absolute inset-[12%] rounded-full bg-accent/10 blur-3xl" />
          <canvas
            ref={canvas}
            className="relative h-full w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000"
            aria-label={`${stop.city}, ${stop.country}`}
            role="img"
          />
          {stops.map((s, i) => (
            <span key={s.id} className="globe-label" data-active={i === active} style={{ positionAnchor: `--cobe-${s.id}`, opacity: `var(--cobe-visible-${s.id}, 0)` } as React.CSSProperties}>
              {s.flag} {s.city}
            </span>
          ))}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center font-mono">
            <p key={stop.id} className="animate-[fadeUp_.5s_ease] text-sm text-white">
              {stop.flag} {stop.city} · <span className="text-accent">{stop.country}</span>
            </p>
            <p className="mt-1 text-[10px] tracking-widest text-slate-500 uppercase">{dragHint}</p>
          </div>
        </div>
      </div>

      <ol className="relative z-10 space-y-[28vh] pb-[20vh] lg:space-y-[40vh] lg:pt-[12vh] lg:pb-[30vh]">
        {stops.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => {
              items.current[i] = el;
            }}
            data-index={i}
            className={`card spotlight p-6 transition duration-500 ${i === active ? "border-accent/50 shadow-xl shadow-accent/10" : "opacity-50"}`}
          >
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              {String(i + 1).padStart(2, "0")} · {s.span}
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-white">
              {s.flag} {s.city}
            </h3>
            <p className="text-sm text-slate-500">{s.country}</p>
            <p className="mt-4 text-slate-300">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
