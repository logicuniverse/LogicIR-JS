# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn verify` | passed | Validated H1-H5 paths, ready-for-review status, verification evidence, HDL evidence flags, promotion checklists, and report coverage. |

## Accepted Verification Evidence

Command:

```powershell
yarn verify
```

Observed output:

```json
{
  "stack": "basic-hdl-sim",
  "rounds": ["H1", "H2", "H3", "H4", "H5"],
  "status": "ready-for-review",
  "report": "ai\\tasks\\2026-05-14-basic-hdl-sim-summary\\summary-report.md"
}
```

## What The Verification Checks

- `summary.json` is parseable.
- All H1-H5 round paths exist.
- Each referenced round README says `ready-for-review`.
- Each referenced round has `verification.md` and `promotion-checklist.md`.
- Each referenced round verification records `yarn verify` and a passed result.
- Rounds marked `requiresIverilog` mention `iverilog` or a `H*_PASS` marker.
- `summary-report.md` mentions every round id.
- `promotion-checklist.md` exists.

## Known Gaps

- This is a route summary, not an implementation merge.
- It does not prove formal package compatibility.
