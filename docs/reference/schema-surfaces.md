# Schema Surfaces

This page describes the current stable schema-facing surfaces that readers
should use.

## Two Layers

LogicIR currently exposes schema in two complementary layers:

1. **TypeScript authoring source**
   - `packages/core`
   - `packages/architecture`
   - `packages/features/*`
2. **Language-neutral published route**
   - `schema/`

The package layer is where accepted TS data shapes are authored today. The
`schema/` layer is the language-neutral route for curated draft notes and
future generated artifacts.

## Core Schema

Current authoring source:

- `packages/core/src/types.ts`

What it currently defines:

- `LogicUnit`, `LUCore`, and `LUI`
- boundary contact kinds: `pull`, `push`, `property`
- endpoint and connection addressing
- LU kind organization:
  - `combinational`
  - `sequential`
  - `stateful`
  - `structural`
- requirement / fulfillment
- closure
- structural anchors / outlets / fills

Published route:

- [schema/core/v0-draft/](../../schema/core/v0-draft/)

## Architecture Schema

Current authoring source:

- `packages/architecture/src/types.ts`

What it covers:

- features
- profiles
- stacks
- capabilities
- provider contracts
- stages and policies
- execution bindings

Published route:

- [schema/architecture/](../../schema/architecture/)

## Feature Schema

Current accepted feature package:

- `packages/features/type-system`

Published route:

- [schema/features/type-system/](../../schema/features/type-system/)

## Reader Guidance

Use these surfaces with the following rule:

- read `docs/` for explanation
- read `schema/` for published route and draft artifact notes
- read `packages/*/src` when you need the exact currently accepted TS shape

Do not treat `dev/` or `ai/tasks/` as schema authority.
