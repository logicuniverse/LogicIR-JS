# Headless Reactive Node Runtime

## Objective

Validate the old FlowForge-style node idea in a headless environment: no React
DOM, no visual editor, and no browser dependency. The task checks whether a
small reactive runtime can preserve useful legacy node behavior such as
retained-current properties, stream propagation, event merge/mux, and derived
operator computation.

## Scope

In scope:

- Task-local snapshots of selected legacy node semantics.
- A minimal headless reactive runtime with property state, subscriptions, event
  delivery, and propagation trace.
- Fixtures for counter updates and derived value recomputation.
- Runnable TypeScript verification.

Out of scope:

- ReactDOM, component rendering, or a visual editor.
- Formal package changes.
- Full legacy runtime compatibility.
- LogicIR schema promotion.

## Directory Map

- `src/types.ts`: task-local runtime and node catalog data shapes.
- `src/legacy-node-snapshot.ts`: small pure-data/function snapshot of relevant
  old stdlib node behavior.
- `src/runtime.ts`: headless reactive runtime.
- `src/fixtures.ts`: scenarios proving reactive behavior.
- `src/smoke.ts`: verification entrypoint.
- `verification.md`: command evidence.
- `promotion-checklist.md`: review notes.

## Write Boundary

This autonomous task writes only inside:

```text
ai/tasks/2026-05-15-headless-reactive-node-runtime/
```

Legacy source is read-only evidence.
