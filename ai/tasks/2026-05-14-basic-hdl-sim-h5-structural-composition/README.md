# basic-hdl-sim H5

## Objective

Prove structural module composition for `basic-hdl-sim`: a top-level structural
LogicIR fixture projects to hierarchical Verilog with two child module
instances and passes simulation.

## Round Target

- Stack: `basic-hdl-sim`
- Round: `H5 structural module composition`
- End-to-end chain: `LogicIR fixture -> structural Verilog projector -> hierarchical modules/testbench -> iverilog -> vvp output`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: structural payload shape, module instance
  emitter pattern, and hierarchy smoke.

## Status

Current status: `ready-for-review`

## Scope

In scope:

- Task-local HDL feature/profile sketch for the H5 round.
- Structured fixture data for module name, library module, internal wire,
  child instances, and truth-table vectors.
- Projector-side payload validation before emitting Verilog.
- Two `and2` child instances.
- One internal wire.
- `and3` top-level behavior.
- `iverilog` hierarchy simulation.

Out of scope:

- General graph scheduling.
- Arbitrary module libraries.
- Multi-bit structural routing beyond emitting width metadata.
- Structural anchors/outlets beyond a minimal payload.
