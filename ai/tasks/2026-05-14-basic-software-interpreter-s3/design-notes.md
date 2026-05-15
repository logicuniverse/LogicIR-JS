# Design Notes

## Summary

S3 introduces completion as profile/runtime behavior. The projector extracts a
`completion-policy` extension and emits an interpreter plan with
`await-provider` semantics. The engine awaits provider output and converts
provider rejection into a diagnostic result.

## Boundary Decisions

- Promise/thenable mechanics stay out of core.
- Completion policy is LUI feature payload projected into the interpreter plan.
- The execution engine consumes the plan-level completion policy directly. S3
  does not need separate execution-profile policy data.
- Engine returns `{ status, outputs, diagnostics }` so reject does not escape as
  an uncaught exception.
- This is a narrow diagnostic path for provider rejection; S5 owns the broader
  diagnostic model.
- Empty `featureContracts`, `stages`, `providerContracts`, and `bindings`
  arrays remain only where the current architecture schema shape requires them.

## Promotion Notes

Promote only the await/reject behavior and the completion policy shape after
review. The S3-local type subset is not schema authority.
