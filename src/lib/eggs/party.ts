// "Party mode": confetti cannons from both bottom corners, a color wash over the page, headings bouncing to a
// chiptune beat, for a few seconds.
import { toast } from "./toast";
import { boom, note } from "./chip";
import type { EggStrings } from "./strings";

const LENGTH = 5200;

type Bit = { x: number; y: number; vx: number; vy: number; r: number; spin: number; w: number; h: number; color: string };

export default async function party(t: EggStrings) {
  const css = getComputedStyle(document.documentElement);
  const colors = [css.getPropertyValue("--color-accent").trim(), css.getPropertyValue("--color-accent-2").trim(), "#f472b6", "#60a5fa", "#fff"];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  toast(t.party, 2400);
  if (reduced) return;

  const W = innerWidth;
  const H = innerHeight;
  const canvas = document.createElement("canvas");
  canvas.dataset.eggUi = "";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;z-index:94;pointer-events:none;";
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const wash = document.createElement("div");
  wash.dataset.eggUi = "";
  wash.className = "egg-party-wash";
  document.body.append(wash, canvas);
  document.documentElement.classList.add("egg-party");

  const bits: Bit[] = [];
  const cannon = (side: 1 | -1) => {
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI / 2 + side * (0.25 + Math.random() * 0.45);
      const s = H * (0.9 + Math.random() * 0.9);
      bits.push({
        x: side > 0 ? 0 : W,
        y: H,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        r: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 12,
        w: 6 + Math.random() * 6,
        h: 3 + Math.random() * 5,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
    boom(0.3, 0.1);
  };
  cannon(1);
  cannon(-1);
  const again = setTimeout(() => {
    cannon(1);
    cannon(-1);
  }, 1800);

  // Four-on-the-floor beat with a little bass line.
  const bass = [131, 131, 165, 196, 175, 175, 147, 196];
  for (let i = 0; i < 16; i++) {
    note(55, 0.12, { at: i * 0.3, type: "sine", vol: 0.12, slide: 40 });
    note(bass[i % 8], 0.14, { at: i * 0.3 + 0.15, type: "square", vol: 0.03 });
  }

  const start = performance.now();
  let last = start;
  await new Promise<void>((done) => {
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      for (const b of bits) {
        b.vy += H * 1.1 * dt;
        b.vx *= 0.99;
        b.vy *= 0.99;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.spin * dt;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.scale(1, Math.cos(b.r * 2));
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (now - start < LENGTH) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  });
  clearTimeout(again);
  document.documentElement.classList.remove("egg-party");
  wash.remove();
  canvas.remove();
}
