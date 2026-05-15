# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Task: `round-schema-alignment`
- Verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/verify-alignment.js` | future AI task template/check script | candidate | Useful guardrail for future rounds. |
| Alignment rule | `ai/tasks/README.md` or task template docs | candidate | Ensure future task-local types do not copy schema. |

## Required Formal Updates

- AI task template docs may need a schema ownership rule.
- Existing summary reports should mention schema-aligned status after review.

## Required Verification After Promotion

- Re-run this task's `yarn verify`.
- Re-run all affected S/H round `yarn verify` scripts.

## Do Not Promote

- Whole sandbox directory.
- Any task-local runtime/projector draft type as schema authority.
