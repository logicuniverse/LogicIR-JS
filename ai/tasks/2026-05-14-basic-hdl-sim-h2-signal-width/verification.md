# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn typecheck` before implementation | failed as expected | RED check: missing `fixture` and `projector`. |
| `yarn verify` | passed | Runs typecheck, build, emit, `iverilog`, and `vvp`. |

## Accepted Evidence

```powershell
yarn verify
```

Final simulator output:

```text
H2_PASS
generated/h2_tb.v:14: $finish called at 3000 (1ps)
```

## Known Gaps

- No signed arithmetic verification.
- No sequential logic.
- No structural module hierarchy.
