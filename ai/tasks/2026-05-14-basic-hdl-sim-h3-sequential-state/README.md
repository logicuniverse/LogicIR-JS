# basic-hdl-sim H3

## Objective

Prove sequential HDL state support for `basic-hdl-sim`: a 4-bit register with
active-high reset projects to Verilog and passes simulation.

## Interpretation Note

This task is sandbox evidence, not schema or projector authority. Its
clock/reset/register lowering is a verified H3 baseline; formal promotion may
use a different sequential realization if clocking/state contracts remain
explicit and HDL simulation preserves the observable behavior.

## Round Target

- Stack: `basic-hdl-sim`
- Round: `H3 sequential state`
- End-to-end chain: `LogicIR fixture -> sequential Verilog projector -> module/testbench -> iverilog -> vvp output`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: clock/reset payload shape, register state payload
  shape, and sequential simulation smoke.

## Status

Current status: `ready-for-review`

## Scope

In scope:

- 4-bit register state.
- Active-high reset.
- Positive-edge clocking.
- Simulation checks reset and two latch events.

Out of scope:

- Multiple clock domains.
- Async completion or software lifecycle.
- Structural composition.
- Rich diagnostic model.
