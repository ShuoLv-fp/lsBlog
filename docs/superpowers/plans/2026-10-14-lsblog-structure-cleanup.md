# lsBlog Structure Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `lsBlog` into a focused Hugo repository, preserve five public notes and their old URLs, remove retired assets and deployment paths, and add a public formatting reference page.

**Architecture:** Keep PaperMod as an untouched submodule and make all site behavior project-owned through Hugo content, configuration, overrides, shortcodes, CSS, and stdlib regression tests. Published notes live only in `content/notes/`; unrelated research scratch work lives outside Hugo under `archive/research-experiments/`; GitHub Actions is the sole deployment path.

**Tech Stack:** Hugo Extended 0.166.0, PaperMod, Go templates, Markdown/Goldmark, CSS, Python `unittest`, GitHub Actions.

## Global Constraints

- Preserve the current bodies of all five public notes; only front matter and filenames may change.
- Preserve the user's uncommitted ULF MRI edits and untracked Games note.
- Keep `Agent Engineering Notes` and `Games and Interactive Worlds` public.
- Preserve every previous `/drafts/.../` route with a Hugo alias.
- Use only `Research Synthesis`, `Personal Experience`, and `Life & Elsewhere` as public categories.
- Do not edit the PaperMod submodule.
- Remove `static/fgo-wiki/` and verify `/lsBlog/fgo-wiki/` disappears from a clean build.
- Build with Hugo Extended 0.166.0.
- Do not push, merge, deploy, or discard the branch.

---

### Task 1: Lock the Cleanup Contract in Tests

**Files:**
- Modify: `tests/test_lsblog_visual_refresh.py`

**Interfaces:**
- Consumes: current repository layout and the approved design document.
- Produces: source contracts for `content/notes/`, the archive, retired-path absence, note body hashes, formatting reference hooks, and generated routes.

- [ ] **Step 1: Add failing structure and content tests.**

Add imports and constants:

```python
import hashlib

NOTE_BODIES = {
    "agent-engineering.md": "52c0df0564264dfad612527553e658030a93e449a7a8a10dd4f97b179bf3193b",
    "games.md": "52c0df0564264dfad612527553e658030a93e449a7a8a10dd4f97b179bf3193b",
    "phd-application-insights.md": "1374d21ce962c52e6b6251905a979b3dd8913f3beeb0ae4da979fb895c6ae51f",
    "ulf-mri-learning-blueprint.md": "a0927f1f6294ab51d75f89988a8d48ea13e4d1f8574501fa0542eaba5cf04cef",
    "functional-connectivity-notes.md": "2c30e197f0548d9e5b4eeca32ad94c86a5ab43e187b39d59b2c1175fd0595577",
}

def markdown_body(text):
    return text.split("---", 2)[2].lstrip("\n")
```

Add tests:

