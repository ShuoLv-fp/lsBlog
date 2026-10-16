import importlib.util
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


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
            "git add --all -- . ':(top,exclude,glob)[p]ublic' ':(top,exclude,glob)[p]ublic/**'",
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


class PublishBehaviorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="lsblog-publish-")
        self.addCleanup(self.temporary.cleanup)
        self.workspace = Path(self.temporary.name)
        self.repo = self.workspace / "checkout"
        self.repo.mkdir()
        self.remote = self.workspace / "origin.git"
        self.bin = self.workspace / "bin"
        self.bin.mkdir()
        self.calls = self.workspace / "calls"
        # Disable inherited Git configuration and hooks; all remotes are local fixtures.
        self.env = {key: value for key, value in os.environ.items()
                    if not key.startswith("GIT_")}
        self.env.update({
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_TERMINAL_PROMPT": "0",
            "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
            "PUBLISH_TEST_CALLS": str(self.calls),
        })
        self.git("init", "--bare", str(self.remote))
        self.git("init", "-b", "main")
        self.git("config", "user.name", "Publish Test")
        self.git("config", "user.email", "publish@example.invalid")
        self.git("config", "commit.gpgsign", "false")
        shutil.copy2(PUBLISH_SCRIPT, self.repo / "publish.sh")
        (self.repo / ".gitignore").write_text("/public/\n", encoding="utf-8")
        (self.repo / "content/notes").mkdir(parents=True)
        (self.repo / "content/notes/existing.md").write_text("Original note\n")
        self.git("add", "--all")
        self.git("commit", "-m", "Initial fixture")
        self.git("remote", "add", "origin", str(self.remote))
        self.git("push", "-u", "origin", "main")
        self.initial = self.git("rev-parse", "HEAD").stdout.strip()
        self.stub("hugo", '''printf 'hugo %s\\n' "$*" >> "$PUBLISH_TEST_CALLS"
exit_code=${PUBLISH_TEST_BUILD_EXIT:-0}
[ "$exit_code" -eq 0 ] || exit "$exit_code"
mkdir -p public
printf 'fresh build\\n' > public/index.html
''')
        self.stub("python3", '''printf 'python3 %s\\n' "$*" >> "$PUBLISH_TEST_CALLS"
[ "$(cat public/index.html)" = 'fresh build' ] || exit 91
exit "${PUBLISH_TEST_SUITE_EXIT:-0}"
''')

    def stub(self, name, body):
        path = self.bin / name
        path.write_text("#!/bin/sh\nset -eu\n" + body, encoding="utf-8")
        path.chmod(0o755)

    def git(self, *args, cwd=None):
        return subprocess.run(["git", *args], cwd=cwd or self.repo, env=self.env,
                              capture_output=True, text=True, check=True)

    def publish(self, *args, **env):
        return subprocess.run([str(self.repo / "publish.sh"), *args],
                              cwd=self.workspace, env={**self.env, **env},
                              capture_output=True, text=True, check=False)

    def assert_untouched(self):
        self.assertEqual(self.git("rev-parse", "HEAD").stdout.strip(), self.initial)
        self.assertEqual(self.git("diff", "--cached", "--name-only").stdout, "")
        self.assertEqual(self.git("rev-parse", "refs/heads/main", cwd=self.remote).stdout.strip(),
                         self.initial)

    def test_empty_or_missing_message_is_rejected_before_validation(self):
        for args in ((), ("",), (" \t\n",)):
            with self.subTest(args=args):
                result = self.publish(*args)
                self.assertEqual(result.returncode, 64, result.stderr)
                self.assertIn("Usage:", result.stderr)
                self.assertFalse(self.calls.exists())
                self.assert_untouched()

    def test_wrong_or_detached_branch_is_rejected_before_validation(self):
        self.git("switch", "-c", "topic")
        for detached in (False, True):
            with self.subTest(detached=detached):
                if detached:
                    self.git("checkout", "--detach")
                result = self.publish("Publish note")
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.calls.exists())
                self.assert_untouched()

    def advance_remote(self):
        peer = self.workspace / "peer"
        self.git("clone", "--branch", "main", str(self.remote), str(peer))
        self.git("config", "user.name", "Remote Test", cwd=peer)
        self.git("config", "user.email", "remote@example.invalid", cwd=peer)
        (peer / "remote.md").write_text("Remote update\n")
        self.git("add", "--all", cwd=peer)
        self.git("commit", "-m", "Remote update", cwd=peer)
        self.git("push", "origin", "main", cwd=peer)

    def test_behind_and_diverged_histories_stop_before_validation(self):
        self.advance_remote()
        for diverged in (False, True):
            with self.subTest(diverged=diverged):
                if diverged:
                    (self.repo / "local.md").write_text("Local update\n")
                    self.git("add", "--all")
                    self.git("commit", "-m", "Local update")
                head = self.git("rev-parse", "HEAD").stdout
                remote_head = self.git("rev-parse", "main", cwd=self.remote).stdout
                result = self.publish("Publish note")
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("behind or has diverged", result.stderr)
                self.assertFalse(self.calls.exists())
                self.assertEqual(self.git("rev-parse", "HEAD").stdout, head)
                self.assertEqual(self.git("rev-parse", "main", cwd=self.remote).stdout, remote_head)
                self.assertEqual(self.git("diff", "--cached", "--name-only").stdout, "")

    def test_build_or_suite_failure_does_not_stage_or_commit(self):
        (self.repo / "content/notes/new.md").write_text("New note\n")
        for variable in ("PUBLISH_TEST_BUILD_EXIT", "PUBLISH_TEST_SUITE_EXIT"):
            with self.subTest(variable=variable):
                result = self.publish("Publish note", **{variable: "7"})
                self.assertEqual(result.returncode, 7, result.stderr)
                self.assert_untouched()
                calls = self.calls.read_text().splitlines()
                self.assertEqual(len(calls), 1 if variable.endswith("BUILD_EXIT") else 2)
                self.calls.unlink()

    def test_synced_noop_validates_fresh_build_without_creating_commit(self):
        (self.repo / "public").mkdir()
        (self.repo / "public/index.html").write_text("stale build\n")
        result = self.publish("Nothing new")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("No changes to publish.", result.stdout)
        self.assertEqual(self.calls.read_text().splitlines(), [
            "hugo --minify --gc --cleanDestinationDir",
            "python3 -m unittest discover -s tests -v",
        ])
        self.assert_untouched()

    def assert_public_path_is_rejected(self):
        head = self.git("rev-parse", "HEAD").stdout
        index = self.git("ls-files", "--stage").stdout
        staged = self.git("diff", "--cached", "--binary").stdout
        fetch_head = self.repo / ".git/FETCH_HEAD"
        self.assertFalse(fetch_head.exists())
        result = self.publish("content: must reject generated output")
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("public/", result.stderr)
        self.assertFalse(self.calls.exists(), "Reject generated output before validation")
        self.assertFalse(fetch_head.exists(), "Reject generated output before fetching")
        self.assertEqual(self.git("rev-parse", "HEAD").stdout, head)
        self.assertEqual(self.git("ls-files", "--stage").stdout, index)
        self.assertEqual(self.git("diff", "--cached", "--binary").stdout, staged)
        self.assertEqual(self.git("rev-parse", "main", cwd=self.remote).stdout.strip(),
                         self.initial)
        self.assertNotIn("public/", self.git("ls-tree", "-r", "--name-only", "main",
                                             cwd=self.remote).stdout)

    def stage_generated_file(self):
        generated = self.repo / "public/accidentally-staged.html"
        generated.parent.mkdir()
        generated.write_text("Accidentally staged output\n")
        self.git("add", "--force", "--", "public/accidentally-staged.html")

    def test_force_staged_public_file_is_rejected_without_changing_git_state(self):
        self.stage_generated_file()
        self.assert_public_path_is_rejected()

    def test_tracked_public_file_is_rejected_without_pushing_existing_commit(self):
        self.stage_generated_file()
        self.git("commit", "-m", "Accidentally committed output")
        self.assert_public_path_is_rejected()

    def test_staged_deletion_of_tracked_public_file_still_requires_cleanup(self):
        self.stage_generated_file()
        self.git("commit", "-m", "Accidentally committed output")
        self.git("rm", "--", "public/accidentally-staged.html")
        self.assert_public_path_is_rejected()

    def test_generated_output_is_excluded_even_without_a_gitignore_rule(self):
        (self.repo / ".gitignore").write_text("")
        result = self.publish("chore: revise ignore rules")
        self.assertEqual(result.returncode, 0, result.stderr)
        for repository in (self.repo, self.remote):
            self.assertNotIn("public/", self.git("ls-tree", "-r", "--name-only", "main",
                                                 cwd=repository).stdout)
        self.assertEqual(self.git("ls-files", "--", "public").stdout, "")

    def test_content_and_image_are_committed_and_pushed_to_local_remote(self):
        (self.repo / "content/notes/existing.md").write_text("Revised note\n")
        (self.repo / "content/notes/new.md").write_text("New note\n")
        image = self.repo / "static/images/new/figure.png"
        image.parent.mkdir(parents=True)
        image.write_bytes(b"image fixture")
        result = self.publish("content: publish note and image")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.git("log", "-1", "--format=%s").stdout.strip(),
                         "content: publish note and image")
        self.assertEqual(self.git("rev-list", "--count", "HEAD").stdout.strip(), "2")
        for path, expected in (
            ("content/notes/existing.md", "Revised note\n"),
            ("content/notes/new.md", "New note\n"),
            ("static/images/new/figure.png", "image fixture"),
        ):
            self.assertEqual(self.git("show", "main:" + path, cwd=self.remote).stdout, expected)
        self.assertNotIn("public/", self.git("ls-tree", "-r", "--name-only", "HEAD").stdout)
        self.assertEqual(self.git("status", "--porcelain").stdout, "")

    def test_failed_push_can_retry_existing_commit_without_an_empty_commit(self):
        hook = self.remote / "hooks/pre-receive"
        hook.write_text("#!/bin/sh\nexit 1\n")
        hook.chmod(0o755)
        (self.repo / "content/notes/new.md").write_text("New note\n")
        failed = self.publish("content: publish new note")
        self.assertNotEqual(failed.returncode, 0)
        local_commit = self.git("rev-parse", "HEAD").stdout.strip()
        self.assertNotEqual(local_commit, self.initial)
        self.assertEqual(self.git("rev-parse", "main", cwd=self.remote).stdout.strip(), self.initial)
        hook.unlink()
        retried = self.publish("content: retry publication")
        self.assertEqual(retried.returncode, 0, retried.stderr)
        self.assertIn("retrying 1 validated local commit(s)", retried.stdout)
        self.assertEqual(self.git("rev-parse", "HEAD").stdout.strip(), local_commit)
        self.assertEqual(self.git("rev-parse", "main", cwd=self.remote).stdout.strip(), local_commit)
        self.assertEqual(self.git("rev-list", "--count", "HEAD").stdout.strip(), "2")


