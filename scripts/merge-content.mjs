#!/usr/bin/env node
// Merges base content with optional variant overrides into src/content-merged/
// Usage: node scripts/merge-content.mjs                     (base only)
//        VARIANT=my-variant node scripts/merge-content.mjs  (base + variant)

import fs from "node:fs/promises";
import path from "node:path";

const BASE_DIR = "src/content";
const MERGED_DIR = "src/content-merged";
const VARIANT = process.env.VARIANT;

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function overlayDir(src, dest, skip = []) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (skip.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await overlayDir(srcPath, destPath, skip);
    } else {
      await fs.copyFile(srcPath, destPath);
      console.log(`  override: ${destPath}`);
    }
  }
}

async function merge() {
  // Clean merged dir
  await fs.rm(MERGED_DIR, { recursive: true, force: true });

  // Copy base content
  await copyDir(BASE_DIR, MERGED_DIR);
  console.log(`Copied base content to ${MERGED_DIR}`);

  if (!VARIANT) return;

  const variantDir = path.join("variants", VARIANT);
  try {
    await fs.access(variantDir);
  } catch {
    console.error(`Variant directory not found: ${variantDir}`);
    process.exit(1);
  }

  console.log(`Merging variant: ${VARIANT}`);
  // Overlay variant files, skip meta.yaml (variant metadata only)
  await overlayDir(variantDir, MERGED_DIR, ["meta.yaml"]);
  console.log("Merge complete.");
}

merge().catch((e) => {
  console.error(e);
  process.exit(1);
});