```python
def test_repository_has_one_public_note_section(self):
    notes = ROOT / "content/notes"
    self.assertEqual({path.name for path in notes.glob("*.md")}, set(NOTE_BODIES))
    self.assertFalse((ROOT / "content/drafts").exists())
    self.assertFalse((ROOT / "content/posts").exists())
    self.assertIn('mainSections = ["notes"]', (ROOT / "hugo.toml").read_text())

def test_note_bodies_survive_the_move(self):
    for name, expected in NOTE_BODIES.items():
        with self.subTest(note=name):
            text = (ROOT / "content/notes" / name).read_text()
            digest = hashlib.sha256(markdown_body(text).encode()).hexdigest()
            self.assertEqual(digest, expected)

def test_notes_have_unique_metadata_and_legacy_aliases(self):
    text = "\n".join(path.read_text() for path in (ROOT / "content/notes").glob("*.md"))
    for title in (
        "A Learning Blueprint for Computational Ultra-Low-Field MRI",
        "Functional Connectivity and Its Generation Methods",
        "Agent Engineering Notes",
        "PhD Application Interview Notes",
        "Games and Interactive Worlds",
    ):
        self.assertEqual(text.count(f'title: "{title}"'), 1)
    for route in (
        "/drafts/ulf_mri_exercise/",
        "/drafts/research_draft/",
        "/drafts/agent_engineering/",
        "/drafts/phd_application_insights/",
        "/drafts/games/",
    ):
        self.assertIn(route, text)

def test_retired_project_paths_are_absent(self):
    for relative in (
        "static/fgo-wiki", "config.yml", "deploy.sh", "deploy.ps1",
        "DEPLOY_GUIDE.md", "hugo_tmp", "content/posts/my-first-post.md",
        "layouts/_default/social.html",
    ):
        self.assertFalse((ROOT / relative).exists(), relative)

def test_research_experiments_are_archived(self):
    archive = ROOT / "archive/research-experiments"
    for relative in (
        "README.md", "CauchyKovalevskaya_bac3ecd234c3497cba4cf4e3efefc330.lean",
        "DeepSeek-Prover-V2.py", "MathNL.md", "Valid_models.md",
        "bench.md.txt", "lean_proof.txt", "lean_proof_Goedel-Prover-V2.txt",
        "Lean_AI_research/Goedel_1.png", "Lean_AI_research/Goedel_2.png",
        "Lean_AI_research/Goedel_3.png", "Lean_AI_research/Goedel_4.png",
    ):
        self.assertTrue((archive / relative).exists(), relative)

def test_formatting_reference_and_shortcodes_exist(self):
    reference = (ROOT / "content/page/formatting-reference.md").read_text()
    for marker in ("math: true", "searchHidden: true", "## Typography",
                   "## Lists", "## Code", "## Mathematics", "## Rich blocks",
                   "## Media", "## Stress tests"):
        self.assertIn(marker, reference)
    for name in ("callout", "columns", "timeline", "pullquote", "gallery"):
        self.assertTrue((ROOT / "layouts/shortcodes" / f"{name}.html").exists())
```

- [ ] **Step 2: Run the new tests and verify the expected failures.**

Run:

```bash
python3 -m unittest discover -s tests -v
```

Expected: existing visual tests pass; the new cleanup tests fail because `content/notes/`, archive paths, formatting reference, and shortcodes do not yet exist and retired paths still exist.

- [ ] **Step 3: Commit only the failing tests.**

```bash
git add tests/test_lsblog_visual_refresh.py
git commit -m "test: define lsBlog cleanup contract"
```

---

### Task 2: Clean the Repository Root and Archive Research Work

**Files:**
- Modify: `.gitignore`
- Create: `README.md`
- Create: `archive/research-experiments/README.md`
- Move unchanged: `CauchyKovalevskaya_bac3ecd234c3497cba4cf4e3efefc330.lean`
- Move unchanged: `DeepSeek-Prover-V2.py`
- Move unchanged: `Lean_AI_research/`
- Move unchanged: `MathNL.md`
- Move unchanged: `Valid_models.md`
- Move unchanged: `bench.md.txt`
- Move unchanged: `lean_proof.txt`
- Move unchanged: `lean_proof_Goedel-Prover-V2.txt`
- Delete: `.DS_Store`
- Delete: `content/.DS_Store`
- Delete: `config.yml`
- Delete: `deploy.sh`
- Delete: `deploy.ps1`
- Delete: `DEPLOY_GUIDE.md`
- Delete: `hugo_tmp/`
- Delete: `static/fgo-wiki/`
- Delete: `static/images/`
- Delete: `layouts/_default/social.html`
- Remove generated local directories: `public/`, `resources/`, `.hugo_build.lock`
- Test: `tests/test_lsblog_visual_refresh.py`

**Interfaces:**
- Consumes: structure tests from Task 1.
- Produces: a Hugo-focused root, a non-published research archive, and contributor documentation.

- [ ] **Step 1: Extend `.gitignore` for local and generated artifacts.**

Use:

```gitignore
# Hugo output
/public/
/resources/_gen/
/assets/jsconfig.json
hugo_stats.json
.hugo_build.lock

# Operating-system metadata
.DS_Store
**/.DS_Store

# Local tools
.superpowers/
/hugo_tmp/
```

- [ ] **Step 2: Move the research files without changing their bytes.**

Use exact destination paths under `archive/research-experiments/` and keep `Lean_AI_research/` as one nested directory. Add this archive README:

```markdown
# Research Experiments

This directory preserves standalone Lean, Python, mathematics, and benchmark scratch work that predates the current blog structure. It is intentionally outside `content/` and is not published by Hugo.

The files are retained for reference only. Blog notes belong in `content/notes/`.
```

