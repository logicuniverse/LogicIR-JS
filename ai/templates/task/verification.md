# Verification

Record all checks performed for this task.

## Commands

| Command | Result | Notes |
| --- | --- | --- |
|  |  |  |

## Expected Minimum Checks

When the task contains TypeScript:

- Run a local type check against task-local code when possible.
- If task code references formal packages, use imports as read-only dependency
  evidence and do not modify those packages.

When the task proposes promotion:

- Record the expected formal verification after promotion, usually `yarn build`
  and `yarn test`.
- Record any documentation link checks, fixture checks, or target-specific
  commands needed for the formal destination.
- Confirm no task-local code is imported by formal packages before promotion.

## Known Gaps

- 
