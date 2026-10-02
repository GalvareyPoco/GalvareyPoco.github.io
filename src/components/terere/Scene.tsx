// The tereré set, drawn in SVG from real references:
// - mortero: a wooden mortar and pestle for crushing the yuyos (mint, cedrón...)
// - guampa: a straight cup wrapped in croc-embossed leather with a stitched seam, yerba heaped on one side
//   and a straight steel bombilla
// - jarra: a clear glass pitcher full of cold water, ice and yuyos, fogged with condensation

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

function Ice({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#e0f2fe" fillOpacity="0.75" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
      <path d="M-4 -4 L2 -4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

// The glass pitcher: a narrow neck that bellies out toward the bottom.
const JAR = "M298 104 C299 128 296 142 293 160 C287 200 285 240 291 266 C295 282 308 288 324 288 L352 288 C368 288 381 282 385 266 C391 240 389 200 383 160 C380 142 377 128 378 104 Z";

// Yuyos packed in the bottom of the jarra: [x, y, rotation, scale, color]
const JAR_LEAVES: [number, number, number, number, string][] = Array.from({ length: 26 }, (_, i) => {
  const greens = ["#14532d", "#166534", "#15803d", "#3f6212", "#4d7c0f", "#16a34a"];
  const row = Math.floor(i / 6);
  return [294 + ((i * 37) % 80), 170 + row * 24 + ((i * 13) % 14), (i * 67) % 360, 1.3 + ((i * 7) % 5) / 8, greens[i % greens.length]];
});

// Drops of condensation on the cold glass, scattered at random (but the same on every render): [x, y, radius]
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const DROPS: [number, number, number][] = Array.from({ length: 40 }, (_, i) => [297 + rand(i) * 84, 114 + rand(i + 99) * 166, 0.6 + rand(i + 7) * 1.3]);

export default function Scene(p: SceneState) {
  const { tilt, flow, level, crush, pound, fly, yuyoIn, sipping, slurp } = p;
  // Pestle rests in the bowl; after each hit it bounces up and comes back down.
  const lift = Math.sin((1 - pound) * Math.PI) * 26 * (pound > 0 ? 1 : 0);
  const pct = Math.round(level * 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[46vh] max-h-[400px] w-auto max-w-full" aria-hidden="true">
      <defs>
        {/* croc-embossed leather: rows of glossy rounded scales, offset like bricks, two sizes */}
        <pattern id="tt-croc" width="14" height="18" patternUnits="userSpaceOnUse">
          <rect width="14" height="18" fill="#0f0905" />
          <rect x="0.8" y="0.8" width="12.4" height="7.6" rx="3.4" fill="#4a2f1d" />
          <rect x="-6.2" y="9.8" width="12.4" height="7.4" rx="3.4" fill="#3f2818" />
          <rect x="7.8" y="9.8" width="12.4" height="7.4" rx="3.4" fill="#3f2818" />
          <path d="M3 2.4 Q7 1.4 11 2.4 M-4 11.4 Q0 10.4 4 11.4 M10 11.4 Q14 10.4 18 11.4" stroke="#c49a74" strokeOpacity="0.55" strokeWidth="1" fill="none" strokeLinecap="round" />
        </pattern>
        <linearGradient id="tt-cyl" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.75" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0.1" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="tt-shade-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="tt-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#f0f9ff" stopOpacity="0.32" />
          <stop offset="0.14" stopColor="#f0f9ff" stopOpacity="0.06" />
          <stop offset="0.8" stopColor="#f0f9ff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#f0f9ff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="tt-jar-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecfccb" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#84cc16" stopOpacity="0.35" />
          <stop offset="1" stopColor="#14532d" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="tt-alpaca" x1="0" x2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="0.3" stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#9ca3af" />
          <stop offset="0.8" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
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
      <ellipse cx="190" cy="291" rx="31" ry="4" fill="#000" opacity="0.55" />
      <ellipse cx={340 - 50 * tilt} cy="291" rx={44 - 14 * tilt} ry="4.5" fill="#000" opacity={0.55 - 0.3 * tilt} />

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

      {/* ── Guampa ── a straight leather-wrapped cup, like the ones sold at every market in Paraguay */}
      <g>
        {/* body: croc-embossed leather, rounded into a cylinder by the shading */}
        <path d="M162 150 L162 282 Q162 288 168 288 L212 288 Q218 288 218 282 L218 150 Z" fill="url(#tt-croc)" />
        {/* the smooth leather strip where the wrap closes, with zigzag stitching */}
        <path d="M162 150 L174 150 L174 288 L168 288 Q162 288 162 282 Z" fill="#1d120b" />
        <path
          d={`M175 154 ${Array.from({ length: 22 }, (_, i) => `L${i % 2 ? 175 : 178.5} ${157 + i * 6}`).join(" ")}`}
          stroke="#c9b08a"
          strokeOpacity="0.7"
          strokeWidth="0.8"
          fill="none"
        />
        <path d="M162 150 L162 282 Q162 288 168 288 L212 288 Q218 288 218 282 L218 150 Z" fill="url(#tt-cyl)" />
        <path d="M162 150 L162 282 Q162 288 168 288 L212 288 Q218 288 218 282 L218 150 Z" fill="url(#tt-shade-v)" />
        {/* folded leather lip */}
        <path d="M162 150 L218 150 L218 157 Q190 162 162 157 Z" fill="#24160d" />
        <path d="M162 157 Q190 162 218 157" stroke="#000" strokeOpacity="0.6" fill="none" />

        {/* opening: yerba heaped to one side ("montañita"), water pooling on the bombilla side */}
        <ellipse cx="190" cy="150" rx="28" ry="6" fill="#1a2e05" />
        <path d="M186 152 C192 141 204 138 217 147 C210 154 196 155 186 152 Z" fill="#4d7c0f" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={192 + (i % 4) * 6} cy={145 + Math.floor(i / 4) * 4 + (i % 2)} r="1.1" fill={i % 3 ? "#a3e635" : "#365314"} />
        ))}
        <ellipse cx={178} cy={151} rx={3 + 11 * level} ry={1.2 + 2.6 * level} fill="url(#tt-water)" opacity={level > 0.02 ? 0.9 : 0} />
        {level > 0.3 && [0, 1, 2].map((i) => <circle key={i} cx={173 + i * 5} cy={150.5 - (i % 2)} r="0.9" fill="#fff" opacity={0.8 * level} />)}

        {/* straight steel bombilla, leaning on the rim */}
        <path d="M176 151 L164 64" stroke="url(#tt-alpaca)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M175 150 L163 64" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" />
        <path d="M166.5 82 L161.5 82.7" stroke="#6b7280" strokeWidth="5.5" strokeLinecap="round" transform="rotate(-8 164 82)" />
        {sipping &&
          [0, 1, 2].map((i) => (
            <circle key={i} r="1.6" fill="#d9f99d">
              <animateMotion dur="0.55s" begin={`${i * 0.18}s`} repeatCount="indefinite" path="M175 148 L164 64" />
            </circle>
          ))}
        {/* front of the rim, over the bombilla */}
        <path d="M162 150 A28 6 0 0 0 218 150" fill="none" stroke="#3d2819" strokeWidth="1.6" />
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

      {/* ── Jarra ── a glass pitcher; it tilts around its spout, which ends right above the guampa */}
      <g transform={`translate(${-85 * tilt} ${12 * tilt}) rotate(${-62 * tilt} 290 98)`}>
        <defs>
          <clipPath id="tt-jar">
            <path d={JAR} />
          </clipPath>
        </defs>
        {/* chunky glass handle */}
        <path d="M379 122 C412 124 414 226 384 246" fill="none" stroke="#e0f2fe" strokeOpacity="0.28" strokeWidth="12" strokeLinecap="round" />
        <path d="M382 126 C408 130 409 222 385 240" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M377 118 C416 118 420 230 386 252" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />

        {/* what's inside, seen through the glass */}
        <g clipPath="url(#tt-jar)">
          <rect x="280" y={112 + 34 * level} width="120" height="190" fill="url(#tt-jar-water)" />
          <ellipse cx="338" cy="262" rx="48" ry="30" fill="#14532d" opacity="0.7" />
          {JAR_LEAVES.map(([x, y, r, s, c], i) => (
            <Leaf key={i} x={x} y={y} r={r} s={s} c={c} />
          ))}
          {yuyoIn && (
            <>
              <Leaf x={312} y={132 + 30 * level} r={-30} s={1} c="#166534" />
              <Leaf x={346} y={128 + 30 * level} r={200} s={1} c="#15803d" />
            </>
          )}
          <Ice x={312} y={122 + 34 * level} r={14} s={1.1} />
          <Ice x={338} y={118 + 34 * level} r={-10} s={1.2} />
          <Ice x={362} y={124 + 34 * level} r={30} s={1} />
          <path d={`M280 ${112 + 34 * level} L400 ${112 + 34 * level}`} stroke="#f7fee7" strokeOpacity="0.6" strokeWidth="1.2" />
        </g>
        {/* a sprig of mint and cedrón poking out of the top */}
        <path d="M322 112 C320 98 316 90 310 84 M332 112 C334 96 340 88 348 82" stroke="#15803d" strokeWidth="1.6" fill="none" />
        <Leaf x={308} y={86} r={-150} s={0.85} />
        <Leaf x={346} y={84} r={-25} s={0.85} c="#4ade80" />
        <path d="M332 96 l-3 -13 M332 96 l5 -12" stroke="#65a30d" strokeWidth="2.4" strokeLinecap="round" />

        {/* the glass itself */}
        <path d={JAR} fill="url(#tt-glass)" stroke="#f8fafc" strokeOpacity="0.6" strokeWidth="1.8" />
        <path d="M290 98 Q285 95 284 93 Q290 92 300 101" fill="#f0f9ff" fillOpacity="0.35" stroke="#f8fafc" strokeOpacity="0.7" strokeWidth="1.4" />
        <ellipse cx="338" cy="104" rx="40" ry="5.5" fill="#0f172a" fillOpacity="0.25" stroke="#f8fafc" strokeOpacity="0.75" strokeWidth="2" />
        <path d="M303 118 C302 138 298 150 295 170 C291 200 291 236 296 262" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M374 120 C375 140 377 152 380 168" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M300 284 Q338 292 376 284" stroke="#f8fafc" strokeOpacity="0.5" strokeWidth="3" fill="none" />
        {/* condensation */}
        {DROPS.map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 1.3} fill="#f8fafc" opacity="0.55" />
        ))}
      </g>

      {slurp && (
        <text x="150" y="52" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="24" fill="var(--color-accent)" filter="url(#tt-glow)" transform="rotate(-8 150 52)">
          *sluuurp*
        </text>
      )}
    </svg>
  );
}
