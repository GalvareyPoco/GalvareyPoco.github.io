// Canvas drawings for the badge faces and the lanyard strap. Shared by the 3D badge and nothing else.

export type BadgeInfo = {
  name: string;
  role: string;
  location: string;
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

function grid(ctx: CanvasRenderingContext2D, w: number, h: number, step = 40) {
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function background(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#111827");
  g.addColorStop(1, "#05070c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  grid(ctx, w, h);
  const glow = ctx.createRadialGradient(w * 0.8, h * 0.05, 0, w * 0.8, h * 0.05, w);
  glow.addColorStop(0, accent + "40");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  // Slot for the clip.
  ctx.fillStyle = "#000";
  roundRect(ctx, w / 2 - 70, 34, 140, 22, 11);
  ctx.fill();
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

/** Deterministic barcode from a string. */
function barcode(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number) {
  let seed = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
  let cx = x;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  while (cx < x + w) {
    const bw = 2 + Math.floor(rand() * 4) * 2;
    if (rand() > 0.35) ctx.fillRect(cx, y, bw, h);
    cx += bw + 2;
  }
}

export function drawFront(info: BadgeInfo, photo: HTMLImageElement | null, accent: string, accent2: string) {
  const { w, h } = BADGE_PX;
  const [c, ctx] = canvas(w, h);
  background(ctx, w, h, accent);

  ctx.font = "600 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textBaseline = "top";
  ctx.fillText("● DEV PASS", 56, 92);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(info.id, w - 56, 92);
  ctx.textAlign = "left";

  // Photo with an accent frame.
  const px = 56;
  const py = 150;
  const ps = w - 112;
  const ph = 560;
  ctx.save();
  roundRect(ctx, px, py, ps, ph, 28);
  ctx.clip();
  ctx.fillStyle = "#1c2436";
  ctx.fillRect(px, py, ps, ph);
  if (photo) {
    const scale = Math.max(ps / photo.width, ph / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, px + (ps - dw) / 2, py + (ph - dh) / 2 - 20, dw, dh);
  }
  const shade = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
  shade.addColorStop(0, "transparent");
  shade.addColorStop(1, "rgba(5,7,12,0.85)");
  ctx.fillStyle = shade;
  ctx.fillRect(px, py, ps, ph);
  // Scanlines for a bit of CRT.
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let y = py; y < py + ph; y += 6) ctx.fillRect(px, y, ps, 2);
  ctx.restore();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  roundRect(ctx, px, py, ps, ph, 28);
  ctx.stroke();

  // Name.
  ctx.fillStyle = "#fff";
  ctx.font = "700 112px 'Space Grotesk', sans-serif";
  ctx.fillText(info.name.toUpperCase(), 52, py + ph + 34, w - 104);
  const g = ctx.createLinearGradient(56, 0, w - 56, 0);
  g.addColorStop(0, accent);
  g.addColorStop(1, accent2);
  ctx.fillStyle = g;
  ctx.font = "500 40px 'Space Grotesk', sans-serif";
  ctx.fillText(info.role, 56, py + ph + 160, w - 112);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "400 26px 'JetBrains Mono', monospace";
  ctx.fillText(info.location, 56, py + ph + 222, w - 112);

  barcode(ctx, info.name + info.id, 56, h - 110, w - 112, 56);
  return c;
}

export function drawBack(info: BadgeInfo, accent: string, accent2: string) {
  const { w, h } = BADGE_PX;
  const [c, ctx] = canvas(w, h);
  background(ctx, w, h, accent2);
  ctx.textBaseline = "top";
  ctx.font = "600 30px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("galvarey@dev:~$", 56, 120);
  let y = 190;
  for (const line of info.back) {
    const isCmd = line.startsWith(">");
    ctx.fillStyle = isCmd ? accent : "rgba(255,255,255,0.8)";
    ctx.font = `${isCmd ? 600 : 400} 30px 'JetBrains Mono', monospace`;
    ctx.fillText(isCmd ? line : "  " + line, 56, y, w - 112);
    y += 52;
  }
  // Access stamp.
  ctx.save();
  ctx.translate(w / 2, h - 300);
  ctx.rotate(-0.12);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  roundRect(ctx, -260, -60, 520, 120, 16);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px 'Space Grotesk', sans-serif";
  ctx.fillText(info.access, 0, 4, 480);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 26px 'JetBrains Mono', monospace";
  ctx.fillText(info.site, w / 2, h - 110);
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
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(`${name.toUpperCase()} </>`, 24, 34);
  ctx.fillText("✦", 470, 34);
  return c;
}
