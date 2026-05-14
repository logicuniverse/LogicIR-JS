# Schema Workspace Structure Plan

## Summary

Create a root-level `schema/` workspace for the new LogicIR schema. Keep it separate from old `src/types/models.ts` and use TS-first schema authoring with clear core/extension/projection boundaries. Keep the scaffold minimal and expand incrementally.

Note: this was the initial workspace scaffold plan. Later schema decisions narrowed "profile" to an application/tool-layer feature bundle, not a canonical LogicIR object-model concept.

## Key Decisions

- `schema/core/` is the target-neutral long-lived protocol core.
- `schema/profiles/` is reserved for application/tool-layer feature bundle notes.
- `schema/projection/` is reserved for projector capability and diagnostic contracts; concrete drafts are created after core or feature-extension fields exist.
- `schema/extensions/` is the feature-scoped extension registry.
- `schema/migrations/legacy-tsjs-v1/` records how old TS/JS prototype concepts map forward.
- TypeScript is the authoring source for protocol data shapes, but schema semantics remain governed by theory and adjacent Markdown docs.
- Avoid empty placeholder files. Add files only when they carry decisions, constraints, examples, or schema types ready for review.

## Theory Mapping

- Core must represent LU/LUI, X/Y LU kind, ports, connections, requirements, fulfillments, Closure, and target references.
- Z fulfillment cannot collapse into in-plane data flow or callback-style runtime convenience.
- Projection/runtime details belong in feature extensions or projector implementations.

## Projection Impact

- JS/TS runtime concerns such as async, subscriptions, host native capabilities, state stores, lifecycle events, and hooks belong in software-runtime features.
- Verilog HDL concerns such as module boundary, clock/reset, combinational/sequential lowering, generate/elaboration-time structure, and static binding constraints belong in Verilog HDL features.

## Compatibility

- The new schema workspace is additive and does not change runtime exports yet.
- Old TS/JS V1 schema remains untouched.
- Future migration plans should use `schema/migrations/legacy-tsjs-v1/`.

## Validation

- Pure documentation and minimal draft schema scaffold change.
- Validate by checking file readability and running `git status --short -uall`.
- `yarn build` is not required until `schema/` TS files are included in the package build.
