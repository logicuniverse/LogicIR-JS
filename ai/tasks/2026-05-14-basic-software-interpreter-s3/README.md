# basic-software-interpreter S3

## Objective

Add thenable-compatible completion behavior to the software interpreter
sandbox. An async provider can resolve into outputs or reject into a structured
diagnostic.

## Round Target

- Stack: `basic-software-interpreter`
- Round: `S3 completion / await`
- End-to-end chain: `LogicIR fixture -> stack/profile resolver -> completion-aware interpreter plan -> async software engine -> resolve/reject assertions`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: completion feature/extension draft, async provider
  fixture, plan completion policy, and engine await/reject behavior.

## Scope

In scope:

- `logicir.software / completion` feature draft.
- LUI-level completion policy extension.
- Provider output as value or `Promise<value>`.
- Rejection converted to diagnostic.

Out of scope:

- Cancellation.
- Retry.
- Scheduling/backpressure.
- Full S5 diagnostic model.

## Status

Current status: `ready-for-review`
