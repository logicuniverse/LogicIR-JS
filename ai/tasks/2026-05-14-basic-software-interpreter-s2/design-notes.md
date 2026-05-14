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
- State-store identity, operation kind, and provider binding are feature/profile
  data, not core schema changes.
- A missing write input means “do not write” for this S2 plan. This lets the
  same plan support read-only and read-write runs.
- Subscriptions and update notification are deferred; S2 validates current
  read/write only.

## Promotion Notes

The promotable behavior is small: state store provider contract, read/write
operation shape, and a regression smoke. The local type subset should not be
promoted as schema.
