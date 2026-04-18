#!/usr/bin/env node
// Generate cover letter PDF from /cover-letter using Puppeteer.
// Expects astro preview to be running. Usage:
//   PORT=4321 node scripts/build-cover-letter-pdf.mjs

import puppeteer from "puppeteer";

const PORT = process.env.PORT || 4321;
const OUTPUT = process.env.PDF_OUTPUT || "dist/cover-letter.pdf";

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/cover-letter`, {
  waitUntil: "networkidle0",
});
await page.pdf({
  path: OUTPUT,
  format: "Letter",
  margin: { top: "0in", bottom: "0in", left: "0in", right: "0in" },
  printBackground: true,
  scale: 0.95,
  pageRanges: "1",
});
await browser.close();
console.log(`PDF generated: ${OUTPUT}`);
