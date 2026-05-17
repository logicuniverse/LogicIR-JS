# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-software-interpreter` S2 retained-current
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/architecture.ts` | future architecture fixture/catalog seed | candidate | Minimal profile/stack draft with no required feature contracts. Property retained-current semantics remain core. |
| `src/fixture.ts` | future retained-current fixture | candidate | Shows stateful read/write current behavior. |
| `src/projector.ts` | future interpreter-plan projector | candidate | Only operation extraction pattern should be promoted. |
| `src/engine.ts` | future software engine | candidate | Memory retained-current state behavior. |
| `src/smoke.ts` | future fixture-runner test | candidate | Good regression for retained current. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Formal software interpreter smoke for retained-current.
- Any later state-store feature must be additive; S2 itself should remain
  runnable without feature declarations.

## Do Not Promote

- Generated `dist/`.
- Whole sandbox directory.
- S2-local schema subset in `src/types.ts`.
