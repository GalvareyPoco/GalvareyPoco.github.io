import { useEffect, useRef, useState, type ReactNode } from "react";
import { setTheme, themes, type Theme } from "../lib/theme";

type Lang = "en" | "es" | "fr";
type Line = { kind: "cmd" | "out" | "err" | "hint"; text: ReactNode };
type Step = { cmd: string; out: string[] };

export type TerminalData = {
  awards: string[];
  journey: string[];
  projects: string[];
  socials: { label: string; url: string }[];
  linkedin: string;
};

const SCRIPTS: Record<Lang, Step[]> = {
  en: [
    { cmd: "whoami", out: ["galvarey · full-stack developer · asunción, py"] },
    { cmd: "cat focus.txt", out: ["react-native  payments/pos  unity/godot", "go  node  postgres  docker"] },
    { cmd: "ls ~/workshop", out: ["bambu-a1/  ender-5-plus/  halot-one/", "fusion360/  blender/  electronics/"] },
  ],
  es: [
    { cmd: "whoami", out: ["galvarey · desarrollador full-stack · asunción, py"] },
    { cmd: "cat enfoque.txt", out: ["react-native  pagos/pos  unity/godot", "go  node  postgres  docker"] },
    { cmd: "ls ~/taller", out: ["bambu-a1/  ender-5-plus/  halot-one/", "fusion360/  blender/  electronica/"] },
  ],
  fr: [
    { cmd: "whoami", out: ["galvarey · développeur full-stack · asunción, py"] },
    { cmd: "cat domaines.txt", out: ["react-native  paiements/pos  unity/godot", "go  node  postgres  docker"] },
    { cmd: "ls ~/atelier", out: ["bambu-a1/  ender-5-plus/  halot-one/", "fusion360/  blender/  electronique/"] },
  ],
};

const T = {
  en: {
    ready: "type `help` and press enter",
    help: [
      "help             this list",
      "whoami           who's behind the keyboard",
      "awards           prizes we've won",
      "whereami         places I've lived",
      "projects         things I've built",
      "socials          where to find me",
      "cd <section>     jump to about, journey, awards, experience, projects, skills, contact",
      "theme [name]     matrix · neon · amber · terere",
      "terere           replay the intro",
      "matrix           follow the white rabbit",
      "sudo hire-me     you know you want to",
      "clear            clean the screen",
    ],
    whoami: ["Guillermo Alvarez, aka Galvarey · full-stack dev, CTO and game maker from Asunción, Paraguay.", "10+ years in tech. Speaks ES · EN · FR. Likes turtles 🐢"],
    notFound: (c: string) => `command not found: ${c}. try \`help\``,
    theme: (t: string) => `theme set to ${t}`,
    themeUsage: "usage: theme <matrix|neon|amber|terere>",
    terere: "serving tereré... 🧉",
    matrix: "wake up, neo...",
    hire: ["[sudo] password for recruiter: ********", "access granted ✔ opening LinkedIn..."],
    cd: (s: string) => `cd ~/${s}`,
    cdUsage: "usage: cd <about|journey|awards|experience|projects|skills|contact>",
    rm: "nice try. permission denied 😏",
    input: "Terminal command",
  },
  es: {
    ready: "escribí `help` y presioná enter",
    help: [
      "help             esta lista",
      "whoami           quién está detrás del teclado",
      "awards           premios que ganamos",
      "whereami         dónde viví",
      "projects         lo que construí",
      "socials          dónde encontrarme",
      "cd <sección>     ir a about, journey, awards, experience, projects, skills, contact",
      "theme [nombre]   matrix · neon · amber · terere",
      "terere           repetir la intro",
      "matrix           seguí al conejo blanco",
      "sudo hire-me     sabés que querés",
      "clear            limpiar la pantalla",
    ],
    whoami: ["Guillermo Alvarez, aka Galvarey · dev full-stack, CTO y creador de videojuegos de Asunción, Paraguay.", "10+ años en tecnología. Habla ES · EN · FR. Le gustan las tortugas 🐢"],
    notFound: (c: string) => `comando no encontrado: ${c}. probá \`help\``,
    theme: (t: string) => `tema cambiado a ${t}`,
    themeUsage: "uso: theme <matrix|neon|amber|terere>",
    terere: "sirviendo tereré... 🧉",
    matrix: "despertá, neo...",
    hire: ["[sudo] contraseña para reclutador: ********", "acceso concedido ✔ abriendo LinkedIn..."],
    cd: (s: string) => `cd ~/${s}`,
    cdUsage: "uso: cd <about|journey|awards|experience|projects|skills|contact>",
    rm: "buen intento. permiso denegado 😏",
    input: "Comando de terminal",
  },
  fr: {
    ready: "tapez `help` puis entrée",
    help: [
      "help             cette liste",
      "whoami           qui est derrière le clavier",
      "awards           nos prix",
      "whereami         où j'ai vécu",
      "projects         ce que j'ai construit",
      "socials          où me trouver",
      "cd <section>     aller à about, journey, awards, experience, projects, skills, contact",
      "theme [nom]      matrix · neon · amber · terere",
      "terere           rejouer l'intro",
      "matrix           suivez le lapin blanc",
      "sudo hire-me     vous en avez envie",
      "clear            effacer l'écran",
    ],
    whoami: ["Guillermo Alvarez, aka Galvarey · dev full-stack, CTO et créateur de jeux à Asunción, au Paraguay.", "10+ ans dans la tech. Parle ES · EN · FR. Adore les tortues 🐢"],
    notFound: (c: string) => `commande introuvable : ${c}. essayez \`help\``,
    theme: (t: string) => `thème : ${t}`,
    themeUsage: "usage : theme <matrix|neon|amber|terere>",
    terere: "on sert le tereré... 🧉",
    matrix: "réveille-toi, neo...",
    hire: ["[sudo] mot de passe pour recruteur : ********", "accès accordé ✔ ouverture de LinkedIn..."],
    cd: (s: string) => `cd ~/${s}`,
    cdUsage: "usage : cd <about|journey|awards|experience|projects|skills|contact>",
    rm: "bien essayé. permission refusée 😏",
    input: "Commande du terminal",
  },
} satisfies Record<Lang, unknown>;

