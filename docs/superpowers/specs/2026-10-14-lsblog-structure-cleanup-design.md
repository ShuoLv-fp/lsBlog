# lsBlog Structure and Content Cleanup Design

Date: 2026-10-14

## Objective

Turn `lsBlog` into a focused Hugo repository whose directory layout clearly separates publishable notes, project code, archived research experiments, and generated output. Remove the retired FGO wiki and obsolete deployment paths, preserve current article bodies, and add a public formatting reference that documents every presentation pattern intentionally supported by the blog.

## Approved Direction

Use a conservative structural cleanup:

- Keep the Hugo site, PaperMod submodule, project-owned templates, tests, and GitHub Actions deployment.
- Remove the retired FGO wiki, obsolete manual deployment files, generated output, unused static images, tracked Finder metadata, and the starter post.
- Preserve unrelated Lean, Python, and mathematics work under `archive/research-experiments/` instead of deleting it.
- Move all five public notes from `content/drafts/` to one canonical `content/notes/` section.
- Keep `Agent Engineering` and `Games` public even though their bodies are placeholders that will be expanded later.
- Preserve old `/drafts/.../` article URLs with Hugo aliases.
- Add a public formatting reference under `/page/formatting-reference/`; link it only from About and the footer, and exclude it from the home feed, taxonomies, archives, and search index.

## Target Repository Layout

```text
lsBlog/
├── .github/workflows/       # the only deployment path
├── archetypes/              # new-note defaults
├── archive/
│   └── research-experiments/
├── assets/                  # project CSS and JavaScript
├── content/
│   ├── notes/               # all public notebook entries
│   ├── page/                # About and formatting reference
│   ├── _index.md
│   ├── archives.md
│   ├── search.md
│   ├── categories/_index.md
│   └── tags/_index.md
├── docs/                    # design and implementation records
├── layouts/                 # project-owned PaperMod overrides
├── tests/                   # source and generated-output checks
├── themes/PaperMod/         # unchanged submodule
├── .gitignore
├── .gitmodules
├── README.md
└── hugo.toml
```

The following root-level files and directories are removed because they are generated, obsolete, or duplicated by GitHub Actions:

- `.DS_Store`, `content/.DS_Store`
- `public/`, `resources/`, `.hugo_build.lock`
- `config.yml`
- `deploy.sh`, `deploy.ps1`, `DEPLOY_GUIDE.md`
- `hugo_tmp/`
- `static/fgo-wiki/`
- unused `static/images/` assets, including the stale Aaron portrait
- `content/posts/my-first-post.md`
- the obsolete empty `layouts/_default/social.html` override

Generated directories remain ignored and reproducible. Deleted tracked files remain recoverable through Git history.

## Research Experiment Archive

The following non-blog materials move without content edits to `archive/research-experiments/`:

- `CauchyKovalevskaya_bac3ecd234c3497cba4cf4e3efefc330.lean`
- `DeepSeek-Prover-V2.py`
- `Lean_AI_research/`
- `MathNL.md`
- `Valid_models.md`
- `bench.md.txt`
- `lean_proof.txt`
- `lean_proof_Goedel-Prover-V2.txt`

An archive README explains that these files are retained research scratch work and are not part of the Hugo build. This makes ownership explicit without introducing a second application into the repository.

## Content Model

`content/notes/` is the only feed section. `params.mainSections` is set explicitly to `notes`, so adding another directory cannot accidentally publish it on the home page.

| Current source | Canonical source | Public title | Category | Old URL |
| --- | --- | --- | --- | --- |
| `drafts/ULF_MRI_exercise.md` | `notes/ulf-mri-learning-blueprint.md` | `A Learning Blueprint for Computational Ultra-Low-Field MRI` | `Research Synthesis` | `/drafts/ulf_mri_exercise/` |
| `drafts/research_draft.md` | `notes/functional-connectivity-notes.md` | `Functional Connectivity and Its Generation Methods` | `Research Synthesis` | `/drafts/research_draft/` |
| `drafts/Agent_engineering.md` | `notes/agent-engineering.md` | `Agent Engineering Notes` | `Personal Experience` | `/drafts/agent_engineering/` |
| `drafts/PhD_application_insights.md` | `notes/phd-application-insights.md` | `PhD Application Interview Notes` | `Personal Experience` | `/drafts/phd_application_insights/` |
| `drafts/Games.md` | `notes/games.md` | `Games and Interactive Worlds` | `Life & Elsewhere` | `/drafts/games/` |

Only front matter and filenames change. Article bodies, including the user's uncommitted ULF MRI edits, are preserved byte-for-byte apart from the final newline already present in the working tree. Tags are made descriptive rather than using placeholder `Blog`, `Hugo`, or generic `Research` labels.

