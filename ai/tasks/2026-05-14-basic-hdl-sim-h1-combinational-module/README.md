# basic-hdl-sim H1

## Objective

Prove the first `basic-hdl-sim` round: a minimal combinational LogicIR fixture
projects to Verilog HDL and passes an `iverilog` simulation smoke test.

## Interpretation Note

This task is sandbox evidence, not schema or projector authority. Its Verilog
emitter is a verified baseline for H1 only; formal promotion may use a different
emission strategy if it explicitly preserves combinational LU semantics and
keeps unsupported behavior diagnostic-friendly.

## Round Target

- Stack: `basic-hdl-sim`
- Round: `H1 combinational module`
- End-to-end chain: `LogicIR fixture -> Verilog projector -> module/testbench -> iverilog -> vvp output`
- Required fixture: `src/fixture.ts`
- Required verification command: `yarn verify`
- Expected promotable output: one combinational fixture, one Verilog emitter
  shape, and one HDL smoke pattern.

## Scope

In scope:

- One bit two-input AND combinational fixture.
- Minimal HDL signal and combinational extension payloads used by the fixture
  and projector.
- Minimal Verilog module and testbench emission.
- `iverilog` and `vvp` verification through OSS CAD Suite.

Out of scope:

- Formal package, schema, docs, example, or fixture promotion.
- Width handling beyond one-bit signals.
- Clock/reset/state.
- Unsupported software semantic rejection.
- Structural hierarchy.

## Status

Current status: `ready-for-review`

## Directory Map

- `src/`: task-local types, fixture, projector, and smoke.
- `generated/`: generated Verilog, testbench, and simulation output.
- `verification.md`: verification evidence.
- `promotion-checklist.md`: possible formal promotion targets.

## Write Boundary

This task writes only inside:

```text
ai/tasks/2026-05-14-basic-hdl-sim-h1-combinational-module/
```

Formal project directories are read-only inputs.
