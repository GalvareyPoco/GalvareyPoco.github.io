import { useEffect, useState } from "react";

type Step = { cmd: string; out: string[] };

const SCRIPT: Step[] = [
  { cmd: "whoami", out: ["galvarey · full-stack developer · asunción, py"] },
  {
    cmd: "cat focus.txt",
    out: ["react-native  emv/pos  unity/godot", "go  node  postgres  docker"],
  },
  {
    cmd: "ls ~/projects",
    out: ["rebuscate/  happy-living/  vert-run/", "tacumbu-finder/  ettios-game/  card/"],
  },
  { cmd: "ls ~/workshop", out: ["bambu-a1/  ender-5-plus/  halot-one/", "fusion360/  blender/  electronics/"] },
  { cmd: "echo $FUN_FACT", out: ["i like turtles 🐢"] },
];

const TYPE_MS = 55;
const PAUSE_MS = 900;

export default function Terminal() {
  const [lines, setLines] = useState<{ kind: "cmd" | "out"; text: string }[]>([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLines(SCRIPT.flatMap((s) => [{ kind: "cmd" as const, text: s.cmd }, ...s.out.map((o) => ({ kind: "out" as const, text: o }))]));
      return;
    }

    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      while (!cancelled) {
        setLines([]);
        for (const step of SCRIPT) {
          for (let i = 1; i <= step.cmd.length; i++) {
            if (cancelled) return;
            setTyping(step.cmd.slice(0, i));
            await sleep(TYPE_MS);
          }
          await sleep(250);
          if (cancelled) return;
          setTyping("");
          setLines((prev) => [...prev, { kind: "cmd", text: step.cmd }, ...step.out.map((text) => ({ kind: "out" as const, text }))]);
          await sleep(PAUSE_MS);
        }
        await sleep(PAUSE_MS * 4);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/40 via-transparent to-accent-2/30 opacity-60 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/90 shadow-2xl shadow-accent/5">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
          <span className="ml-3 font-mono text-xs text-slate-500">galvarey@dev: ~</span>
        </div>
        <div className="h-[380px] p-5 font-mono text-[13px] leading-relaxed sm:text-sm" aria-label="Animated terminal introduction" role="img">
          {lines.map((l, i) =>
            l.kind === "cmd" ? (
              <p key={i} className="text-white">
                <span className="text-accent">❯</span> {l.text}
              </p>
            ) : (
              <p key={i} className="pl-4 text-slate-400">
                {l.text}
              </p>
            ),
          )}
          <p className="text-white">
            <span className="text-accent">❯</span> {typing}
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
          </p>
        </div>
      </div>
    </div>
  );
}
