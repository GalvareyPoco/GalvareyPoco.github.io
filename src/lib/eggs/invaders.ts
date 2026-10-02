// "Skill Invaders": a small Space Invaders where the invaders are the skill chips from the page.
// Keyboard: ← → (or A D) to move, space to shoot, Esc to quit. Touch: drag to move, tap to shoot.
import { boom, note, tune } from "./chip";
import type { EggStrings } from "./strings";

const BEST_KEY = "invaders-best";

type Enemy = { x: number; y: number; w: number; text: string; alive: boolean };
type Shot = { x: number; y: number; vy: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

export default function invaders(t: EggStrings): Promise<void> {
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const accent = css.getPropertyValue("--color-accent").trim() || "#34d399";
  const accent2 = css.getPropertyValue("--color-accent-2").trim() || "#22d3ee";
  const touch = window.matchMedia("(pointer: coarse)").matches;

  const words = [...new Set([...document.querySelectorAll<HTMLElement>("[data-chip]")].map((c) => c.textContent!.trim()).filter(Boolean))]
    .sort((a, b) => a.length - b.length)
    .slice(0, 30);
  if (words.length < 6) words.push("TypeScript", "React", "Go", "Docker", "Unity", "Godot");

  const box = document.createElement("div");
  box.dataset.eggUi = "";
  box.className = "egg-arcade";
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", t.invaders.title);
  const quit = document.createElement("button");
  quit.type = "button";
  quit.className = "egg-arcade-quit";
  quit.textContent = "✕";
  quit.setAttribute("aria-label", t.invaders.quit);
  const end = document.createElement("div");
  end.className = "egg-arcade-end";
  end.hidden = true;
  box.append(canvas, quit, end);
  document.body.append(box);
  const overflow = root.style.overflow;
  root.style.overflow = "hidden";

  const ctx = canvas.getContext("2d")!;
  let W = 0;
  let H = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  let best = 0;
  try {
    best = Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {}

  const FONT = `600 ${W < 600 ? 11 : 13}px 'JetBrains Mono', monospace`;
  let enemies: Enemy[] = [];
  let shots: Shot[] = [];
  let bombs: Shot[] = [];
  let sparks: Spark[] = [];
  let player = { x: W / 2, lives: 3, hitAt: -1e9 };
  let score = 0;
  let dir = 1;
  let state: "play" | "over" = "play";
  let lastShot = 0;

  const setup = () => {
    ctx.font = FONT;
    const gap = 14;
    const rowH = 30;
    const maxRow = Math.min(W - 60, 900);
    enemies = [];
    let row: Enemy[] = [];
    let rowW = 0;
    let y = 90;
    const flush = () => {
      const x0 = (W - rowW + gap) / 2;
      let x = x0;
      for (const e of row) {
        e.x = x;
        e.y = y;
        x += e.w + gap;
      }
      enemies.push(...row);
      row = [];
      rowW = 0;
      y += rowH;
    };
    for (const text of words) {
      const w = ctx.measureText(text).width + 16;
      if (rowW + w > maxRow) flush();
      row.push({ x: 0, y: 0, w, text, alive: true });
      rowW += w + gap;
    }
    flush();
    shots = [];
    bombs = [];
    sparks = [];
    player = { x: W / 2, lives: 3, hitAt: -1e9 };
    score = 0;
    dir = 1;
    state = "play";
    end.hidden = true;
  };
  setup();

  const keys = new Set<string>();
  const fire = (now: number) => {
    if (state !== "play" || now - lastShot < 260) return;
    lastShot = now;
    shots.push({ x: player.x, y: H - 70, vy: -620 });
    note(880, 0.08, { slide: 440, vol: 0.04 });
  };
  const burst = (x: number, y: number, n = 14) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 180;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
    }
  };

  const finish = (won: boolean) => {
    state = "over";
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {}
    }
    tune(won ? [[523, 1], [659, 1], [784, 1], [1047, 3]] : [[392, 2], [330, 2], [262, 4]]);
    end.innerHTML = "";
    const title = document.createElement("p");
    title.className = "egg-arcade-title";
    title.textContent = won ? t.invaders.win : t.invaders.lose;
    const sc = document.createElement("p");
    sc.textContent = `${t.invaders.score} ${score} · ${t.invaders.best} ${best}`;
    const again = document.createElement("button");
    again.type = "button";
    again.className = "egg-button static";
    again.textContent = t.invaders.again;
    again.onclick = () => setup();
    const out = document.createElement("button");
    out.type = "button";
    out.className = "egg-button static ghost";
    out.textContent = t.invaders.quit;
    out.onclick = () => close();
    end.append(title, sc, again, out);
    end.hidden = false;
    again.focus();
  };

  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const alive = enemies.filter((e) => e.alive);

    if (state === "play") {
      // Player
      const speed = 420;
      if (keys.has("ArrowLeft") || keys.has("a")) player.x -= speed * dt;
      if (keys.has("ArrowRight") || keys.has("d")) player.x += speed * dt;
      if (keys.has(" ")) fire(now);
      player.x = Math.max(24, Math.min(W - 24, player.x));

      // The formation speeds up as it shrinks, and steps down at the edges.
      const v = (30 + (1 - alive.length / enemies.length) * 140) * dir;
      let edge = false;
      for (const e of alive) {
        e.x += v * dt;
        if ((dir > 0 && e.x + e.w > W - 12) || (dir < 0 && e.x < 12)) edge = true;
      }
      if (edge) {
        dir *= -1;
        for (const e of alive) e.y += 16;
        note(110, 0.06, { type: "triangle", vol: 0.05 });
      }
      if (alive.length && Math.random() < dt * (0.8 + (1 - alive.length / enemies.length) * 2)) {
        const e = alive[(Math.random() * alive.length) | 0];
        bombs.push({ x: e.x + e.w / 2, y: e.y + 12, vy: 220 + Math.random() * 80 });
      }

      for (const s of shots) {
        s.y += s.vy * dt;
        for (const e of alive) {
          if (e.alive && s.y < e.y + 11 && s.y > e.y - 11 && s.x > e.x && s.x < e.x + e.w) {
            e.alive = false;
            s.y = -100;
            score += 10;
            burst(e.x + e.w / 2, e.y);
            boom(0.18, 0.08);
          }
        }
      }
      for (const b of bombs) {
        b.y += b.vy * dt;
        if (now - player.hitAt > 1200 && b.y > H - 72 && b.y < H - 40 && Math.abs(b.x - player.x) < 20) {
          b.y = H + 100;
          player.lives--;
          player.hitAt = now;
          burst(player.x, H - 56, 24);
          boom(0.4, 0.14);
          if (player.lives <= 0) finish(false);
        }
      }
      shots = shots.filter((s) => s.y > -20);
      bombs = bombs.filter((b) => b.y < H + 20);
      if (state === "play" && !enemies.some((e) => e.alive)) finish(true);
      if (state === "play" && alive.some((e) => e.y > H - 90)) finish(false);
    }
    for (const p of sparks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.6;
    }
    sparks = sparks.filter((p) => p.life > 0);

    // Draw
    ctx.clearRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.strokeStyle = accent;
      ctx.fillStyle = "rgba(18,24,38,0.9)";
      ctx.beginPath();
      ctx.roundRect(e.x, e.y - 11, e.w, 22, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(e.text, e.x + e.w / 2, e.y + 1);
    }
    ctx.fillStyle = accent;
    for (const s of shots) ctx.fillRect(s.x - 1.5, s.y - 8, 3, 14);
    ctx.fillStyle = "#f43f5e";
    for (const b of bombs) ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
    for (const p of sparks) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = Math.random() > 0.5 ? accent : accent2;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
    // Ship, blinking for a moment after a hit.
    if (state === "play" && (now - player.hitAt > 1200 || Math.floor(now / 100) % 2)) {
      const y = H - 56;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(player.x, y - 14);
      ctx.lineTo(player.x + 18, y + 10);
      ctx.lineTo(player.x - 18, y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent2;
      ctx.fillRect(player.x - 2, y - 20, 4, 8);
    }
    // HUD
    ctx.textAlign = "left";
    ctx.fillStyle = accent;
    ctx.font = `700 ${W < 600 ? 14 : 18}px 'JetBrains Mono', monospace`;
    ctx.fillText(t.invaders.title, 20, 32);
    ctx.font = `400 ${W < 600 ? 11 : 13}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`${t.invaders.score} ${score}   ${t.invaders.best} ${Math.max(best, score)}   ${"♥".repeat(Math.max(0, player.lives))}`, 20, 56);
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText(touch ? t.invaders.touch : t.invaders.keys, W / 2, H - 18);

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    if (e.target instanceof HTMLButtonElement && e.key === " ") return;
    keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    // Fire on the press itself too, so a quick tap between frames still shoots.
    if (e.key === " " && !e.repeat) fire(performance.now());
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  // Pointer: the ship follows the finger or mouse; a tap or click shoots.
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.buttons) player.x = e.clientX;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") player.x = e.clientX;
    fire(performance.now());
  };
  addEventListener("keydown", onKey);
  addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  addEventListener("resize", resize);
  tune([[262, 1], [330, 1], [392, 1], [523, 2]]);

  let close: () => void = () => {};
  return new Promise<void>((done) => {
    close = () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", onKey);
      removeEventListener("keyup", onKeyUp);
      removeEventListener("resize", resize);
      root.style.overflow = overflow;
      box.remove();
      done();
    };
    quit.onclick = () => close();
  });
}
