// Matrix rain: katakana and code glyphs falling in the accent color for a few seconds.

const GLYPHS = "アカサタナハマヤラワ0123456789<>/{}[]#$%&*+=";

export default function matrixRain(ms = 6000): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.getElementById("matrix-rain")) return Promise.resolve();
  const c = document.createElement("canvas");
  c.id = "matrix-rain";
  c.setAttribute("aria-hidden", "true");
  c.style.cssText = "position:fixed;inset:0;z-index:90;pointer-events:none;transition:opacity .8s;opacity:.85";
  document.body.append(c);
  const ctx = c.getContext("2d")!;
  const dpr = Math.min(devicePixelRatio, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const size = 16;
  const cols = Math.ceil(innerWidth / size);
  const drops = Array.from({ length: cols }, () => Math.random() * -50);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#34d399";
  const end = performance.now() + ms;
  let last = 0;
  return new Promise((done) => {
    const frame = (now: number) => {
      if (now - last > 45) {
        last = now;
        ctx.fillStyle = "rgba(7,9,15,0.12)";
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = color;
        ctx.font = `${size}px 'JetBrains Mono', monospace`;
        drops.forEach((y, i) => {
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * size, y * size);
          drops[i] = y * size > innerHeight && Math.random() > 0.97 ? 0 : y + 1;
        });
      }
      if (now < end) requestAnimationFrame(frame);
      else {
        c.style.opacity = "0";
        setTimeout(() => {
          c.remove();
          done();
        }, 800);
      }
    };
    requestAnimationFrame(frame);
  });
}
