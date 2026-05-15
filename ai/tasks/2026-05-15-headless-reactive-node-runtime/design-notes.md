# Design Notes

## Boundary

This task validates reactive execution behavior, not React rendering. The word
`reactive` here means value changes and events propagate through a headless
graph. It intentionally does not depend on `react`, `react-dom`, browser APIs, or
component nodes.

## Legacy Interpretation

The old node functions are evidence for useful behavior:

- `property` keeps a retained current value and updates from stream events.
- `property.number` accepts commands such as `set`, `add`, and `increment`.
- `event.merge` and `event.mux` forward incoming event data.
- `operator.add` and related operators are pure derived computations.

The sandbox reimplements the smallest useful subset instead of importing old
runtime helpers.

## Runtime Model

- Property nodes hold durable task-local state.
- Stream nodes deliver events synchronously through explicit subscriptions.
- Derived nodes recompute when their upstream property values change.
- Every propagation emits a trace entry so smoke tests can prove ordering and
  final retained values.

This is a candidate realization strategy, not a new core schema rule.
