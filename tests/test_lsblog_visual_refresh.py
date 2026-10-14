from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SourceContractTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
