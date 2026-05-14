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
H3_PASS
generated/h3_tb.v:23: $finish called at 22000 (1ps)
```

## Known Gaps

- No multi-clock behavior.
- No structural composition.
- No failure-path diagnostics.
