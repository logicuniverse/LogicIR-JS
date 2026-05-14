# Promotion Checklist

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-hdl-sim` H5
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-hdl/and3-structural.ts` | candidate | Needs formal structural shape review. |
| `src/projector.ts` | future `packages/projectors/verilog` | candidate | Payload validation and instance emission helpers may be useful. |
| `src/smoke.ts` | future HDL hierarchy smoke | candidate | Useful 8-vector regression. |

## Do Not Promote

- Generated files.
- Hard-coded structural payload as final schema.
- Task-local thrown-error validation as final diagnostic model.
