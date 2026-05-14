# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-software-interpreter` S4 fulfillment / closure
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/architecture.ts` | future architecture fixture/catalog seed | candidate | Fulfillment feature draft. |
| `src/fixture.ts` | future fulfillment fixtures | candidate | Needs formal closure representation before promotion. |
| `src/projector.ts` | future interpreter-plan projector | candidate | Extracts fulfillment into plan nodes. |
| `src/engine.ts` | future software engine | candidate | Executes closure/upstream fulfillment and missing-provider diagnostic. |
| `src/smoke.ts` | future fixture-runner test | candidate | Covers closure, upstream, and missing provider. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Formal fulfillment smoke.

## Do Not Promote

- Generated `dist/`.
- Whole sandbox directory.
- Runtime-function closure representation without formal review.
