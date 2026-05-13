# LogicIR Core v0 Draft Validation

This document defines validation targets for `types.ts`. The TypeScript
schema gives the canonical shape; validators decide whether a concrete
LogicIR object is a well-formed resolved core object.

## Validation Phases

1. Shape and collection discipline.
2. Local identity and key integrity.
3. Port, endpoint, and connection checks.
4. LU/LUI target compatibility.
5. Structural composition checks.
6. Requirement service and fulfillment checks.
7. Closure and upstream reachability checks.
8. Extension requirement and capability checks.

Validators should report structured diagnostics with stable rule ids. A
projector may reuse these rules as preflight checks before target-specific
lowering.

## Checklist

| Rule | Check |
| --- | --- |
| VAL-001 | `schemaVersion` matches a supported core schema version. |
| VAL-002 | Required maps and arrays are present even when empty. Optional fields are used only for meaningful absence. |
| VAL-003 | Entity ids come from containing record keys; entity bodies do not repeat ids. |
| VAL-004 | Every owner `PortSurface` uses one `PortKey` namespace. The same owner cannot declare separate input and output ports with the same key. |
| VAL-005 | Each port has at least one of `interaction.pullReadable` or `interaction.pushNotifiable`. |
| VAL-006 | `interaction.retainedCurrent === true` requires `interaction.pullReadable === true`. |
| VAL-007 | A `primary-result` port appears at most once per LU boundary and must be an output boundary port. |
| VAL-008 | `PinSet.indexed.count` is a non-negative integer. `PinSet.keyed.keys` is set-like with no duplicates. |
| VAL-009 | Every `Connection.from` and `Connection.to` endpoint resolves to an existing owner, port key, and optional first-level pin when `Port.pins` is declared. |
| VAL-010 | Connection graph direction matches owner-relative boundaries: LU/closure input and LUI output are graph sources; LU/closure output and LUI input are graph sinks. |
| VAL-011 | A connection's source interaction supports the target interaction, including retained-current preservation unless a required adapter feature declares a valid conversion. |
| VAL-012 | Target endpoint paths do not overlap within one `LUCore.connections` map unless a required merge/resolution feature applies. |
| VAL-013 | `PayloadPath` is used only for addressing/remap. It does not imply computation, packing, merge, or nested independent topology. |
| VAL-014 | `LUCore.kindOrganization.kind` matches the concrete `LUCore` branch. |
| VAL-015 | A core's `luis` values obey the containing LU kind's allowed LUI kind set. |
| VAL-016 | Sequential `steps` contains only existing LUI ids and has no missing LUI references. Duplicate steps are allowed only if the intended semantics is repeated invocation of the same LUI; otherwise a feature rule may restrict this. |
| VAL-017 | For `lu` targets, `LUI.kind` matches the target `LogicUnit.core.kindOrganization.kind`. |
| VAL-018 | For `requirement` targets, `LUI.kind` matches the resolved target `RequirementUnit.kind`. |
| VAL-019 | For `external` targets, the external registry or feature contract must provide a compatible kind contract before projection. |
| VAL-020 | For `lu` and `requirement` targets, each `LUI.ports` key exists on the target interface and preserves boundary and interaction unless a required adapter feature applies. |
| VAL-021 | Structural LUIs carry a resolved `compositionSurface`; non-structural LUIs do not. |
| VAL-022 | `compositionSurface.outlets` is set-like with no duplicates. |
| VAL-023 | Every structural `exportAnchorFills` key exists in `exportAnchors`. Required export anchors are filled. Non-required missing anchors are allowed; explicit `empty` means bound-to-empty. |
| VAL-024 | Every `exportAnchorFills` value is a `CompositionLeaf` and therefore a single composition value. |
| VAL-025 | Every `luiFills[luiId]` key references an existing structural child LUI. |
| VAL-026 | Every child anchor fill key exists in that child's resolved `compositionSurface.anchors`. Required child anchors are filled unless a required feature declares another policy. |
| VAL-027 | Each child anchor fill matches the anchor shape: `single` accepts only `CompositionLeaf`, `collection` accepts only collection values, and `map` accepts only map values. |
| VAL-028 | A `lui-outlet` leaf references an existing structural child LUI and an outlet key in that child's `compositionSurface.outlets`. |
| VAL-029 | An `external-outlet` leaf references an existing `externalOutlets` key. |
| VAL-030 | `CompositionLeaf.empty` is explicit empty/null composition; validators distinguish it from a missing binding. |
| VAL-031 | Requirement service map keys are the local service identities; service bodies do not repeat service ids. |
| VAL-032 | External requirement service entries resolve by `namespace + key` before checking ports, units, composition surface, fulfillment scope, or fulfillment shape. |
| VAL-033 | Requirement nesting is finite: `RequirementUnit.requirements` uses `PlainRequirementSurface`; `PlainRequirementUnit` does not declare further requirements. |
| VAL-034 | Structural requirement units declare `compositionSurface`; non-structural requirement units do not. |
| VAL-035 | LUI `fulfillments` keys correspond to the derived requirement surface of the LUI target. |
| VAL-036 | `RequirementServiceFulfillment.kind` matches the resolved service `fulfillmentScope`. |
| VAL-037 | `independent-units` fulfillment provides a `UnitFulfillment` for each required unit and does not provide unknown units unless a feature permits extra bindings. |
| VAL-038 | `shared-service` fulfillment provides one `UpstreamServiceSupplierFulfillment`; it is not encoded as unit-level closures. |
| VAL-039 | Closure fulfillments reference existing `LUCore.closures` entries. |
| VAL-040 | Closure `forwardedPortKeys.inputs` and `.outputs` reference existing same-key ports on the closure core with matching boundaries. |
| VAL-041 | Closure forwarded ports do not rename ports or alter port discipline. |
| VAL-042 | `reachabilityPath` contains only closure ids that are valid for the fulfillment site's supply lineage. Empty path means current/root supply environment. |
| VAL-043 | Upstream unit fulfillment resolves to an upstream service and unit compatible with `supplierServiceKey` and `supplierUnitKey`. |
| VAL-044 | Upstream shared-service fulfillment resolves to an upstream service compatible with `supplierServiceKey`. |
| VAL-045 | Required extensions are supported by the validator/projector capability set. Unsupported required extensions are errors. |
| VAL-046 | Unsupported optional extensions may be ignored only if core semantics remain unchanged. |
| VAL-047 | Extension records use feature refs and extension keys that are syntactically valid for the active feature registry. |
| VAL-048 | Extension payload selectors that point into helper positions, such as step index, anchor key, outlet key, unit key, port key, or payload path, resolve to existing positions. |

