# basic-software-interpreter S5

## Objective

Unify basic software interpreter failure paths into structured diagnostics and
reports. Provider missing, invalid plan, unsupported semantics, and runtime
failure all return diagnostic data instead of uncaught exceptions.

## Interpretation Note

This task is sandbox evidence, not diagnostic-schema authority. Its report shape
is the S5 baseline; formal promotion may use a different taxonomy, source span
model, or severity policy if failures remain structured and reviewable.

## Round Target

- Stack: `basic-software-interpreter`
- Round: `S5 error / diagnostic`
- End-to-end chain: `failure fixtures -> diagnostic-aware projector/engine -> report summary assertions`
- Required fixture: `src/fixtures.ts`
- Required verification command: `yarn verify`
- Expected promotable output: diagnostic model draft, failure fixtures, report
  output shape, and no-uncaught-throw failure path behavior.

## Scope

In scope:

- Diagnostic shape with `code`, `severity`, `phase`, `message`, `subject`, and
  optional detail.
- Provider missing.
- Plan invalid.
- Unsupported semantics.
- Runtime failure.
- Report summary.

Out of scope:

- Warning/info policy.
- Localization.
- Rich source locations.
- Formal integration with previous S1-S4 code.

## Status

Current status: `ready-for-review`
