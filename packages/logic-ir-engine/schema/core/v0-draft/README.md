# LogicIR Core Schema v0 Draft

This directory is for the target-neutral LogicIR core schema. Core contains only the semantic relations that must be preserved across software runtimes, Verilog HDL, tools, analyzers, editors, and future projection targets.

## Scope

Core schema must represent:

- Bounded LUs and local LUIs.
- X/Y execution-plane kind: Combinational, Sequential, Stateful, Structural.
- Ports, pins, port discipline, addressable endpoint references, in-plane connections, and structural composition organization.
- Requirement services and requirement units.
- Fulfillment relations, including Closure fulfillment and upstream lineage fulfillment.
- Closure cores and same-key forwarded port declarations.
- Target references for LU-defined, external, and requirement-backed manifestations.
- Core invariants needed to determine whether the represented object is the same logical topology.

## Out of Scope

Core must not encode:

- JS Promise/Thenable or async runtime mechanics.
- Subscription/listener implementation details.
- Runtime state store handles.
- Hook or plugin implementation APIs.
- Verilog clock/reset, module elaboration, or HDL lowering details unless expressed as target-neutral logical topology.

## Files

- `types.ts`: TS-first authoring source for core protocol data shapes.

Add glossary, model, invariants, wire-shape, examples, or generated formats only when that work starts and the file can carry real design content.

## Core Invariants

