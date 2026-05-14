# Initial Schema Structure Plan

## Summary

Status: superseded historical plan.

This was the initial scaffold plan for a root-level `schema/` area. The current
repo structure has moved beyond it:

- TypeScript authoring sources live under `packages/`.
- `schema/` is the language-neutral artifact and route surface.
- `dev/` contains internal development theory, plans, handoffs, rules, and AI
  skill sources.
- `ai/tasks/` contains unpromoted AI-autonomous exploration material.
- `docs/` contains reader-facing documentation.

Keep this file only as a record of the initial direction, not as current
architecture guidance.

## Key Decisions

Original decisions that still mostly hold:

- Target-neutral core belongs in the core schema surface.
- Projection/runtime details belong outside core.
- Migration notes from the old JS/TS prototype belong under schema migration
  routes or internal development docs.
- TypeScript is the preferred authoring source for protocol data shapes.
- Avoid empty placeholder files. Add files only when they carry decisions,
  constraints, examples, or schema types ready for review.

Original decisions that have been replaced:

- `schema/` is no longer treated as the authoring workspace. It is the
  language-neutral schema artifact surface.
- Profile and stack data shapes belong to `packages/architecture`, with
  generated or curated routes under `schema/architecture`, `schema/profiles`,
  and `schema/projection` when needed.
- Feature definitions belong to `packages/features/*`, with generated or
  curated routes under `schema/features/*`.

## Theory Mapping

- Core must represent LU/LUI, X/Y LU kind, ports, connections, requirements, fulfillments, Closure, and target references.
- Z fulfillment cannot collapse into in-plane data flow or callback-style runtime convenience.
- Projection/runtime details belong in feature extensions or projector implementations.

## Projection Impact

- JS/TS runtime concerns such as async, subscriptions, host native capabilities, state stores, lifecycle events, and hooks belong in software-runtime features.
- Verilog HDL concerns such as module boundary, clock/reset, combinational/sequential lowering, generate/elaboration-time structure, and static binding constraints belong in Verilog HDL features.

## Compatibility

- The schema surface is additive and does not change runtime exports by itself.
- Old TS/JS V1 schema remains untouched.
- Future migration plans should use `schema/migrations/legacy-tsjs-v1/`.

## Validation

- Pure documentation and minimal draft schema scaffold change.
- Validate by checking file readability and running `git status --short -uall`.
- `yarn build` is not required for this historical plan.
