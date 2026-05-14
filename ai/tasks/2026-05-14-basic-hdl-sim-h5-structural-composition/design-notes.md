# Design Notes

## Summary

H5 demonstrates structural composition as hierarchical Verilog. The fixture
uses structural LU organization plus an HDL-owned `module-structure` payload
that lists internal wires and child module instances.

The sandbox keeps the code intentionally small, but no longer emits the top
module from fixed strings only. The top module name, top ports, internal wire,
library module, child instances, and testbench vectors all come from task-local
fixture data.

## Boundaries

- Core structural organization remains target-neutral.
- Concrete Verilog module instance details live in HDL feature payload.
- The projector validates the H5 structural payload enough to reject unknown
  modules, unknown ports, missing ports, unknown signal names, and invalid
  Verilog identifiers.
- The projector still supports only the module-library and structural payload
  shape needed for this round.

## Risks

- The structural payload is a projection-facing draft, not a final schema.
- Formal promotion should align with `CompositionAnchor` and `CompositionOutlet`
  semantics instead of hard-coding Verilog instance lists.
- Multi-bit signal width is emitted, but the H5 fixture only proves single-bit
  AND composition.
