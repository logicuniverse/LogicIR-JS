# Design Notes

## Intent

The MVP proves a development unit: instead of treating an AI change as an
unstructured file diff, represent it as a scoped LogicIR edit transaction with
replayable operations and verification evidence.

## Transaction Shape

The task-local transaction contains:

- `intent`: human-readable reason for the edit.
- `scope`: the logical region being edited.
- `before`: snapshot ref, hash, and data.
- `operations`: replayable structural operations.
- `after`: expected snapshot ref, hash, and data.
- `validation`: left optional in the transaction object because this task
  computes validation during smoke.
- `tests`: left optional for the same reason.
- `rationale`: short explanation suitable for review.

This is not a final schema. It is a small executable proof of the review unit.

## Operation Model

Operations are deliberately small:

- `set`: replace a value at a JSON path.
- `insert`: insert a keyed value into a record.
- `delete`: remove a value at a JSON path.
- `connect`: add a core connection by `connectionId`.

`connect` is not strictly necessary because `insert` could add a connection,
but keeping it as a domain operation makes review clearer: the transaction says
it is wiring endpoints, not just editing an object field.

## Typed Holes

The `before` snapshot uses explicit `$hole` records for:

- the unresolved external-target LUI.

This keeps the partial IR bounded. The fixture is incomplete, but the missing
parts carry expected kind, reason, and optional contract text.

The typed-hole vocabulary is intentionally limited to the hole kinds used by
this MVP. Feature-use holes are deferred until a task actually edits feature
manifests or extension contracts.

Provider selection is intentionally outside the LogicIR snapshot. The smoke
uses task-local execution binding data to map the external target to
`add-pair-provider`, matching the architecture boundary used by S1.

## Validation

Validation is intentionally minimal:

- replay diagnostics;
- before/after hash check;
- after snapshot equality check;
- typed hole detection;
- core shape checks for the combinational fixture;
- port direction and connection endpoint checks;
- extension `featureKey` manifest resolution.

It is not a replacement for formal validators. It is enough to prove that the
transaction can be mechanically checked in a task-local loop.

## Smoke

After replay and validation, the task projects the completed LogicUnit into a
tiny invocation plan using task-local execution binding data, then executes it
with a local `add-pair-provider`.

Expected output:

```json
{ "result": 5 }
```

## Promotion Boundary

Potentially promotable ideas:

- transaction as review unit;
- explicit typed holes in authoring snapshots;
- domain operations such as `connect`;
- replay plus hash plus validation as AI task acceptance evidence.

Not promotable as-is:

- the exact TypeScript shapes;
- the FNV hash implementation;
- the minimal validator;
- the tiny interpreter projector.
