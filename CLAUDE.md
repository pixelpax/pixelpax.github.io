# pixelpax.github.io

Personal website + printable resume pipeline for Gabriel Elkind. Built with Astro, generates two outputs from shared Markdown content: a luxurious animated website at `/` and a clean HTML resume at `/resume`. Supports AI-driven tailoring for specific job applications via the `/tailor` slash command.

Live site: https://gabrielelkind.com
Archived legacy site: `old/`

---

## Architecture

- **Astro 6** for static site generation
- **Tailwind CSS 4** (via `@tailwindcss/vite`) for website styling
- **GSAP + ScrollTrigger** for scroll-driven animations
- **Puppeteer** for HTML → PDF resume export
- **GitHub Actions → GitHub Pages** deploys base + all variants on push to `master`

### Directory map

```
src/content/          # Base Markdown + YAML content (source of truth)
src/content-merged/   # Build-time staging (gitignored, do not commit)
src/pages/            # index.astro (website), resume.astro (print)
src/components/       # website/ and resume/ components
src/layouts/          # BaseLayout, WebsiteLayout, ResumeLayout
src/styles/           # global.css (Tailwind + theme), resume.css
src/lib/data.ts       # Helpers to load meta.yaml and skills.yaml
src/content.config.ts # Astro collection schemas (Zod)

variants/             # Tailored overrides per job application
  <name>/
    meta.yaml         # slug, target company/role, job description
    experience/*.md   # Only the files that differ from base
    skills.yaml       # Reordered / reweighted skills
    about/bio.md      # Adjusted emphasis

scripts/
  merge-content.mjs   # Pre-build: copies base → content-merged, overlays variant
  build-all.mjs       # Builds base + all variants into dist/ and dist/v/<slug>/
  build-pdf.mjs       # Puppeteer: /resume → dist/resume.pdf

.claude/commands/
  tailor.md           # Claude Code slash command for AI tailoring
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server with hot reload (base content) |
| `VARIANT=<name> npm run dev` | Dev server with variant merged in |
| `npm run build` | Build base site to `dist/` |
| `VARIANT=<name> npm run build` | Build a single variant |
| `npm run build-all` | Build base + all variants (used by CI) |
| `npm run build-pdf` | Generate `dist/resume.pdf` via Puppeteer |
| `/tailor <company-role>` | Claude Code: generate a variant for a job description |

---

## Content model

Content lives in Markdown files with YAML frontmatter. One file per entry (job, project, degree, etc.). Frontmatter holds structured data; body holds rich prose for the website.

- **`experience/*.md`** — company, title, dates, tags, highlights, visible flags
- **`education/*.md`** — institution, degree, dates, GPA, coursework
- **`projects/*.md`** — name, tagline, url, repo, tags
- **`about/bio.md`** — headline (for hero) + body (for resume summary and website About)
- **`skills.yaml`** — categories of skills with level (expert / proficient / familiar)
- **`meta.yaml`** — name, tagline, contact, links, resumeTagline

Each `experience`, `education`, and `project` entry has `visible` (website) and `resumeVisible` (resume) flags, plus an `order` field for manual sorting.

### Variant overrides

Variants only contain files that differ from base. The `merge-content.mjs` script copies base content to `src/content-merged/`, then overlays variant files on top. Astro's content collections always read from `content-merged/`.

---

## Resume constraints (IMPORTANT)

**The resume must parse cleanly into Applicant Tracking Systems (ATS).** Recruiters and companies scan resumes through ATS software before a human sees them. An unparseable resume gets auto-rejected.

### ATS rules to preserve when editing `src/pages/resume.astro`

- **Real text only** — never put content in images, SVGs, or background-image pseudo-elements. Decorative elements (corner marks, accent bars, blueprint grid) are OK only if they contain no information.
- **Standard semantic HTML** — use real `<h1>`, `<h2>`, `<ul>`, `<li>`, `<p>` tags. Don't fake headings with styled `<div>`s alone (the current code uses `<div class="section-title">` — if we hit ATS issues, swap to `<h2>`).
- **Standard section names** — "Experience", "Education", "Skills", "Projects", "Summary". ATS parsers look for these exact labels.
- **Reading order matters** — the HTML source order must make sense top-to-bottom even though CSS arranges it into two columns. Sidebar content (name, contact, skills) comes first in the DOM, then the main panel (summary, experience, education, projects). Verify by disabling CSS and reading the page.
- **Fonts must embed in the PDF** — Puppeteer embeds web fonts automatically when they're loaded from Google Fonts with `display=swap`. Do not switch to fonts that require manual embedding without testing.
- **No text in images or as `background-image`**. Corner marks, gold rules, and the blueprint grid are OK because they contain no textual information.
- **Avoid tables for layout** — the two-column structure uses CSS Grid, which is ATS-safe. Do NOT convert to `<table>`-based layout.
- **Contact info as real text** — phone, email, links are plain `<a>` and text, not icons-only. Icons are decorative; text is adjacent.
- **Dates in standard format** — "Feb 2022 — Present", "2015 — 2017". The `formatDate()` helper in `resume.astro` handles this.
- **No headers/footers with critical info** — nothing lives in `@page` margins. All content is in the page body.

### Testing ATS parseability

Before shipping a significant resume redesign:

1. Generate the PDF: `npm run build-pdf`
2. Upload the PDF to an online ATS checker (e.g., jobscan.co, resumeworded.com, or Affinda's free resume parser).
3. Verify that name, contact info, work experience (company + title + dates), education, and skills are all extracted correctly.
4. Test with a copy-paste of the PDF text into a plain text editor — the reading order should be logical.
5. If a section doesn't parse, investigate: likely a semantic HTML issue (divs instead of headings) or a layout issue (two-column reading order).

### What the current design gets right

- CSS Grid layout (not tables)
- Google Fonts with `display=swap` (embeds in PDF)
- Real text throughout, icons are decorative only
- Standard section names
- Dates in parseable format
- Sidebar is DOM-first, then main panel (correct reading order)

### Known risks to watch

- Section titles use `<div class="section-title">` instead of `<h2>`. If we hit parsing issues with section detection, convert these to semantic headings.
- The two-column layout can trip up older ATS parsers that don't handle modern CSS. If rejection rates get high on a specific employer, consider a single-column variant.

---

## Tailoring workflow

The `/tailor <company-role>` slash command reads base content + a job description and generates a variant directory with only the files that need to differ. Rules are in `.claude/commands/tailor.md`:

- **NEVER fabricate** experience, skills, achievements, or metrics
- **NEVER change** company names, dates, institutions, or factual claims
- **ONLY adjust** emphasis, wording, ordering, and visibility flags
- Each variant gets an auto-generated 6-char hex slug stored in its `meta.yaml`
- Variants deploy to `https://gabrielelkind.com/v/<slug>/` (unlisted, blocked via `robots.txt`)
