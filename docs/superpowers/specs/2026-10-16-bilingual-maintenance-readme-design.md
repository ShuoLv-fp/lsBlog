# Bilingual Maintenance README and One-Command Publishing

## Goal

Turn the repository README into a practical bilingual maintenance guide and add a safe one-command publishing workflow for routine blog updates.

The primary workflow should be easy to remember:

```bash
./publish.sh "content: add a new field note"
```

## README Structure

The README will use section-by-section Chinese and English explanations. Commands and configuration examples will be shared between both languages so the two versions cannot drift independently.

The guide will cover:

1. Project purpose and live URLs.
2. Required software and initial setup.
3. Creating a note with Hugo.
4. Completing front matter, including the three supported categories.
5. Adding images and using the public formatting reference.
6. Previewing drafts locally.
7. Running production checks manually.
8. Publishing with `publish.sh`.
9. Understanding GitHub Actions and GitHub Pages deployment.
10. Common failure recovery and the repository map.

## Publishing Script

`publish.sh` will be a Bash script invoked from anywhere inside or outside the repository. It will resolve its own directory and run all Git commands from the repository root.

The script will:

1. Require exactly one non-empty commit message.
2. Require the checked-out branch to be `main`.
3. Fetch `origin/main` before publishing.
4. Stop when local `main` is behind or has diverged from `origin/main`.
5. Run a Hugo production build with garbage collection and a clean destination.
6. Run the complete Python unittest suite.
7. Stage all repository changes with `git add --all` only after validation succeeds.
8. Stop without creating a commit when no staged changes exist.
9. Commit using the supplied message.
10. Push the new commit to `origin main`.

The script will not force-push, rebase, merge, pull, delete files, or bypass tests. Generated `public/` output remains ignored and is never committed.

## Failure Handling

The script will use strict Bash error handling. Any failed prerequisite, build, test, Git check, commit, or push stops the workflow immediately with a concise diagnostic. A failed build or test must occur before staging, so validation failures do not alter the Git index.

If the remote branch is ahead or divergent, the README will tell the maintainer to inspect the difference and synchronize manually rather than letting the script make an implicit merge decision.

## Verification

Automated source-contract tests will verify that:

- the README documents note creation, draft publication, categories, preview, checks, one-command publishing, deployment, and troubleshooting;
- `publish.sh` exists and is executable;
- the script validates its commit message and branch;
- the script checks remote ancestry before staging;
- build and tests run before `git add`, `git commit`, and `git push`;
- the script never force-pushes or bypasses verification.

Final verification will run the Hugo production build, the full unittest suite, `bash -n publish.sh`, and `git diff --check`.
