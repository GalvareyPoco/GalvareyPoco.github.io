// The tereré set, drawn in SVG from real references:
// - mortero: a wooden mortar and pestle for crushing the yuyos (mint, cedrón...)
// - guampa: a black horn with engraved silver rims and a side ring, yerba heaped on one side, and a steel bombilla
//   with a knob and a bent mouthpiece
// - jarra: a clear glass pitcher with a narrow neck and a round belly, full of cold water, ice and mint
// The guampa and jarra art lives in ./art (generated from the approved drawings); this file adds what moves.

import { BOMBILLA_PATH, GUAMPA_BACK, GUAMPA_FRONT, JAR_BODY, JAR_CONTENTS, JAR_DEFS, JAR_GLASS, JAR_HANDLE, JAR_TINT, JAR_WATER_TOP } from "./art";

export type SceneState = {
  tilt: number; // jarra tilt 0..1
  flow: number; // stream strength 0..1
  level: number; // water in the guampa 0..1
  crush: number; // yuyos crushed 0..1
  pound: number; // pestle impact 1 → 0
  fly: number; // crushed yuyos flying into the jarra 0..1 (0 = not flying)
  yuyoIn: boolean;
  sipping: boolean;
  slurp: boolean;
};

const W = 460;
const H = 320;

function Leaf({ x, y, r = 0, s = 1, c = "#22c55e" }: { x: number; y: number; r?: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C4 -5 11 -5 15 0 C11 5 4 5 0 0 Z" fill={c} />
      <path d="M0.5 0 L14 0" stroke="#052e16" strokeOpacity="0.45" strokeWidth="0.7" />
    </g>
  );
}

