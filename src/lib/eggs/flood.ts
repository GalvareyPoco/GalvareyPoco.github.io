// "Tereré flood": the jarra from the intro tips over the page and fills the screen with cold water, ice and yuyos,
// then it drains. Counts how many tererés this browser has served.
import { toast } from "./toast";
import { createSound } from "../../components/terere/sound";
import { fill, type EggStrings } from "./strings";

const COUNT_KEY = "terere-served";

// The intro's frosted glass jarra, full of ice and mint. Its pour lip is at the top left.
const JARRA = `<svg viewBox="0 0 190 250" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="flood-c"><path d="M34 24 C30 50 28 64 30 84 C32 98 24 112 24 140 C24 182 26 214 36 230 Q42 238 56 238 L114 238 Q128 238 134 230 C144 214 146 182 146 140 C146 112 138 98 140 84 C142 64 140 50 136 24 Z"/></clipPath><filter id="flood-f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.3"/></filter><linearGradient id="flood-g" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc" stop-opacity=".42"/><stop offset=".2" stop-color="#f8fafc" stop-opacity=".22"/><stop offset=".8" stop-color="#f8fafc" stop-opacity=".22"/><stop offset="1" stop-color="#f8fafc" stop-opacity=".42"/></linearGradient></defs><path d="M134 40 C172 38 180 66 176 104 C173 132 162 150 142 160" fill="none" stroke="#e2e8f0" stroke-opacity=".5" stroke-width="10"/><path d="M134 40 C172 38 180 66 176 104 C173 132 162 150 142 160" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.5" transform="translate(-1.5 0)"/><g clip-path="url(#flood-c)"><rect x="0" y="34" width="190" height="250" fill="#ecfeff33"/><g filter="url(#flood-f)"><g transform="translate(54 141) rotate(6)"><rect x="-8.5" y="-8.5" width="17.0" height="16.8" rx="3.7" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-5.5 -5.5 l5.9 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(37 42) rotate(-14)"><rect x="-10.3" y="-10.3" width="20.7" height="18.0" rx="4.6" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.3 -7.3 l7.2 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(130 127) rotate(-1)"><rect x="-10.3" y="-10.3" width="20.7" height="20.5" rx="4.6" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.3 -7.3 l7.2 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(45 158) rotate(1)"><rect x="-10.5" y="-10.5" width="20.9" height="21.4" rx="4.6" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.5 -7.5 l7.3 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(97 52) rotate(5)"><rect x="-10.0" y="-10.0" width="20.1" height="17.9" rx="4.4" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.0 -7.0 l7.0 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(33 201) rotate(13)"><rect x="-8.9" y="-8.9" width="17.8" height="18.9" rx="3.9" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-5.9 -5.9 l6.2 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(101 211) rotate(18)"><rect x="-8.6" y="-8.6" width="17.2" height="16.0" rx="3.8" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-5.6 -5.6 l6.0 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(124 203) rotate(-22)"><rect x="-7.4" y="-7.4" width="14.8" height="12.8" rx="3.3" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-4.4 -4.4 l5.2 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(127 121) rotate(-12)"><rect x="-9.5" y="-9.5" width="19.0" height="18.1" rx="4.2" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-6.5 -6.5 l6.7 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(69 105) rotate(5)"><rect x="-9.3" y="-9.3" width="18.7" height="20.0" rx="4.1" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-6.3 -6.3 l6.5 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(98 213) rotate(29)"><rect x="-10.4" y="-10.4" width="20.9" height="20.9" rx="4.6" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.4 -7.4 l7.3 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(46 200) rotate(24)"><rect x="-10.9" y="-10.9" width="21.7" height="21.1" rx="4.8" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.9 -7.9 l7.6 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(101 79) rotate(4)"><rect x="-10.3" y="-10.3" width="20.7" height="18.3" rx="4.5" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-7.3 -7.3 l7.2 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(36 199) rotate(-25)"><rect x="-11.0" y="-11.0" width="21.9" height="22.8" rx="4.8" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-8.0 -8.0 l7.7 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(71 68) rotate(16)"><rect x="-8.2" y="-8.2" width="16.4" height="17.4" rx="3.6" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-5.2 -5.2 l5.7 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(34 154) rotate(13)"><rect x="-7.2" y="-7.2" width="14.4" height="12.9" rx="3.2" fill="#f8fafc" fill-opacity="0.6" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/><path d="M-4.2 -4.2 l5.0 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(115 234) rotate(1)"><path d="M0 0 L0 -55" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -19) rotate(-125) scale(1.52)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#166534"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -19) rotate(125) scale(1.52)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#166534"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -36) rotate(-125) scale(1.17)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -36) rotate(125) scale(1.17)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -52) rotate(-125) scale(0.93)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#15803d"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -52) rotate(125) scale(0.93)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#15803d"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g><g transform="translate(123 147) rotate(-28)"><path d="M0 0 L0 -47" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -17) rotate(-125) scale(1.99)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -17) rotate(125) scale(1.99)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -31) rotate(-125) scale(1.29)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#15803d"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -31) rotate(125) scale(1.29)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#15803d"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -45) rotate(-125) scale(1.35)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -45) rotate(125) scale(1.35)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g><g transform="translate(69 220) rotate(-14)"><path d="M0 0 L0 -52" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -18) rotate(-125) scale(1.78)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#166534"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -18) rotate(125) scale(1.78)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#166534"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -34) rotate(-125) scale(1.47)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -34) rotate(125) scale(1.47)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -49) rotate(-125) scale(1.04)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#22c55e"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -49) rotate(125) scale(1.04)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#22c55e"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g><g transform="translate(100 140) rotate(-24)"><path d="M0 0 L0 -54" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -19) rotate(-125) scale(1.66)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -19) rotate(125) scale(1.66)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#16a34a"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -35) rotate(-125) scale(1.31)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -35) rotate(125) scale(1.31)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -52) rotate(-125) scale(1.39)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -52) rotate(125) scale(1.39)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g><g transform="translate(36 188) rotate(16)"><path d="M0 0 L0 -32" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -11) rotate(-125) scale(1.74)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -11) rotate(125) scale(1.74)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#4d7c0f"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -20) rotate(-125) scale(1.31)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -20) rotate(125) scale(1.31)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -30) rotate(-125) scale(1.21)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -30) rotate(125) scale(1.21)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g><g transform="translate(102 113) rotate(-53)"><path d="M0 0 L0 -47" stroke="#4d7c0f" stroke-width="1.3"/><g transform="translate(0 -16) rotate(-125) scale(1.97)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -16) rotate(125) scale(1.97)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -30) rotate(-125) scale(1.48)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -30) rotate(125) scale(1.48)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -45) rotate(-125) scale(1.20)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g><g transform="translate(0 -45) rotate(125) scale(1.20)"><path d="M0 0 C3 -5 10 -5 13 0 C10 5 3 5 0 0Z" fill="#3f6212"/><path d="M1 0 L12 0" stroke="#052e16" stroke-opacity=".45" stroke-width=".5"/></g></g></g><path d="M0 34 H190" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/></g><path d="M34 24 C30 50 28 64 30 84 C32 98 24 112 24 140 C24 182 26 214 36 230 Q42 238 56 238 L114 238 Q128 238 134 230 C144 214 146 182 146 140 C146 112 138 98 140 84 C142 64 140 50 136 24 Z" fill="url(#flood-g)" stroke="#f8fafc" stroke-opacity=".85" stroke-width="2.2"/><path d="M30 90 Q85 100 140 90 M26 150 Q85 162 144 150" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/><path d="M40 40 C36 62 36 76 38 88 M32 112 C28 140 28 196 36 220" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M28 22 C32 19 54.400000000000006 18 85 18 A51 6 0 0 1 136 24 A51 6 0 0 1 85 30 C54.400000000000006 30 36 27 28 22 Z" fill="#0f172a" fill-opacity=".12" stroke="#f8fafc" stroke-opacity=".9" stroke-width="3.2" stroke-linejoin="round"/><ellipse cx="46" cy="68" rx="1.5" ry="2.1" fill="#fff" opacity=".75"/><ellipse cx="122" cy="84" rx="1.6" ry="2.1" fill="#fff" opacity=".75"/><ellipse cx="38" cy="197" rx="1.8" ry="2.4" fill="#fff" opacity=".75"/><ellipse cx="104" cy="57" rx="1.3" ry="1.7" fill="#fff" opacity=".75"/><ellipse cx="101" cy="85" rx="1.1" ry="1.4" fill="#fff" opacity=".75"/><ellipse cx="103" cy="164" rx="0.8" ry="1.1" fill="#fff" opacity=".75"/><ellipse cx="94" cy="226" rx="1.4" ry="1.9" fill="#fff" opacity=".75"/><ellipse cx="52" cy="197" rx="1.8" ry="2.4" fill="#fff" opacity=".75"/><ellipse cx="35" cy="183" rx="0.9" ry="1.3" fill="#fff" opacity=".75"/><ellipse cx="91" cy="86" rx="1.6" ry="2.1" fill="#fff" opacity=".75"/><ellipse cx="30" cy="227" rx="1.0" ry="1.4" fill="#fff" opacity=".75"/><ellipse cx="121" cy="148" rx="1.7" ry="2.2" fill="#fff" opacity=".75"/><ellipse cx="65" cy="201" rx="0.8" ry="1.1" fill="#fff" opacity=".75"/><ellipse cx="97" cy="151" rx="1.2" ry="1.6" fill="#fff" opacity=".75"/><ellipse cx="85" cy="205" rx="1.2" ry="1.6" fill="#fff" opacity=".75"/><ellipse cx="98" cy="90" rx="1.3" ry="1.8" fill="#fff" opacity=".75"/><ellipse cx="30" cy="115" rx="0.9" ry="1.2" fill="#fff" opacity=".75"/><ellipse cx="80" cy="202" rx="1.4" ry="1.9" fill="#fff" opacity=".75"/></svg>`;

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
  jarra.style.cssText = `position:fixed;z-index:92;pointer-events:none;width:${size}px;height:${size * 1.32}px;top:${H * 0.12}px;right:${W * 0.12}px;transform-origin:15% 9%;transition:transform .8s cubic-bezier(.3,1.4,.5,1);filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));`;
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
