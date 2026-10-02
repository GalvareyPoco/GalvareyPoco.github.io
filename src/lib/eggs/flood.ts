// "Tereré flood": the jarra from the intro tips over the page and fills the screen with cold water, ice and yuyos,
// then it drains. Counts how many tererés this browser has served.
import { toast } from "./toast";
import { createSound } from "../../components/terere/sound";
import { fill, type EggStrings } from "./strings";

const COUNT_KEY = "terere-served";

// A small leather jarra like the intro's, with the tricolor band. Its spout is at the top left.
const JARRA = `<svg viewBox="0 0 100 130" width="100%" height="100%" aria-hidden="true">
  <path d="M18 14 Q50 4 82 14 L86 112 Q50 126 14 112 Z" fill="#7a4a24" stroke="#3b220f" stroke-width="3"/>
  <path d="M16 40 Q50 48 84 40 L84 52 Q50 60 16 52 Z" fill="#d52b1e"/>
  <path d="M16 52 Q50 60 84 52 L84 62 Q50 70 16 62 Z" fill="#fff"/>
  <path d="M16 62 Q50 70 84 62 L84 72 Q50 80 16 72 Z" fill="#0038a8"/>
  <path d="M84 30 Q104 50 86 92" fill="none" stroke="#3b220f" stroke-width="7" stroke-linecap="round"/>
  <path d="M18 14 Q8 10 4 16" fill="none" stroke="#3b220f" stroke-width="4" stroke-linecap="round"/>
  <text x="50" y="100" text-anchor="middle" font-family="monospace" font-size="12" fill="#f6e7c8">G·A</text>
</svg>`;

type Floater = { x: number; kind: "ice" | "leaf"; size: number; phase: number; spin: number; drop: number };
type Bubble = { x: number; y: number; r: number; v: number };

export default async function flood(t: EggStrings) {
  let n = 1;
  try {
    n = (Number(localStorage.getItem(COUNT_KEY)) || 0) + 1;
    localStorage.setItem(COUNT_KEY, String(n));
  } catch {}
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    toast(fill(t.served, { n }), 3200);
    return;
  }

  const W = innerWidth;
  const H = innerHeight;
  const canvas = document.createElement("canvas");
  canvas.dataset.eggUi = "";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;z-index:91;pointer-events:none;";
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const size = Math.min(150, W * 0.28);
  const jarra = document.createElement("div");
  jarra.dataset.eggUi = "";
  jarra.innerHTML = JARRA;
  jarra.style.cssText = `position:fixed;z-index:92;pointer-events:none;width:${size}px;height:${size * 1.3}px;top:${H * 0.12}px;right:${W * 0.12}px;transform-origin:20% 15%;transition:transform .8s cubic-bezier(.3,1.4,.5,1);filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));`;
  document.body.append(canvas, jarra);

  const sound = createSound();
  const floaters: Floater[] = Array.from({ length: Math.round(W / 70) }, (_, i) => ({
    x: ((i + Math.random() * 0.8) / Math.round(W / 70)) * W,
    kind: Math.random() < 0.45 ? "ice" : "leaf",
    size: 14 + Math.random() * 16,
    phase: Math.random() * 10,
    spin: (Math.random() - 0.5) * 1.5,
    drop: Math.random() * 30,
  }));
  const bubbles: Bubble[] = [];

  // Timeline (seconds): tip the jarra, pour while the water rises, hold, then drain.
  const TIP = 0.6;
  const POUR = 3.6;
  const HOLD = 1.6;
  const DRAIN = 1.8;
  const TOP = 0.62;
  const start = performance.now();
  requestAnimationFrame(() => (jarra.style.transform = "rotate(-75deg)"));

  await new Promise<void>((done) => {
    let poured = false;
    const frame = (now: number) => {
      const s = (now - start) / 1000;
      let level: number;
      if (s < TIP) level = 0;
      else if (s < TIP + POUR) level = TOP * (1 - (1 - (s - TIP) / POUR) ** 2);
      else if (s < TIP + POUR + HOLD) level = TOP;
      else level = TOP * Math.max(0, 1 - ((s - TIP - POUR - HOLD) / DRAIN) ** 2);
      const pouring = s > TIP && s < TIP + POUR;
      sound.pour.set(pouring ? 0.8 : 0);
      if (s > TIP + POUR && !poured) {
        poured = true;
        jarra.style.transform = "rotate(0deg) translateY(-160%)";
      }

      const surface = H * (1 - level);
      ctx.clearRect(0, 0, W, H);
      const wave = (x: number, k = 1) => surface + Math.sin(x / 70 + s * 2.2 * k) * 7 + Math.sin(x / 31 - s * 3.1 * k) * 3;

      // Stream from the spout down to the water.
      const jr = jarra.getBoundingClientRect();
      if (pouring) {
        const sx = jr.left + jr.width * 0.08;
        const sy = jr.top + jr.height * 0.75;
        ctx.strokeStyle = "rgba(186,230,253,0.75)";
        ctx.lineWidth = 10 + Math.sin(s * 30) * 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx - 40, sy + 60, sx - 50 + Math.sin(s * 9) * 4, Math.max(sy + 80, wave(sx - 50)));
        ctx.stroke();
        if (Math.random() < 0.6) bubbles.push({ x: sx - 50 + (Math.random() - 0.5) * 40, y: wave(sx - 50) + 10, r: 2 + Math.random() * 4, v: 30 + Math.random() * 60 });
      }

      if (level > 0.001) {
        // Two water layers: a deeper tereré green behind, a lighter one in front.
        for (const [k, color] of [
          [0.7, "rgba(101,163,13,0.28)"],
          [1, "rgba(125,211,252,0.22)"],
        ] as const) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, wave(x, k) + (k < 1 ? -6 : 0));
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, wave(x));
        ctx.stroke();

        for (const b of bubbles) {
          b.y -= b.v / 60;
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x + Math.sin(b.y / 12) * 2, b.y, b.r, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (Math.random() < 0.3) bubbles.push({ x: Math.random() * W, y: H, r: 1 + Math.random() * 3, v: 40 + Math.random() * 40 });
        for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].y < wave(bubbles[i].x) + 4) bubbles.splice(i, 1);

        // Ice and yuyo leaves bob on the surface.
        for (const f of floaters) {
          const y = wave(f.x) + 4 + Math.sin(s * 2 + f.phase) * 3 + f.drop * Math.max(0, 1 - level / TOP);
          if (y > H + 30) continue;
          ctx.save();
          ctx.translate(f.x + Math.sin(s + f.phase) * 6, y);
          ctx.rotate(Math.sin(s * 0.8 + f.phase) * 0.4 + f.spin * s * 0.2);
          if (f.kind === "ice") {
            ctx.fillStyle = "rgba(240,249,255,0.55)";
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-f.size / 2, -f.size / 2, f.size, f.size, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillRect(-f.size / 3, -f.size / 3, f.size / 4, f.size / 8);
          } else {
            ctx.fillStyle = "#4d7c0f";
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size * 0.6, f.size * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#a3e635";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-f.size * 0.55, 0);
            ctx.lineTo(f.size * 0.55, 0);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      if (s < TIP + POUR + HOLD + DRAIN) requestAnimationFrame(frame);
      else {
        sound.dispose();
        canvas.remove();
        jarra.remove();
        done();
      }
    };
    requestAnimationFrame(frame);
  });
  toast(fill(t.served, { n }), 3200);
}
