# lsBlog Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Research Notebook Index design for `lsBlog`, matching the personal homepage's visual language while preserving PaperMod's reading and navigation features.

**Architecture:** Keep PaperMod as a submodule and place all project-specific behavior in Hugo project overrides. A shared category-map partial and shared article-row partial feed the home, taxonomy, archive, and search-adjacent list views; one extended stylesheet owns the visual system and responsive behavior.

**Tech Stack:** Hugo Extended 0.166.0, PaperMod, Hugo templates, CSS, Markdown, Python `unittest`/stdlib checks, GitHub Actions.

## Global Constraints

- Build with Hugo Extended 0.166.0, matching `.github/workflows/hugo.yml`.
- Do not edit files inside `themes/PaperMod`.
- Preserve existing user-written draft bodies and unrelated `static/fgo-wiki` files.
- Use the approved palette: `#224b8d`, `#fbfcfe`, `#ffffff`, `#29313a`, `#717b86`, `#dfe5ed`.
- Use Georgia for display/article titles, Trebuchet MS with fallbacks for interface/body text, and Monaco/Consolas for compact metadata.
- Keep taxonomy counts dynamic from Hugo data; do not hard-code counts in templates.
- Keep the `/lsBlog/` base path correct through `relURL`, `absLangURL`, and Hugo-generated permalinks.
- Preserve light/dark themes, search, code-copy, reading time, breadcrumbs, sharing, and post navigation.

## File Map

- Create `layouts/partials/category_map.html`: dynamic category sidebar and mobile filter.
- Create `layouts/partials/notebook_intro.html`: home introduction and identity copy.
- Create `layouts/partials/article_row.html`: reusable rule-based article row.
- Modify `layouts/partials/extend_head.html`: project stylesheet and existing math metadata hooks.
- Create `layouts/partials/header.html`: project header override with blog/home links.
- Modify `layouts/partials/home_info.html`: home introduction wrapper using the real portrait asset.
- Modify `layouts/_default/list.html`: notebook home/list structure and shared rows.
- Create `layouts/_default/single.html`: article reading shell and shared styling hooks.
- Modify `layouts/_default/archives.html`: archive rows using the shared article treatment.
- Modify `layouts/_default/taxonomy.html`, `layouts/categories/terms.html`, `layouts/tags/terms.html`: taxonomy pages with the shared map and rows.
- Create `assets/css/extended/lsblog.css`: all project-owned visual and responsive rules.
- Modify `hugo.toml`: identity, home copy, taxonomy labels, author links, and theme parameters.
- Modify `content/_index.md`, `content/page/about.md`, `content/posts/my-first-post.md`, and category front matter: remove public placeholders and normalize content labels without deleting draft bodies.
- Modify `.gitignore`: keep local `.superpowers/` visual-companion artifacts out of version control.
- Create `tests/test_lsblog_visual_refresh.py`: stdlib regression checks for source paths, CSS tokens, taxonomy labels, and generated HTML when available.

## Task 1: Define Site Data and Taxonomy Labels

**Files:**
- Modify: `hugo.toml`
- Modify: `content/drafts/Agent_engineering.md`
- Modify: `content/drafts/PhD_application_insights.md`
- Modify: `content/drafts/ULF_MRI_exercise.md`
- Modify: `content/drafts/research_draft.md`
- Modify: `content/posts/my-first-post.md`
- Modify: `content/_index.md`

**Interfaces:**
- Produces site params `.Site.Params.notebookCategories`, an ordered list of display labels and source taxonomy keys.
- Produces content with categories `Research Synthesis`, `Personal Experience`, or `Life & Elsewhere` where the intended mapping is unambiguous.

- [ ] **Step 1: Add a failing source regression test.**

