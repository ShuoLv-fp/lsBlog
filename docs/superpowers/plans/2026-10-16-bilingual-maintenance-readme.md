# Bilingual Blog Maintenance Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a bilingual README for routine blog maintenance and a safe `./publish.sh "message"` command that validates, commits, and publishes changes.

**Architecture:** `README.md` is the human-facing source of truth for authoring and deployment. `publish.sh` is a small fail-fast Bash workflow around the existing Hugo build, Python tests, Git repository, and GitHub Actions deployment. A focused source-contract test file keeps the documentation and script aligned with the approved safety behavior.

**Tech Stack:** Hugo Extended 0.166.0, Bash, Git, Python `unittest`, GitHub Actions, GitHub Pages

## Global Constraints

- Use section-by-section Chinese and English explanations with shared command blocks.
- Require exactly one non-empty commit message for one-command publishing.
- Publish only from `main` and stop if local `main` is behind or divergent from `origin/main`.
- Run the production Hugo build and complete unittest suite before staging, committing, or pushing.
- Never force-push, rebase, merge, pull, delete files, or bypass tests.
- Keep generated `public/` output uncommitted.
- Do not modify blog templates, styles, configuration, or article content.

---

### Task 1: Define the Maintenance and Publishing Contract

**Files:**
- Create: `tests/test_blog_maintenance.py`

**Interfaces:**
- Consumes: repository files `README.md`, `publish.sh`, and `.github/workflows/hugo.yml`
- Produces: `BlogMaintenanceTests`, the executable behavior contract for Task 2

- [ ] **Step 1: Write the failing contract tests**

Create `tests/test_blog_maintenance.py` with:

```python
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
```

- [ ] **Step 2: Run the focused tests and verify the red state**

Run:

```bash
python3 -m unittest tests.test_blog_maintenance -v
```

Expected: README contract fails because the existing guide is incomplete, and script tests fail because `publish.sh` does not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/test_blog_maintenance.py
git commit -m "test: define blog publishing workflow"
```

---

### Task 2: Implement Safe One-Command Publishing

**Files:**
- Create: `publish.sh`
- Test: `tests/test_blog_maintenance.py`

**Interfaces:**
- Consumes: one positional argument containing the Git commit message; local `main`; `origin/main`; `hugo`; `python3`; `git`
- Produces: a validated commit pushed to `origin/main`, which triggers the existing GitHub Actions deployment

- [ ] **Step 1: Create the publishing script**

Create `publish.sh` with:

```bash
#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

usage() {
  printf 'Usage: %s "commit message"\n' "${0##*/}" >&2
}

