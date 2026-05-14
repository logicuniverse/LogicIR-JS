# AI Tasks

This directory is the dedicated workspace for AI-autonomous tasks.

Use it for work produced by `/goal` or by parallel agents when the task is not
being reviewed step by step by a human. Sandbox output is exploration material,
not an accepted project result.

## Write Boundary

Each autonomous task must create and work inside exactly one child directory:

```text
ai/tasks/YYYY-MM-DD-<task>/
```

During that task, the agent may:

- Read any repository file needed for context.
- Write only inside its assigned `ai/tasks/YYYY-MM-DD-<task>/` directory.
- Run local verification commands when they do not modify formal project files.

During that task, the agent must not:

- Write to another task directory.
- Write to `packages/`, `schema/`, `docs/`, `examples/`, `fixtures/`, or other
  formal project directories.
- Import task output from active workspace packages.
- Treat task files as schema authority or accepted implementation.

## Required Contents

Each task directory should contain:

- `README.md`: objective, scope, status, and how to read the task directory.
- `source-map.md` or equivalent notes when existing code or documents were used
  as evidence.
- Code, drafts, generated artifacts, or experiments under clear subdirectories.
- Verification notes with commands run, results, and known gaps.
- A promotion checklist describing which pieces may be moved into formal project
  directories after human review.

## Promotion

Human review is required before any task output becomes project content.
Promotion should move only the smallest reviewed pieces into their proper
formal locations. Do not copy a whole task directory into the project.
