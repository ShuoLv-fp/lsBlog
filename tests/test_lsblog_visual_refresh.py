import json
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SourceContractTests(unittest.TestCase):
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
                 ROOT / "content/page/about.md", ROOT / "content/posts/my-first-post.md"]
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
        output = Path("/tmp/lsblog-public/index.html")
        if not output.exists():
            self.skipTest("Hugo output not built")
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
        output = Path("/tmp/lsblog-public/index.html")
        if not output.exists():
            self.skipTest("Hugo output not built")
        html = output.read_text()
        for label, path in (
            ("Research Synthesis", "/lsBlog/categories/research-synthesis/"),
            ("Personal Experience", "/lsBlog/categories/personal-experience/"),
        ):
            self.assertIn(label, html)
            self.assertIn(path, html)
        self.assertNotIn("/lsBlog/categories/life-elsewhere/", html)

    def test_generated_search_summaries_are_plain_text(self):
        output = Path("/tmp/lsblog-public/index.json")
        if not output.exists():
            self.skipTest("Hugo output not built")
        for item in json.loads(output.read_text()):
            with self.subTest(title=item["title"]):
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


if __name__ == "__main__":
    unittest.main()
