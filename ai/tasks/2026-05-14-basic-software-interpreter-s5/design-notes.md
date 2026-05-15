# Design Notes

## Summary

S5 introduces a small diagnostic model and report function. The projector can
produce project-phase diagnostics for unsupported semantics and invalid plans.
The engine can produce execute-phase diagnostics for provider missing and
runtime failure.

## Boundary Decisions

- Diagnostics are data, not thrown control flow, for expected failure paths.
- Project-phase diagnostics stop execution and are returned unchanged by the
  engine.
- Runtime exceptions from providers are caught and converted to
  `RUNTIME_FAILURE`.
- Report summary counts diagnostic codes for machine checks and human review.
- This round intentionally does not define profile, stack, feature, provider
  contract, or capability data because the S5 smoke path only exercises
  diagnostic projection, execution, and reporting.

## Promotion Notes

The diagnostic shape is a seed, not final schema. Before formal promotion it
should be reconciled with architecture diagnostic policy and source-location
needs.