Verify moved file hashes against the source hashes recorded in the design work:

```bash
shasum -a 256 archive/research-experiments/CauchyKovalevskaya_bac3ecd234c3497cba4cf4e3efefc330.lean \
  archive/research-experiments/DeepSeek-Prover-V2.py \
  archive/research-experiments/MathNL.md \
  archive/research-experiments/Valid_models.md \
  archive/research-experiments/bench.md.txt \
  archive/research-experiments/lean_proof.txt \
  archive/research-experiments/lean_proof_Goedel-Prover-V2.txt \
  archive/research-experiments/Lean_AI_research/*
```

- [ ] **Step 3: Remove retired tracked content and exact generated targets.**

Remove only the paths listed in the Files block. Do not use a repository-wide recursive deletion and do not touch `themes/PaperMod`.

- [ ] **Step 4: Add the root README.**

The README must include these exact sections and commands:

````markdown
# Shuo Lv / Field Notes

Research summaries, practical experience, and notes from life beyond the lab.

## Local development

Requires Hugo Extended 0.166.0 and initialized Git submodules.

```bash
git submodule update --init --recursive
hugo server --buildDrafts
```

## Production build

```bash
hugo --minify --gc --cleanDestinationDir
python3 -m unittest discover -s tests -v
```

## Content

Public notes live in `content/notes/`. Use one category per note: `Research Synthesis`, `Personal Experience`, or `Life & Elsewhere`. Tags describe the subject. New notes start as drafts.

```bash
hugo new content notes/my-note.md
```

See the public formatting reference at `/page/formatting-reference/` for supported Markdown and shortcodes.

## Deployment

Pushes to `main` are built and deployed to `gh-pages` by `.github/workflows/hugo.yml`. Generated `public/` files are never committed on the source branch.

## Repository map

- `content/`: published pages and notes
- `assets/`: project CSS and JavaScript
- `layouts/`: project-owned Hugo templates and shortcodes
- `archive/research-experiments/`: unpublished standalone research scratch work
- `tests/`: source and generated-site regression checks
- `themes/PaperMod/`: upstream theme submodule
````

- [ ] **Step 5: Run the relevant structure tests.**

Run:

```bash
python3 -m unittest tests.test_lsblog_visual_refresh.SourceContractTests.test_retired_project_paths_are_absent tests.test_lsblog_visual_refresh.SourceContractTests.test_research_experiments_are_archived -v
```

Expected: PASS.

- [ ] **Step 6: Commit root cleanup separately.**

Stage the explicit removed, moved, and created paths plus `.gitignore`; inspect `git status --short`; then commit:

```bash
git commit -m "chore: organize lsBlog repository"
```

---

### Task 3: Move Public Notes Into the Canonical Section

**Files:**
- Modify: `hugo.toml`
- Modify: `archetypes/default.md`
- Create from current body: `content/notes/ulf-mri-learning-blueprint.md`
- Create from current body: `content/notes/functional-connectivity-notes.md`
- Create from current body: `content/notes/agent-engineering.md`
- Create from current body: `content/notes/phd-application-insights.md`
- Create from current body: `content/notes/games.md`
- Delete after exact move: `content/drafts/`
- Delete: `content/posts/my-first-post.md`
- Modify: `tests/test_lsblog_visual_refresh.py`

**Interfaces:**
- Consumes: the body hashes defined in Task 1.
- Produces: five public notes in section `notes`, with `summary`, one approved category, descriptive tags, and legacy aliases.

- [ ] **Step 1: Set the only public feed section.**

Add under `[params]` in `hugo.toml`:

```toml
mainSections = ["notes"]
```

- [ ] **Step 2: Move each note and replace only its front matter.**

Use these exact front matter blocks:

```yaml
---
title: "A Learning Blueprint for Computational Ultra-Low-Field MRI"
date: 2026-09-21
draft: false
summary: "A staged roadmap from MRI physics and k-space foundations to EMI-aware reconstruction and reliable low-field neuroimaging."
tags: ["MRI", "AI for Science", "Neuroimaging"]
categories: ["Research Synthesis"]
aliases: ["/drafts/ulf_mri_exercise/"]
math: true
---
```

