# basic-software-interpreter S2

## Objective

Add retained-current behavior to the software interpreter sandbox: a LogicIR
fixture reads current state, writes a new current value through a state-store
provider, then reads the updated value on the next run.

## Interpretation Note

This task is sandbox evidence, not schema or engine authority. Its state-store
path is the S2 baseline, not a mandatory state architecture. Formal promotion
may use a different store, reactive, incremental, or event-loop strategy if
retained-current/current read and durable update semantics remain explicit and
verified.

## Round Target

- Stack: `basic-software-interpreter`
- Round: `S2 retained-current`
- End-to-end chain: `LogicIR fixture -> stack/profile resolver -> retained-current interpreter plan -> state-store engine -> current value assertions`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: retained-current feature/extension draft,
  state-store provider contract shape, stateful fixture, and minimal state-store
  engine behavior.

## Scope

In scope:

- `logicir.software / retained-current` feature draft.
- LUI/Port extension payload draft for state key and state operation.
- Memory state-store provider.
- Read-current and write-current interpreter operations.
- Task-local smoke proving initial read, write, and updated current read.

Out of scope:

- Formal package changes.
- Async completion, fulfillment/closure, lifecycle, transport, and HDL.
- Durable persistence or subscriptions.

## Status

Current status: `ready-for-review`

## Directory Map

- `src/architecture.ts`: S2 feature/profile/stack/provider-contract data.
- `src/fixture.ts`: retained-current fixture.
- `src/resolver.ts`: minimal stack resolver.
- `src/projector.ts`: retained-current plan projector.
- `src/engine.ts`: memory state-store execution.
- `src/smoke.ts`: end-to-end smoke.
- `verification.md`: fresh command evidence.
- `promotion-checklist.md`: promotion notes.

## Write Boundary

This sandbox writes only inside:

```text
ai/tasks/2026-05-14-basic-software-interpreter-s2/
```
