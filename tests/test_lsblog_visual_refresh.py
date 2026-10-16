import json
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]


class ElementIndex(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.elements = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class SourceContractTests(unittest.TestCase):
    def generated_output(self):
        output = ROOT / "public"
        self.assertTrue((output / "index.html").is_file(),
                        "Missing public/index.html; run the production Hugo build before tests")
        return output

    @staticmethod
    def _contrast_ratio(foreground, background):
        def luminance(color):
            channels = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
            channels = [
                value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
                for value in channels
            ]
            return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]

        lighter, darker = sorted(
            (luminance(foreground), luminance(background)), reverse=True
        )
        return (lighter + 0.05) / (darker + 0.05)

    def test_notebook_categories_are_configured(self):
        config = (ROOT / "hugo.toml").read_text()
        self.assertIn("Research Synthesis", config)
        self.assertIn("Personal Experience", config)
        self.assertIn("Life & Elsewhere", config)

    def test_notebook_partials_have_required_hooks(self):
        partial_dir = ROOT / "layouts" / "partials"
        for name, marker in (
            ("category_map.html", "category-map"),
            ("article_row.html", "article-row"),
            ("notebook_intro.html", "notebook-intro"),
        ):
            with self.subTest(partial=name):
                path = partial_dir / name
                self.assertTrue(path.exists(), f"Missing {name}")
                self.assertIn(marker, path.read_text())

    def test_index_views_share_notebook_components(self):
        for name in ("list.html", "archives.html", "taxonomy.html", "terms.html"):
            with self.subTest(template=name):
                text = (ROOT / "layouts/_default" / name).read_text()
                self.assertIn('partial "category_map.html"', text)
        self.assertIn('partial "article_row.html"', (ROOT / "layouts/_default/list.html").read_text())

    def test_single_keeps_reading_features(self):
        path = ROOT / "layouts/_default/single.html"
        self.assertTrue(path.exists(), "Missing single article override")
        text = path.read_text()
        for marker in ("notebook-article", "notebook-reading", "toc.html", "cover.html",
                       "post_nav_links.html", "share_icons.html", "comments.html",
                       "translation_list.html", "edit_post.html", "post_canonical.html"):
            self.assertIn(marker, text)

    def test_css_contains_approved_tokens_and_mobile_layout(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        for token in ("#224b8d", "#fbfcfe", "#29313a", "Georgia", "Trebuchet MS",
                      "grid-template-columns: 220px", ".dark", ":focus-visible"):
            self.assertIn(token, css)
        self.assertIn("@media (max-width: 768px)", css)
        self.assertIn("prefers-reduced-motion", css)

    def test_light_mode_muted_text_meets_wcag_aa(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        root_block = css.split(":root {", 1)[1].split("}", 1)[0]
        muted = re.search(r"--muted-ink:\s*(#[0-9a-fA-F]{6})", root_block).group(1)
        for background in ("#fbfcfe", "#ffffff"):
            with self.subTest(background=background):
                self.assertGreaterEqual(self._contrast_ratio(muted, background), 4.5)

    def test_sidebar_label_does_not_precede_page_h1_as_a_heading(self):
        category_map = (ROOT / "layouts/partials/category_map.html").read_text()
        self.assertNotIn('<h2 class="category-map__title"', category_map)
        self.assertIn('<p class="category-map__title"', category_map)

    def test_base_template_uses_current_hugo_language_direction_api(self):
        base = (ROOT / "layouts/_default/baseof.html").read_text()
        self.assertIn(".Language.Direction", base)
        self.assertNotIn(".Language.LanguageDirection", base)

    def test_public_copy_has_no_placeholder_identity(self):
        paths = [ROOT / "hugo.toml", ROOT / "content/_index.md",
                 ROOT / "content/page/about.md"]
        text = "\n".join(path.read_text() for path in paths)
        for stale in ("aaron.jpg", "Aaron", "[Your Name]", "My Blog", "Welcome to My Blog"):
            self.assertNotIn(stale, text)
        for path in (ROOT / "layouts").rglob("*.html"):
            self.assertNotIn("/my-blog/", path.read_text())

    def test_search_uses_one_script_and_has_an_empty_state(self):
        template = (ROOT / "layouts/_default/search.html").read_text()
        self.assertNotIn("resources.Get", template)
        self.assertNotIn("loadSearch", template)
        script = (ROOT / "assets/js/fastsearch.js").read_text()
        self.assertIn("No matching notes", script)
        self.assertIn("search-result", script)

    def test_skip_link_has_a_main_target(self):
        header = (ROOT / "layouts/partials/header.html").read_text()
        base = (ROOT / "layouts/_default/baseof.html").read_text()
        self.assertIn('href="#notebook-main"', header)
        self.assertIn('id="notebook-main"', base)

    def test_menu_links_remain_under_the_blog_base_path(self):
        config = (ROOT / "hugo.toml").read_text()
        for path in ("categories", "tags", "archives", "search"):
            self.assertNotIn(f'url = "/{path}/"', config)

    def test_language_config_uses_current_hugo_label_key(self):
        config = (ROOT / "hugo.toml").read_text()
        self.assertIn('label = "English"', config)
        self.assertNotIn('languageName = "English"', config)

    def test_brand_assets_reuse_homepage_icons(self):
        config = (ROOT / "hugo.toml").read_text()
        for icon in ("favicon-16x16_new.png", "favicon-32x32_new.png",
                     "apple-touch-icon_new.png", "academic-icon_new.svg"):
            self.assertIn(f"https://ShuoLv-fp.github.io/assets/icons/{icon}", config)

    def test_generated_home_has_notebook_hooks(self):
        output = self.generated_output() / "index.html"
        html = output.read_text()
        for marker in ("notebook-layout", "category-map", "article-row",
                       "Shuo Lv / Field Notes"):
            self.assertIn(marker, html)
        self.assertNotIn("/my-blog/", html)

    def test_pagination_uses_hugo_pager_size_api(self):
        for name in ("list.html", "taxonomy.html"):
            with self.subTest(template=name):
                text = (ROOT / "layouts/_default" / name).read_text()
                self.assertIn("$paginator.PagerSize", text)
                self.assertNotIn("$paginator.PageSize", text)

    def test_generated_category_map_links_nonempty_configured_terms(self):
        output = self.generated_output() / "index.html"
        html = output.read_text()
        for label, path in (
            ("Research Synthesis", "/lsBlog/categories/research-synthesis/"),
            ("Personal Experience", "/lsBlog/categories/personal-experience/"),
            ("Life & Elsewhere", "/lsBlog/categories/life--elsewhere/"),
        ):
            self.assertIn(label, html)
            self.assertIn(path, html)

    def test_generated_search_summaries_are_plain_text(self):
        output = self.generated_output() / "index.json"
        self.assertTrue(output.is_file(), "Production build must include the search index")
        entries = json.loads(output.read_text())
        self.assertTrue(entries, "Search must contain published entries")
        permalinks = [item["permalink"] for item in entries]
        self.assertEqual(len(permalinks), len(set(permalinks)), "Search routes must be unique")
        for item in entries:
            with self.subTest(title=item["title"]):
                self.assertTrue(item["title"].strip(), "Published entries need a title")
                self.assertNotIn("<", item["summary"])
                self.assertNotIn(">", item["summary"])
                self.assertIsNone(re.search(r"&(?:[A-Za-z]+|#\d+);", item["summary"]))

    def test_search_replays_a_query_entered_while_index_loads(self):
        script = (ROOT / "assets/js/fastsearch.js").read_text()
        self.assertIn("searchInput.dispatchEvent(new Event('input'))", script)

    def test_compact_header_does_not_clip_homepage_label(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        compact = css.split("@media (max-width: 430px)", 1)[1]
        compact = compact.split("@media (prefers-reduced-motion", 1)[0]
        self.assertNotIn("overflow: hidden", compact)

    def test_search_index_does_not_accumulate_between_hugo_rebuilds(self):
        template = (ROOT / "layouts/_default/index.json").read_text()
        self.assertNotIn("Scratch", template)

    def test_search_result_links_override_theme_absolute_positioning(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        self.assertIn("#searchResults .search-result > a", css)
        self.assertIn("position: static", css)

    def test_repository_has_one_public_note_section(self):
        notes = ROOT / "content/notes"
        self.assertTrue(notes.is_dir(), "The public note section must exist")
        self.assertTrue(any(notes.rglob("*.md")), "The notebook must contain Markdown notes")
        self.assertFalse((ROOT / "content/drafts").exists())
        self.assertFalse((ROOT / "content/posts").exists())
        self.assertIn('mainSections = ["notes"]', (ROOT / "hugo.toml").read_text())

    def test_legacy_note_aliases_remain_declared(self):
        text = "\n".join(path.read_text() for path in (ROOT / "content/notes").rglob("*.md"))
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
            ".DS_Store", "content/.DS_Store", "static/fgo-wiki",
            "config.yml", "deploy.sh", "deploy.ps1", "DEPLOY_GUIDE.md", "hugo_tmp",
            "content/posts/my-first-post.md", "layouts/_default/social.html",
        ):
            self.assertFalse((ROOT / relative).exists(), relative)

    def test_research_experiments_are_archived(self):
        archive = ROOT / "archive/research-experiments"
        for relative in (
            "README.md", "CauchyKovalevskaya_bac3ecd234c3497cba4cf4e3efefc330.lean",
            "DeepSeek-Prover-V2.py", "MathNL.md", "Valid_models.md", "bench.md.txt",
            "lean_proof.txt", "lean_proof_Goedel-Prover-V2.txt",
            "Lean_AI_research/Goedel_1.png", "Lean_AI_research/Goedel_2.png",
            "Lean_AI_research/Goedel_3.png", "Lean_AI_research/Goedel_4.png",
        ):
            self.assertTrue((archive / relative).exists(), relative)

    def test_formatting_reference_and_shortcodes_exist(self):
        path = ROOT / "content/page/formatting-reference.md"
        self.assertTrue(path.exists(), "Missing public formatting reference")
        reference = path.read_text()
        for marker in (
            "math: true", "TocOpen: true", "searchHidden: true", "build:",
            "list: never", "## Typography", "## Lists",
            "## Code", "## Mathematics", "## Rich blocks", "## Media",
            "## Stress tests",
        ):
            self.assertIn(marker, reference)
        for name in ("callout", "columns", "timeline", "pullquote", "gallery"):
            self.assertTrue((ROOT / "layouts/shortcodes" / f"{name}.html").exists())

    def test_formatting_shortcodes_support_real_markdown(self):
        for name in ("callout", "columns", "timeline", "pullquote", "gallery"):
            path = ROOT / "layouts/shortcodes" / f"{name}.html"
            with self.subTest(shortcode=name):
                self.assertTrue(path.exists())
                text = path.read_text()
                self.assertIn("RenderString", text)
                self.assertIn("reference-", text)

    def test_callouts_have_accessible_landmark_labels(self):
        text = (ROOT / "layouts/shortcodes/callout.html").read_text()
        self.assertIn("aria-labelledby", text)
        self.assertIn(".Ordinal", text)

    def test_gallery_caption_styling_is_explicit(self):
        css = (ROOT / "assets/css/extended/lsblog.css").read_text()
        self.assertIn(".reference-gallery__caption", css)
        self.assertNotIn(".reference-gallery > p:last-child", css)

    def test_math_delimiters_survive_markdown_parsing(self):
        config = (ROOT / "hugo.toml").read_text()
        self.assertIn("[markup.goldmark.extensions.passthrough]", config)
        self.assertIn("enable = true", config)

    def test_generated_formatting_reference_is_public_but_not_indexed(self):
        output = self.generated_output()
        path = output / "page/formatting-reference/index.html"
        self.assertTrue(path.exists(), "Formatting reference must be published")
        html = path.read_text()
        for marker in ("reference-callout", "reference-columns", "reference-timeline",
                       "reference-pullquote", "reference-gallery", "katex", "footnotes"):
            self.assertIn(marker, html)
        self.assertEqual(sum(tag == "h1" for tag, _ in ElementIndex(html).elements), 1)
        home = (output / "index.html").read_text()
        self.assertTrue(any("article-row" == attrs.get("class")
                            for tag, attrs in ElementIndex(home).elements))
        self.assertNotIn('aria-label="Read Formatting Reference"', home)
        search = json.loads((output / "index.json").read_text())
        self.assertNotIn("Formatting Reference", {item["title"] for item in search})
        page_index = (output / "page/index.html").read_text()
        self.assertNotIn('aria-label="Read Formatting Reference"', page_index)
        for route in ("index.xml", "page/index.xml"):
            feed = ElementTree.parse(output / route)
            titles = {item.text for item in feed.findall("./channel/item/title")}
            self.assertNotIn("Formatting Reference", titles)
        for route in ("index.html", "archives/index.html", "page/about/index.html"):
            links = [attrs.get("href") for tag, attrs
                     in ElementIndex((output / route).read_text()).elements if tag == "a"]
            self.assertIn("/lsBlog/page/formatting-reference/", links)

    def test_generated_site_has_no_retired_fgo_route(self):
        output = self.generated_output()
        self.assertFalse((output / "fgo-wiki").exists())

    def test_generated_note_aliases_target_canonical_urls(self):
        output = self.generated_output()
        for old, new in (
            ("agent_engineering", "agent-engineering"),
            ("games", "games"),
            ("phd_application_insights", "phd-application-insights"),
            ("ulf_mri_exercise", "ulf-mri-learning-blueprint"),
            ("research_draft", "functional-connectivity-notes"),
        ):
            path = output / "drafts" / old / "index.html"
            with self.subTest(alias=old):
                self.assertTrue(path.exists())
                elements = ElementIndex(path.read_text()).elements
                refresh = [attrs.get("content", "") for tag, attrs in elements
                           if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh"]
                self.assertEqual(len(refresh), 1)
                self.assertIn(f"/lsBlog/notes/{new}/", refresh[0])


if __name__ == "__main__":
    unittest.main()
