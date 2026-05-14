# Promotion Checklist

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-hdl-sim` H2
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-hdl/add4.ts` | candidate | Needs formal type imports. |
| `src/projector.ts` | future `packages/projectors/verilog` | candidate | Width helper may be useful. |
| `src/smoke.ts` | future HDL smoke fixture | candidate | Wraparound test is useful. |

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- `iverilog` plus `vvp` smoke.

## Do Not Promote

- Generated artifacts.
- Task-local type subset.
