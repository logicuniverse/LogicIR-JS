# Type-System Feature Extension Drafts

These drafts describe type and compatibility semantics that are useful for
validation and projection, but should not be required by LogicIR core. Core
knows ports, pins, payload paths, anchors, outlets, and requirement contracts;
type-system features describe what those contacts carry and how compatibility
is checked.

## Feature Identity

Recommended feature ref: `logicir.type-system / core`.

Extension keys under this feature:

- `type-definitions`
- `payload-types`
- `port-compatibility`
- `requirement-compatibility`
- `composition-compatibility`
- `path-schema`

Application profiles may group this feature with runtime or HDL features, but
validators and projectors must still reason over concrete feature refs and
extension keys.

## `type-definitions`

Purpose: define named logical payload types that other type-system payloads can
reference with `{ kind: 'named', namespace, key }`.

Suggested attachment:

- `LogicUnit.extensions` for unit-level named type registries.
- `LUCore.extensions` for core-local named type registries.
- `RequirementService.extensions` when a requirement contract owns reusable
  interface types.

Example payload shape:

```ts
type TypeDefinitionsPayload = {
  definitions: Record<
    string,
    TypeExpression & { namespace?: string; key?: string }
  >;
};
```

If a definition omits `namespace`, the owning extension feature namespace is
used. If it omits `key`, the map key is used. Validators should reject
duplicate resolved `namespace:key` definitions, unknown named references, and
recursive named references when they affect required compatibility checks.

## `payload-types`

Purpose: attach logical value types to ports, pins, and payload paths.

Suggested attachment:

- `Port.extensions` for a whole-port type.
- `LUCore.extensions` with selectors for many ports or paths.
- `RequirementService.extensions` when a requirement contract defines shared
  interface types.

Example payload shape:

```ts
type PayloadTypesPayload = {
  selector?: {
    portKey?: string;
    pinKey?: string;
    payloadPath?: (string | number)[];
  };
  type:
    | { kind: 'primitive'; name: 'bool' | 'int' | 'float' | 'string' }
    | { kind: 'record'; fields: Record<string, TypeRef | TypeField> }
    | { kind: 'array'; item: TypeRef; length?: number }
    | { kind: 'tuple'; items: TypeRef[] }
    | { kind: 'union'; variants: TypeRef[] }
    | { kind: 'named'; namespace: string; key: string };
};

type TypeRef = string | PayloadTypesPayload['type'];

type TypeField = {
  type: TypeRef;
  optional?: boolean;
};
```

Requirement guidance:

- `required` when validators/projectors must reject incompatible payloads.
- `optional` for documentation or editor-only type hints.

Core boundary:

- Core `Port.pins` and `EndpointRef.payloadPath` provide addressing.
- Type shape, field constraints, and named type registries are feature data.

## `port-compatibility`

Purpose: define compatibility rules beyond matching `PortKey`, boundary, and
interaction.

Suggested attachment:

- `Connection.extensions` for a specific conversion or adapter requirement.
- `Port.extensions` for declared variance or coercion policy.
- `LUCore.extensions` for a core-wide compatibility policy.

Example payload shape:

```ts
type PortCompatibilityPayload = {
  selector?: {
    connectionId?: string;
    from?: { portKey: string; payloadPath?: (string | number)[] };
    to?: { portKey: string; payloadPath?: (string | number)[] };
  };
  policy:
    | 'exact'
    | 'assignable'
    | 'widening'
    | 'projector-adapter'
    | 'custom';
  adapterTarget?: { namespace: string; key: string };
};
```

Requirement guidance:

- `required` when projection relies on non-exact compatibility.
- `optional` when it only narrows diagnostics or improves editor feedback.
- `projector-adapter` must identify an `adapterTarget`; otherwise a projector
  cannot prove which adapter preserves the declared compatibility.
- A selector may target a connection by `connectionId`, or by matching the
  source/target endpoint `portKey` and optional `payloadPath`. If no selector
  is provided, the policy applies as the owner-level default.
- The draft `assignable` relation supports structural record compatibility,
  including width subtyping and optional target fields. A source record may
  carry extra fields beyond the target contract. A missing source field can
  satisfy an optional target field, but an optional source field cannot satisfy
  a required target field.
- The draft `assignable` relation also supports conservative tuple/fixed-array
  compatibility: tuple items can satisfy a fixed-length array when each item is
  assignable to the array item type, and a fixed-length array can satisfy a
  tuple when the array item type is assignable to each tuple item.
- Union support is explicit and conservative. A source union is assignable to a
  target only when every variant is assignable to that target. A source is
  assignable to a target union when at least one target variant accepts it.
  Exact union equality is ordered and same-length in this draft; canonical
  sorting or duplicate elimination can be added later as a feature-level
  normalization rule.
