import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const contentDir = path.resolve("src/content-merged");

function loadYaml<T>(filename: string): T {
  const filepath = path.join(contentDir, filename);
  const raw = fs.readFileSync(filepath, "utf-8");
  return parseYaml(raw) as T;
}

export interface Meta {
  name: string;
  firstName: string;
  lastName: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  links: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  resumeTagline?: string;
}

export interface SkillItem {
  name: string;
  level?: "expert" | "proficient" | "familiar";
  years?: number;
  certification?: string;
}

export interface SkillCategory {
  name: string;
  items: SkillItem[];
}

export interface Skills {
  categories: SkillCategory[];
}

export function getMeta(): Meta {
  return loadYaml<Meta>("meta.yaml");
}

export function getSkills(): Skills {
  return loadYaml<Skills>("skills.yaml");
}