| ID | Area | Invariant |
| --- | --- | --- |
| CORE-001 | Identity and keys | `id` is the opaque machine/editor identity used for graph addresses, references, diffing, migration, and visual-editor persistence. It must not carry semantic meaning. `key` is reserved for stable semantic names in a declared namespace or contract surface, such as ports and requirement service/unit names. |
| CORE-002 | Typed identity | Each addressable machine entity has its own id type, such as `LUId`, `LUIId`, `ClosureId`, and `ConnectionId`. Do not use a generic identity mixin that erases the entity kind. |
| CORE-003 | Map identity | When an entity is stored in a `Record<Id, Entity>`, the record key is the entity identity. The entity body must not repeat the same id field unless it is not keyed by an enclosing record. This includes LUIs, closures, and connections. |
| CORE-004 | LogicUnit boundary | `LogicUnit` is the schema body for one bounded LU. It does not declare its own registry identity or catalog key; LU maps, package indexes, file names, and import aliases belong to the application/profile layer that carries the `LogicUnit`. |
| CORE-005 | LU kind | `LUCore.organization.kind` is the single source of truth for the LU execution-plane kind. `LogicUnit` must not repeat this kind at its wrapper level. |
| CORE-006 | In-plane flow | Ports and connections express ordinary data or signal interaction only. Requirement fulfillment and structural composition must not be encoded as a connection. |
| CORE-007 | Single-driver target | Within one `LUCore.connections` map, each `Connection.to` endpoint must be unique by full endpoint address (`owner`, `portKey`, and `payloadPath`). Fan-out from one `from` endpoint is allowed. Fan-in or multi-driver behavior must be represented by an explicit LUI, or by a required profile/extension that declares resolution semantics. |
| CORE-008 | Connection direction | For every `Connection`, the `from` endpoint must resolve to an output port and the `to` endpoint must resolve to an input port. `payloadPath` does not change the containing port's direction. |
| CORE-009 | Structural composition | Composition belongs inside `LUOrganization.kind === 'structural'`. Composition points are not ports, do not use connection edges, and do not need their own machine ids. |
| CORE-010 | Composition slot declarations | Structural organization declares `exposedSlots` for values exposed by the structural LU and `acceptedSlots` for values that external composition may supply. Declared slots can exist without bindings. |
| CORE-011 | Accepted slots | An `acceptedSlot` is a single placeholder inside the current structural LU. Collection or map composition must be represented by `CompositionValue.collection` or `CompositionValue.map`, not by making the accepted slot itself collection-shaped. |
| CORE-012 | Composition slot bindings | `exposedValues` binds exposed slots to composition value trees. A `lui-exposure` may fill that child LUI's accepted slots inline through its own `acceptedSlots`. Missing optional bindings are allowed; missing required bindings are validator errors. |
| CORE-013 | No empty composition value | Core does not encode an explicit empty composition value. Missing binding means unbound; required slots with missing bindings are validator errors. |
| CORE-014 | Composition shape | Structural composition values are either a leaf or a single-level collection/map of leaves. Nested collection/map structure must be represented by an intermediate structural LUI, not by anonymous nested containers. A common exposed slot key may be `root`, but `root` is not a core field name. |
| CORE-015 | Composition slot shape match | Each `exposedValues[slotKey]` must match `exposedSlots[slotKey].shape`. Missing `shape` defaults to `single`; `single` accepts only a `CompositionLeaf`, `collection` accepts only `CompositionValue.kind === 'collection'`, and `map` accepts only `CompositionValue.kind === 'map'`. |
| CORE-016 | LUI target | A `LUI.target` identifies what the LUI manifests. It does not by itself fulfill requirements. |
| CORE-017 | LUI kind | `LUI.kind` declares the manifestation kind visible in the parent core. For `lu` targets it must match the target `LUCore.organization.kind`; for `requirement` targets it must match the target `RequirementUnit.kind`; for `external` targets it is the core-visible kind contract. |
| CORE-018 | Endpoint refs | `EndpointRef` is a logical endpoint address for connections, not a port declaration. It is `PortOwner` plus `PortKey`, optionally plus `PayloadPath`. Closure endpoints are addressed by `closureId` only because closures are keyed in `LUCore.closures`. |
| CORE-019 | Port pins | `Port.pins` optionally declares one level of pin surface inside a port. `indexed` pins model array-like or bus-like contacts; `keyed` pins model named fields. Pins are not independent ports and inherit the containing port's polarity and direction. |
| CORE-020 | Payload path | `EndpointRef.payloadPath` is a logical payload path under a port. Missing `payloadPath` means the whole port. When present, its first segment must match the one-level `Port.pins` declaration; later segments are captured by the target LUI/profile/projector and are not interpreted as nested core pins. Use intermediate LUIs when deeper payload structure must become explicit topology. |
| CORE-021 | LUI port surface | `LUI.ports` declares the LUI's owner-local port surface inside the parent core. Connections to a LUI must reference this local port surface, not the target registry directly. |
| CORE-022 | Target port compatibility | For `lu` and `requirement` targets, each `LUI.ports` key must exist on the target interface with the same key. LUI-level port aliasing or renaming is not core schema semantics. |
| CORE-023 | External port contract | For `external` targets, `LUI.ports` is the core-declared boundary contract for the externally realized target. The external target registry may add realization details, but it must not silently change the declared port discipline. |
| CORE-024 | Port discipline preservation | For `lu` and `requirement` targets, a LUI port must preserve the target port's polarity and direction unless a required extension or later adapter schema explicitly declares otherwise. |
| CORE-025 | Primary result | A LU may declare at most one `primary-result` port. It must be an output port. Its pull/push polarity describes boundary interaction, not software await/no-await behavior. |
| CORE-026 | Requirement target | A `requirement` target lets a declared requirement appear inside local topology while its satisfaction remains a Z-axis fulfillment relation. |
| CORE-027 | Requirement surface | `RequirementSurface` is the top-level requirement surface exposed by a LU. It is a service-keyed map of `RequirementService` declarations. |
| CORE-028 | Nested and plain requirements | A top-level `RequirementUnit` may declare a `PlainRequirementSurface` for one more layer of nested requirements. `PlainRequirementUnit` must not declare further requirements; this keeps requirement nesting finite and graph-editor friendly. |
| CORE-029 | Derived LUI requirement surface | A LUI's requirement surface is derived from its `target`, not stored on the LUI. For `lu` targets it comes from the target `LogicUnit.requirements`; for `requirement` targets it comes from the target `RequirementUnit.requirements`; for `external` targets it comes from the external registry/profile contract when such a contract exists. |
| CORE-030 | LUI fulfillment surface | When a top-level `RequirementUnit` is manifested as a LUI, the LUI's `fulfillments` satisfy that unit's nested plain requirement surface, not the requirement target itself. |
| CORE-031 | Requirement keys | Requirement services and units are identified by their containing map keys. `RequirementService`, `PlainRequirementService`, `RequirementUnit`, and `PlainRequirementUnit` bodies must not repeat opaque ids. |
| CORE-032 | Requirement fulfillment scope | `RequirementService.fulfillmentScope` declares the expected fulfillment shape: `independent-units` is fulfilled by a unit-level map, while `shared-service` is fulfilled by one service-level supplier. This is not the same as `LUKind.stateful`. |
| CORE-033 | Fulfillment shape match | A `RequirementServiceFulfillment.kind` must match the target service's `fulfillmentScope`. Validators must reject `shared-service` fulfilled as independent units, and `independent-units` fulfilled as a service supplier. |
| CORE-034 | Independent unit fulfillment | `independent-units` services use `IndependentUnitsFulfillment.units`, where each unit has its own `UnitFulfillment`. This supports services whose units do not share supplier identity or state. |
| CORE-035 | Shared service fulfillment | `shared-service` services use one `UpstreamServiceSupplierFulfillment`. The upstream supplier is analogous to an object/service instance; units are resolved under that supplier, like methods on the same object. |
| CORE-036 | Fulfillment forms | Unit fulfillments are explicit local Closure fulfillments or upstream unit fulfillments. Service supplier fulfillments currently resolve to upstream service suppliers; local service suppliers require a future explicit supplier structure, not a plain Closure. |
| CORE-037 | Closure role | A Closure is a local boundary object stored in `LUCore.closures` and referenced by closure fulfillment. It is not itself a LUI and should not be modeled as ordinary child nesting. |
| CORE-038 | Closure fulfillment | A closure fulfillment points to a `closureId`; the closure body lives in `LUCore.closures`. |
| CORE-039 | Forwarded ports | Closure `forwardedPortKeys` declares which same-key ports from the Closure core are visible outside the Closure boundary. Forwarded ports are ordinary in-plane contacts, not requirement fulfillment paths. |
| CORE-040 | Forwarded port integrity | Each forwarded port key must exist in `Closure.core.ports`, and the key visible outside the Closure is the same key as the inner core port. Forwarding does not rename ports or redeclare port discipline. |
| CORE-041 | Supply lineage | `reachabilityPath` is an ordered list of `ClosureId` values that records the Closure boundaries through which upstream supply is admitted. The current fulfillment site is implied by the containing LUI, so LUI steps are not encoded. Reaching the current/root supply environment is represented by an empty `reachabilityPath`, not by a LU step. |
| CORE-042 | External target | `external` targets refer to externally realized capabilities through one opaque target id. Core does not import host, package, native binding, primitive, module, or capability registry mechanics. |
| CORE-043 | Extensions | Required extensions must be declared through extension records and must be rejected by projectors that do not support them. Profiles group domains, features declare capabilities inside profiles, and extension records carry concrete node-level payloads. |
| CORE-044 | Runtime separation | Core schema must remain free of JS runtime details and Verilog HDL realization details. |