- The draft `widening` relation supports shape-preserving recursive numeric
  widening. Today this means `int -> float` at primitive leaves, recursively
  through records with the same field set/optional flags, arrays with the same
  length declaration, and tuples with the same arity.

Core boundary:

- Core checks interaction and endpoint path overlap.
- Type coercion, variance, and adapter selection are feature semantics.

## `requirement-compatibility`

Purpose: describe when one requirement service/unit contract can fulfill
another.

Suggested attachment:

- `RequirementService.extensions` for service-wide compatibility rules.
- `RequirementServiceFulfillment.extensions` for a fulfillment relation that
  relies on a compatibility proof.
- `UnitFulfillment.extensions` for unit-specific compatibility.

Example payload shape:

```ts
type RequirementCompatibilityPayload = {
  relation:
    | 'same-contract'
    | 'structural-subtype'
    | 'nominal-implements'
    | 'adapter-required';
  evidence?: {
    namespace: string;
    key: string;
    version?: string;
  };
};
```

Requirement guidance:

- Usually `required` when fulfillment is not exact same-contract matching.
- `adapter-required` must include `evidence`; the evidence identifies the
  adapter proof or adapter contract used by the projector.
- Current draft validation checks closure fulfillment, upstream-unit
  fulfillment, and upstream shared-service supplier fulfillment. When the
  fulfilled requirement unit and supplier same-key ports both declare
  `payload-types`, default `structural-subtype` checks treat requirement input
  ports as `assignable` and output ports as `exact`.
- A `requirement-compatibility` payload attached to a `UnitFulfillment`,
  `RequirementServiceFulfillment`, or `RequirementService` can refine that
  relation. `same-contract` and `nominal-implements` use exact same-key port
  payload matching. `structural-subtype` uses the default structural rule.
  `adapter-required` requires evidence and is treated as an explicit adapter
  proof rather than structural payload equality.
- Requirement checks can compare whole-port types or explicitly declared nested
  `payloadPath` types.

Core boundary:

- Core records the requirement and fulfillment relation.
- Compatibility proof and adapter semantics belong to the type-system feature.

## `composition-compatibility`

Purpose: type structural anchors and outlets without making outlet values
first-class core objects.

Suggested attachment:

- `StructuralCompositionContract.extensions` for surface-wide composition type
  rules.
- `LUCore.extensions` with `anchorKey` or `outletKey` selectors for structural
  LU export anchors or external outlets.

Example payload shape:

```ts
type CompositionCompatibilityPayload = {
  selector: {
    anchorKey?: string;
    outletKey?: string;
  };
  type: { namespace: string; key: string };
  accepts?: 'exact' | 'assignable' | 'custom';
};
```

Requirement guidance:

- `required` when structural projection or validation depends on outlet/anchor
  type compatibility.
- `optional` for editor hints or documentation.
- Current draft validation checks local structural `exportAnchorFills` and
  `luiFills`: a typed anchor requires each source outlet filling it to have a
  declared composition type, then compares those types under `exact`,
  `assignable`, or `custom`.

Core boundary:

- Core only says anchors have `single`, `collection`, or `map` shape.
- Semantic type of a composition outlet or anchor belongs to this feature.

## `path-schema`

Purpose: validate nested `payloadPath` segments against a declared logical
payload schema.

Suggested attachment:

- `Port.extensions` for a whole-port path schema.
- `LUCore.extensions` for reusable schemas shared by many ports.
- `RequirementService.extensions` for contract-level path schemas.

Example payload shape:

```ts
type PathSchemaPayload = {
  selector?: { portKey?: string };
  root: PathNode;
};

type PathNode =
  | { kind: 'leaf'; type: string }
  | { kind: 'record'; fields: Record<string, PathNode> }
  | { kind: 'tuple'; items: PathNode[] }
  | { kind: 'array'; item: PathNode };
```

Requirement guidance:

- `required` when `payloadPath` validation or HDL flattening depends on it.
- `optional` when paths can be treated as opaque logical addresses.

Core boundary:

- Core validates only first-level `Port.pins` when present.
- Deep path validity is feature/projector responsibility.

## Type-System Validator Capability Checklist

A validator or projector should declare support for:

- Named type registry lookup.
- Primitive, record, array, tuple, union, and named type forms it can compare.
- Path-schema validation depth.
- Compatibility relations: exact, assignable, widening, adapter-required, or
  custom.
- Requirement compatibility proof formats.
- Composition anchor/outlet type matching.
- Diagnostics for unsupported required type-system extensions.
