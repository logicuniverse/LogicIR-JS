# Promotion Checklist

Human review is required before any task output becomes project content.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-software-interpreter` Round S1, pure invocation
- End-to-end verification reviewed: yes / no

## Promotable Pieces

Move only the smallest reviewed pieces into formal project locations.

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-software/pure-invocation.ts` or `examples/basic-software/` | candidate | Needs reconciliation with formal core type imports and fixture naming. |
| `src/architecture.ts` | architecture fixtures/examples or future profile catalog package | candidate | Promote only the data shape, not task-local helper choices. |
| `src/resolver.ts` | future `packages/tools/profile-resolver` | candidate | Needs general catalog lookup, diagnostics, and tests before formal use. |
| `src/projector.ts` | future `packages/projectors/interpreter-plan` | candidate | Only supports one combinational external LUI; promote as seed behavior, not complete projector. |
| `src/engine.ts` | future `packages/engines/software` | candidate | Only supports synchronous object-in/object-out providers. |
| `src/smoke.ts` | future fixture-runner smoke test | candidate | Useful as the first end-to-end regression. |

## Required Formal Updates

- Package exports: add only after formal package locations exist.
- Schema docs: document `basic-software-interpreter` S1 as a verified seed only
  if promoted.
- Dev docs or plans: mark Round S1 as promoted or reviewed after human review.
- Fixtures: create a formal pure invocation fixture if accepted.
- Examples: optionally add a minimal `examples/basic-software` runner.
- Tests: add formal unit or smoke tests for resolver, projector, and engine.
- README/docs: point users to formal examples only after promotion.
- Migration notes: none for S1 unless existing legacy code is replaced.

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- JS/TS smoke or fixture command for the promoted software runtime/projector
  path.
- Confirm no formal package imports from `ai/tasks/`.

## Do Not Promote

- Do not promote the whole task directory.
- Do not promote generated `dist/` output.
- Do not promote broad README or verification narrative into runtime packages.
- Do not treat the S1-local type subset in `src/types.ts` as the formal schema.