```yaml
---
title: "Functional Connectivity and Its Generation Methods"
date: 2026-04-07
draft: false
summary: "Working notes on functional connectivity generation, spatial statistics, and permutation testing."
tags: ["Connectomics", "Neuroscience", "Statistics"]
categories: ["Research Synthesis"]
aliases: ["/drafts/research_draft/"]
---
```

```yaml
---
title: "Agent Engineering Notes"
date: 2026-04-07
draft: false
summary: "An evolving notebook for practical patterns in agent engineering, evaluation, and tool use."
tags: ["AI Agents", "Engineering"]
categories: ["Personal Experience"]
aliases: ["/drafts/agent_engineering/"]
---
```

```yaml
---
title: "PhD Application Interview Notes"
date: 2026-09-20
draft: false
summary: "Questions and reflections collected from a PhD interview process."
tags: ["PhD Applications", "Interviews"]
categories: ["Personal Experience"]
aliases: ["/drafts/phd_application_insights/"]
---
```

```yaml
---
title: "Games and Interactive Worlds"
date: 2026-04-07
draft: false
summary: "An evolving space for notes on games, interactive systems, and the experiences they create."
tags: ["Games", "Interactive Media"]
categories: ["Life & Elsewhere"]
aliases: ["/drafts/games/"]
---
```

Append the current body after the new front matter without editing body bytes.

- [ ] **Step 3: Update the new-note archetype.**

Use:

```toml
+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = '{{ .Date }}'
draft = true
summary = ''
tags = []
categories = []
+++
```

- [ ] **Step 4: Run note structure and hash tests.**

Run:

```bash
python3 -m unittest tests.test_lsblog_visual_refresh.SourceContractTests.test_repository_has_one_public_note_section tests.test_lsblog_visual_refresh.SourceContractTests.test_note_bodies_survive_the_move tests.test_lsblog_visual_refresh.SourceContractTests.test_notes_have_unique_metadata_and_legacy_aliases -v
```

Expected: PASS for five notes; the body SHA-256 values exactly match the pre-move values.

- [ ] **Step 5: Commit the content migration.**

Stage only `hugo.toml`, the archetype, removed old note paths, and new note paths. Confirm `content/.DS_Store` is already removed by Task 2. Commit:

```bash
git commit -m "content: organize published field notes"
```

---

### Task 4: Add the Public Formatting Reference

**Files:**
- Create: `content/page/formatting-reference.md`
- Create: `layouts/shortcodes/callout.html`
- Create: `layouts/shortcodes/columns.html`
- Create: `layouts/shortcodes/timeline.html`
- Create: `layouts/shortcodes/pullquote.html`
- Create: `layouts/shortcodes/gallery.html`
- Modify: `assets/css/extended/lsblog.css`
- Modify: `content/page/about.md`
- Create: `layouts/partials/footer.html`
- Modify: `tests/test_lsblog_visual_refresh.py`

**Interfaces:**
- Consumes: `.Inner`, named shortcode parameters, the site's design tokens, and the formatting page's `.RelPermalink`.
- Produces: reusable article-format components and a public compatibility reference excluded from feeds and search.

- [ ] **Step 1: Add failing generated-output expectations.**

Add:

```python
def test_generated_formatting_reference_is_public_but_not_indexed(self):
    reference = Path("/tmp/lsblog-public/page/formatting-reference/index.html")
    if not reference.exists():
        self.skipTest("Hugo output not built")
    html = reference.read_text()
    for marker in ("reference-callout", "reference-columns", "reference-timeline",
                   "reference-pullquote", "reference-gallery", "katex"):
        self.assertIn(marker, html)
    home = Path("/tmp/lsblog-public/index.html").read_text()
    search = json.loads(Path("/tmp/lsblog-public/index.json").read_text())
    self.assertNotIn("Formatting Reference", home)
    self.assertNotIn("Formatting Reference", {item["title"] for item in search})

def test_generated_site_has_no_retired_fgo_route(self):
    self.assertFalse(Path("/tmp/lsblog-public/fgo-wiki").exists())
```

Run the two tests after a build and verify they fail because the reference does not exist yet and stale output is removed only after a clean build.

- [ ] **Step 2: Implement semantic project shortcodes.**

`callout.html` validates `type` against `note`, `tip`, `warning`, and `danger`, defaults to `note`, and renders a labeled `<aside>` with `.Inner | markdownify`.

