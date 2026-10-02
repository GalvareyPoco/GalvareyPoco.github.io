// "Black hole": a black hole opens where the pointer is (or mid-screen) and swallows everything on screen in a
// spiral, then collapses and spits it all back out into place.
import { hold, visiblePieces } from "./pieces";
import { boom, note } from "./chip";

const PULL = 2400;
const HOLD = 500;

export default async function blackhole() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = visiblePieces(90);
  if (!els.length) return;
  const cx = last?.[0] ?? innerWidth / 2;
  const cy = last?.[1] ?? innerHeight / 2;

  const hole = document.createElement("div");
  hole.dataset.eggUi = "";
  hole.className = "egg-hole";
  hole.style.left = `${cx}px`;
  hole.style.top = `${cy}px`;
  document.body.append(hole);
  requestAnimationFrame(() => hole.classList.add("is-open"));
  note(80, PULL / 1000, { type: "sawtooth", vol: 0.05, slide: 30 });

  const pieces = els.map((el) => {
    const restore = hold(el);
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    // Closer pieces fall in first.
    const delay = Math.min(0.5, Math.hypot(dx, dy) / Math.hypot(innerWidth, innerHeight)) * 0.9;
    el.style.transition = "none";
    el.style.willChange = "transform, opacity";
    return { el, restore, dx, dy, delay, spin: (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random()) };
  });

  const start = performance.now();
  await new Promise<void>((done) => {
    const frame = (now: number) => {
      const t = (now - start) / PULL;
      for (const p of pieces) {
        const k = Math.min(1, Math.max(0, (t - p.delay) / (1 - p.delay)));
        const e = k * k * k;
        // Spiral in: the offset to the hole rotates while it shrinks.
        const a = e * p.spin * Math.PI;
        const left = 1 - e;
        const x = p.dx - (p.dx * Math.cos(a) - p.dy * Math.sin(a)) * left;
        const y = p.dy - (p.dx * Math.sin(a) + p.dy * Math.cos(a)) * left;
        p.el.style.transform = `translate(${x}px, ${y}px) rotate(${a * 57}deg) scale(${1 - e * 0.97})`;
        p.el.style.opacity = String(1 - e * 0.8);
      }
      if (t < 1) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  });

  await new Promise((r) => setTimeout(r, HOLD));
  // Collapse and spit everything back.
  hole.classList.add("is-pop");
  boom(0.5, 0.15);
  for (const p of pieces) {
    p.el.style.transition = `transform ${600 + Math.random() * 500}ms cubic-bezier(.2,1.4,.4,1), opacity .4s`;
    p.el.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
    p.el.style.opacity = "1";
  }
  await new Promise((r) => setTimeout(r, 1200));
  hole.remove();
  pieces.forEach((p) => p.restore());
}

// The last pointer position, so the hole opens under the cursor.
let last: [number, number] | null = null;
addEventListener("pointermove", (e) => (last = [e.clientX, e.clientY]), { passive: true });
