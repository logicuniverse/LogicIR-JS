# Decision Log

This file records decisions that shaped the current draft. They are preserved
as discussion material, not frozen as final protocol law.

## Core Boundary

Core remains target-neutral. JS/Python runtime mechanics, HDL clock/reset and
module realization, type-system compatibility proofs, distributed routing
policies, and editor/tool metadata stay in feature extensions or projectors.

Reasoning:

- LogicIR core should preserve cross-target topology and boundary semantics.
- Projection targets must declare capability and fail safely when required
  semantics cannot be preserved.

## X Axis Versus Port Interaction

The X axis describes unit-level boundary drive. Port interaction describes
contact-level capability. Therefore `pullReadable`, `pushNotifiable`, and
`retainedCurrent` are port/contact semantics, not additional LU kinds or X-axis
directions.

Consequence:

- A retained-current contact can appear in a structural, stateful, sequential,
  or combinational context when the surrounding LU kind permits the boundary
  semantics.
- Old `Property` behavior maps to pull-readable + push-notifiable +
  retained-current contact capability, while implementation location is left
  to source, sink, or projector adapter.

## Port Surface Namespace

Each owner has one `PortKey` namespace. Input/output is a boundary property,
not a pair of separate maps.

Consequence:

- Same owner cannot have input `foo` and output `foo`.
- Connection validation derives graph source/sink role from owner kind plus
  boundary.

## Payload Path As Bus Addressing

`payloadPath` remains on both `from` and `to` endpoints.

Reasoning:

- It supports nested payload addressing, wrapped buses, bus lanes, and message
  fields without exploding every payload position into core pins.
- It allows ordinary point-to-point wiring to be interpreted as a special case
  of bus-style addressing.
- It gives projectors enough structure to remap or route payload fragments
  while preserving connection identity.

Boundary:

- `payloadPath` performs addressing and remapping only. It does not encode
  computation, merge policy, fan-in, serialization, or scheduling.

## Coarse Extension Attachment

Extensions attach to stable owner or relationship nodes. Helper children such
as pins, sequential step entries, composition leaves, and internal
kindOrganization fields do not get their own extension arrays.

Reasoning:

- Too many attachment points make extension management difficult.
- Owner-level payload selectors can target internal positions without adding
  identities where core does not need them.

## Feature-Centered Extension Model

Feature is the projector capability unit. Extension records belong to a
feature and use a feature-local `key` for concrete payload kind. Application
profiles or bundles remain outside the canonical LogicIR object model.

Consequence:

- A projector must declare concrete feature support, not just a bundle name.
- Required extensions are safe-failure obligations.
- Optional extensions may be ignored only when core semantics remain intact.

## Structural Anchor/Outlet Model

Structural composition uses anchors and outlets.

- `CompositionAnchor` carries `shape` and `required`.
- `compositionSurface.outlets` is a set-like list of keys, because core
  outlets intentionally carry no shape or requiredness.
- Structural LU/closure `exportAnchors` are exported single anchors and only
  carry `required`.
- Non-single composition belongs in structural LUI anchors and `luiFills`.

Reasoning:

- This keeps matching simple at the LU/closure boundary.
- Rich outlet typing, categories, layout hints, and routing hints belong in
  feature extensions.

## Spatial Slices And Distributed Projection

Structural `exportAnchors` can be read as named spatial slices. A projector may
lower an N-anchor structural LU into N slice subsystems with generated
coordination contacts such as RX/TX buses.

Boundary:

- Core supports the topology and addressing needed for this projection.
- RX/TX port generation, placement, transport, serialization, fan-in, and
  arbitration are projection strategy or required feature semantics.

## LUI Kind Matrix

The schema keeps a single `luis` map per LUCore, but constrains allowed LUI
kinds by the containing LU kind through the discriminated union and validator.

Current matrix:

- Combinational core: combinational LUIs.
- Stateful core: combinational or stateful LUIs.
- Sequential core: combinational, stateful, or sequential LUIs.
- Structural core: combinational, stateful, or structural LUIs.

Reasoning:

- This retains a schema-friendly map shape without generic-heavy type design.
- It still captures the old prototype's useful kind-specific containment
  restrictions.

## Requirement Fulfillment Separation

Requirement fulfillment remains Z-axis structure and must not collapse into
ordinary data flow, parameter passing, ambient context, or callbacks.

Consequence:

- A requirement-target LUI exposes the requirement in local topology.
- Its satisfaction is still declared by closure or upstream fulfillment
  relations.
- Runtime dynamic fulfillment is a feature/projector concern.

## Executable Runtime Lowerings As Probes

The JS and Python executable lowerings are intentionally minimal runtime probes.
They demonstrate that the schema and feature contracts can be realized for a
subset, but they should not be treated as final runtime APIs.

Stable value:

- They pressure-test retained-current, dynamic fulfillment, lifecycle/resource,
  error, and routing semantics.
- They provide executable fixtures for conformance.

Unstable value:

- Scheduling, streaming, cancellation, concurrency, backpressure, and richer
  lifecycle ordering remain open.

## Verilog HDL Lowering As Static Skeleton

The current HDL path is a static skeleton/proof path, not a complete HDL
compiler.

Stable value:

- It tests that core topology can be planned under HDL constraints.
- It proves clock/reset, signal typing, module binding, state registers,
  combinational assigns, and structural slices can live outside core.

Unstable value:

- Full child elaboration, routed buses, arithmetic sizing, state-machine
  generation, arbitration, and deep payload flattening remain future work.