The archetype produces new notes in a draft state with the expected title, date, category, tags, and summary fields. The README documents the three-category model and the command for creating a note.

## Formatting Reference

Create `content/page/formatting-reference.md` with `math: true`, table of contents enabled, and `searchHidden: true`. It is a public utility page, not a notebook entry, so it has no category or tags and is not included in home, archive, or taxonomy counts.

The page is a live compatibility reference. Each section renders an example and shows the exact Markdown, HTML, built-in shortcode, or project shortcode required to reproduce it. It covers:

- heading levels, paragraphs, line breaks, horizontal rules, and anchored headings;
- bold, italic, combined emphasis, strikethrough, inline code, mark, insert, superscript, subscript, abbreviation, and keyboard input;
- internal, external, email, and automatic links;
- ordered, unordered, nested, task, and definition lists;
- block quotes, multi-paragraph quotes, pull quotes, and citations;
- footnotes and back references;
- compact and wide responsive tables;
- fenced code, syntax highlighting, line numbers, highlighted lines, and copy controls;
- inline and display mathematics through the existing KaTeX integration;
- responsive images, linked images, captions, attribution, and figure alignment;
- collapsible details using PaperMod's existing `collapse` shortcode;
- note, tip, warning, and danger callouts;
- a two-column comparison block that collapses cleanly on mobile;
- a vertical timeline or step sequence;
- a small responsive image gallery;
- long URLs, long code lines, mixed Chinese/English text, and other overflow stress cases.

Project shortcodes are intentionally small and presentation-only: `callout`, `columns`, `timeline`, `pullquote`, and `gallery`. They accept Markdown inner content, emit semantic HTML, have visible keyboard focus where interactive, and share the site's light/dark tokens. No client-side framework or third-party diagram runtime is introduced.

The figure examples reuse an existing branded author asset rather than retaining unrelated stock or abandoned article images. Every image has meaningful alternative text; decorative examples use empty alt text.

About gains a short `Formatting reference` link. A project-owned `layouts/partials/footer.html` override adds the same link to the footer using the formatting page's `.RelPermalink`, so `/lsBlog/` remains correct. The override preserves PaperMod's copyright, scroll-to-top, theme-toggle, and code-copy behavior.

## URL and Build Compatibility

Every moved public article receives an `aliases` entry for its previous route. Alias output is verified as an HTML redirect to the new canonical note. Internal templates use `.RelPermalink`; no root-relative navigation or hard-coded local path is added.

The GitHub Actions workflow remains the sole deployment mechanism and continues to build with Hugo Extended 0.166.0. PaperMod remains an untouched submodule. `README.md` replaces the obsolete deployment guide with:

- prerequisites;
- local preview and production-build commands;
- repository map;
- note creation and publication workflow;
- category and tag conventions;
- formatting-reference link;
- GitHub Actions deployment behavior.

## Failure and Edge Cases

- A missing or invalid category keeps the existing `Unsorted` row label but never creates a permanent sidebar category.
- The two placeholder public notes render concise front-matter summaries so the home page does not expose their one-line bodies as unexplained content.
- Formatting examples that depend on JavaScript are excluded; all custom formats render useful content without JavaScript.
- Wide tables, code, galleries, long URLs, and mathematical expressions scroll or wrap locally and never create page-level overflow.
- Remote sample media failure leaves stable dimensions, useful alt text, and readable surrounding content.
- The `/fgo-wiki/` route is intentionally removed and must return 404 after a clean build.

## Verification

Add regression checks for:

- the target root layout and absence of retired files;
- `.DS_Store`, generated output, and local tool directories in `.gitignore`;
- all five public notes under `content/notes/` with unique titles, approved categories, useful tags, summaries, and old-route aliases;
- explicit `mainSections = ["notes"]`;
- the formatting-reference front matter, documented format sections, and project shortcode implementations;
- absence of `fgo-wiki`, stale profile assets, obsolete deploy paths, and generic placeholder metadata from generated output;
- successful Hugo Extended 0.166.0 build;
- valid home, note, category, tag, archive, search, About, formatting-reference, and old alias routes;
- no `/lsBlog/` path regressions;
- desktop and mobile formatting-reference rendering, including dark mode, keyboard focus, local overflow, and page-level width;
- no browser console errors.

The final Git diff must preserve the user's current ULF MRI body and must not silently rewrite archived research experiment contents.

## Out of Scope

- Rewriting substantive article bodies.
- Completing the two placeholder articles.
- Adding new category types beyond the approved three.
- Replacing PaperMod or editing the PaperMod submodule.
- Deploying, pushing, or merging the branch.
