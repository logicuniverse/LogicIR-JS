# Projection Targets Reference

Use this when assessing how schema, architecture, feature, tool, projection, or
execution changes affect JS/TS runtime and Verilog HDL.

## JS/TS Runtime Projection

Software runtime details belong in feature extensions or projector implementation, not core schema.

Common JS/TS feature concerns:

- async and thenable/promise realization.
- subscription and event listener mechanics.
- host native capabilities.
- runtime state storage.
- error and lifecycle events.
- provider contracts and execution bindings.
- interpreter plans, generated-code plans, and execution profiles.
- legacy TS/JS compatibility.
- provider packaging, hook systems, or local plugin loaders.

Reject designs that make these details mandatory for core LogicIR semantics.

## Verilog HDL Projection

Verilog HDL is a first-class projection constraint, not a late add-on.

Assess whether the schema can map to:

- module boundaries.
- ports and directions.
- explicit connections.
- combinational logic.
- sequential logic.
- state.
- clock and reset handling.
- generate/elaboration-time structure.
- static binding constraints.

Do not force LogicIR to become HDL schema. Use HDL as a check that the core topology is not locked to software runtime assumptions.

## When HDL Cannot Directly Support a Concept

Classify the gap:

- Semantic limitation: target cannot preserve the declared LogicIR behavior.
- Implementation deferred: possible, but projector does not support it yet.
- Requires projection pass: needs lowering, specialization, static elaboration, or decomposition before HDL generation.

Required unsupported behavior must produce diagnostic, not partial HDL.

## Execution Provider Boundary

- Execution target is the run shape.
- Execution environment is the host context.
- Execution binding is item-level profile data mapping an abstract need to a
  provider identity and config.
- Execution provider is the concrete ability entity, such as a function, module,
  remote service, database, message bus, hardware interface, or simulator
  foreign module.
- `Plugin` is only one packaging/loading strategy for a provider or pass, not a
  core ecosystem term.

## Target-Neutral Design Test

For every proposed core field, ask:

- Does JS/TS need this only because of runtime implementation?
- Does HDL need this only because of hardware realization?
- Can this be expressed as feature extension data or projector capability instead?
- Would removing this field destroy the logical topology, or only one target's lowering path?
