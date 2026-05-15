# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn verify` | passed | Typecheck, build, and smoke completed. |

## Accepted Verification Evidence

Command:

```powershell
yarn verify
```

Observed smoke summary:

```json
{
  "task": "algebraic-type-system-feature-tools",
  "status": "passed",
  "checkedValues": 8,
  "checkedConnections": 5,
  "issues": [
    {
      "code": "incompatible-type",
      "message": "Source type is not assignable to target type.",
      "subject": "connection:invalidNumberToInteger"
    }
  ]
}
```

## Known Gaps

- Requirement and composition type bindings are not active in this round.
- No host-language code generation or HDL layout lowering.
- Recursive assignability is conservative.
- The one reported issue is an intentional negative fixture proving that
  `number` is not assignable to `integer`.
