// "The page falls apart": everything on screen shakes loose and falls with real physics. Pieces can be grabbed
// and thrown, and "Rebuild" flies them back into place. Reuses matter-js from the falling skills.
import type { EggStrings } from "./strings";

const PIECES = "h1, h2, h3, h4, p, a, button, img, li, .card, [data-chip], canvas, svg, kbd";

type Piece = { el: HTMLElement; body: import("matter-js").Body; cx: number; cy: number; style: string };

export default async function collapse(t: EggStrings) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = await import("matter-js");
  const W = innerWidth;
  const H = innerHeight;

  // The biggest blocks on screen that aren't inside another chosen block, so each piece moves as one.
  const chosen: HTMLElement[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(PIECES)) {
    if (chosen.length >= 80 || chosen.some((c) => c.contains(el)) || el.closest("[data-egg-ui]")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    if (r.width * r.height > W * H * 0.3) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    // Skip things covered by something else (the pinned hero sits behind the sections that scroll over it).
    const x = Math.min(W - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(H - 1, Math.max(0, r.top + Math.min(r.height / 2, 20)));
    const top = document.elementFromPoint(x, y);
    if (!top || !(el.contains(top) || top.contains(el))) continue;
    chosen.push(el);
  }
  if (!chosen.length) return;

  const html = document.documentElement;
  const overflow = html.style.overflow;
  html.style.overflow = "hidden";

  const engine = Engine.create();
  engine.gravity.y = 1.2;
  const pieces: Piece[] = chosen.map((el) => {
    const style = el.getAttribute("style") ?? "";
    // Transforms don't apply to inline boxes.
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const body = Bodies.rectangle(cx, cy, r.width, r.height, {
      chamfer: { radius: Math.min(8, r.width / 3, r.height / 3) },
      restitution: 0.3,
      friction: 0.4,
      frictionAir: 0.01,
    });
    el.style.transition = "none";
    el.style.willChange = "transform";
    return { el, body, cx, cy, style };
  });

  const wall = 200;
  Composite.add(engine.world, [
    Bodies.rectangle(W / 2, H + wall / 2, W * 3, wall, { isStatic: true }),
    Bodies.rectangle(-wall / 2, 0, wall, H * 4, { isStatic: true }),
    Bodies.rectangle(W + wall / 2, 0, wall, H * 4, { isStatic: true }),
  ]);

  // A clear layer on top catches the pointer, so pieces can be thrown and links can't be clicked by accident.
  const layer = document.createElement("div");
  layer.dataset.eggUi = "";
  layer.style.cssText = "position:fixed;inset:0;z-index:92;cursor:grab;touch-action:none;";
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.eggUi = "";
  button.className = "egg-button";
  button.textContent = t.rebuild;
  button.title = t.grab;
  document.body.append(layer, button);
  const mouse = Mouse.create(layer);
  const m = mouse as unknown as { mousewheel: EventListener };
  for (const ev of ["wheel", "mousewheel", "DOMMouseScroll"]) layer.removeEventListener(ev, m.mousewheel);
  Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));

  const place = ({ el, body, cx, cy }: Piece, dx = body.position.x - cx, dy = body.position.y - cy, a = body.angle) => {
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${a}rad)`;
  };

  // A short shake, then everything drops. Pieces lower on screen go first.
  const start = performance.now();
  const SHAKE = 650;
  let dropped = false;
  let raf = 0;
  let last = start;
  const frame = (now: number) => {
    if (now - start < SHAKE) {
      const k = (now - start) / SHAKE;
      for (const p of pieces) place(p, (Math.random() - 0.5) * 6 * k, (Math.random() - 0.5) * 6 * k, (Math.random() - 0.5) * 0.04 * k);
    } else {
      if (!dropped) {
        dropped = true;
        for (const p of pieces) {
          Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 });
          Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.15);
        }
        Composite.add(
          engine.world,
          pieces.map((p) => p.body),
        );
        last = now;
      }
      Engine.update(engine, Math.min(32, now - last));
      last = now;
      for (const p of pieces) place(p);
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  await new Promise<void>((done) => {
    const rebuild = () => {
      removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      Engine.clear(engine);
      layer.remove();
      button.remove();
      for (const { el } of pieces) {
        el.style.transition = `transform ${700 + Math.random() * 400}ms cubic-bezier(.2,.9,.25,1.15)`;
        el.style.transform = "translate(0px, 0px) rotate(0rad)";
      }
      setTimeout(() => {
        for (const { el, style } of pieces) {
          if (style) el.setAttribute("style", style);
          else el.removeAttribute("style");
        }
        html.style.overflow = overflow;
        done();
      }, 1150);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && rebuild();
    button.addEventListener("click", rebuild);
    addEventListener("keydown", onKey);
  });
}