```go-html-template
{{- $type := .Get "type" | default "note" -}}
{{- $allowed := slice "note" "tip" "warning" "danger" -}}
{{- if not (in $allowed $type) }}{{ errorf "Unsupported callout type %q" $type }}{{ end -}}
<aside class="reference-callout reference-callout--{{ $type }}">
  <p class="reference-callout__label">{{ .Get "title" | default ($type | title) }}</p>
  <div>{{ .Inner | markdownify }}</div>
</aside>
```

Use these complete templates:

```go-html-template
<!-- columns.html -->
<div class="reference-columns">{{ .Inner | markdownify }}</div>

<!-- timeline.html -->
<div class="reference-timeline">{{ .Inner | markdownify }}</div>

<!-- pullquote.html -->
<figure class="reference-pullquote">
  <blockquote>{{ .Inner | markdownify }}</blockquote>
  {{- with .Get "cite" }}<figcaption>{{ . }}</figcaption>{{ end -}}
</figure>

<!-- gallery.html -->
<figure class="reference-gallery">{{ .Inner | markdownify }}</figure>
```

`gallery` keeps Markdown image alt text intact; gallery captions are ordinary Markdown text inside the outer figure.

- [ ] **Step 3: Create the complete reference page.**

Use front matter:

```yaml
---
title: "Formatting Reference"
description: "A live reference for Markdown, HTML, mathematics, and reusable article blocks supported by Field Notes."
date: 2026-10-14
draft: false
math: true
showToc: true
searchHidden: true
hideMeta: true
---
```

Create these sections with both rendered examples and fenced source samples:

```markdown
## Typography
### Heading level three
#### Heading level four
##### Heading level five
###### Heading level six

**Bold**, *italic*, ***combined***, ~~strikethrough~~, `inline code`,
<mark>highlight</mark>, <ins>inserted text</ins>, H<sub>2</sub>O,
x<sup>2</sup>, <abbr title="Magnetic resonance imaging">MRI</abbr>,
and <kbd>Command</kbd> + <kbd>K</kbd>.

## Links

Include internal, external, email, and autolink examples.

## Lists

Include ordered, unordered, nested, task, and definition lists.

## Quotations and footnotes

Include nested and multi-paragraph quotes, a `pullquote`, a citation, and a footnote with back reference.

## Tables

Include an aligned compact table and a deliberately wide MRI comparison table.

## Code

Include inline code, a fenced Python block, and Hugo `highlight` with line numbers and highlighted lines.

## Mathematics

Include `$S(k_x,k_y)=\int\int \rho(x,y)e^{-i2\pi(k_xx+k_yy)}dxdy$` and a display equation.

## Rich blocks

Render all four `callout` variants, `columns`, `timeline`, PaperMod `collapse`, and `pullquote`.

## Media

Render a linked author portrait with explicit dimensions and caption, followed by a `gallery` example using the same stable remote branded asset with distinct alt text.

## Stress tests

Include mixed Chinese/English copy, a very long URL, a no-space token, a wide table, and a long code line.
```

Escape shortcode syntax inside fenced source examples with Hugo comment escapes so examples display without executing twice.

- [ ] **Step 4: Add reference component styling.**

Append focused CSS using existing tokens. Requirements:

```css
.reference-callout,
.reference-pullquote {
    border-left: 3px solid var(--research-blue);
    padding: 14px 18px;
    background: var(--surface);
}

.reference-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

.reference-timeline {
    border-left: 1px solid var(--rule);
    padding-left: 24px;
}

.reference-gallery {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.post-content kbd {
    border: 1px solid var(--rule);
    border-bottom-width: 2px;
    border-radius: 4px;
    padding: 2px 6px;
    background: var(--surface);
    font-family: Monaco, Consolas, monospace;
}

@media (max-width: 768px) {
    .reference-columns,
    .reference-gallery {
        grid-template-columns: minmax(0, 1fr);
    }
}
```

Add distinct accessible border colors for tip, warning, and danger, local overflow for reference tables/code/math, dark-mode compatibility through existing variables, and no motion beyond the existing reduced-motion rules.

- [ ] **Step 5: Link the utility page from About and the footer.**

Add a concise link to `content/page/about.md`. Copy PaperMod's current `footer.html` into the project and add one link resolved from `site.GetPage "/page/formatting-reference"`; preserve copyright, Hugo/PaperMod attribution, scroll-to-top, theme toggle, and code-copy scripts.