if [[ $# -ne 1 || -z "${1//[[:space:]]/}" ]]; then
  usage
  exit 64
fi

commit_message="$1"

for command_name in git hugo python3; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command_name" >&2
    exit 127
  fi
done

current_branch="$(git symbolic-ref --quiet --short HEAD)"
if [[ "$current_branch" != "main" ]]; then
  printf 'Publishing is only allowed from main; current branch: %s\n' "$current_branch" >&2
  exit 1
fi

git remote get-url origin >/dev/null
git fetch origin main

if ! git merge-base --is-ancestor origin/main HEAD; then
  printf 'Local main is behind or has diverged from origin/main. Synchronize it manually before publishing.\n' >&2
  exit 1
fi

printf '\nChecking whitespace...\n'
git diff --check HEAD --

printf '\nBuilding the production site...\n'
hugo --minify --gc --cleanDestinationDir

printf '\nRunning the complete test suite...\n'
python3 -m unittest discover -s tests -v

printf '\nStaging validated changes...\n'
git add --all

if git diff --cached --quiet; then
  ahead_count="$(git rev-list --count origin/main..HEAD)"
  if [[ "$ahead_count" -eq 0 ]]; then
    printf 'No changes to publish.\n'
    exit 0
  fi

  printf 'No new file changes; retrying %s validated local commit(s).\n' "$ahead_count"
else
  git status --short
  git commit -m "$commit_message"
fi

git push origin main

printf '\nPublished successfully. GitHub Actions will deploy the site to:\n'
printf 'https://shuolv-fp.github.io/lsBlog/\n'
```

- [ ] **Step 2: Make the script executable**

Run:

```bash
chmod +x publish.sh
```

- [ ] **Step 3: Run syntax and focused tests**

Run:

```bash
bash -n publish.sh
python3 -m unittest tests.test_blog_maintenance.BlogMaintenanceTests.test_publish_script_is_executable_and_valid_bash tests.test_blog_maintenance.BlogMaintenanceTests.test_publish_script_validates_before_mutating_git_state -v
```

Expected: Bash syntax succeeds and both script contract tests pass. The README test remains red until Task 3.

- [ ] **Step 4: Commit the script**

```bash
git add publish.sh
git commit -m "feat: add safe blog publishing command"
```

---

### Task 3: Write the Bilingual Maintenance README

**Files:**
- Modify: `README.md`
- Test: `tests/test_blog_maintenance.py`

**Interfaces:**
- Consumes: `publish.sh`, `archetypes/default.md`, `hugo.toml`, `.github/workflows/hugo.yml`, and the public formatting-reference route
- Produces: the canonical bilingual authoring, validation, publishing, deployment, and troubleshooting guide

- [ ] **Step 1: Replace the README with the approved bilingual guide**

Write section-by-section Chinese and English content with these exact sections and commands:

````markdown
# Shuo Lv / Field Notes

> **中文：** 研究总结、个人经验与实验室之外的生活记录。
>
> **English:** Research summaries, personal experience, and notes from life beyond the lab.

- 在线博客 / Live site: https://shuolv-fp.github.io/lsBlog/
- 排版参考 / Formatting reference: https://shuolv-fp.github.io/lsBlog/page/formatting-reference/

## 1. 准备环境 / Prerequisites

本项目需要 Hugo Extended 0.166.0、Python 3 和 Git。首次使用时请确认版本：

This project requires Hugo Extended 0.166.0, Python 3, and Git. Verify them before the first update:

```bash
hugo version
python3 --version
git --version
```

macOS 可以使用 Homebrew 安装 Hugo：

On macOS, Hugo can be installed with Homebrew:

```bash
brew install hugo
```

克隆并进入仓库：

Clone the repository and enter it:

```bash
git clone https://github.com/ShuoLv-fp/lsBlog.git
cd lsBlog
```

## 2. 新建博客 / Create a Note

文件名使用小写 kebab-case。下面的命令会根据 `archetypes/default.md` 创建一篇草稿：

Use a lowercase kebab-case filename. This command creates a draft from `archetypes/default.md`:

```bash
hugo new content notes/my-note.md
```

然后编辑 `content/notes/my-note.md` 的 front matter 和正文：

Then edit the front matter and body in `content/notes/my-note.md`:

```toml
+++
date = 2026-10-16T10:00:00+08:00
draft = true
title = "My Note"
summary = "A concise summary shown on index and search pages."
tags = ["MRI", "Methods"]
categories = ["Research Synthesis"]
+++
```

每篇文章只选择一个分类：

Choose exactly one category for each note:

- `Research Synthesis`: 文献、方法与科研总结 / literature, methods, and research notes
- `Personal Experience`: 申请、工程实践与经验复盘 / applications, engineering practice, and lessons learned
- `Life & Elsewhere`: 实验室之外的生活记录 / notes from outside the lab

`tags` 用来描述具体主题，可以填写多个。准备公开时把：

Use `tags` for specific subjects; multiple tags are allowed. When the note is ready to publish, change:

```toml
draft = false
```

更新已有博客时，直接编辑对应的 `content/notes/*.md` 文件即可。

To update an existing post, edit its corresponding `content/notes/*.md` file directly.

## 3. 图片与排版 / Images and Formatting

将文章图片放在以文章 slug 命名的目录中：

Store article images in a directory named after the note slug:

```text
static/images/my-note/figure-1.png
```

在 Markdown 中使用带 `/lsBlog/` 前缀的路径，并提供准确的替代文本：

Reference the image with the `/lsBlog/` prefix and meaningful alternative text:

```markdown
![Description of the figure](/lsBlog/images/my-note/figure-1.png)
```

标题、表格、代码、数学公式、提示框、分栏、时间线、折叠区和图片画廊的可用写法见在线排版参考：

For headings, tables, code, mathematics, callouts, columns, timelines, collapsible sections, and galleries, use the live formatting reference:

https://shuolv-fp.github.io/lsBlog/page/formatting-reference/

## 4. 本地预览 / Local Preview

启动包含草稿的本地服务器：

Start a local server that includes draft notes:

```bash
hugo server --buildDrafts
```

浏览器打开 http://localhost:1313/lsBlog/ 。保存 Markdown 后 Hugo 会自动重建页面。按 `Ctrl+C` 停止服务器。

Open http://localhost:1313/lsBlog/ in a browser. Hugo rebuilds automatically after Markdown changes. Press `Ctrl+C` to stop the server.

## 5. 发布前检查 / Pre-Publish Checks

先确认将要提交的文件，再运行与线上一致的生产构建和完整测试：

Review the files to be committed, then run the production build and complete test suite:

```bash
git status --short
hugo --minify --gc --cleanDestinationDir
python3 -m unittest discover -s tests -v
git diff --check
```

`public/` 是本地生成目录，已被忽略，不需要提交。

`public/` is generated locally and ignored; never commit it.

## 6. 一键发布 / One-Command Publish

确认 `git status --short` 中只有本次要发布的改动，然后运行：

Confirm that `git status --short` contains only the intended changes, then run:

```bash
./publish.sh "content: add a new field note"
```

脚本会依次检查提交说明、当前分支和远端同步状态，执行 Hugo 生产构建及全部测试，然后才会暂存所有改动、提交并推送 `origin/main`。任一步失败都会立即停止，不会强制推送或跳过测试。

The script checks the commit message, current branch, and remote ancestry; runs the production Hugo build and all tests; and only then stages every change, commits, and pushes `origin/main`. Any failure stops immediately. It never force-pushes or skips validation.

建议使用清楚的提交说明：

Use a concise, descriptive commit message:

```bash
./publish.sh "content: publish MRI reconstruction notes"
./publish.sh "content: revise PhD interview reflections"
./publish.sh "docs: update formatting reference"
```

## 7. 自动部署 / Automatic Deployment

推送成功后，`.github/workflows/hugo.yml` 会自动完成以下流程：

After a successful push, `.github/workflows/hugo.yml` automatically runs this pipeline:

```text
main -> Hugo production build -> gh-pages -> GitHub Pages
```

生成的 `public/` 不会进入 `main`；GitHub Actions 会把构建产物发布到 `gh-pages`。可以在以下页面查看部署状态：

Generated `public/` files are not committed to `main`; GitHub Actions publishes the build output to `gh-pages`. Monitor deployment here:

https://github.com/ShuoLv-fp/lsBlog/actions

部署成功后访问：https://shuolv-fp.github.io/lsBlog/ 。GitHub Pages CDN 可能需要几分钟刷新。

After deployment succeeds, visit https://shuolv-fp.github.io/lsBlog/ . The GitHub Pages CDN may take a few minutes to refresh.

## 8. 常见问题 / Troubleshooting

### `Required command not found: hugo`

安装 Hugo Extended 0.166.0 并重新运行。Install Hugo Extended 0.166.0 and retry.

### `Publishing is only allowed from main`

先保存当前分支工作，再切换到 `main`。Finish or preserve the current branch work, then switch to `main`.

```bash
git switch main
```

### `Local main is behind or has diverged from origin/main`

脚本不会自动合并或变基。先运行以下命令检查差异，再手动同步：

The script never merges or rebases automatically. Inspect the difference and synchronize manually:

```bash
git fetch origin
git log --oneline --left-right origin/main...main
```

### 构建或测试失败 / Build or tests fail

修复输出中的第一个错误，然后重新运行 `./publish.sh`。验证失败发生在暂存和提交之前。

Fix the first reported error, then run `./publish.sh` again. Validation fails before staging or committing.

### `No changes to publish`

当前没有文件改动，也没有未推送的本地提交，无需处理。

There are no file changes or unpushed local commits; no action is needed.

### Push 因网络错误失败 / Push fails because of a network error

网络恢复后重新运行同一条 `./publish.sh` 命令。脚本不会创建空提交，而会推送已经通过验证的本地提交。

Run the same `./publish.sh` command after the connection recovers. The script does not create an empty commit; it pushes the already validated local commit.

### 推送成功但线上仍是旧页面 / Push succeeds but the live site is stale

先确认 Actions 已成功，再等待几分钟并刷新页面。不要通过再次创建空提交来催促部署。

Confirm that Actions succeeded, wait a few minutes, and refresh. Do not create empty commits to retrigger deployment.

## 9. 项目结构 / Repository Map

- `content/notes/`: 公开博客正文 / published notes
- `content/page/`: About 与排版参考等独立页面 / standalone pages
- `static/images/`: 文章静态图片 / article images
- `assets/`: 项目 CSS 与 JavaScript / project CSS and JavaScript
- `layouts/`: 项目自定义模板与 shortcodes / project templates and shortcodes
- `archetypes/`: 新文章模板 / new-note templates
- `tests/`: 源码及生成页面回归测试 / source and generated-site regression tests
- `archive/`: 不公开的研究实验材料 / unpublished research experiments
- `themes/PaperMod/`: 内置上游主题，不在此处定制 / bundled upstream theme; do not customize here
- `publish.sh`: 验证、提交并推送博客更新 / validate, commit, and push blog updates
````

- [ ] **Step 2: Run the focused contract suite**

Run:

```bash
python3 -m unittest tests.test_blog_maintenance -v
```

Expected: all three maintenance tests pass.

- [ ] **Step 3: Commit the bilingual guide**

```bash
git add README.md
git commit -m "docs: add bilingual blog maintenance guide"
```

---

### Task 4: Verify the Complete Workflow

**Files:**
- Verify: `README.md`
- Verify: `publish.sh`
- Verify: `tests/test_blog_maintenance.py`

**Interfaces:**
- Consumes: all Task 1-3 deliverables
- Produces: fresh evidence that documentation, script syntax, site generation, and repository tests agree

- [ ] **Step 1: Run the publishing script syntax check**

Run:

```bash
bash -n publish.sh
```

Expected: exit 0 with no output.

- [ ] **Step 2: Run the Hugo production build**

Run:

```bash
hugo --minify --gc --cleanDestinationDir
```

Expected: exit 0 and a generated site under `public/` with no retired `fgo-wiki` route.

- [ ] **Step 3: Run the complete test suite**

Run:

```bash
python3 -m unittest discover -s tests -v
```

Expected: all existing and new tests pass.

- [ ] **Step 4: Check formatting and repository state**

Run:

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace errors; `main` contains only the planned commits and has no uncommitted changes.

- [ ] **Step 5: Review the final commit range**

Run:

```bash
git log --oneline --decorate origin/main..HEAD
```

Expected: the design, plan, contract-test, publishing-script, and README commits are present and ready for a deliberate push.
