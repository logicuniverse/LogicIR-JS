# basic-hdl-sim H4

## Objective

Prove that `basic-hdl-sim` rejects unsupported software-only semantics instead
of silently generating invalid or degraded HDL.

## Interpretation Note

This task is sandbox evidence, not schema or projector authority. Its rejection
shape is a baseline for H4 only; formal promotion may use a different diagnostic
model if unsupported required semantics still fail explicitly and cannot be
silently degraded.

## Round Target

- Stack: `basic-hdl-sim`
- Round: `H4 unsupported-semantics rejection`
- End-to-end chain: `LogicIR fixture -> HDL profile capability check -> structured rejection diagnostic`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: rejection diagnostic shape and unsupported
  software feature smoke.

## Status

Current status: `ready-for-review`

## Scope

In scope:

- Negative fixture using `logicir.software/invocation`.
- HDL supported feature set.
- Projector rejection result with diagnostic.

Out of scope:

- Verilog generation.
- Lowering software invocation into HDL.
- Full capability checker.
