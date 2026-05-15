# Design Notes

## Summary

S2 extends the S1 interpreter path with retained-current state. The fixture uses
a stateful LU with one state-store-backed surface named `counter`.

The plan has two operations:

- `read-current`: read the current value into an output port.
- `write-current`: write an input value to the store and expose the written
  value.

The smoke runs the same plan three times against one memory state store to prove
state is retained across runs.

## Boundary Decisions

- `retainedCurrent` remains a port interaction capability in core-shaped data.
- State-store identity and operation kind are retained-current feature payload.
  The task-local engine receives its state store as execution context; S2 does
  not need an architecture-level provider contract or execution binding.
- Required retained-current feature checking is only declared on the projection
  profile because the S2 projector is the code path that consumes it.
- A missing write input means “do not write” for this S2 plan. This lets the
  same plan support read-only and read-write runs.
- Subscriptions and update notification are deferred; S2 validates current
  read/write only.
- Empty `featureContracts`, `stages`, `providerContracts`, and `bindings`
  arrays remain only where the current architecture schema shape requires them.
  S2 does not predeclare a projection stage because the task-local resolver and
  projector do not consume stage data.

## Promotion Notes

The promotable behavior is small: retained-current feature payload shape,
read/write operation shape, and a regression smoke. The local type subset should
not be promoted as schema.