```python
# tests/test_lsblog_visual_refresh.py
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class SourceContractTests(unittest.TestCase):
    def test_notebook_categories_are_configured(self):
        config = (ROOT / "hugo.toml").read_text()
        self.assertIn("Research Synthesis", config)
        self.assertIn("Personal Experience", config)
        self.assertIn("Life & Elsewhere", config)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test and verify the expected failure.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: FAIL because the new category labels and test file do not yet exist.

- [ ] **Step 3: Add explicit notebook data and normalize only category metadata.**

Add to `[params]` in `hugo.toml`:

```toml
notebookCategories = [
  { key = "research-synthesis", label = "Research Synthesis", description = "Literature, methods, and research notes." },
  { key = "personal-experience", label = "Personal Experience", description = "Applications, engineering practice, and lessons learned." },
  { key = "life-elsewhere", label = "Life & Elsewhere", description = "Notes from outside the lab." }
]
notebookHomeTitle = "A working notebook for research, code, and unfinished questions."
notebookHomeDescription = "Research summaries, practical experience, and occasional notes from life beyond the lab."
personalHomepage = "https://ShuoLv-fp.github.io/"
authorImage = "https://ShuoLv-fp.github.io/images/profile_202609.png"

[params.label]
text = "Shuo Lv / Field Notes"
```

Set `title = "Shuo Lv / Field Notes"` in the English language block, keep `author = "Shuo Lv"`, and replace the generic home info title/content with the notebook title/description. Map tracked research drafts to `Research Synthesis`, and map the PhD article and existing first post to `Personal Experience`. Leave the untracked `content/drafts/Games.md` unchanged. Set `content/posts/my-first-post.md` to `draft: true` until its body is rewritten. Keep article bodies unchanged. Add `.superpowers/` to `.gitignore`.

- [ ] **Step 4: Run the source test and commit the data-only change.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: PASS for the category assertions. Commit with `git add .gitignore hugo.toml content/drafts/Agent_engineering.md content/drafts/PhD_application_insights.md content/drafts/ULF_MRI_exercise.md content/drafts/research_draft.md content/posts/my-first-post.md content/_index.md tests/test_lsblog_visual_refresh.py && git commit -m "chore: define notebook taxonomy"`.

## Task 2: Add Shared Notebook Partials and Page Overrides

**Files:**
- Create: `layouts/partials/category_map.html`
- Create: `layouts/partials/notebook_intro.html`
- Create: `layouts/partials/article_row.html`
- Modify: `layouts/partials/extend_head.html`
- Create: `layouts/partials/header.html`
- Modify: `layouts/partials/home_info.html`
- Modify: `layouts/_default/list.html`
- Create: `layouts/_default/single.html`
- Modify: `layouts/_default/archives.html`
- Modify: `layouts/_default/taxonomy.html`
- Modify: `layouts/categories/terms.html`
- Modify: `layouts/tags/terms.html`

**Interfaces:**
- `partial "category_map.html"` consumes the current page and emits desktop navigation plus the mobile category filter from `.Site.Taxonomies.categories`.
- `partial "article_row.html" .` consumes a Hugo page and emits one semantic linked article row with ordinal, category, title, summary, date, and reading time.
- List, taxonomy, and archive templates continue to expose PaperMod pagination and existing page metadata.

- [ ] **Step 1: Extend the source test with required partial markers.**

```python
    def test_notebook_partials_have_required_hooks(self):
        partial_dir = ROOT / "layouts" / "partials"
        for name in ("category_map.html", "article_row.html", "notebook_intro.html"):
            self.assertTrue((partial_dir / name).exists())
        self.assertIn("category-map", (partial_dir / "category_map.html").read_text())
        self.assertIn("article-row", (partial_dir / "article_row.html").read_text())
