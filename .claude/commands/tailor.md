Tailor the resume and website for a specific job application.

## Instructions

The user will provide a job description (either pasted or as a file path). Your job is to create a variant of the base content that emphasizes the most relevant skills and experience for this specific role.

## Steps

1. **Read the base content** in `src/content/` — all experience, education, projects, skills, and about files.
2. **Analyze the job description** — identify key technologies, skills, domains, and experience levels they're looking for.
3. **Create the variant directory** at `variants/$ARGUMENTS/` with:

### Required files:

**`meta.yaml`** — variant metadata:
```yaml
slug: "<6-char random hex>"  # Generate this randomly, e.g. "a3f2b1"
targetCompany: "<Company Name>"
targetRole: "<Role Title>"
generatedAt: "<YYYY-MM-DD>"
notes: "<Brief note on what was emphasized>"
jobDescription: |
  <Full job description text>
```

**Override files** — ONLY for content that should change. Mirror the `src/content/` directory structure. Only create files that differ from base.

### What to modify:

- **`experience/*.md`** — Adjust `short`, `highlights`, and `tags` to emphasize relevant skills. Reorder `tags` to front-load matching ones. May change `order` to promote a more relevant role. May toggle `resumeVisible` to show/hide entries.
- **`skills.yaml`** — Reorder categories and items within categories to lead with the most relevant. May adjust `level` if borderline.
- **`about/bio.md`** — Adjust `headline` and `short` to match what the role values. Body text can be tweaked too.
- **`projects/*.md`** — Adjust `short` to emphasize relevant aspects. May toggle `resumeVisible`.

### Rules — NEVER BREAK THESE:

- **NEVER fabricate** experience, skills, achievements, or metrics that don't exist in the base content
- **NEVER change** company names, dates, institutions, degree names, or factual claims
- **ONLY adjust** emphasis, wording, ordering, and visibility
- **Keep the exact same frontmatter schema** — don't add or remove fields
- **Preserve the markdown body** unless making minor emphasis adjustments

4. **Report what changed** — show the user a summary of what was adjusted and why.
5. **Tell the user** how to preview: `VARIANT=$ARGUMENTS npm run dev` and how to build: `VARIANT=$ARGUMENTS npm run build`