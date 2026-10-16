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
