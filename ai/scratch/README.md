# AI Scratch

This directory is for temporary AI exploration that is not yet reviewable task
evidence.

Use `ai/scratch/` for:

- Quick spikes.
- Failed attempts.
- Temporary notes.
- Partial automation output.
- Agent experiments that do not yet have a bounded objective or verification
  plan.

Scratch contents are ignored by git by default. Keep only this README in version
control.

When a scratch result becomes worth reviewing, do not promote the scratch
directory directly. Create or update a task under `ai/tasks/YYYY-MM-DD-<task>/`
with:

- Clear objective and scope.
- Source map.
- Task-local source, fixtures, or reports.
- Runnable verification evidence.
- Promotion checklist.

Formal project files must not import from `ai/scratch/` or `ai/tasks/`.
