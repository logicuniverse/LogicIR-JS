# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn typecheck` before implementation | failed as expected | RED check: missing `fixture` and `projector`. |
| `yarn typecheck` after full-code smoke update | failed as expected | RED check: missing `and3TruthTable`, `h5LibraryModules`, and projector options. |
| `yarn verify` | passed | Runs typecheck, build, emit, `iverilog`, and `vvp`; smoke covers 8 test vectors. |

## Accepted Evidence

```powershell
yarn verify
```

Final simulator output:

```text
H5_PASS
generated/h5_tb.v:36: $finish called at 8000 (1ps)
```

## Known Gaps

- No arbitrary hierarchy lowering.
- No formal module library resolution.
- No anchor/outlet lowering beyond the minimal payload.
- No formal diagnostic object model; H5 validation failures still throw errors.
