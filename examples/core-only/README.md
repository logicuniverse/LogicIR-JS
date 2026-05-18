# Core-Only Examples

This package contains feature-free LogicIR examples based on the current
`@logic-universe/logic-ir-core` schema.

The examples are deliberately small. Their purpose is to validate the shape and
meaning of the current IR before introducing feature, profile, provider, or
runtime-specific data.

They are executed through the shared
`@logic-universe/logic-ir-engine-core-software-interpreter` seed instead of
per-example handwritten runtime logic. Each scenario should contribute:

- a core-only `LogicUnit` fixture
- minimal example input / push / structural outlet data
- assertions about result / property / composition behavior

This keeps examples focused on IR evidence while the execution semantics are
gradually consolidated into one formal engine package.

## Current Sequence

1. `01-combinational-add`: single-LUI combinational add.
2. `02-stateful-counter`: stateful current with `pull` initial, `push` updates,
   and `property` output.
3. `03-sequential-pipeline`: sequential pipeline with explicit ordered steps.
4. `04-structural-dom`: headless structural UI/DOM composition surface.
5. `05-multi-lui-composition`: multiple LUI connection composition.
6. `06-z-requirement-closure`: requirement target and closure fulfillment.

## Commands

```sh
yarn workspace @logic-universe/logic-ir-examples-core-only build
yarn workspace @logic-universe/logic-ir-examples-core-only test
```