- [ ] **Step 6: Build and run reference tests.**

Run:

```bash
/tmp/lsblog-hugo.QB2f62/expanded/Payload/hugo --minify --gc --cleanDestinationDir --destination /tmp/lsblog-public
python3 -m unittest discover -s tests -v
```

Expected: build exits 0; all source and generated-output tests pass; the only accepted warning is PaperMod's upstream `.Language.LanguageCode` deprecation.

- [ ] **Step 7: Commit the reference page.**

```bash
git add content/page/about.md content/page/formatting-reference.md layouts/shortcodes layouts/partials/footer.html assets/css/extended/lsblog.css tests/test_lsblog_visual_refresh.py
git commit -m "feat: add formatting reference"
```

---

### Task 5: Verify the Clean Site End to End

**Files:**
- Modify only if verification finds a task-scoped defect.
- Generated only: `/tmp/lsblog-public/`

**Interfaces:**
- Consumes: the reorganized repository and pinned Hugo binary.
- Produces: fresh build, test, browser, and Git evidence for completion.

- [ ] **Step 1: Run a fresh clean build.**

```bash
/tmp/lsblog-hugo.QB2f62/expanded/Payload/hugo --minify --gc --cleanDestinationDir --destination /tmp/lsblog-public
```

Expected: exit 0, five canonical `/notes/` articles, five `/drafts/` alias redirects, formatting reference, and no `fgo-wiki` output.

- [ ] **Step 2: Run the full regression suite and source checks.**

```bash
python3 -m unittest discover -s tests -v
git diff --check
rg -n '/my-blog/|href="/(categories|tags|archives|search)/' /tmp/lsblog-public -g '*.html' -g '*.json'
```

Expected: all tests pass; `git diff --check` is silent; the generated-path search is silent.

- [ ] **Step 3: Inspect generated routes and redirects.**

Verify these exact paths:

```text
/tmp/lsblog-public/index.html
/tmp/lsblog-public/notes/agent-engineering/index.html
/tmp/lsblog-public/notes/games/index.html
/tmp/lsblog-public/notes/phd-application-insights/index.html
/tmp/lsblog-public/notes/ulf-mri-learning-blueprint/index.html
/tmp/lsblog-public/notes/functional-connectivity-notes/index.html
/tmp/lsblog-public/page/formatting-reference/index.html
/tmp/lsblog-public/drafts/agent_engineering/index.html
/tmp/lsblog-public/drafts/games/index.html
/tmp/lsblog-public/drafts/phd_application_insights/index.html
/tmp/lsblog-public/drafts/ulf_mri_exercise/index.html
/tmp/lsblog-public/drafts/research_draft/index.html
```

Confirm each old route has a canonical refresh target under `/lsBlog/notes/`.

- [ ] **Step 4: Perform browser verification.**

At desktop `1280x720` and mobile `390x844`, verify:

- home shows five unique note titles and three configured category links;
- category counts are correct;
- old aliases navigate to canonical notes;
- About and footer open Formatting Reference;
- formatting reference has one `h1`, ordered headings, visible TOC, rendered KaTeX, styled callouts, columns, timeline, pull quote, gallery, collapse, tables, and code-copy controls;
- light and dark themes render without overlap;
- keyboard focus is visible;
- wide examples scroll locally and page-level `scrollWidth <= innerWidth`;
- `/lsBlog/fgo-wiki/` returns 404;
- console contains no errors.

Reset the browser viewport, leave the formatting reference open, and mark it deliverable.

- [ ] **Step 5: Review repository and commit state.**

```bash
git status --short
git log --oneline -8
git diff main...HEAD --stat
```

Expected: only intentional commits plus any explicitly preserved user changes; no generated output, `.DS_Store`, or untracked Games source remains at the old path.

## Self-Review Checklist

- Spec coverage: Tasks 1-5 cover repository cleanup, FGO removal, research archival, five-note migration, aliases, formatting reference, docs, build, and browser verification.
- Placeholder scan: every task names exact paths, front matter, class hooks, commands, expected outcomes, and commit boundaries.
- Interface consistency: `content/notes/`, `mainSections`, shortcode class names, formatting-reference route, alias routes, and test output paths match across all tasks.
