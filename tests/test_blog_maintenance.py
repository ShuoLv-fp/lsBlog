import os
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
PUBLISH_SCRIPT = ROOT / "publish.sh"


class BlogMaintenanceTests(unittest.TestCase):
    def test_readme_documents_the_complete_bilingual_workflow(self):
        text = README.read_text(encoding="utf-8")

        required_copy = (
            "中文",
            "English",
            "hugo new content notes/my-note.md",
            "draft = false",
            "Research Synthesis",
            "Personal Experience",
            "Life & Elsewhere",
            "hugo server --buildDrafts",
            "hugo --minify --gc --cleanDestinationDir",
            "python3 -m unittest discover -s tests -v",
            './publish.sh "content: add a new field note"',
            ".github/workflows/hugo.yml",
            "gh-pages",
            "https://shuolv-fp.github.io/lsBlog/",
        )
        for expected in required_copy:
            with self.subTest(expected=expected):
                self.assertIn(expected, text)

    def test_publish_script_is_executable_and_valid_bash(self):
        self.assertTrue(PUBLISH_SCRIPT.exists())
        self.assertTrue(os.access(PUBLISH_SCRIPT, os.X_OK))
        result = subprocess.run(
            ["bash", "-n", str(PUBLISH_SCRIPT)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_publish_script_validates_before_mutating_git_state(self):
        text = PUBLISH_SCRIPT.read_text(encoding="utf-8")

        required_commands = (
            "set -euo pipefail",
            "git symbolic-ref --quiet --short HEAD",
            "git fetch origin main",
            "git merge-base --is-ancestor origin/main HEAD",
            "git diff --check HEAD --",
            "hugo --minify --gc --cleanDestinationDir",
            "python3 -m unittest discover -s tests -v",
            "git add --all",
            "git diff --cached --quiet",
            "git rev-list --count origin/main..HEAD",
            'git commit -m "$commit_message"',
            "git push origin main",
        )
        for command in required_commands:
            with self.subTest(command=command):
                self.assertIn(command, text)

        validation = text.index("hugo --minify --gc --cleanDestinationDir")
        tests = text.index("python3 -m unittest discover -s tests -v")
        stage = text.index("git add --all")
        commit = text.index('git commit -m "$commit_message"')
        push = text.index("git push origin main")
        self.assertLess(validation, stage)
        self.assertLess(tests, stage)
        self.assertLess(stage, commit)
        self.assertLess(commit, push)

        forbidden = ("--force", "git pull", "git merge ", "git rebase")
        for command in forbidden:
            with self.subTest(forbidden=command):
                self.assertNotIn(command, text)


if __name__ == "__main__":
    unittest.main()
