// Canvas drawings for the badge faces and the lanyard strap. The front follows React Bits' ProfileCard layout:
// name and title on top, big photo, and a glass bar with avatar, handle, status and location at the bottom.

export type BadgeInfo = {
  name: string;
  handle: string;
  role: string;
  location: string;
  status: string;
  photo: string;
  id: string;
  site: string;
  /** Short lines printed on the back, terminal style. */
  back: string[];
  access: string;
};

export const BADGE_PX = { w: 800, h: 1125 };

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Dark card with a holographic wash and a faint grid. */
function background(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, accent2: string) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#101726");
  g.addColorStop(1, "#05070c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const holo = ctx.createLinearGradient(0, h, w, 0);
  holo.addColorStop(0, accent + "33");
  holo.addColorStop(0.4, "#a78bfa22");
  holo.addColorStop(0.7, accent2 + "33");
  holo.addColorStop(1, "#f472b622");
  ctx.fillStyle = holo;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Slot for the clip.
  ctx.fillStyle = "#000";
  roundRect(ctx, w / 2 - 70, 30, 140, 22, 11);
  ctx.fill();
}

/** Deterministic barcode from a string. */
function barcode(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number) {
  let seed = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  let cx = x;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  while (cx < x + w) {
    const bw = 2 + Math.floor(rand() * 4) * 2;
    if (rand() > 0.35) ctx.fillRect(cx, y, bw, h);
    cx += bw + 2;
  }
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, shiftY = 0) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2 + shiftY, dw, dh);
}

export function drawFront(info: BadgeInfo, photo: HTMLImageElement | null, accent: string, accent2: string) {
  const { w, h } = BADGE_PX;
  const [c, ctx] = canvas(w, h);
  background(ctx, w, h, accent, accent2);
  ctx.textBaseline = "top";
  ctx.textAlign = "center";

  // Name and title, centered like ProfileCard.
  ctx.fillStyle = "#fff";
  ctx.font = "700 76px 'Space Grotesk', sans-serif";
  ctx.fillText(info.name, w / 2, 84, w - 80);
  const g = ctx.createLinearGradient(160, 0, w - 160, 0);
  g.addColorStop(0, accent);
  g.addColorStop(1, accent2);
  ctx.fillStyle = g;
  ctx.font = "500 36px 'Space Grotesk', sans-serif";
  ctx.fillText(info.role, w / 2, 176, w - 120);

  // Photo, fading into the card at the bottom.
  const py = 240;
  const ph = 640;
  ctx.save();
  roundRect(ctx, 40, py, w - 80, ph, 32);
  ctx.clip();
  ctx.fillStyle = "#1c2436";
  ctx.fillRect(40, py, w - 80, ph);
  if (photo) cover(ctx, photo, 40, py, w - 80, ph, 10);
  const tint = ctx.createLinearGradient(0, py, 0, py + ph);
  tint.addColorStop(0, accent + "18");
  tint.addColorStop(0.6, "rgba(5,7,12,0)");
  tint.addColorStop(1, "rgba(5,7,12,0.95)");
  ctx.fillStyle = tint;
  ctx.fillRect(40, py, w - 80, ph);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  for (let y = py; y < py + ph; y += 6) ctx.fillRect(40, y, w - 80, 2);
  ctx.restore();
  ctx.strokeStyle = accent + "aa";
  ctx.lineWidth = 3;
  roundRect(ctx, 40, py, w - 80, ph, 32);
  ctx.stroke();

  // Glass info bar.
  const by = 900;
  const bh = 130;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 40, by, w - 80, bh, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // mini avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(110, by + bh / 2, 40, 0, Math.PI * 2);
  ctx.clip();
  if (photo) cover(ctx, photo, 70, by + bh / 2 - 40, 80, 80, 6);
  ctx.restore();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(110, by + bh / 2, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "600 32px 'JetBrains Mono', monospace";
  ctx.fillText(`@${info.handle}`, 170, by + 28);
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(182, by + 92, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "400 24px 'JetBrains Mono', monospace";
  ctx.fillText(info.status, 198, by + 79);
  // location pill
  ctx.textAlign = "center";
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  const label = info.location;
  const pw = Math.min(300, ctx.measureText(label).width + 44);
  const px = w - 60 - pw;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, px, by + 40, pw, 50, 25);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.fillText(label, px + pw / 2, by + 53, pw - 24);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "400 20px 'JetBrains Mono', monospace";
  ctx.fillText(info.id, w - 50, 1060);
  return c;
}

export function drawBack(info: BadgeInfo, accent: string, accent2: string) {
  const { w, h } = BADGE_PX;
  const [c, ctx] = canvas(w, h);
  background(ctx, w, h, accent2, accent);
  ctx.textBaseline = "top";
  ctx.font = "600 30px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(`${info.handle}@dev:~$`, 56, 110);
  let y = 172;
  for (const line of info.back) {
    const isCmd = line.startsWith(">");
    ctx.fillStyle = isCmd ? accent : "rgba(255,255,255,0.82)";
    ctx.font = `${isCmd ? 600 : 400} 29px 'JetBrains Mono', monospace`;
    ctx.fillText(isCmd ? line : "  " + line, 56, y, w - 112);
    y += isCmd ? 44 : 50;
  }
  // Access stamp.
  ctx.save();
  ctx.translate(w / 2, h - 250);
  ctx.rotate(-0.12);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  roundRect(ctx, -250, -56, 500, 112, 16);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 60px 'Space Grotesk', sans-serif";
  ctx.fillText(info.access, 0, 4, 460);
  ctx.restore();
  barcode(ctx, info.name + info.id, 56, h - 140, w - 112, 50);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 24px 'JetBrains Mono', monospace";
  ctx.fillText(info.site, w / 2, h - 70);
  return c;
}

/** One tile of the strap; the material repeats it along the band. */
export function drawStrap(name: string, accent: string) {
  const [c, ctx] = canvas(512, 64);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = "rgba(7,9,15,0.85)";
  ctx.fillRect(0, 4, 512, 2);
  ctx.fillRect(0, 58, 512, 2);
  ctx.font = "700 26px 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(`${name.toUpperCase()} </>`, 20, 34, 440);
  ctx.fillText("✦", 474, 34);
  return c;
}

/**
 * PixelCard-style overlay: a small grid of cells that light up in a wave from `origin` (0..1 card coords)
 * and twinkle while `on`, then fade out. Returns true while anything is still visible.
 */
export function drawPixels(
  ctx: CanvasRenderingContext2D,
  cells: Float32Array,
  t: number,
  on: boolean,
  origin: [number, number],
  colors: string[],
  dt: number,
) {
  const { width: W, height: H } = ctx.canvas;
  ctx.clearRect(0, 0, W, H);
  let alive = false;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const d = Math.hypot(x / W - origin[0], (y / H - origin[1]) * (H / W));
      const lit = on && t > d * 0.9;
      // ease each cell toward lit/unlit; unlit cells fade slower near the origin for a nicer ripple out
      const target = lit ? 0.35 + 0.65 * Math.abs(Math.sin(t * 6 + i * 1.7)) : 0;
      cells[i] += (target - cells[i]) * Math.min(1, dt * (lit ? 10 : 4));
      if (cells[i] > 0.02) {
        alive = true;
        ctx.globalAlpha = cells[i] * 0.55;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.globalAlpha = 1;
  return alive;
}