## Validator Implementation Plan

The first validator should be a pure TypeScript library with no projection
side effects.

Suggested API:

```ts
export type ValidationSeverity = 'error' | 'warning';

export type ValidationDiagnostic = {
  rule: string;
  severity: ValidationSeverity;
  path: (string | number)[];
  message: string;
};

export type ValidationContext = {
  resolveLogicUnit?: (luId: string) => LogicUnit | undefined;
  resolveExternalTarget?: (
    namespace: string,
    key: string
  ) => ExternalTargetContract | undefined;
  resolveRequirementService?: (
    namespace: string,
    key: string
  ) => RequirementService | undefined;
  capabilities?: ProjectorCapabilitySet;
};

export function validateLogicUnit(
  unit: LogicUnit,
  context: ValidationContext
): ValidationDiagnostic[];
```

Implementation order:

1. Implement local shape checks that require no registry lookup:
   `VAL-001` through `VAL-016`, plus structural duplicate checks.
2. Add resolver-backed compatibility checks for `lu`, `requirement`, and
   `external` targets.
3. Add structural composition graph checks.
4. Add requirement and fulfillment checks.
5. Add closure reachability checks.
6. Add extension capability checks.
7. Add fixtures from `examples.ts` and one negative fixture for each
   validator phase.

Target-specific projectors should call the core validator first, then apply
feature and target validators for JS/runtime or Verilog HDL.

## Current Implementation Coverage

`validator.ts` currently implements the target-neutral local pass. It checks:

- Core schema version.
- Port interaction and retained-current rules.
- Primary result count and boundary on LU port surfaces.
- Pin count/key sanity.
- LUI kind matrix for each LU kind.
- Sequential step references.
- Endpoint owner/port existence, first-level pin path checks, graph direction,
  interaction compatibility, and overlapping target paths.
- Structural outlet uniqueness, export-anchor fills, child LUI anchor fills,
  composition value shape, child outlet references, and external outlet
  references.
- Inline requirement service/unit local port surfaces and structural
  composition contracts.
- Closure core validation and same-key forwarded port boundary checks.
- Resolver-backed `lu`, `requirement`, and `external` target kind, port, and
  structural composition-surface compatibility when resolvers are supplied.
- Derived LUI requirement service key checks.
- Fulfillment kind versus resolved requirement service scope.
- Independent-unit fulfillment unit coverage and unknown-unit checks.
- Closure fulfillment reference checks.
- Upstream reachability path checks for closure lineage prefixes.
- Upstream unit and shared-service supplier service resolution checks.
- Required/optional extension support against a declared capability set.
- Projection preflight now composes this core validator with
  feature-specific draft validators in `schema/extensions/drafts/validator.ts`.
  That layer checks draft type-system, JS runtime, Python runtime, and Verilog
  HDL extension payloads, selector resolution where local context is available,
  and declared `path-schema` constraints against `EndpointRef.payloadPath`.

Not yet implemented:

- Full feature-specific compatibility semantics beyond the current draft
  extension preflight.
- Full external target registry semantics beyond the resolved target contract.
- JS/Python runtime and Verilog HDL target lowering.

`validator-smoke.ts` is a no-framework smoke test that validates all positive
examples and checks selected negative diagnostics for port interaction,
endpoint direction, target path overlap, structural outlet references, closure
forwarding, resolver-backed target kind mismatch, fulfillment scope/unit
coverage, upstream reachability/supplier resolution, and unsupported required
extensions.
