# basic-hdl-sim Summary

## Objective

Summarize the `basic-hdl-sim` H1-H5 sandbox rounds and identify what is ready
for human review, what can seed a formal Verilog projector, and what still
needs follow-up work.

## Interpretation Note

This summary is review evidence, not projector authority. H1-H5 are verified
baselines for feasibility; they do not mandate the final Verilog projector
architecture, HDL feature payload shape, structural lowering model, or diagnostic
taxonomy.

## Round Target

- Stack: `basic-hdl-sim`
- Round: route summary for H1-H5
- End-to-end chain: `H1-H5 task evidence -> summary.json -> summary-report.md -> verification script`
- Required fixture: `summary.json`
- Required verification command: `yarn verify`
- Expected promotable output: route-level promotion guidance and follow-up
  roadmap input.

## Scope

In scope:

- H1 combinational module.
- H2 signal width / simple type.
- H3 sequential state.
- H4 unsupported-semantics rejection.
- H5 structural module composition.

Out of scope:

- Merging H1-H5 implementations into a formal package.
- Editing `packages/`, `schema/`, `dev/`, `examples/`, or `fixtures/`.
- Claiming H1-H5 are a complete HDL compiler.

## Status

Current status: `ready-for-review`

## Directory Map

- `summary.json`: machine-readable route summary.
- `summary-report.md`: human-readable route assessment.
- `source-map.md`: evidence used.
- `src/verify-summary.js`: task-local consistency check.
- `verification.md`: command evidence.
- `promotion-checklist.md`: promotion guidance.

## Write Boundary

This task writes only inside:

```text
ai/tasks/2026-05-14-basic-hdl-sim-summary/
```

Formal project directories and earlier AI task directories are read-only inputs.
