import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({ label: z.string(), url: z.string() });

// One Markdown file per project in src/content/projects/.
// Body = bullet list of highlights; frontmatter = card metadata.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    category: z.enum(["Product", "Client", "Open source", "Game"]),
    platforms: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    url: z.string().optional(),
    links: z.array(link).default([]),
    collaborators: z.array(z.object({ label: z.string(), url: z.string().optional() })).default([]),
    featured: z.boolean().default(false),
  }),
});

// Roles from LinkedIn. Entries with `placeholder: true` render as "coming soon" cards.
const experience = defineCollection({
  loader: file("./src/content/experience.json"),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    companyUrl: z.string().optional(),
    location: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    current: z.boolean().default(false),
    highlights: z.array(z.string()).default([]),
    placeholder: z.boolean().default(false),
  }),
});

const education = defineCollection({
  loader: file("./src/content/education.json"),
  schema: z.object({
    school: z.string(),
    degree: z.string(),
    start: z.string().optional(),
    end: z.string().optional(),
    notes: z.string().optional(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { projects, experience, education };