const SECTIONS = ["about", "journey", "awards", "experience", "projects", "skills", "contact"];
const TYPE_MS = 45;
const PAUSE_MS = 600;

export default function Terminal({ lang, label, data }: { lang: Lang; label: string; data: TerminalData }) {
  const t = T[lang];
  const script = SCRIPTS[lang];
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [interactive, setInteractive] = useState(false);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const skip = useRef(false);
  const pending = useRef<string | null>(null);
  const interactiveRef = useRef(false);
  interactiveRef.current = interactive;
  const screen = useRef<HTMLDivElement>(null);
  const inputEl = useRef<HTMLInputElement>(null);

  const finished = (): Line[] => [
    ...script.flatMap((s) => [{ kind: "cmd" as const, text: s.cmd }, ...s.out.map((o) => ({ kind: "out" as const, text: o }))]),
    { kind: "hint", text: t.ready },
  ];

  // Play the intro script once, then hand the prompt to the visitor. Clicking the terminal skips ahead.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLines(finished());
      setInteractive(true);
      return;
    }
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      for (const step of script) {
        for (let i = 1; i <= step.cmd.length && !skip.current; i++) {
          if (cancelled) return;
          setTyping(step.cmd.slice(0, i));
          await sleep(TYPE_MS);
        }
        if (cancelled) return;
        if (skip.current) break;
        await sleep(200);
        setTyping("");
        setLines((prev) => [...prev, { kind: "cmd", text: step.cmd }, ...step.out.map((text) => ({ kind: "out" as const, text }))]);
        await sleep(PAUSE_MS);
      }
      if (cancelled) return;
      setTyping("");
      setLines(finished());
      setInteractive(true);
      if (pending.current) {
        runRef.current(pending.current);
        pending.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Commands clicked outside the terminal (see Console.astro). Kept in a ref so the listener sees fresh state.
  const runRef = useRef<(c: string) => void>(() => {});
  useEffect(() => {
    const onRun = (e: Event) => {
      const cmd = (e as CustomEvent<string>).detail;
      // Still playing the intro script: skip to the end and run it there.
      if (!interactiveRef.current) {
        skip.current = true;
        pending.current = cmd;
      } else runRef.current(cmd);
    };
    window.addEventListener("terminal:run", onRun);
    return () => window.removeEventListener("terminal:run", onRun);
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    const out: Line[] = [{ kind: "cmd", text: cmd }];
    const say = (...text: ReactNode[]) => text.forEach((x) => out.push({ kind: "out", text: x }));
    const [name = "", ...args] = cmd.split(/\s+/);
    if (cmd) {
      history.current.unshift(cmd);
      histIdx.current = -1;
    }
    switch (name.toLowerCase()) {
      case "":
        break;
      case "help":
        say(...t.help);
        break;
      case "whoami":
        say(...t.whoami);
        break;
      case "awards":
      case "prizes":
        say(...data.awards.map((a) => `🏆 ${a}`));
        break;
      case "journey":
      case "whereami":
        say(...data.journey);
        document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "projects":
      case "ls":
        say(data.projects.map((p) => `${p}/`).join("  "));
        break;
      case "socials":
      case "contact":
        data.socials.forEach((s) =>
          say(
            <a href={s.url} target="_blank" rel="noopener" className="underline decoration-accent/40 hover:text-accent">
              {s.label.padEnd(16)} {s.url.replace(/^https?:\/\//, "")}
            </a>,
          ),
        );
        break;
      case "cd": {
        const target = args[0]?.replace(/^~?\/?/, "");
        if (target && SECTIONS.includes(target)) {
          say(t.cd(target));
          document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
        } else say(t.cdUsage);
        break;
      }
      case "theme": {
        const th = args[0] as Theme | undefined;
        if (th && themes.includes(th)) {
          setTheme(th);
          say(t.theme(th));
        } else say(t.themeUsage);
        break;
      }
      case "terere":
      case "tereré":
        say(t.terere);
        setTimeout(() => window.dispatchEvent(new Event("terere:replay")), 400);
        break;
      case "matrix":
        say(t.matrix);
        window.dispatchEvent(new Event("matrix"));
        break;
      case "sudo":
        if (args.join(" ") === "hire-me") {
          say(...t.hire);
          window.open(data.linkedin, "_blank", "noopener");
        } else out.push({ kind: "err", text: t.notFound(cmd) });
        break;
      case "rm":
        say(t.rm);
        break;
      case "clear":
        setLines([]);
        return;
      default:
        out.push({ kind: "err", text: t.notFound(name) });
    }
    setLines((prev) => [...prev, ...out]);
  };
  runRef.current = run;

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/40 via-transparent to-accent-2/30 opacity-60 blur-sm" />
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/90 shadow-2xl shadow-accent/5"
        onClick={() => {
          if (!interactive) skip.current = true;
          inputEl.current?.focus({ preventScroll: true });
        }}
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
          <span className="ml-3 font-mono text-xs text-slate-500">galvarey@dev: ~</span>
        </div>
        <div ref={screen} className="h-[360px] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed sm:text-sm" aria-label={label} aria-live="polite">
          {lines.map((l, i) =>
            l.kind === "cmd" ? (
              <p key={i} className="text-white">
                <span className="text-accent">❯</span> {l.text}
              </p>
            ) : (
              <p
                key={i}
                className={`whitespace-pre-wrap pl-4 ${l.kind === "err" ? "text-red-400" : l.kind === "hint" ? "text-accent/80 italic" : "text-slate-400"}`}
              >
                {l.text}
              </p>
            ),
          )}
          {interactive ? (
            <form
              className="flex items-center text-white"
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
                setInput("");
              }}
            >
              <span className="text-accent">❯</span>
              <input
                ref={inputEl}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const h = history.current;
                    histIdx.current = Math.max(-1, Math.min(h.length - 1, histIdx.current + (e.key === "ArrowUp" ? 1 : -1)));
                    setInput(histIdx.current === -1 ? "" : h[histIdx.current]);
                  }
                }}
                aria-label={t.input}
                enterKeyHint="send"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="ml-2 min-w-0 flex-1 bg-transparent text-base caret-accent outline-none focus-visible:outline-none sm:text-sm"
              />
            </form>
          ) : (
            <p className="text-white">
              <span className="text-accent">❯</span> {typing}
              <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