export default function Scene(p: SceneState) {
  const { tilt, flow, level, crush, pound, fly, yuyoIn, sipping, slurp } = p;
  // Pestle rests in the bowl; after each hit it bounces up and comes back down.
  const lift = Math.sin((1 - pound) * Math.PI) * 26 * (pound > 0 ? 1 : 0);
  const pct = Math.round(level * 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[46vh] max-h-[400px] w-auto max-w-full" aria-hidden="true">
      <defs>
        <linearGradient id="tt-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#3f2a17" />
          <stop offset="0.4" stopColor="#a06a3b" />
          <stop offset="0.6" stopColor="#8a5a30" />
          <stop offset="1" stopColor="#2f1f10" />
        </linearGradient>
        <linearGradient id="tt-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a1a" />
          <stop offset="1" stopColor="#120c07" />
        </linearGradient>
        <radialGradient id="tt-water" cx="0.35" cy="0.4">
          <stop offset="0" stopColor="#f0fdf4" />
          <stop offset="0.6" stopColor="#bef264" />
          <stop offset="1" stopColor="#65a30d" />
        </radialGradient>
        <radialGradient id="tt-light" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <filter id="tt-glow">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Warm afternoon light and a wooden table */}
      <rect x="0" y="0" width={W} height={H} fill="url(#tt-light)" />
      <rect x="0" y="290" width={W} height="30" fill="url(#tt-table)" />
      <path d="M0 290 L460 290" stroke="#c08a52" strokeOpacity="0.5" strokeWidth="1.5" />
      {[30, 120, 250, 380].map((x, i) => (
        <path key={i} d={`M${x} 298 q40 ${i % 2 ? 3 : -3} 80 0`} stroke="#000" strokeOpacity="0.25" fill="none" />
      ))}
      <ellipse cx="70" cy="291" rx="34" ry="3.5" fill="#000" opacity="0.55" />
      <ellipse cx="184" cy="291" rx="24" ry="4" fill="#000" opacity="0.55" />
      <ellipse cx={328 - 50 * tilt} cy="291" rx={50 - 18 * tilt} ry="4.5" fill="#000" opacity={0.55 - 0.3 * tilt} />

      {/* HUD */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#94a3b8">
        <text x="12" y="18">
          TEMP <tspan fill="var(--color-accent-2)">3°C</tspan>
        </text>
        <text x="12" y="31">
          ICE <tspan fill="var(--color-accent-2)">✓</tspan>
        </text>
        <text x="12" y="44">
          YUYOS <tspan fill={yuyoIn ? "var(--color-accent-2)" : "#64748b"}>{yuyoIn ? "✓" : `${Math.round(crush * 100)}%`}</tspan>
        </text>
        <text x="236" y="156">H₂O</text>
        <rect x="238" y="161" width="7" height="114" rx="2" fill="none" stroke="var(--color-accent)" strokeOpacity="0.5" />
        <rect x="240" y={163 + 110 * (1 - level)} width="3" height={110 * level} fill="var(--color-accent)" />
        <text x="236" y="286">{pct}%</text>
      </g>

      {/* ── Mortero ── */}
      <g>
        {/* yuyos inside, shrinking into a paste as they're crushed */}
        <ellipse cx="70" cy="238" rx={8 + 18 * crush} ry={2 + 3 * crush} fill="#166534" opacity={0.3 + 0.7 * crush} />
        {fly === 0 &&
          !yuyoIn &&
          [
            [52, 232, -40, "#22c55e"],
            [60, 226, -70, "#16a34a"],
            [72, 224, -100, "#4ade80"],
            [80, 228, -130, "#15803d"],
            [66, 230, -20, "#86efac"],
          ].map(([x, y, r, c], i) => <Leaf key={i} x={x as number} y={(y as number) + crush * 8} r={r as number} s={1.1 * (1 - crush * 0.75)} c={c as string} />)}
        {/* pestle */}
        <g transform={`translate(${lift * 0.2} ${18 - lift}) rotate(${-14 + lift * 0.3} 74 236)`}>
          <path d="M66 232 L82 232 L88 168 Q89 160 81 158 L69 158 Q61 160 62 168 Z" fill="url(#tt-wood)" />
          <ellipse cx="75" cy="160" rx="8" ry="3" fill="#b07a48" />
          <path d="M70 175 L71 225 M78 172 L77 222" stroke="#2f1f10" strokeOpacity="0.35" strokeWidth="0.8" />
        </g>
        {/* bowl */}
        <path d="M34 236 C34 262 46 276 54 280 L86 280 C94 276 106 262 106 236 Z" fill="url(#tt-wood)" />
        <path d="M44 250 C56 256 84 256 96 250 M46 262 C58 267 82 267 94 262" stroke="#2f1f10" strokeOpacity="0.4" fill="none" />
        <path d="M50 280 L90 280 L94 290 L46 290 Z" fill="#3f2a17" />
        <ellipse cx="70" cy="236" rx="36" ry="7" fill="none" stroke="#c08a52" strokeWidth="2" />
        {/* bits of leaf jump out on each hit */}
        {pound > 0.1 &&
          [-1, -0.4, 0.5, 1].map((d, i) => <circle key={i} cx={70 + d * 26 * (1 - pound)} cy={232 - 30 * Math.sin((1 - pound) * Math.PI * 0.8) - i * 2} r="1.6" fill={i % 2 ? "#4ade80" : "#15803d"} opacity={pound} />)}
      </g>

      {/* Crushed yuyos flying from the mortero into the jarra */}
      {fly > 0 &&
        [0, 1, 2, 3].map((i) => {
          const t = Math.min(1, Math.max(0, fly * 1.3 - i * 0.1));
          const x = 70 + (340 - 70) * t;
          const y = 230 - Math.sin(t * Math.PI) * 150 + (100 - 230) * t;
          return <Leaf key={i} x={x} y={y} r={t * 540 + i * 40} s={0.7} c={i % 2 ? "#16a34a" : "#4ade80"} />;
        })}

      {/* ── Guampa ── drawn in its own coordinates and placed with its opening at (190, 150) */}
      <g transform="translate(143.25 115.87) scale(0.742)">
        <g dangerouslySetInnerHTML={{ __html: GUAMPA_BACK }} />
        {sipping &&
          [0, 1, 2].map((i) => (
            <circle key={i} r="2.2" fill="#d9f99d">
              <animateMotion dur="0.55s" begin={`${i * 0.18}s`} repeatCount="indefinite" path={BOMBILLA_PATH} />
            </circle>
          ))}
        <g dangerouslySetInnerHTML={{ __html: GUAMPA_FRONT }} />
        {/* water pooling on the bombilla side */}
        <ellipse cx={44} cy={47} rx={4 + 14 * level} ry={1.5 + 3.4 * level} fill="url(#tt-water)" opacity={level > 0.02 ? 0.9 : 0} />
        {level > 0.3 && [0, 1, 2].map((i) => <circle key={i} cx={38 + i * 6} cy={47 - (i % 2)} r="1.2" fill="#fff" opacity={0.8 * level} />)}
      </g>

      {/* Stream from the jarra spout into the guampa */}
      {flow > 0.02 && (
        <g filter="url(#tt-glow)">
          <path d="M202 114 Q201 132 180 150" stroke="#ecfccb" strokeOpacity={0.6 + 0.4 * flow} strokeWidth={1.5 + 3 * flow} strokeLinecap="round" fill="none" strokeDasharray="7 3">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.22s" repeatCount="indefinite" />
          </path>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={172 + i * 5} cy="149" r="1.3" fill="#f7fee7">
              <animate attributeName="cy" values="150;140;150" dur={`${0.3 + i * 0.08}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* ── Jarra ── a glass pitcher; it tilts around its pour lip, which ends right above the guampa */}
      <g transform={`translate(${-85 * tilt} ${12 * tilt}) rotate(${-62 * tilt} 290 98)`}>
        <g transform="translate(252.8 78.64) scale(0.88)">
          <defs dangerouslySetInnerHTML={{ __html: JAR_DEFS }} />
          <g dangerouslySetInnerHTML={{ __html: JAR_HANDLE }} />
          <g clipPath="url(#tj-c)">
            {/* the water goes down as it's poured */}
            <rect x="0" y={JAR_WATER_TOP + 40 * level} width="190" height="250" fill={JAR_TINT} />
            <g dangerouslySetInnerHTML={{ __html: JAR_CONTENTS }} />
            {yuyoIn && (
              <>
                <Leaf x={60} y={JAR_WATER_TOP + 30 + 40 * level} r={-30} s={1.3} c="#166534" />
                <Leaf x={104} y={JAR_WATER_TOP + 26 + 40 * level} r={200} s={1.3} c="#15803d" />
              </>
            )}
            <path d={`M0 ${JAR_WATER_TOP + 40 * level} H190`} stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
          </g>
          <g dangerouslySetInnerHTML={{ __html: JAR_GLASS }} />
        </g>
      </g>

      {slurp && (
        <text x="150" y="52" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="24" fill="var(--color-accent)" filter="url(#tt-glow)" transform="rotate(-8 150 52)">
          *sluuurp*
        </text>
      )}
    </svg>
  );
}
