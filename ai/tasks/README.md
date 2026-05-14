# AI Tasks

This directory is the dedicated workspace for AI-autonomous tasks.

Use it for work produced by `/goal` or by parallel agents when the task is not
being reviewed step by step by a human. Sandbox output is exploration material,
not an accepted project result.

Existing task directories may contain earlier exploration packs that were moved
here from older development-doc locations. Treat them as AI task material until
human promotion. Historical paths inside archived task material may be preserved
as evidence; do not read them as current project routes.

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

## Promotion

Human review is required before any task output becomes project content.
Promotion should move only the smallest reviewed pieces into their proper
formal locations. Do not copy a whole task directory into the project.

After promotion, the promoted piece must satisfy the normal package, schema,
documentation, fixture, and verification rules for its formal location.
