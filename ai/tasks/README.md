# AI Tasks

This directory is the dedicated workspace for reviewable AI-autonomous tasks.

Use it for work produced by `/goal` or by parallel agents when the task is not
being reviewed step by step by a human, and when the work has a clear objective,
bounded scope, and runnable verification plan. Sandbox output is exploration
material, not an accepted project result.

Use [`../scratch/`](../scratch/) instead for quick spikes, failed attempts,
temporary notes, or work that is not yet ready to become review evidence.

Default routing rule:

- Use `ai/tasks/` for `/goal`, roadmap rounds, parallel-agent work, or other
  explicitly reviewable automation tasks.
- Use `ai/scratch/` for uncertain, exploratory, throwaway, or partially
  specified work.
- If an agent is unsure, it must choose `ai/scratch/`.

Existing task directories may contain earlier exploration packs that were moved
here from older development-doc locations. Treat them as AI task material until
human promotion. Historical paths inside archived task material may be preserved
as evidence; do not read them as current project routes.

## Interpretation Rules

AI task output is evidence, not authority. Legacy code used by a task is design
input and compatibility evidence; it is not schema truth, and it is not the only
valid implementation route.

Task-local runtime, projector, compiler, HDL, catalog, or validation behavior
should be read as a verified baseline for that task's scope. A later formal
implementation may use a different algorithm, data layout, execution model, or
lowering strategy if the profile, feature contract, lowering trace, diagnostics,
and verification show that the relevant LogicIR semantics are preserved.

In particular, current 2026-05-14 / 2026-05-15 software and HDL tasks may use
terms such as lazy pull, pipeline, independent state realization, composition
function, Verilog structural payload, or legacy stdlib replica. Those terms
describe the task baseline unless a promoted formal document says otherwise.
They must not be read as final core schema, final feature schema, or mandatory
engine/projector architecture.

## Write Boundary

Each autonomous task must create and work inside exactly one child directory:

```text
ai/tasks/YYYY-MM-DD-<task>/
```

Start new tasks from the template in [`../templates/task/`](../templates/task/).
Copy the template contents into the new task directory, then fill them in during
the task.

During that task, the agent may:

- Read any repository file needed for context.
- Write only inside its assigned `ai/tasks/YYYY-MM-DD-<task>/` directory.
- Run local verification commands when they do not modify formal project files.

During that task, the agent must not:

- Write to another task directory.
- Write to `packages/`, `schema/`, `docs/`, `examples/`, `fixtures/`, or other
  formal project directories.
- Write to `dev/` unless a human explicitly asks for a reviewed documentation
  change outside the autonomous task.
- Import task output from formal workspace packages.
- Treat task files as schema authority or accepted implementation.

## Required Contents

Each task directory should contain:

- `README.md`: objective, scope, status, and how to read the task directory.
- `source-map.md`: existing code, docs, and legacy evidence used.
- `design-notes.md`: theory mapping, boundaries, alternatives, risks, and open
  questions.
- `implementation/`: code experiments, prototypes, or draft package shapes.
- `fixtures/`: task-local fixtures.
- `docs/`: task-local documentation drafts.
- `reports/`: generated reports, diagnostics, or logs.
- `verification.md`: commands run, results, and known gaps.
- `promotion-checklist.md`: smallest reviewed pieces that may be moved into
  formal project directories after human review.

Recommended status values:

- `in-progress`: the task is being worked on and is not ready for review.
- `ready-for-review`: verification evidence exists and human review can begin.
- `promoted`: selected pieces were reviewed and moved to formal project
  locations.
- `archived`: the task is kept as evidence but should not drive current work.

## Promotion

Human review is required before any task output becomes project content.
Promotion should move only the smallest reviewed pieces into their proper
formal locations. Do not copy a whole task directory into the project.

After promotion, the promoted piece must satisfy the normal package, schema,
documentation, fixture, and verification rules for its formal location.
