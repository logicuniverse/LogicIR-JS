# Promotion Checklist

Human review is required before any task output becomes project content.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: legacy stdlib coverage follow-up
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/catalog.ts` | future `packages/features/stdlib` or feature catalog package | review-needed | Pure data identity/port evidence only. |
| `src/providers.ts` | future `packages/engines/software` provider package | review-needed | JS runtime behavior, not schema. |
| `src/smoke-cases.ts` | future fixtures/tests | review-needed | Good seed for formal interpreter tests. |
| `src/logic-unit-fixture.ts` | future fixtures helper | review-needed | Builds current core `LogicUnit` fixtures for one-node stdlib calls. |
| `src/coverage-check.ts` | future migration coverage gate | review-needed | Verifies legacy key coverage. |

## Required Formal Updates After Promotion

- Decide the feature namespace for stdlib behavior.
- Split pure feature/catalog data from provider implementation.
- Add formal package exports and package-level tests.
- Add HDL rejection or lowering rules for software-only nodes.
- Add docs explaining callback and property semantics as feature/runtime
  contracts, not core schema.

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Package-level software interpreter smoke tests.
- HDL projector rejection tests for unsupported stdlib nodes, if promoted into
  profile-visible fixtures.

## Do Not Promote

- `dist/`
- whole task directory
- task-local README/report prose as formal docs without editing
- task-local callback-function smoke representation as core schema
