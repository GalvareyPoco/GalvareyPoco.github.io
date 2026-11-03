import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import type { JourneyPlace, JourneyStop } from "../data/journey";

// Scroll-driven globe: as each chapter scrolls to the middle of the screen, the globe turns to it and the route
// grows by one leg. The globe can also be dragged. Uses cobe (~5 KB WebGL globe).

const toAngles = ([lat, lon]: [number, number]) => [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180] as const;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.2, 0.83, 0.6];
}

const fmt = new Intl.NumberFormat("en-US");

export default function Journey({ stops, places, dragHint, kmLabel }: { stops: JourneyStop[]; places: JourneyPlace[]; dragHint: string; kmLabel: string }) {
  const [active, setActive] = useState(0);
  const [km, setKm] = useState(0);
  const activeRef = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const list = useRef<HTMLOListElement>(null);
  const fillEl = useRef<HTMLSpanElement>(null);

  // Which chapter is in the middle of the screen.
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
      // On mobile the sticky globe covers the top half, so a chapter only becomes active once it sits below it.
      { rootMargin: matchMedia("(min-width: 1024px)").matches ? "-50% 0px -40% 0px" : "-60% 0px -25% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // The route line beside the chapters fills as you scroll. Written straight to the DOM so scrolling never re-renders.
  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      const el = list.current;
      if (!el || !fillEl.current) return;
      const r = el.getBoundingClientRect();
      fillEl.current.style.transform = `scaleY(${Math.max(0, Math.min(1, (innerHeight * 0.5 - r.top) / r.height))})`;
    };
    const onScroll = () => !queued && (queued = true) && requestAnimationFrame(update);
    addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // Distance counter eases toward the active chapter's total.
  useEffect(() => {
    const target = stops[active].km;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const k = 1 - Math.exp(-(now - last) / 180);
      last = now;
      setKm((v) => {
        const next = Math.abs(target - v) < 20 ? target : v + (target - v) * k;
        if (next !== target) raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, stops]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    let accent = hexToRgb(css.getPropertyValue("--color-accent"));
    let accent2 = hexToRgb(css.getPropertyValue("--color-accent-2"));
    // cobe multiplies width/height by devicePixelRatio itself.
    const dpr = Math.min(window.devicePixelRatio, 2);
    let size = el.offsetWidth;
    let [phi, theta] = toAngles(stops[0].location);
    let drag = 0;
    let dragging: number | null = null;
    let visible = true;
    let shown = -1;

    const markers = () => {
      const here = stops[activeRef.current].placeId;
      const seen = new Set(stops.slice(0, activeRef.current + 1).map((s) => s.placeId));
      // San Miguel and Asunción are close together, so dots stay small and the current one is drawn last, on top.
      return places
        .map((p) => ({
          location: p.location,
          size: p.id === here ? 0.06 : seen.has(p.id) ? 0.04 : 0.025,
          color: p.id === here ? accent : seen.has(p.id) ? accent2 : ([0.45, 0.5, 0.6] as [number, number, number]),
          id: p.id,
        }))
        .sort((a, b) => Number(a.id === here) - Number(b.id === here));
    };
    // One arc per leg travelled so far; the latest leg is bright.
    const arcs = () =>
      stops.slice(1, activeRef.current + 1).flatMap((s, i) => {
        const from = stops[i];
        if (from.placeId === s.placeId) return [];
        return [{ from: from.location, to: s.location, id: `leg-${i}`, color: i + 1 === activeRef.current ? accent : accent2 }];
      });

    const globe = createGlobe(el, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
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
      arcs: arcs(),
      arcColor: accent,
      arcWidth: 0.7,
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
      if (visible) {
        const state: Parameters<typeof globe.update>[0] = { phi: phi + drag, theta };
        // Marker and arc buffers are only re-uploaded when the chapter changes.
        if (shown !== activeRef.current) {
          shown = activeRef.current;
          state.markers = markers();
          state.arcs = arcs();
        }
        globe.update(state);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const onResize = () => {
      // Mobile URL bars fire resize while scrolling without changing the width.
      if (el.offsetWidth === size) return;
      size = el.offsetWidth;
      globe.update({ width: size, height: size });
    };
    const onTheme = () => {
      const s = getComputedStyle(document.documentElement);
      accent = hexToRgb(s.getPropertyValue("--color-accent"));
      accent2 = hexToRgb(s.getPropertyValue("--color-accent-2"));
      globe.update({ markerColor: accent, arcColor: accent });
      shown = -1;
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
  }, [stops, places]);

  const stop = stops[active];
  const here = stop.placeId;
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="sticky top-16 z-0 h-[min(88vw,380px)] self-start sm:top-20 sm:h-[460px] lg:top-24 lg:h-[540px]">
        <div className="relative mx-auto aspect-square h-full max-w-full">
          <div className="absolute inset-[12%] rounded-full bg-accent/10 blur-3xl" />
          <canvas
            ref={canvas}
            className="relative h-full w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000"
            aria-label={`${stop.title}, ${stop.where}`}
            role="img"
          />
          {places.map((p) => (
            <span
              key={p.id}
              className="globe-label"
              data-active={p.id === here}
              // San Miguel, Asunción and La Granja sit close together, so their labels go to different sides.
              data-side={p.id === "smi" ? "right" : p.id === "scl" ? "left" : undefined}
              style={{ positionAnchor: `--cobe-${p.id}`, opacity: `var(--cobe-visible-${p.id}, 0)` } as React.CSSProperties}
            >
              {p.flag} {p.city}
            </span>
          ))}
          <div className="pointer-events-none absolute top-1 left-1 font-mono text-[10px] tracking-widest text-slate-500 uppercase sm:text-xs">
            <span className="text-accent">{String(active + 1).padStart(2, "0")}</span>/{String(stops.length).padStart(2, "0")}
            <span className="ml-3 text-slate-300 tabular-nums">{fmt.format(Math.round(km))}</span> {kmLabel}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center font-mono">
            {/* The chapter card already shows this on mobile, and the one-line caption is wider than a phone. */}
            <p key={stop.id} className="animate-[fadeUp_.5s_ease] text-sm whitespace-nowrap text-white max-lg:hidden">
              {stop.flag} {stop.title}
              {!stop.title.includes(stop.where) && <span className="text-accent"> · {stop.where}</span>}
            </p>
            <p className="mt-1 text-[10px] tracking-widest text-slate-500 uppercase">{dragHint}</p>
          </div>
        </div>
      </div>

      <ol ref={list} className="relative z-10 space-y-[24svh] pb-[30svh] pl-8 lg:space-y-[32vh] lg:pt-[12vh] lg:pb-[30vh]">
        {/* Route line with a fill that follows the scroll */}
        {/* The rail is centered on the chapter dots (dots sit 33px left of the card, inside its 1px border). */}
        <span className="absolute top-0 bottom-0 left-[7.5px] w-px bg-white/10" aria-hidden="true" />
        <span className="absolute top-0 left-[7.5px] w-px origin-top bg-gradient-to-b from-accent to-accent-2" ref={fillEl} style={{ height: "100%", transform: "scaleY(0)" }} aria-hidden="true" />
        {stops.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => {
              items.current[i] = el;
            }}
            data-index={i}
            className={`card spotlight relative p-6 transition duration-500 max-lg:transition-[opacity,border-color,background-color,box-shadow] max-lg:duration-300 max-lg:backdrop-blur-none ${i === active ? "border-accent/50 bg-ink-900/90 shadow-xl shadow-accent/10" : "opacity-10 lg:opacity-50"}`}
          >
            <span
              className={`absolute top-7 -left-[33px] grid h-4 w-4 place-items-center rounded-full border transition duration-500 ${
                i <= active ? "border-accent bg-accent/30 shadow-[0_0_14px] shadow-accent/60" : "border-white/20 bg-ink-950"
              }`}
              aria-hidden="true"
            >
              {i === active && <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent" />}
            </span>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              {String(i + 1).padStart(2, "0")} · {s.span}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {s.flag} {s.title}
            </h3>
            {!s.title.includes(s.where) && <p className="text-sm text-slate-500">{s.where}</p>}
            <p className="mt-4 text-slate-300">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
