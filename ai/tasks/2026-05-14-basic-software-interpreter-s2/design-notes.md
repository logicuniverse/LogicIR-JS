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

- `property` is one of the three core port contact kinds and already implies
  retained-current semantics. It replaces the older task-local retained-current
  boolean shape.
- State-store identity and operation kind are task-local external target
  identity in S2. They describe this sandbox runtime's implementation route,
  not the existence of retained-current semantics.
  The task-local engine receives its state store as execution context; S2 does
  not need an architecture-level provider contract or execution binding.
- S2 intentionally has no required feature contracts. Later formal software
  state-store features can add richer binding/lowering metadata, but the minimal
  property/current smoke must run without them.
- A missing write input means “do not write” for this S2 plan. This lets the
  same plan support read-only and read-write runs.
- Subscriptions and update notification are deferred; S2 validates current
  read/write only.
- Empty `featureContracts`, `stages`, `providerContracts`, and `bindings`
  arrays remain only where the current architecture schema shape requires them.
  S2 does not predeclare a projection stage because the task-local resolver and
  projector do not consume stage data.

## Promotion Notes

The promotable behavior is small: core property fixture usage, read/write
operation shape, and a regression smoke. The local type subset should not be
promoted as schema.
