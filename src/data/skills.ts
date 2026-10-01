import type { Lang, Localized } from "../i18n";

// Skill groups, sourced from the README's "Skill Set" and "Languages" sections plus details Galvarey added.
// Items are tool names; the few that are plain words get translations in `itemText`.
const groups: { name: Localized; items: string[] }[] = [
  { name: { en: "Languages", es: "Lenguajes", fr: "Langages" }, items: ["TypeScript", "JavaScript", "Go", "Python", "C#", "Solidity", "SQL", "HTML / CSS"] },
  { name: { en: "Frontend & Mobile", es: "Frontend y mobile", fr: "Frontend et mobile" }, items: ["React", "React Native", "Expo", "Next.js", "Vue.js", "Tailwind CSS", "Shadcn/UI", "Tamagui", "Flutter", "Android"] },
  { name: { en: "Backend & Data", es: "Backend y datos", fr: "Backend et données" }, items: ["Node.js", "NestJS", "Go", ".NET", "PostgreSQL", "Supabase", "MongoDB", "Prisma", "DynamoDB", "ETL pipelines", "Web scraping"] },
  { name: { en: "Infrastructure & DevOps", es: "Infraestructura y DevOps", fr: "Infrastructure et DevOps" }, items: ["VPS self-hosting", "Docker", "Traefik", "Domains, DNS & routing", "Microservices", "S3-compatible storage", "Backups", "CI/CD", "AWS (Lambda, Cognito, Bedrock)", "Git"] },
  { name: { en: "Platform services", es: "Servicios de plataforma", fr: "Services de plateforme" }, items: ["PostHog", "Novu", "Resend", "Expo Notifications", "Plane"] },
  { name: { en: "Games & 3D", es: "Videojuegos y 3D", fr: "Jeu vidéo et 3D" }, items: ["Unity", "Godot", "ShaderGraph", "UIToolkit", "TopDownEngine", "Blender (game assets & 3D modeling)"] },
  { name: { en: "AI & ML", es: "IA y ML", fr: "IA et ML" }, items: ["Qdrant", "Embedding services", "Multimodal search (image + text)", "LLM chatbots", "PyTorch", "Keras", "OpenCV"] },
  { name: { en: "Payments & Security", es: "Pagos y seguridad", fr: "Paiements et sécurité" }, items: ["EMV", "POS terminals", "Penetration testing", "Kali Linux", "Security & performance testing"] },
  { name: { en: "Hardware & Making", es: "Hardware y maker", fr: "Hardware et fabrication" }, items: ["Electronics", "Raspberry Pi", "Fusion 360 (CAD)", "Blender", "3D printing: FDM & resin", "Bambu Lab A1", "Creality Ender 5 Plus", "Creality Halot One"] },
  { name: { en: "Design", es: "Diseño", fr: "Design" }, items: ["Figma", "Photoshop", "Illustrator", "After Effects", "Premiere Pro"] },
];

const itemText: Record<string, Omit<Localized, "en">> = {
  "ETL pipelines": { es: "Pipelines ETL", fr: "Pipelines ETL" },
  "VPS self-hosting": { es: "Autoalojamiento en VPS", fr: "Auto-hébergement sur VPS" },
  "Domains, DNS & routing": { es: "Dominios, DNS y ruteo", fr: "Domaines, DNS et routage" },
  Microservices: { es: "Microservicios", fr: "Microservices" },
  "S3-compatible storage": { es: "Almacenamiento compatible con S3", fr: "Stockage compatible S3" },
  Backups: { es: "Backups", fr: "Sauvegardes" },
  "Blender (game assets & 3D modeling)": { es: "Blender (assets y modelado 3D)", fr: "Blender (assets et modélisation 3D)" },
  "Embedding services": { es: "Servicios de embeddings", fr: "Services d'embeddings" },
  "Multimodal search (image + text)": { es: "Búsqueda multimodal (imagen + texto)", fr: "Recherche multimodale (image + texte)" },
  "LLM chatbots": { es: "Chatbots con LLM", fr: "Chatbots LLM" },
  "POS terminals": { es: "Terminales POS", fr: "Terminaux POS" },
  "Penetration testing": { es: "Pruebas de penetración", fr: "Tests d'intrusion" },
  "Security & performance testing": { es: "Pruebas de seguridad y rendimiento", fr: "Tests de sécurité et de performance" },
  Electronics: { es: "Electrónica", fr: "Électronique" },
  "Fusion 360 (CAD)": { es: "Fusion 360 (CAD)", fr: "Fusion 360 (CAO)" },
  "3D printing: FDM & resin": { es: "Impresión 3D: FDM y resina", fr: "Impression 3D : FDM et résine" },
};

export const skillGroups = (lang: Lang) =>
  groups.map((g) => ({
    name: g.name[lang],
    items: g.items.map((i) => (lang === "en" ? i : (itemText[i]?.[lang] ?? i))),
  }));

export const operatingSystems = ["Windows 11", "Ubuntu", "Kali", "Android", "iOS"] as const;
