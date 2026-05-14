# Promotion Checklist

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-hdl-sim` H1
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-hdl/and2.ts` | candidate | Needs formal core type imports. |
| `src/projector.ts` | future `packages/projectors/verilog` | candidate | Promote only as seed behavior. |
| `src/smoke.ts` | future HDL fixture-runner smoke | candidate | Useful end-to-end regression shape. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- HDL smoke using `. E:\oss-cad-suite\environment.ps1; iverilog ...; vvp ...`

## Do Not Promote

- Generated `dist/` and `generated/*.vvp`.
- Whole sandbox directory.
- Task-local type subset as formal schema.
