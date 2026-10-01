// Skill groups, sourced from the "Skill Set" and "Languages" sections of the README plus details Galvarey added.
export const skillGroups = [
  { name: "Languages", items: ["TypeScript", "JavaScript", "Go", "Python", "C#", "Solidity", "SQL", "HTML / CSS"] },
  { name: "Frontend & Mobile", items: ["React", "React Native", "Expo", "Next.js", "Vue.js", "Tailwind CSS", "Shadcn/UI", "Tamagui", "Flutter", "Android"] },
  { name: "Backend & Data", items: ["Node.js", "NestJS", "Go", ".NET", "PostgreSQL", "Supabase", "MongoDB", "Prisma", "DynamoDB", "ETL pipelines", "Web scraping"] },
  { name: "Infrastructure & DevOps", items: ["VPS self-hosting", "Docker", "Traefik", "Domains, DNS & routing", "Microservices", "S3-compatible storage", "Backups", "CI/CD", "AWS (Lambda, Cognito, Bedrock)", "Git"] },
  { name: "Platform services", items: ["PostHog", "Novu", "Resend", "Expo Notifications", "Plane"] },
  { name: "Games & 3D", items: ["Unity", "Godot", "ShaderGraph", "UIToolkit", "TopDownEngine", "Blender (game assets & 3D modeling)"] },
  { name: "AI & ML", items: ["Qdrant", "Embedding services", "Multimodal search (image + text)", "LLM chatbots", "PyTorch", "Keras", "OpenCV"] },
  { name: "Payments & Security", items: ["EMV", "POS terminals", "Penetration testing", "Kali Linux", "Security & performance testing"] },
  { name: "Hardware & Making", items: ["Electronics", "Raspberry Pi", "Fusion 360 (CAD)", "Blender", "3D printing: FDM & resin", "Bambu Lab A1", "Creality Ender 5 Plus", "Creality Halot One"] },
  { name: "Design", items: ["Figma", "Photoshop", "Illustrator", "After Effects", "Premiere Pro"] },
] as const;

export const operatingSystems = ["Windows 11", "Ubuntu", "Kali", "Android", "iOS"] as const;
