# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Task: `legacy-coverage-map`
- Verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `coverage-report.md` | `dev/legacy-coverage-map.md` or a roadmap appendix | candidate | Useful as roadmap input after review. |
| `coverage.json` | future planning data under `dev/` or `ai/templates` | candidate | Machine-readable coverage matrix. |
| Follow-up round list in `coverage-report.md` | `dev/roadmap.md` | candidate | Promote only selected rounds after prioritization. |

## Required Formal Updates

- Roadmap: add accepted follow-up rounds only after human review.
- Dev docs: optionally add a stable legacy coverage page.
- AI tasks: future rounds should cite the relevant coverage ids.

## Required Verification After Promotion

- Markdown link/source path check.
- Re-run any promoted consistency script or equivalent.
- Confirm no formal package imports from `ai/tasks/`.

## Do Not Promote

- Generated logs.
- Whole sandbox directory.
- Any claim that S1-S5 fully reproduce legacy behavior.
- Coverage status as a migration order.
- Legacy algorithms as required implementation routes.
- Legacy mechanism as core schema or schema truth.
