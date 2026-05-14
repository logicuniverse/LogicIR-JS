# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn typecheck` before implementation | failed as expected | RED check: missing `fixture` and `projector`. |
| `yarn verify` | passed | Runs typecheck, build, and rejection smoke. |

## Accepted Evidence

```powershell
yarn verify
```

Observed output:

```json
{
  "result": "rejected",
  "diagnostic": {
    "code": "HDL_UNSUPPORTED_REQUIRED_FEATURE",
    "severity": "error",
    "feature": "logicir.software/invocation",
    "message": "basic-hdl-sim cannot project required feature logicir.software/invocation without an explicit lowering or rejection policy."
  },
  "artifactWritten": false
}
```

## Known Gaps

- No formal shared diagnostic model.
- No lowering route.
- No Verilog simulation because rejection is the expected final result.
