# Verification

## Command

Run from `ai/tasks/2026-05-14-latest-schema-engine-replica/`:

```powershell
yarn verify
```

## Latest Result

Fresh verification passed on 2026-05-14:

```text
yarn typecheck
yarn build
yarn smoke
yarn coverage
```

Coverage output after build:

```json
{
  "rows": 14,
  "covered": 12,
  "partial": 0
}
```

The remaining two non-covered rows are not runtime gaps:

- `legacy port id runtime table`: `drop-intentionally`.
- `editor/model conveniences`: `defer`.

## Smoke Coverage

The smoke run verifies:

- Provider invocation.
- LUI override hook.
- Retained-current state read/write/read.
- Promise completion and sync async diagnostic.
- Thenable completion.
- Closure and upstream fulfillment.
- Closure override hook.
- Sequential go-back and return events.
- Payload path selection/assembly.
- Data after-read and before-emit transform hooks.
- Event emit and reactive replay.
- Nested LU plan execution and nested session bookkeeping.
- Structural composition rendering.

