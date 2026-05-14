# Flow Runtime Core Snapshot

This is a curated legacy snapshot from:

`D:\Projects\flow-monorepo\packages\ff-runtime-core`

It is kept as historical evidence for the software runtime side of LogicIR design. It is not an active package and should not be imported by current packages.

## Included

- `src/types/`
- `src/runner.ts`
- `src/run-flow.ts`
- `src/hooks/`
- `src/helpers/`
- `src/utils.ts`
- `package.snapshot.json`

## Evidence value

This snapshot is useful when reasoning about:

- Flow/Node era model shapes.
- Pull, push, and property-style port behavior.
- Thenable-based async completion.
- State store behavior for retained-current values.
- Provider/injection service lookup.
- Runtime hooks and session metadata.
- Subflow execution and old closure-like behavior.

Do not treat this code as the current LogicIR schema authority. Runtime machinery such as thenables, subscriptions, stores, and hooks belongs in software features, execution profiles, or implementation packages, not in core schema.