```

- [ ] **Step 2: Run the test and verify it fails for missing partials.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: FAIL with missing partial assertions.

- [ ] **Step 3: Implement the category map and article row with dynamic Hugo data.**

`category_map.html` must sort `site.Params.notebookCategories`, resolve each label to a taxonomy page using `site.GetPage`, use `.Count` from `site.Taxonomies.categories`, omit empty terms, and render links with `relURL`. `article_row.html` must derive the primary category from `.Params.categories`, use `.Summary`, `.Date`, `.ReadingTime`, and `.Permalink`, and include an accessible `aria-label` on the row link. Do not hard-code post counts or article URLs.

- [ ] **Step 4: Implement the project header and home info.**

Override PaperMod's header partial with the notebook label, a link to `site.Params.personalHomepage`, the existing menu loop, and the existing theme toggle. Override `home_info.html` to call `notebook_intro.html` and use `site.Params.authorImage` with alt text `Shuo Lv`.

- [ ] **Step 5: Replace list, taxonomy, and archive entry markup.**

Use a two-column `.notebook-layout` on the home and list pages. Render `category_map.html` in the aside and `article_row.html` for each paginator page. Keep pagination links and breadcrumbs. Taxonomy and archive pages use the same article row partial inside `.notebook-list`, with their existing page headings and descriptions preserved.

- [ ] **Step 6: Wrap single articles with notebook classes.**

Keep PaperMod's TOC, cover, tags, share, comments, translation, edit, canonical, and post-nav partials. Add `.notebook-article` to the outer article and `.notebook-reading` to the content wrapper so the new CSS can set a 720px reading measure.

- [ ] **Step 7: Run source tests and commit the template change.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: PASS for partial existence and hooks. Commit with `git add layouts && git commit -m "feat: add notebook index templates"`.

## Task 3: Implement the Visual System and Responsive Behavior

**Files:**
- Create: `assets/css/extended/lsblog.css`
- Modify: `layouts/partials/extend_head.html`

**Interfaces:**
- `extend_head.html` loads the project stylesheet through Hugo Pipes with `resources.Get "css/extended/lsblog.css" | resources.Minify | resources.Fingerprint`.
- CSS targets `.notebook-layout`, `.category-map`, `.notebook-intro`, `.article-row`, `.notebook-article`, PaperMod's theme variables, and both `.dark` and `prefers-reduced-motion` states.

- [ ] **Step 1: Add failing CSS contract assertions.**

```python
    def test_css_contains_approved_tokens_and_mobile_layout(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        for token in ("#224b8d", "#fbfcfe", "#29313a", "Georgia", "Trebuchet MS"):
            self.assertIn(token, css)
        self.assertIn("@media (max-width: 768px)", css)
        self.assertIn("prefers-reduced-motion", css)
```

- [ ] **Step 2: Run the test and verify it fails because the stylesheet is absent.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: FAIL with `FileNotFoundError` for the stylesheet.

- [ ] **Step 3: Add the minimal approved stylesheet.**

Define root tokens, theme variable overrides, header divider, 220px desktop category rail, 720px article measure, rule-separated article rows, focus styles, no card shadows on list entries, taxonomy chips, code/table/image styles, and dark-mode remaps. Add the 768px breakpoint that hides the rail, shows `.category-map__mobile`, collapses article rows, preserves stable grid tracks, and prevents horizontal page overflow. Add `@media (prefers-reduced-motion: reduce)` to disable transforms and transitions.

- [ ] **Step 4: Load CSS through the project partial and run source tests.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: PASS. Commit with `git add assets/css/extended layouts/partials/extend_head.html && git commit -m "style: apply notebook visual system"`.

## Task 4: Clean Public Content and Remove Stale References

**Files:**
- Modify: `content/_index.md`
- Modify: `content/page/about.md`
- Modify: `content/posts/my-first-post.md`
- Modify: `hugo.toml`
- Modify: `layouts/partials/home_info.html`

**Interfaces:**
- Public copy names the notebook and points readers to the academic homepage for the full profile.
- No generated or source HTML contains `/my-blog/`, `aaron.jpg`, `Aaron`, `[Your Name]`, or generic `My Blog` copy.

- [ ] **Step 1: Add failing content hygiene assertions.**

```python
    def test_public_copy_has_no_placeholder_identity(self):
        paths = [ROOT / "hugo.toml", ROOT / "content/_index.md", ROOT / "content/page/about.md", ROOT / "content/posts/my-first-post.md"]
        text = "\n".join(path.read_text() for path in paths)
        for stale in ("aaron.jpg", "Aaron", "[Your Name]", "My Blog"):
            self.assertNotIn(stale, text)
        for path in (ROOT / "layouts").rglob("*.html"):
            self.assertNotIn("/my-blog/images/profile/aaron.jpg", path.read_text())
```

- [ ] **Step 2: Run the hygiene test and verify it fails against current placeholders.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: FAIL with one or more stale placeholder strings.

- [ ] **Step 3: Replace only public placeholder copy.**

Set `content/_index.md` title to `Shuo Lv / Field Notes`. Rewrite `content/page/about.md` as a concise page describing the three note types and linking to `https://ShuoLv-fp.github.io/`. Change the first post to `draft: true` and use a neutral title/body notice that it is a starter post awaiting a real essay. Do not touch the body of other drafts.

- [ ] **Step 4: Run source tests and commit content hygiene.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: PASS. Commit with `git add content/_index.md content/page/about.md content/posts/my-first-post.md hugo.toml layouts/partials/home_info.html && git commit -m "content: remove blog placeholders"`.

## Task 5: Build, Inspect, and Regression-Test the Site

**Files:**
- Modify: `tests/test_lsblog_visual_refresh.py`
- Generated only: `/tmp/lsblog-public/`

**Interfaces:**
- Build command is `hugo --minify --gc --destination /tmp/lsblog-public` using Hugo Extended 0.166.0.
- Source tests inspect generated HTML when `/tmp/lsblog-public/index.html` exists.

- [ ] **Step 1: Add generated-output assertions.**

```python
    def test_generated_home_has_notebook_hooks(self):
        output = Path("/tmp/lsblog-public/index.html")
        if not output.exists():
            self.skipTest("Hugo output not built")
        html = output.read_text()
        for marker in ("notebook-layout", "category-map", "article-row", "Shuo Lv / Field Notes"):
            self.assertIn(marker, html)
        self.assertNotIn("/my-blog/", html)
```

- [ ] **Step 2: Install or obtain the pinned Hugo Extended binary outside the repo if needed.**

Use the CI version `0.166.0` and keep the binary in `/tmp` or an existing tool cache. Do not add it to the repository. If the binary cannot be obtained, run all source tests and report the build limitation rather than claiming a successful build.

- [ ] **Step 3: Build the site.**

Run: `hugo --minify --gc --destination /tmp/lsblog-public`

Expected: exit code 0 and generated routes under `/tmp/lsblog-public/`.

- [ ] **Step 4: Run all regression checks.**

Run: `python3 -m unittest tests/test_lsblog_visual_refresh.py -v`

Expected: all checks pass, with no stale asset paths or placeholder identity strings.

- [ ] **Step 5: Inspect representative generated routes.**

Run: `find /tmp/lsblog-public -maxdepth 3 -type f | sort | sed -n '1,160p'` and search generated HTML for `category-map`, `article-row`, `/lsBlog/`, and `my-blog`. Confirm home, one article, categories, tags, archives, search, and about pages exist under the base path. Confirm no search or taxonomy link accidentally points to `/` instead of `/lsBlog/`.

- [ ] **Step 6: Run final diff checks and commit verification updates.**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only intended project files are changed, and existing user modifications remain untouched. Commit any test-only changes with `git add tests/test_lsblog_visual_refresh.py && git commit -m "test: verify notebook refresh output"`.

## Self-Review Checklist

- Spec coverage: taxonomy distinction, dynamic counts, responsive sidebar/filter, homepage visual language, single-article reading measure, content hygiene, accessibility, reduced motion, and `/lsBlog/` verification are covered by Tasks 1-5.
- Placeholder scan: no `TBD`, `TODO`, or vague implementation step appears in this plan; each implementation step names files, behavior, and commands.
- Type consistency: partial names and CSS hooks are consistent across the file map, task interfaces, and generated-output assertions.
