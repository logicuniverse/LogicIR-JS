# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: algebraic type-system feature/tool candidate
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/types.ts` | `packages/features/type-system/src/types.ts` | review-needed | Candidate ADT payload shape; compare with existing package before promotion. |
| `src/feature.ts` | `packages/features/type-system/src/feature.ts` | review-needed | Pure data feature definition for consumed extension points. |
| `src/registry.ts`, `src/checker.ts`, `src/logicir.ts` | `packages/tools/type-system/src/` | review-needed | Candidate tool behavior and diagnostics. |
| `src/fixtures.ts`, `src/smoke.ts` | `packages/tools/type-system/tests/` or `fixtures/logicir/features/type-system/` | review-needed | Regression candidates. |

## Required Formal Updates

- Package exports:
- Schema docs:
- Dev docs or plans:
- Fixtures:
- Examples:
- Tests:
- README/docs:
- Migration notes:

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Type-system package smoke.

## Minimal Round Review

- Unused data structures removed or justified:
- Future-only feature/stage/provider/diagnostic declarations removed or
  explicitly justified:
- Empty schema-required fields documented as schema-shape constraints:
- Promoted pieces are the smallest reviewed units, not whole sandbox folders:

## Do Not Promote

- Whole sandbox directory.
- Generated `dist/`.
- Requirement/composition binding wording as implemented behavior; those are
  deferred follow-up candidates.
