# Design Notes

## Summary

S4 validates the smallest useful fulfillment model:

- Requirement target LUI points at `math.increment`.
- The same requirement can be fulfilled by local closure or upstream provider.
- Missing upstream provider becomes a diagnostic result.

## Boundary Decisions

- Requirement identity and fulfillment relation are LogicIR-shaped data.
- Provider execution remains runtime realization.
- Closure body in this sandbox is a task-local function for smoke simplicity;
  before promotion it must be replaced or represented by formal LogicIR closure
  data and a proper execution plan.
- Shared-service and reachability path are deferred.
- Required fulfillment feature checking is only declared on the projection
  profile because the S4 projector is the code path that consumes it.
- Empty `featureContracts`, `stages`, `providerContracts`, and `bindings`
  arrays remain only where the current architecture schema shape requires them.

## Promotion Notes

The key promotable part is the distinction between closure fulfillment and
upstream provider fulfillment in the interpreter plan. The closure function in
the fixture is not itself a formal schema proposal.
