# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-software-interpreter` S3 completion / await
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/architecture.ts` | future architecture fixture/catalog seed | candidate | Completion feature and policy draft. |
| `src/fixture.ts` | future async provider fixture | candidate | Minimal async double fixture. |
| `src/engine.ts` | future software engine | candidate | Await/reject conversion behavior. |
| `src/smoke.ts` | future fixture-runner test | candidate | Covers resolve and reject. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Formal async software interpreter smoke.

## Do Not Promote

- Generated `dist/`.
- Whole sandbox directory.
- S3-local schema subset in `src/types.ts`.
