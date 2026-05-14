# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-software-interpreter` S5 error / diagnostic
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/types.ts` diagnostic subset | future shared diagnostics package/tool | candidate | Needs formal schema review. |
| `src/diagnostics.ts` | future diagnostic utility | candidate | Small report summary function. |
| `src/projector.ts` | future projector diagnostic path | candidate | Unsupported and invalid-plan examples. |
| `src/engine.ts` | future software engine | candidate | Missing provider and runtime failure conversion. |
| `src/smoke.ts` | future fixture-runner test | candidate | Covers four failure classes. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Formal failure fixture smoke.

## Do Not Promote

- Generated `dist/`.
- Whole sandbox directory.
- Diagnostic taxonomy as final without review.
