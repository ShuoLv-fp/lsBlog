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
