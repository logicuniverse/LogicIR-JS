# Design Notes

## Summary

H3 introduces HDL-specific clocking and state as feature-owned extension
payloads. The core sequential skeleton only orders the stateful LUI; Verilog
clock/reset details remain outside core.

## Boundaries

- `kindOrganization.steps` stays target-neutral.
- Clock/reset and register reset value are HDL feature data.
- The projector supports one positive-edge, active-high-reset 4-bit register.

## Risks

- The clocking payload needs broader semantics before formal promotion.
- Reset polarity and synchronous vs asynchronous reset are intentionally narrow.
