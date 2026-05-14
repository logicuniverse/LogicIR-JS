# Task README

Use this template as the root `README.md` for one autonomous AI task directory:

```text
ai/tasks/YYYY-MM-DD-<task>/
```

## Objective

State the concrete task in one or two sentences.

## Scope

In scope:

- List the feature, tool, validator, runtime, projector, fixture, or document
  areas explored by this task.

Out of scope:

- List formal project directories or semantics that this task must not change.

## Status

- `draft`: work in progress.
- `ready-for-review`: task output is complete enough for human review and the
  required JS/TS and/or Verilog HDL verification paths have been run or blocked
  with concrete recorded reasons.
- `reviewed`: a human has reviewed the task and identified promotable pieces.
- `closed`: no further work is expected in this sandbox.

Current status: `draft`

## How To Read This Task

Recommended order:

1. `source-map.md`
2. `design-notes.md`
3. implementation or draft folders
4. `verification.md`
5. `promotion-checklist.md`

## Directory Map

- `source-map.md`: source files, docs, and legacy evidence used.
- `design-notes.md`: design decisions, boundaries, alternatives, and risks.
- `package.json`: required when this task contains runnable JS/TS code; define
  task-local verification scripts here.
- `implementation/`: code experiments, prototypes, or draft package shapes.
- `fixtures/`: local fixtures used by this task.
- `docs/`: local documentation drafts.
- `reports/`: generated reports, diagnostics, or logs.
- `verification.md`: commands run, results, and known gaps.
- `promotion-checklist.md`: reviewed pieces that may be moved to formal
  project directories.

## Write Boundary

This task may read the repository, but it may write only inside this task
directory. Do not import this task from formal packages.

Formal project directories such as `packages/`, `schema/`, `docs/`, `dev/`,
`examples/`, and `fixtures/` may be referenced as read-only inputs. Changes for
those locations must be listed in `promotion-checklist.md` and applied only
after human review.

Task-local code and fixtures may use relative paths to read or import external
repository files as read-only inputs. This applies to JS/TS, Verilog HDL,
Python, generated artifacts, fixtures, and docs. The direction is one-way:
sandbox code may reference formal project files, but formal project files must
not import or depend on sandbox code.

If this task contains runnable JS/TS code, it should include its own
`package.json` at the task root with scripts such as `typecheck`, `test`,
`build`, or `smoke`. The task may depend on formal workspace packages as
read-only dependencies, but verification should be runnable from inside the task
sandbox instead of requiring formal packages to import task-local code.
