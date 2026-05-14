# 2026-05-13 Projection Stack Goal

This pack consolidates the partially completed goal:

> Complete the type-system, JS/Python runtime, and Verilog HDL projection work,
> while continuing to refine it until genuinely complete.

The goal is not complete. This pack is an AI task record and conversation
substrate. It records what the unconfirmed automatic goal run produced, what
that material appears to prove, what it does not yet prove, and how future
human/AI sessions should continue.

Important status rule:

- Files already confirmed by the human and committed to git may remain in the
  formal project tree.
- Files generated automatically during the paused goal run and not committed
  are archived under `artifacts/unsubmitted-working-tree/` and must be treated
  only as exploration material.
- Do not copy archived files back into formal package/schema/projection paths
  unless a later human/AI session reviews, narrows, and explicitly reintroduces
  them.

## Current Status

- Human-confirmed package and schema files remain in formal project directories
  at the current git `HEAD`.
- The automatic run produced additional core examples, validator drafts,
  feature drafts, projection contracts, lowerings, smoke files, and conformance
  files. Those files are archived under
  `artifacts/unsubmitted-working-tree/schema/`.
- The automatic run also produced temporary CommonJS smoke artifacts. Those are
  archived under `artifacts/unsubmitted-working-tree/tmp/`.
- Tracked formal-file edits from the automatic run were reviewed and their
  useful content was extracted into
  [tracked-patch-extract.md](tracked-patch-extract.md). The intermediate patch
  capture is not kept as a long-term artifact.

## Pack Contents

- [results-map.md](results-map.md): grouped artifact map and current evidence.
- [decision-log.md](decision-log.md): design decisions that should be preserved
  for later discussion.
- [open-questions.md](open-questions.md): unresolved issues and interaction
  prompts for the next sessions.
- [tracked-patch-extract.md](tracked-patch-extract.md): readable extraction of
  useful ideas from the automatic run's tracked-document edits.
- [verification.md](verification.md): last-known verification commands and
  what they mean.

## Source Priority

1. Canonical theory remains `docs/essay.md` and the operational extracts in
   `dev/`.
2. Formal package and schema/projection files are only the committed,
   human-confirmed state at `HEAD`.
3. Uncommitted automatic-run products live under this pack's `artifacts/`
   directory and are discussion material, not accepted schema.

## Git Evidence

Recent committed evidence on `develop`:

- `b412b01` on 2026-05-12: workspace/schema/projection documentation sync.
- `e5f417a` on 2026-05-12: core v0 draft and operational principle updates.
- `932067b` on 2026-05-12: core v0 draft refinement.
- `8219c04` on 2026-05-12: major schema/workspace/protocol alignment pass.

Archived automatic-run evidence includes validator, feature, projection,
lowering, smoke, and conformance files under
`artifacts/unsubmitted-working-tree/schema/`, plus the tracked formal-file
ideas extracted in [tracked-patch-extract.md](tracked-patch-extract.md).

## How To Use This Pack

Start by reading [results-map.md](results-map.md), then pick one topic from
[open-questions.md](open-questions.md). Future sessions should avoid treating
the current lowerings as final target runtimes; they are executable probes that
help decide the stable feature/projection contracts.

Recommended next-session flow:

1. Read `dev/operational-theory.md` and
   `dev/schema-principles.md` for the stable design boundary.
2. Read this pack's [results-map.md](results-map.md) for what exists now.
3. Read [decision-log.md](decision-log.md) before changing names, feature
   boundaries, or target semantics.
4. Read [tracked-patch-extract.md](tracked-patch-extract.md) before deciding
   whether any tracked-document idea should be promoted into formal docs.
5. If a prompt depends on automatic-run code, inspect the archived file under
   `artifacts/unsubmitted-working-tree/` and reintroduce only the reviewed
   subset needed for that prompt.
6. Pick one prompt from [open-questions.md](open-questions.md) and turn it into
   a narrow plan or patch.
7. Use [verification.md](verification.md) to rerun the relevant gate.

Do not start by rewriting the essay or by expanding core schema to absorb
target behavior. Most remaining work belongs in feature drafts, projection
diagnostics, target planning, lowerings, and conformance fixtures.
