# basic-hdl-sim H2

## Objective

Prove signal width and simple type metadata for `basic-hdl-sim`: a 4-bit
unsigned add fixture projects to Verilog and passes simulation, including
4-bit wraparound.

## Interpretation Note

This task is sandbox evidence, not schema or projector authority. Its signal
payload and Verilog emitter are verified baselines for H2 only; formal promotion
may use a different signal model or emission strategy if width semantics remain
explicit and verifiable.

## Round Target

- Stack: `basic-hdl-sim`
- Round: `H2 signal width / simple type`
- End-to-end chain: `LogicIR fixture -> width-aware Verilog projector -> module/testbench -> iverilog -> vvp output`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: HDL signal payload shape, width-aware emitter
  rules, and a 4-bit arithmetic smoke pattern.

## Status

Current status: `ready-for-review`

## Scope

In scope:

- 4-bit unsigned signal metadata on ports.
- Combinational add primitive.
- Testbench covering normal addition and wraparound.

Out of scope:

- Signed arithmetic behavior beyond carrying `signed: false`.
- Clock/reset/register.
- Unsupported software semantic rejection.
- Structural hierarchy.
