---
name: github-project-workflow
description: Use when working on Glyph GitHub issues, pull requests, or roadmap execution. Keeps the GitHub Project board, issue states, and PR links in sync for this repo.
---

# GitHub Project Workflow

Use this skill whenever the task involves:

- starting work from a GitHub issue
- creating or updating roadmap issues
- opening or updating a pull request
- keeping the GitHub Project board aligned with implementation progress

Project board:

- `https://github.com/users/FALAK097/projects/1/views/1`

## Required workflow

1. Prefer starting implementation from an existing GitHub issue.
2. If the work should be tracked and no issue exists yet, create the issue first unless the task is truly tiny.
3. When work actually starts on an issue, move its project status from `Todo` to `In Progress`.
4. When the work is complete, move the project status to `Done`.
5. When opening a PR, always link the relevant issue or issues in the PR body.
6. Use closing keywords when appropriate, for example `Closes #123`.
7. If one PR covers multiple issues, link every relevant issue in the PR body.
8. Keep the issue state, PR linkage, and project status consistent with the real state of the work.

## Guardrails

- Do not leave an actively worked issue in `Todo`.
- Do not leave finished work in `In Progress`.
- Do not open a PR without linking the issue or issues it addresses.
- Treat the GitHub Project board as the source of truth for roadmap execution state.