class AuthoringWorkflowTests(unittest.TestCase):
    def test_generated_checks_fail_when_repository_build_is_missing(self):
        spec = importlib.util.spec_from_file_location(
            "visual_contract", ROOT / "tests/test_lsblog_visual_refresh.py")
        visual = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(visual)
        with tempfile.TemporaryDirectory(prefix="lsblog-missing-build-") as directory:
            with patch.object(visual, "ROOT", Path(directory)):
                suite = unittest.TestSuite([
                    visual.SourceContractTests(name) for name in
                    unittest.defaultTestLoader.getTestCaseNames(visual.SourceContractTests)
                    if name.startswith("test_generated_")
                ])
                result = unittest.TestResult()
                suite.run(result)
        self.assertFalse(result.skipped, "Missing production output must never skip validation")
        self.assertEqual(len(result.failures), result.testsRun,
                         "Every generated-page check must fail when public/ is absent")

    def test_new_note_edited_note_and_image_pass_the_site_contracts(self):
        self.check_authoring_workflow(existing_fixture=False)

    def test_authoring_accepts_an_existing_maintenance_example_note(self):
        self.check_authoring_workflow(existing_fixture=True)

    def check_authoring_workflow(self, existing_fixture):
        with tempfile.TemporaryDirectory(prefix="lsblog-authoring-") as directory:
            site = Path(directory) / "site"
            shutil.copytree(ROOT, site, ignore=shutil.ignore_patterns(
                ".git", ".superpowers", "public", "resources", "__pycache__",
                ".hugo_build.lock"))
            occupied_note = site / "content/notes/maintenance-example.md"
            if existing_fixture and not occupied_note.exists():
                occupied_note.write_text(
                    '+++\ntitle = "Existing Maintenance Example"\n'
                    'date = "2020-01-01"\ndraft = false\n+++\n\n'
                    'A legitimate existing note.\n')
            occupied_content = occupied_note.read_bytes() if occupied_note.exists() else None
            slug = "maintenance-example"
            suffix = 0
            while any(path.exists() for path in (
                site / "content/notes" / f"{slug}.md",
                site / "content/notes" / slug,
                site / "static/images" / slug,
            )):
                suffix += 1
                slug = f"maintenance-example-{suffix}"
            created = subprocess.run(["hugo", "new", "content", f"notes/{slug}.md"],
                                     cwd=site, capture_output=True, text=True)
            self.assertEqual(created.returncode, 0, created.stderr)
            note = site / "content/notes" / f"{slug}.md"
            note.write_text(note.read_text().replace("draft = true", "draft = false")
                            + "\nA new maintenance note.\n\n"
                            + f"![Example figure](/lsBlog/images/{slug}/figure.png)\n")
            existing = site / "content/notes/agent-engineering.md"
            existing.write_text(existing.read_text().replace("Agent Engineering Notes",
                                                           "Revised Agent Engineering Notes")
                                + "\nAn ordinary author revision.\n")
            image = site / "static/images" / slug / "figure.png"
            image.parent.mkdir(parents=True)
            image.write_bytes(bytes.fromhex(
                "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
                "0000000b49444154789c636000020000050001a5f645400000000049454e44ae426082"))
            build = subprocess.run(["hugo", "--minify", "--gc", "--cleanDestinationDir"],
                                   cwd=site, capture_output=True, text=True)
            self.assertEqual(build.returncode, 0, build.stdout + build.stderr)
            contracts = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "-s", "tests",
                 "-p", "test_lsblog_visual_refresh.py", "-v"],
                cwd=site, capture_output=True, text=True)
            self.assertEqual(contracts.returncode, 0, contracts.stdout + contracts.stderr)
            self.assertIn("A new maintenance note.",
                          (site / "public/notes" / slug / "index.html").read_text())
            self.assertIn("An ordinary author revision.",
                          (site / "public/notes/agent-engineering/index.html").read_text())
            self.assertEqual((site / "public/images" / slug / "figure.png").read_bytes(),
                             image.read_bytes())
            if occupied_content is not None:
                self.assertEqual(occupied_note.read_bytes(), occupied_content)


if __name__ == "__main__":
    unittest.main()
