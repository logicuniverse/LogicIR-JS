# Promotion Checklist

Human review is required before any task output becomes project content.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: latest-schema engine replica / legacy integration evidence
- End-to-end verification reviewed: yes / no

## Promotable Pieces

Move only the smallest reviewed pieces into formal project locations.

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixtures.ts` selected fixtures | `fixtures/logicir/` or formal engine tests | candidate | Must be normalized into reviewed fixture naming and feature definitions. |
| `src/compiler.ts` concepts | `packages/projectors/js` or `packages/engines/software` | candidate | Needs formal interpreter-plan API design before promotion. |
| `src/runtime.ts` behavior slices | `packages/engines/software` | candidate | Should be split into tested modules instead of one task-local file. |
| `src/legacy-coverage.ts` | roadmap appendix or dev coverage doc | candidate | Useful as migration evidence after review. |

## Required Formal Updates

- Package exports: define a reviewed software interpreter package surface.
- Schema docs: document software runtime extensions only after feature review.
- Dev docs or plans: update roadmap with which replica slices were promoted.
- Fixtures: add stable latest-schema fixtures for promoted behaviors.
- Examples: add a basic-software interpreter example only after package exists.
- Tests: convert smoke assertions into formal unit and integration tests.
- README/docs: keep user docs focused on accepted behavior, not sandbox code.
- Migration notes: explain which old engine behaviors are intentionally not
  promoted.

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- Relevant package-level typecheck.
- Formal software interpreter smoke command.
- `git diff --check`

## Do Not Promote

- Whole sandbox directory.
- Generated `dist/`.
- Task-local runtime plan types as final API.
- Task-local `runtime-operation` payload shape without feature schema review.
- Editor/model convenience rows as runtime requirements.
- Replica runtime scheduling, state storage, hook, event replay, structural
  rendering, or session mechanics as mandatory engine law.
- Legacy behavior as schema truth without current-schema feature/profile review.
