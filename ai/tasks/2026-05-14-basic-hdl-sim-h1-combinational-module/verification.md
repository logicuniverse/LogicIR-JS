# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn typecheck` before implementation | failed as expected | RED check: missing `fixture` and `projector` modules. |
| `yarn verify` | passed | Runs typecheck, build, Verilog emission, `iverilog`, and `vvp`. |

## Accepted Evidence

Command:

```powershell
yarn verify
```

Observed final output:

```text
H1_PASS
generated/h1_tb.v:15: $finish called at 4000 (1ps)
```

Generated files:

- `generated/h1_module.v`
- `generated/h1_tb.v`
- `generated/h1.vvp`

## Known Gaps

- No vector width support.
- No sequential logic.
- No unsupported-semantics rejection.
- No structural hierarchy.