## Port Discipline by LU Kind (Draft)

These rules are validation targets, not duplicated data stored in the schema. The schema stores `LUCore.organization.kind` and port `polarity`/`direction`; validators derive whether the combination is valid.

| ID | LU kind | Draft discipline |
| --- | --- | --- |
| CORE-045 | `combinational` | Space-like, pull-driven logic. Boundary inputs should be `pull input`; a `primary-result`, when present, should be `pull output`. Push-driven advancement belongs in another LU kind or an explicit adapter/profile rule. |
| CORE-046 | `sequential` | Time-like ordered progression. Progression is represented by ordered sequential step objects that each reference a LUI, not software await/no-await. Sequential steps do not have their own ids unless future core semantics require addressable control-flow steps. A `primary-result` may be `pull output` or `push output`; that polarity describes boundary interaction only. |
| CORE-047 | `stateful` | Time-like resident state under external arrival. Push inputs may advance resident state; outputs may be push or pull depending on whether the boundary emits events or exposes sampled state. |
| CORE-048 | `structural` | Space-like structure re-manifested under external arrival. Structural LUs declare exposed structures and inline child slot fills inside `LUOrganization.kind === 'structural'`. Push inputs may trigger re-manifestation; this LU kind must not use its own layer to encode the primary temporal trajectory. |

The exact legal port combinations remain draft until core examples and validators are introduced. Do not encode JS runtime scheduling terms such as await/no-await in these rules.
