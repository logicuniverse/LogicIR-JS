# Promotion Checklist

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round: `basic-hdl-sim` H4
- End-to-end verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/fixture.ts` | `fixtures/logicir/basic-hdl/unsupported-software-invocation.ts` | candidate | Negative fixture. |
| `src/projector.ts` | future capability checker/projector diagnostic path | candidate | Seed behavior only. |
| `src/smoke.ts` | future HDL rejection test | candidate | Useful regression. |

## Do Not Promote

- Minimal task-local diagnostic type as final diagnostic schema.
- Whole sandbox directory.
