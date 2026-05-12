# Core Theory Reference

Use this when a task asks what must be represented in LogicIR core schema.

## Source Priority

- Full theory source: `docs/essay.md`.
- Operational repo extract: `docs/workspace/operational-theory.md`.
- Original chapter sources: `D:\Projects\logicuniverse\origin-lab\essay\04-tri-axial-model.md`, `06-logicir.md`, `08-evidence-and-limits.md`.

## LogicIR Role

LogicIR is a structured-data representation of logical topology. It is not itself a runtime, engine, generated code, Verilog HDL, or JS API. Runtimes, tools, editors, analyzers, and projectors consume LogicIR.

## LU, LUI, Closure

- LU: bounded logic topology at a chosen boundary and scale.
- LUI: local manifestation of a LU inside a wider topology.
- Closure: wrapper attached to a LUI to locally fulfill one exposed requirement; it may contain a core and forward ordinary ports.

## X/Y Execution Plane

- X = unit-level boundary drive.
  - Pull (-X): sampling, reading, requesting, latching, gated progression.
  - Push (+X): arrival, event, notification, delivery directly advances boundary.
- Y = manifestation mode.
  - Space (-Y): present mapping without retained own temporal trajectory.
  - Time (+Y): retained progression, state, history, or temporal identity.

Four LU kinds:

- Combinational (-X, -Y).
- Sequential (-X, +Y).
- Stateful (+X, +Y).
- Structural (+X, -Y).

## Z Requirement Fulfillment

- Requirement is declared by a site/surface inside a LU.
- Fulfillment is compatible logic satisfying that requirement.
- Z-0 is local Closure fulfillment at the current manifestation.
- Z-n is upstream resolution through supply lineage.
- Required logic must not be smuggled through ordinary in-plane data flow.

## Representation Obligations

Core schema must preserve at least:

- Bounded LUs and local LUIs.
- Ports, endpoint refs, port discipline, and in-plane connections.
- Port-level contact capabilities such as readable, notifiable, and retained-current, while keeping their runtime/HDL realization out of core.
- Payload-level endpoint addressing for nested payload structures such as object fields, array items, bus lanes, and wrapped bus fields, while keeping deep type/packing realization in feature extensions or projectors.
- LU kind and kind-specific organization.
- Requirement services and requirement units.
- Fulfillment relations, including Closure and upstream lineage.
- Closure cores and same-key forwarded port declarations.
- Target references for LU-defined, external, and requirement-backed manifestations.
- Clear separation between representation and projection/runtime.

## Current Core Draft Alignment

The active v0 draft expresses those obligations with:

- `PortSurface = Record<PortKey, Port>`, using one key namespace per owner and `Port.boundary` for input/output side.
- `Port.interaction` as contact capability: `pullReadable`, `pushNotifiable`, and `retainedCurrent`.
- `EndpointRef.payloadPath` for payload/bus/lane addressing without turning nested payload into nested core pins.
- `LUCore.kindOrganization.kind` as the execution-plane kind discriminator.
- `steps: LUIId[]` as the minimal sequential organization; richer control flow is feature/projection territory.
- Structural anchors/outlets through `exportAnchors`, `externalOutlets`, `exportAnchorFills`, `luiFills`, and structural LUI `compositionSurface`.
- Requirement services as inline or external contracts, and fulfillment as explicit closure or upstream lineage relations.
- Extensions attached to stable owner or relationship nodes, with selector payloads for internal helper positions.
