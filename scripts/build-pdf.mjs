#!/usr/bin/env node
// Builds PDF from the resume page using Puppeteer
// Usage: node scripts/build-pdf.mjs              (from running server)
//        node scripts/build-pdf.mjs --serve       (starts preview server, builds PDF, stops)

import puppeteer from "puppeteer";
import { execSync, spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const PORT = process.env.PORT || 4321;
const OUTPUT = process.env.PDF_OUTPUT || "dist/resume.pdf";
const SERVE = process.argv.includes("--serve");

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await setTimeout(500);
  }
  throw new Error(`Server at ${url} did not start in time`);
}

async function main() {
  let server;

  if (SERVE) {
    console.log("Starting preview server...");
    server = spawn("npx", ["astro", "preview", "--port", String(PORT)], {
      stdio: "pipe",
    });
    await waitForServer(`http://localhost:${PORT}/resume`);
    console.log("Server ready.");
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`http://localhost:${PORT}/resume`, {
      waitUntil: "networkidle0",
    });

    await page.pdf({
      path: OUTPUT,
      format: "Letter",
      margin: { top: "0.4in", bottom: "0.4in", left: "0.5in", right: "0.5in" },
      printBackground: true,
    });

    await browser.close();
    console.log(`PDF generated: ${OUTPUT}`);
  } finally {
    if (server) {
      server.kill();
      console.log("Preview server stopped.");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
