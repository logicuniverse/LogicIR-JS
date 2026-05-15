# Source Map

## Software Round Evidence

| Source | Why It Matters |
| --- | --- |
| `ai/tasks/2026-05-14-basic-software-interpreter-s1/` | Provider invocation, resolver, interpreter plan, and synchronous engine seed. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s2/` | Retained-current state-store provider behavior. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s3/` | Thenable-compatible completion and provider rejection behavior. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s4/` | Requirement fulfillment, closure, upstream provider, and missing-provider behavior. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s5/` | Shared diagnostic/report seed and no-uncaught-throw failure behavior. |
| `ai/tasks/2026-05-14-legacy-coverage-map/` | Legacy coverage gaps and recommended S6+ rounds. |

## Project Guidance

| Source | Why It Matters |
| --- | --- |
| `dev/roadmap.md` | Defines the S1-S5 round intent and promotion discipline. |
| `dev/operational-theory.md` | Separates core topology from software runtime realization. |
| `dev/schema-principles.md` | Defines feature/profile/projector boundaries and required diagnostics. |
| `packages/legacy/engine/src/` | Old engine evidence for provider, projection, completion, retained-current, and diagnostics. |

## Source Priority Notes

- S1-S5 are sandbox evidence, not formal implementation.
- Legacy code is source evidence, not schema authority.
- Formal promotion must re-verify from the destination package context.
