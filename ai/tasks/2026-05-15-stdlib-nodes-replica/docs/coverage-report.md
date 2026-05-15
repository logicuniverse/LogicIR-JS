# Coverage Report

## Summary

The source audit extracts 104 actual legacy stdlib template keys and the task
replica covers all 104.

| Category | Nodes |
| --- | ---: |
| constant | 4 |
| operator | 25 |
| number | 6 |
| string | 22 |
| array | 26 |
| object | 5 |
| async | 2 |
| event | 6 |
| property | 6 |
| component | 2 |
| total | 104 |

## Coverage Gates

- `legacy-source-audit`: extracts the actual exported legacy stdlib key set
  from source and verifies catalog equality.
- `smoke`: executes every key through a current core `LogicUnit` fixture,
  task-local compiler, runtime, and provider.
- `coverage`: verifies catalog, providers, and smoke cases all cover the same
  104-key set without extras or duplicates.

## Excluded Legacy Drafts

The old string template source contains commented-out drafts:

- `string.sliceToEnd`
- `string.splitAt`

They are not part of the actual exported `stringSimpleNodeTemplates` object
after comments are stripped, so they are intentionally excluded from this
stdlib replica.
