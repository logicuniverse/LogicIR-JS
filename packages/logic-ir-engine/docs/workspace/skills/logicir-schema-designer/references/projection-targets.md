# Projection Targets Reference

Use this when assessing how schema or projection changes affect JS/TS runtime and Verilog HDL.

## JS/TS Runtime Projection

Software runtime details belong in feature extensions or projector implementation, not core schema.

Common JS/TS feature concerns:

- async and thenable/promise realization.
- subscription and event listener mechanics.
- host native capabilities.
- runtime state storage.
- error and lifecycle events.
- legacy TS/JS compatibility.
- plugin or hook systems.

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

## Target-Neutral Design Test

For every proposed core field, ask:

- Does JS/TS need this only because of runtime implementation?
- Does HDL need this only because of hardware realization?
- Can this be expressed as feature extension data or projector capability instead?
- Would removing this field destroy the logical topology, or only one target's lowering path?
