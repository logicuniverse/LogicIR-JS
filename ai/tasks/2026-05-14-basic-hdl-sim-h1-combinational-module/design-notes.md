# Design Notes

## Summary

H1 keeps the HDL path intentionally narrow: one LogicIR combinational LU with
two one-bit inputs and one one-bit output projects to a Verilog module and
testbench. The simulator verifies the full truth table for AND.

## Theory Mapping

- LU/LUI: one top-level combinational LU and one child external primitive LUI.
- X/Y plane: input/output ports and connections describe signal flow.
- Z fulfillment: not exercised.
- Feature/extension: `logicir.hdl/signal` annotates one-bit ports;
  `logicir.hdl/combinational` annotates the primitive operation.
- Projection/runtime boundary: TS emits Verilog artifacts; `iverilog` consumes
  those artifacts.

## Boundaries

- HDL clock/reset and state stay out of H1.
- Width and signedness are fixed to one-bit.
- The Verilog projector supports only one external `and` primitive.
- Generated HDL is an artifact, not LogicIR.
- H1 intentionally does not define task-local profile/stack/architecture data;
  this round only verifies fixture-to-Verilog-to-iverilog behavior.

## Risks

- The task-local type subset must be reconciled with formal packages before
  promotion.
- H1 emitter is deliberately narrow and should not be promoted as a general
  Verilog projector.
