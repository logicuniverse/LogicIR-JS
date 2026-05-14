# Promotion Checklist

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-hdl-sim` H3
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-hdl/reg4.ts` | candidate | Needs formal core type imports. |
| `src/projector.ts` | future `packages/projectors/verilog` | candidate | Register emitter seed only. |
| `src/smoke.ts` | future HDL smoke fixture | candidate | Useful reset/latch regression. |

## Do Not Promote

- Generated files.
- Task-local type subset.
