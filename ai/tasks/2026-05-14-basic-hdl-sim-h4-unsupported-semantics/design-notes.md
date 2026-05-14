# Design Notes

## Summary

H4 verifies a failure path. A LogicIR fixture declares
`logicir.software/invocation`; the HDL projector checks the selected
`basic-hdl-sim` profile support set and returns a rejection diagnostic.

## Boundaries

- Unsupported semantics policy belongs to profile/projector behavior.
- Core only records feature use; it does not decide projection compatibility.
- No HDL artifact should be written for a rejected required semantic.

## Risks

- The diagnostic model is minimal and should be reconciled with the future
  shared diagnostic model before promotion.
