# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn verify` first run | failed | The matrix declared `drop-intentionally` as an allowed status but had no row using it. |
| `yarn verify` after adding `runtime.plugin-as-core` | passed | Validated status enum coverage, row ids, source paths, recommendations, and report id coverage. |

## Accepted Verification Evidence

Command:

```powershell
yarn verify
```

Observed output:

```json
{
  "rows": 28,
  "byStatus": {
    "covered-by-s1-s5": 2,
    "partially-covered": 8,
    "missing": 13,
    "drop-intentionally": 1,
    "defer": 4
  },
  "report": "ai\\tasks\\2026-05-14-legacy-coverage-map\\coverage-report.md"
}
```

## What The Verification Checks

- `coverage.json` has non-empty rows.
- Every row id is unique.
- Every row status is in the allowed status enum.
- Every allowed status appears at least once.
- Every source path exists in the repository.
- Every `missing`, `partially-covered`, `defer`, or `drop-intentionally` row has
  an actionable recommendation.
- Every `covered-by-s1-s5` row lists at least one S round.
- `coverage-report.md` includes every row id from `coverage.json`.

## Known Gaps

- This is a coverage analysis task, not runtime implementation.
- The report is broad but not exhaustive at function-level granularity.
- Follow-up rounds still need separate implementation tasks and verification.
