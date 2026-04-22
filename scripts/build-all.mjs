#!/usr/bin/env node
// Builds the base site + all variants into dist/
// Base → dist/
// Each variant → dist/v/<slug>/

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VARIANTS_DIR = "variants";
const DIST_DIR = "dist";

function run(cmd, env = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

async function getVariants() {
  try {
    const entries = await fs.readdir(VARIANTS_DIR, { withFileTypes: true });
    const variants = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(VARIANTS_DIR, entry.name, "meta.yaml");
      try {
        const raw = await fs.readFile(metaPath, "utf-8");
        const meta = parseYaml(raw);
        variants.push({
          name: entry.name,
          slug: meta.slug || entry.name,
          meta,
        });
      } catch {
        console.warn(`Skipping ${entry.name}: no meta.yaml found`);
      }
    }
    return variants;
  } catch {
    return [];
  }
}

async function generatePdfs(distDir = DIST_DIR, basePath = "") {
  const { spawn: spawnProcess } = await import("node:child_process");
  const { setTimeout: sleep } = await import("node:timers/promises");

  const port = 4400 + Math.floor(Math.random() * 100);
  console.log(`\nStarting preview server on port ${port} for PDF generation...`);

  const server = spawnProcess("npx", ["astro", "preview", "--port", String(port), "--outDir", distDir], {
    stdio: "pipe",
    env: { ...process.env },
  });

  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${port}${basePath}/resume`);
      if (res.ok) break;
    } catch {}
    await sleep(500);
  }

  try {
    run(`PORT=${port} PDF_OUTPUT=${distDir}/resume.pdf node scripts/build-pdf.mjs`);
    run(`PORT=${port} PDF_OUTPUT=${distDir}/cover-letter.pdf node scripts/build-cover-letter-pdf.mjs`);
  } finally {
    server.kill();
    console.log("Preview server stopped.");
  }
}

async function main() {
  // 1. Build base site
  console.log("=== Building base site ===");
  run("node scripts/merge-content.mjs");
  run("npx astro build");

  // 1b. Generate PDFs for base site
  console.log("\n=== Generating PDFs for base site ===");
  await generatePdfs(DIST_DIR);

  // 2. Build each variant
  const variants = await getVariants();
  for (const variant of variants) {
    console.log(`\n=== Building variant: ${variant.name} (slug: ${variant.slug}) ===`);
    const variantDist = path.join(DIST_DIR, "v", variant.slug);

    run("node scripts/merge-content.mjs", { VARIANT: variant.name });
    run("npx astro build --outDir .variant-dist", {
      VARIANT: variant.name,
      BASE_PATH: `/v/${variant.slug}`,
    });

    // Move variant build output into dist/v/<slug>/
    await fs.mkdir(path.dirname(variantDist), { recursive: true });
    await fs.rm(variantDist, { recursive: true, force: true });
    await fs.rename(".variant-dist", variantDist);

    console.log(`Variant built to ${variantDist}`);
  }

  if (variants.length === 0) {
    console.log("\nNo variants found. Only base site built.");
  } else {
    console.log(`\nBuilt base + ${variants.length} variant(s).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
