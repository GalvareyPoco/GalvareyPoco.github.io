// Text for the easter eggs. Shared by the command menu (rendered by Astro) and the eggs themselves (in the browser).

export const EGGS = ["collapse", "breach", "invaders", "eightbit", "flood", "matrix"] as const;
export type Egg = (typeof EGGS)[number];

const en = {
  group: "Easter eggs",
  names: {
    collapse: "The page falls apart",
    breach: "Secret level",
    invaders: "Skill Invaders",
    eightbit: "8-bit mode",
    flood: "Tereré flood",
    matrix: "Matrix rain",
  } satisfies Record<Egg, string>,
  found: "Easter egg {n}/{total}: {name}",
  rebuild: "↺ Rebuild the page",
  grab: "Grab the pieces and throw them",
  breach: [
    "> ssh guest@galvarey.dev",
    "connecting to 127.0.0.1:1337 …",
    "> bypassing firewall",
    "> decrypting secret level",
    "> sudo unlock --theme gold",
  ],
  granted: "ACCESS GRANTED",
  unlocked: "Secret theme unlocked: gold",
  invaders: {
    title: "SKILL INVADERS",
    keys: "← → move · space shoot · esc quit",
    touch: "drag to move · tap to shoot",
    score: "score",
    best: "best",
    win: "All skills collected!",
    lose: "Game over",
    again: "Play again",
    quit: "Quit",
  },
  eightOn: "8-bit mode on. Run it again to switch it off.",
  eightOff: "Back to HD.",
  served: "Tereré served {n}× in this browser 🧉",
};

export type EggStrings = typeof en;

const es: EggStrings = {
  group: "Easter eggs",
  names: {
    collapse: "La página se desarma",
    breach: "Nivel secreto",
    invaders: "Skill Invaders",
    eightbit: "Modo 8 bits",
    flood: "Inundación de tereré",
    matrix: "Lluvia de Matrix",
  },
  found: "Easter egg {n}/{total}: {name}",
  rebuild: "↺ Rearmar la página",
  grab: "Agarrá las piezas y tiralas",
  breach: [
    "> ssh guest@galvarey.dev",
    "conectando a 127.0.0.1:1337 …",
    "> saltando el firewall",
    "> desencriptando el nivel secreto",
    "> sudo unlock --theme gold",
  ],
  granted: "ACCESO CONCEDIDO",
  unlocked: "Tema secreto desbloqueado: gold",
  invaders: {
    title: "SKILL INVADERS",
    keys: "← → mover · espacio disparar · esc salir",
    touch: "arrastrá para moverte · tocá para disparar",
    score: "puntos",
    best: "récord",
    win: "¡Juntaste todas las skills!",
    lose: "Game over",
    again: "Jugar de nuevo",
    quit: "Salir",
  },
  eightOn: "Modo 8 bits activado. Ejecutalo de nuevo para apagarlo.",
  eightOff: "De vuelta en HD.",
  served: "Tereré servido {n}× en este navegador 🧉",
};

const fr: EggStrings = {
  group: "Easter eggs",
  names: {
    collapse: "La page s'effondre",
    breach: "Niveau secret",
    invaders: "Skill Invaders",
    eightbit: "Mode 8 bits",
    flood: "Inondation de tereré",
    matrix: "Pluie Matrix",
  },
  found: "Easter egg {n}/{total} : {name}",
  rebuild: "↺ Reconstruire la page",
  grab: "Attrapez les morceaux et lancez-les",
  breach: [
    "> ssh guest@galvarey.dev",
    "connexion à 127.0.0.1:1337 …",
    "> contournement du pare-feu",
    "> déchiffrement du niveau secret",
    "> sudo unlock --theme gold",
  ],
  granted: "ACCÈS AUTORISÉ",
  unlocked: "Thème secret débloqué : gold",
  invaders: {
    title: "SKILL INVADERS",
    keys: "← → bouger · espace tirer · échap quitter",
    touch: "glissez pour bouger · touchez pour tirer",
    score: "score",
    best: "record",
    win: "Toutes les compétences récupérées !",
    lose: "Game over",
    again: "Rejouer",
    quit: "Quitter",
  },
  eightOn: "Mode 8 bits activé. Relancez-le pour l'éteindre.",
  eightOff: "Retour en HD.",
  served: "Tereré servi {n}× dans ce navigateur 🧉",
};

export function eggStrings(lang: string): EggStrings {
  return lang.startsWith("es") ? es : lang.startsWith("fr") ? fr : en;
}

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
