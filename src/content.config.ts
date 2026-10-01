import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

// Text given once for all languages, or per language.
const localized = <T extends z.ZodType>(t: T) => z.object({ en: t, es: t, fr: t });
const text = z.union([z.string(), localized(z.string())]);
const textList = localized(z.array(z.string()));

const projects = defineCollection({
  loader: file("./src/content/projects.json"),
  schema: z.object({
    title: text,
    summary: localized(z.string()),
    highlights: textList,
    order: z.number(),
    category: z.enum(["Product", "Client", "Open source", "Game"]),
    platforms: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    url: z.string().optional(),
    links: z.array(z.object({ label: text, url: z.string() })).default([]),
    collaborators: z.array(z.object({ label: z.string(), url: z.string().optional() })).default([]),
    featured: z.boolean().default(false),
  }),
});

// Dates are "YYYY-MM" and get formatted per language. Roles with highlights get full timeline cards.
const experience = defineCollection({
  loader: file("./src/content/experience.json"),
  schema: z.object({
    role: text,
    company: z.string(),
    companyUrl: z.string().optional(),
    location: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    current: z.boolean().default(false),
    highlights: textList.optional(),
    // Optional manual position; lower comes first. Unset roles sort by date after these.
    order: z.number().optional(),
  }),
});

const education = defineCollection({
  loader: file("./src/content/education.json"),
  schema: z.object({
    school: z.string(),
    degree: text,
    start: z.string().optional(),
    end: z.string().optional(),
  }),
});

export const collections = { projects, experience, education };
