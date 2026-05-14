# Design Notes

## Summary

H2 extends the H1 combinational shape with HDL signal metadata:
`{ width, signed }`. The projector uses width to emit Verilog ranges and the
testbench verifies unsigned 4-bit arithmetic wraparound.

## Boundaries

- Width is feature-owned port metadata, not core schema.
- Type checking is minimal and target-facing; there is no full type-system
  integration in this sandbox.
- The emitter supports only matching-width add.

## Risks

- Signedness is represented but not behaviorally tested.
- Formal promotion should reconcile this payload with `logicir.type-system`
  and HDL signal feature definitions.
