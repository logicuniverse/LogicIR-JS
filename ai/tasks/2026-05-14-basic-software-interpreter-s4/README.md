# basic-software-interpreter S4

## Objective

Add minimal Z-axis fulfillment to the software interpreter sandbox. A
requirement-backed LUI can be fulfilled by a local closure or by an upstream
provider. Missing upstream provider returns a diagnostic.

## Round Target

- Stack: `basic-software-interpreter`
- Round: `S4 fulfillment / closure`
- End-to-end chain: `LogicIR requirement fixture -> stack/profile resolver -> fulfillment interpreter plan -> closure/upstream engine -> success and missing-provider assertions`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: fulfillment feature/extension draft,
  requirement/closure/upstream fixture, provider binding behavior, and missing
  provider diagnostic path.

## Scope

In scope:

- `logicir.software / fulfillment` feature draft.
- Requirement unit fixture.
- Closure fulfillment.
- Upstream provider fulfillment.
- Missing provider diagnostic.

Out of scope:

- Shared-service fulfillment.
- Reachability path through nested closures.
- Dynamic/switchable providers.
- Full S5 diagnostic taxonomy.

## Status

Current status: `ready-for-review`
