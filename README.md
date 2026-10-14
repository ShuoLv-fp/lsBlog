# Shuo Lv / Field Notes

Research summaries, practical experience, and notes from life beyond the lab.

## Local Development

Requires Hugo Extended 0.166.0. PaperMod's source is included in this repository.

```bash
hugo server --buildDrafts
```

The local site is available at the URL printed by Hugo, under the `/lsBlog/` base path.

## Production Build

```bash
hugo --minify --gc --cleanDestinationDir
python3 -m unittest discover -s tests -v
```

## Content

Public notes live in `content/notes/`. Use one category per note:

- `Research Synthesis` for literature, methods, and technical notes.
- `Personal Experience` for applications, engineering practice, and lessons learned.
- `Life & Elsewhere` for notes outside the lab.

Tags describe the subject. New notes start as drafts:

```bash
hugo new content notes/my-note.md
```

See the public formatting reference at `/page/formatting-reference/` for supported Markdown and shortcodes.

## Deployment

Pushes to `main` are built and deployed to `gh-pages` by `.github/workflows/hugo.yml`. Generated `public/` files are never committed on the source branch.

## Repository Map

- `content/`: published pages and notes
- `assets/`: project CSS and JavaScript
- `layouts/`: project-owned Hugo templates and shortcodes
- `archive/research-experiments/`: unpublished standalone research scratch work
- `tests/`: source and generated-site regression checks
- `themes/PaperMod/`: bundled upstream theme source; put customizations in `layouts/` and `assets/`
