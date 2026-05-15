# Promotion Checklist

Human review is required before any task output becomes project content.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `logicir-edit-transaction-mvp`
- End-to-end verification reviewed: yes / no

## Promotable Pieces

Move only the smallest reviewed pieces into formal project locations.

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/types.ts` | TBD, likely future edit/tool package | candidate | Promote concepts, not exact shape, unless reviewed. |
| `src/replay.ts` | TBD, likely future edit/tool package | candidate | Replay behavior is useful but currently task-local. |
| `src/validate.ts` | TBD, likely future validation/report tool | partial | Only the transaction checks are promotable; core validation is fixture-specific. |
| `design-notes.md` | `dev/plans/` or future edit model plan | candidate | Could seed a formal edit model plan. |

## Required Formal Updates

- Package exports: decide whether edit transaction belongs in a future
  `packages/tools/*`, `packages/core`, or a separate edit package.
- Schema docs: only after a second task confirms the shape.
- Dev docs or plans: add a focused plan if promotion is approved.
- Fixtures: add a formal partial LogicIR fixture only after the partial/hole
  representation is reviewed.
- Examples: none yet.
- Tests: replay equality, hash/equality mismatch, unresolved hole detection,
  invalid connect path, duplicate target endpoint.
- README/docs: document the review unit and write boundary if promoted.
- Migration notes: none.

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- JS/TS smoke or fixture command, when promoted into tools or packages:
- Verilog HDL smoke command, when promoted piece affects HDL features,
  projectors, examples, or fixtures:
  `. E:\oss-cad-suite\environment.ps1; iverilog <files>`
- Additional checks: run an invalid transaction fixture to confirm diagnostics.

## Do Not Promote

- `dist/`
- Generated smoke output.
- The exact FNV hash implementation as a formal content addressing decision.
- The fixture-specific core validator as a general validator.
- The tiny invocation interpreter as a runtime implementation.

Do not promote the whole sandbox directory.
