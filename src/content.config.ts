import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const contentBase = "./src/content-merged";

const experience = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentBase}/experience` }),
  schema: z.object({
    company: z.string(),
    title: z.string(),
    location: z.string(),
    start: z.string(),
    end: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
    short: z.string(),
    highlights: z.array(z.string()).default([]),
    visible: z.boolean().default(true),
    resumeVisible: z.boolean().default(true),
    resumeAdditional: z.boolean().default(false),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentBase}/education` }),
  schema: z.object({
    institution: z.string(),
    degree: z.string(),
    location: z.string(),
    start: z.string(),
    end: z.string(),
    gpa: z.string().optional(),
    order: z.number(),
    short: z.string(),
    coursework: z.array(z.string()).default([]),
    visible: z.boolean().default(true),
    resumeVisible: z.boolean().default(true),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentBase}/about` }),
  schema: z.object({
    headline: z.string(),
  }),
});

const coverLetters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentBase}/cover-letters` }),
  schema: z.object({
    recipient: z.string(),
    recipientOrg: z.string(),
    recipientTitle: z.string().optional(),
    role: z.string(),
    team: z.string().optional(),
    salutation: z.string().optional(),
    closing: z.string().default("With appreciation,"),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentBase}/projects` }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    url: z.string().default(""),
    repo: z.string().default(""),
    tags: z.array(z.string()).default([]),
    order: z.number(),
    short: z.string(),
    highlights: z.array(z.string()).default([]),
    visible: z.boolean().default(true),
    resumeVisible: z.boolean().default(true),
  }),
});

export const collections = { experience, education, about, projects, coverLetters };
