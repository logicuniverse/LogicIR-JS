# Promotion Checklist

Human review is required before promotion.

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `src/types.ts` | future `packages/engines/software` or tool package | review-needed | Runtime shape only, not schema. |
| `src/runtime.ts` | future headless engine prototype | review-needed | Small synchronous reactive realization candidate. |
| `src/legacy-node-snapshot.ts` | future stdlib/provider catalog seed | review-needed | Must be narrowed and reconciled with LogicIR feature contracts. |
| `src/fixtures.ts`, `src/smoke.ts` | future regression fixtures | review-needed | Useful as behavior tests. |

## Do Not Promote

- Whole sandbox directory.
- `dist/`.
- The old node behavior as core schema law.
- Any ReactDOM or browser assumption; this task intentionally has none.
