# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Task: `basic-software-interpreter-summary`
- Verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `summary-report.md` | `dev/basic-software-interpreter-summary.md` or roadmap appendix | candidate | Useful as promotion planning input. |
| `summary.json` | future planning data under `dev/` | candidate | Machine-readable route matrix. |
| Recommended promotion slice | `dev/roadmap.md` or focused plan | candidate | Promote only selected items after review. |

## Required Formal Updates

- Roadmap: add accepted integration task and selected S6+ rounds.
- Dev docs: optionally add stable software route summary.
- Package plans: create focused plans for `packages/projectors/interpreter-plan`
  and `packages/engines/software`.
- Fixtures: decide which S1-S5 fixtures become formal regression fixtures.

## Required Verification After Promotion

- Markdown link/source path check.
- Formal package `yarn build`.
- Formal package tests or fixture runner smoke.
- Confirm no formal package imports from `ai/tasks/`.

## Do Not Promote

- Whole summary sandbox.
- Whole S1-S5 task directories.
- Task-local type subsets.
- Generated `dist/` output.
- S1-S5 runtime algorithms as mandatory engine architecture.
- Old-code-inspired behavior as schema truth without fresh feature/profile
  review.
