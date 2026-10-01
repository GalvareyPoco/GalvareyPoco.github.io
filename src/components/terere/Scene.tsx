// The tereré set, drawn in SVG from real references:
// - mortero: a wooden mortar and pestle for crushing the yuyos (mint, cedrón...)
// - guampa: a bull-horn cup with alpaca rims, a leather band with ñandutí lace, yerba heaped on one side
//   and an alpaca bombilla with a gold mouthpiece
// - jarra: an insulated jug wrapped in tooled leather with laced edges, a strap handle, ice and yuyos inside

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

/** Ñandutí: Paraguayan spider-web lace, a ring of colored petals around a radial web. */
function Nanduti({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const colors = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#ec4899", "#f97316"];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fef3c7" strokeWidth="0.8" opacity="0.9" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#fef3c7" strokeWidth="0.6" opacity="0.8" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="#fef3c7" strokeWidth="0.45" opacity="0.8" />;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        return <circle key={i} cx={cx + Math.cos(a) * r * 0.78} cy={cy + Math.sin(a) * r * 0.78} r={r * 0.17} fill={colors[i % colors.length]} opacity="0.95" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#facc15" />
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

export default function Scene(p: SceneState) {
  const { tilt, flow, level, crush, pound, fly, yuyoIn, sipping, slurp } = p;
  // Pestle rests in the bowl; after each hit it bounces up and comes back down.
  const lift = Math.sin((1 - pound) * Math.PI) * 26 * (pound > 0 ? 1 : 0);
  const pct = Math.round(level * 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[46vh] max-h-[400px] w-auto max-w-full" aria-hidden="true">
      <defs>
        <linearGradient id="tt-horn" x1="0" x2="1">
          <stop offset="0" stopColor="#1c130b" />
          <stop offset="0.16" stopColor="#4a2f18" />
          <stop offset="0.34" stopColor="#b48a58" />
          <stop offset="0.46" stopColor="#e3cc9e" />
          <stop offset="0.6" stopColor="#9a6f42" />
          <stop offset="0.82" stopColor="#3b2715" />
          <stop offset="1" stopColor="#140d07" />
        </linearGradient>
        <linearGradient id="tt-horn-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="tt-leather" x1="0" x2="1">
          <stop offset="0" stopColor="#2e1607" />
          <stop offset="0.3" stopColor="#8a4b1f" />
          <stop offset="0.5" stopColor="#a86331" />
          <stop offset="0.75" stopColor="#6b3814" />
          <stop offset="1" stopColor="#2a1406" />
        </linearGradient>
        <linearGradient id="tt-band" x1="0" x2="1">
          <stop offset="0" stopColor="#120b06" />
          <stop offset="0.45" stopColor="#3b2416" />
          <stop offset="1" stopColor="#0d0805" />
        </linearGradient>
        <linearGradient id="tt-alpaca" x1="0" x2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="0.3" stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#9ca3af" />
          <stop offset="0.8" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="tt-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#92400e" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b45309" />
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
      <ellipse cx="190" cy="291" rx="34" ry="4" fill="#000" opacity="0.55" />
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

      {/* ── Guampa ── */}
      <g>
        {/* bombilla (drawn first; the rim covers where it enters) */}
        <path d="M178 156 L152 78" stroke="url(#tt-alpaca)" strokeWidth="5" strokeLinecap="round" />
        <path d="M177 155 L151 77" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
        <path d="M152 78 Q149 70 141 66" fill="none" stroke="url(#tt-gold)" strokeWidth="5" strokeLinecap="round" />
        <rect x="157" y="98" width="9" height="6" rx="1.5" fill="url(#tt-gold)" transform="rotate(-18 161 101)" />
        {sipping &&
          [0, 1, 2].map((i) => (
            <circle key={i} r="1.8" fill="#d9f99d">
              <animateMotion dur="0.55s" begin={`${i * 0.18}s`} repeatCount="indefinite" path="M176 150 L152 78 Q149 70 141 66" />
            </circle>
          ))}

        {/* horn body */}
        <path d="M158 152 C158 200 160 248 163 280 L217 280 C220 248 222 200 222 152 Z" fill="url(#tt-horn)" />
        {/* natural horn streaks */}
        <path d="M168 160 C170 200 167 240 171 278 M184 158 C182 190 186 230 183 278 M206 160 C209 200 204 236 208 278" stroke="#2a1a0d" strokeOpacity="0.28" strokeWidth="2.5" fill="none" />
        <path d="M176 162 C178 196 175 236 178 276" stroke="#fffbeb" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
        <path d="M163 165 C164 210 165 250 167 276" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" fill="none" />
        <path d="M158 152 C158 200 160 248 163 280 L217 280 C220 248 222 200 222 152 Z" fill="url(#tt-horn-v)" />
        {/* leather band with ñandutí */}
        <path d="M158.8 196 C159 214 159.4 230 160 246 L220 246 C220.6 230 221 214 221.2 196 Z" fill="url(#tt-band)" />
        <path d="M159 199.5 L221 199.5 M160 242.5 L220 242.5" stroke="#fef3c7" strokeWidth="0.9" strokeDasharray="2.5 2" opacity="0.8" />
        <Nanduti cx={190} cy={221} r={15} />
        {/* alpaca base and engraved rim */}
        <path d="M161 274 L219 274 L222 289 Q190 294 158 289 Z" fill="url(#tt-alpaca)" />
        <path d="M163 281 L217 281" stroke="#374151" strokeWidth="0.6" strokeDasharray="1 2" />
        <path d="M156 150 L224 150 L223.4 164 Q190 170 156.6 164 Z" fill="url(#tt-alpaca)" />
        <path d="M158 158 Q190 163 222 158" stroke="#374151" strokeWidth="0.7" strokeDasharray="1.5 2.5" fill="none" />

        {/* opening: yerba heaped to one side ("montañita"), water pooling on the bombilla side */}
        <ellipse cx="190" cy="150" rx="34" ry="7" fill="#1a2e05" />
        <path d="M184 152 C190 140 204 136 222 147 C214 154 196 156 184 152 Z" fill="#4d7c0f" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={i} cx={190 + (i % 5) * 6} cy={145 + Math.floor(i / 5) * 4 + (i % 2)} r="1.1" fill={i % 3 ? "#a3e635" : "#365314"} />
        ))}
        <ellipse cx={176} cy={151} rx={4 + 14 * level} ry={1.5 + 3 * level} fill="url(#tt-water)" opacity={level > 0.02 ? 0.9 : 0} />
        {level > 0.3 && [0, 1, 2].map((i) => <circle key={i} cx={170 + i * 5} cy={150.5 - (i % 2)} r="0.9" fill="#fff" opacity={0.8 * level} />)}
        <path d="M156 150 A34 7 0 0 0 224 150" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
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

      {/* ── Jarra ── tilts around its spout, which ends right above the guampa */}
      <g transform={`translate(${-85 * tilt} ${12 * tilt}) rotate(${-62 * tilt} 290 98)`}>
        {/* yuyos and ice sticking out of the top */}
        <path d="M316 106 C312 88 306 80 298 76 M346 106 C348 86 356 76 366 72 M330 106 C330 92 328 84 324 76" stroke="#15803d" strokeWidth="1.8" fill="none" />
        <Leaf x={296} y={78} r={-150} s={0.9} />
        <Leaf x={302} y={86} r={-200} s={0.8} c="#16a34a" />
        <Leaf x={362} y={74} r={-20} s={0.9} c="#4ade80" />
        <Leaf x={356} y={82} r={20} s={0.8} c="#15803d" />
        {/* cedrón: long narrow leaves */}
        <path d="M324 76 l-3 -16 M324 76 l6 -14 M324 76 l-9 -10" stroke="#65a30d" strokeWidth="2.6" strokeLinecap="round" />
        {yuyoIn && (
          <>
            <Leaf x={310} y={98} r={-30} s={0.6} c="#166534" />
            <Leaf x={350} y={96} r={200} s={0.6} c="#166534" />
          </>
        )}
        <Ice x={314} y={96} r={14} />
        <Ice x={338} y={94} r={-10} s={0.95} />
        <Ice x={360} y={97} r={30} s={0.8} />

        {/* leather strap handle */}
        <path d="M380 136 C414 140 416 236 380 244" fill="none" stroke="#5a2e10" strokeWidth="11" strokeLinecap="round" />
        <path d="M381 140 C408 145 409 232 381 239" fill="none" stroke="#f5deb3" strokeWidth="0.8" strokeDasharray="2.5 2" opacity="0.7" />
        <circle cx="383" cy="138" r="2" fill="url(#tt-alpaca)" />
        <circle cx="383" cy="242" r="2" fill="url(#tt-alpaca)" />

        {/* metal rim and spout */}
        <path d="M300 104 L380 104 L380 116 L300 116 Z" fill="url(#tt-alpaca)" />
        <ellipse cx="340" cy="104" rx="40" ry="6" fill="#0f172a" stroke="url(#tt-alpaca)" strokeWidth="3" />
        <path d="M301 101 L287 96 Q286 102 301 110 Z" fill="url(#tt-alpaca)" />
        {/* condensation */}
        {[
          [308, 111],
          [326, 113],
          [354, 110],
          [372, 113],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="1.2" ry="1.7" fill="#e0f2fe" opacity="0.85" />
        ))}

        {/* tooled leather forro with laced edges */}
        <path d="M300 116 L380 116 L380 282 Q340 292 300 282 Z" fill="url(#tt-leather)" />
        <path d="M300 116 L380 116 L380 282 Q340 292 300 282 Z" fill="url(#tt-horn-v)" opacity="0.6" />
        {Array.from({ length: 13 }, (_, i) => {
          const x = 303 + i * 6.1;
          const low = 281 + (i > 2 && i < 10 ? 2 : 0);
          return (
            <g key={i} stroke="#f5deb3" strokeWidth="1.1" opacity="0.85">
              <path d={`M${x} 117 l4 5 M${x + 4} 117 l-4 5`} />
              <path d={`M${x} ${low} l4 -5 M${x + 4} ${low} l-4 -5`} />
            </g>
          );
        })}
        {/* burned-in medallion: the flag's star with a laurel, over a tricolor band */}
        <circle cx="340" cy="168" r="20" fill="none" stroke="#2a1406" strokeWidth="2" opacity="0.8" />
        <circle cx="340" cy="168" r="15.5" fill="none" stroke="#2a1406" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.8" />
        <path d="M340 157 L342.9 165.6 L351.9 165.6 L344.6 170.9 L347.4 179.5 L340 174.2 L332.6 179.5 L335.4 170.9 L328.1 165.6 L337.1 165.6 Z" fill="#facc15" stroke="#2a1406" strokeWidth="0.8" />
        <path d="M326 181 C330 187 335 190 340 190 C345 190 350 187 354 181" fill="none" stroke="#2a1406" strokeWidth="1.2" />
        <rect x="300" y="214" width="80" height="4" fill="#d52b1e" />
        <rect x="300" y="218" width="80" height="4" fill="#f8fafc" />
        <rect x="300" y="222" width="80" height="4" fill="#0038a8" />
        <text x="340" y="254" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#2a1406" opacity="0.75" letterSpacing="2">
          G·A
        </text>
        {/* shine */}
        <path d="M308 122 L309 276" stroke="#fff" strokeOpacity="0.14" strokeWidth="4" />
      </g>

      {slurp && (
        <text x="150" y="52" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="24" fill="var(--color-accent)" filter="url(#tt-glow)" transform="rotate(-8 150 52)">
          *sluuurp*
        </text>
      )}
    </svg>
  );
}
