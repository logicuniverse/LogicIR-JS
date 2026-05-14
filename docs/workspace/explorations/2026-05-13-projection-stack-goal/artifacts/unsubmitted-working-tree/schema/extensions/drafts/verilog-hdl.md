# Verilog HDL Feature Extension Drafts

These drafts describe HDL projection constraints that must not be baked into
LogicIR core. They let a Verilog projector preserve core topology while adding
target-specific realization data.

## Feature Identity

Recommended feature ref: `logicir.verilog-hdl / core`.

Extension keys under this feature:

- `signal-types`
- `clock-reset`
- `module-binding`
- `combinational-assigns`
- `state-registers`
- `elaboration`
- `structural-slices`

Application bundles may group this feature, but projection capability must
still be declared as concrete feature refs and extension keys.

## `signal-types`

Purpose: declare bit widths, signedness, packed/unpacked shapes, and payload
path type information for HDL ports and pins.

Suggested attachment:

- `Port.extensions` for whole-port HDL signal shape.
- `LUCore.extensions` with selectors for `portKey`, `payloadPath`, or pin key
  when type data covers many ports.
- `RequirementService.extensions` when a requirement contract fixes a hardware
  interface shape.

Example payload shape:

```ts
type SignalTypesPayload = {
  selector?: {
    portKey?: string;
    pinKey?: string;
    payloadPath?: (string | number)[];
  };
  width: number;
  signed?: boolean;
  packed?: boolean;
  encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
};
```

Requirement guidance:

- Usually `required` for HDL projection because untyped logical payloads often
  cannot become Verilog signals safely.
- `optional` only when the projector can infer an equivalent shape.

Core boundary:

- Core `Port.pins` and `payloadPath` express logical addressability.
- HDL bit layout and packing are feature semantics.

## `clock-reset`

Purpose: associate sequential/stateful behavior with clock and reset domains.

Suggested attachment:

- `LUCore.extensions` for a clock/reset domain covering the core.
- `LUI.extensions` for child instance domain overrides.
- `Port.extensions` when a root port is explicitly the logical clock/reset
  contact.

Example payload shape:

```ts
type ClockResetPayload = {
  domain: string;
  clock: { portKey: string; edge: 'posedge' | 'negedge' };
  reset?: {
    portKey: string;
    active: 'high' | 'low';
    kind: 'sync' | 'async';
  };
  selectors?: { luiIds?: string[]; stateKeys?: string[] };
};
```

Requirement guidance:

- `required` for sequential/stateful HDL projection unless the projector has a
  target-level default domain explicitly accepted by the user.

Core boundary:

- Core recognizes sequential/stateful topology.
- Clock/reset realization is HDL-specific and not core.

## `module-binding`

Purpose: bind external LUI targets or LogicUnits to Verilog module names,
parameters, blackboxes, or generated module policies.

Suggested attachment:

- `LUI.extensions` for one external or LU-backed instance.
- `LogicUnit.extensions` for module-level naming and export policy.
- `RequirementService.extensions` for reusable hardware interface contracts.

Example payload shape:

```ts
type ModuleBindingPayload = {
  moduleName: string;
  instanceName?: string;
  parameters?: Record<string, string | number | boolean>;
  blackbox?: boolean;
  portMap?: Record<string, string>;
  interface?: Record<
    string,
    {
      direction?: 'input' | 'output' | 'inout';
      width?: number;
    }
  >;
};
```

When a bound LUI is sequential or stateful and a matching `clock-reset`
extension applies, the Verilog projector may use `portMap` entries for the
logical clock/reset `portKey`s as the external module port names. If no mapping
is provided, the logical keys are used directly.

Projector-side module registries may carry the same payload shape. When an
`interface` is present, the current planner checks registry-backed external
LUIs against LUI port boundaries and planned signal widths, emitting `HDL-007`
for mismatches instead of silently instantiating an incompatible module.

Projectors may also declare an equivalent module binding in their capability
set through a target registry keyed by external target `namespace/key`. That is
projector-side capability evidence, not canonical LogicIR schema data. A local
`module-binding` extension on the LUI overrides registry lookup for that LUI.

Requirement guidance:

- `required` when the HDL projector cannot infer or generate the module.
- `optional` for naming preferences when an equivalent generated module is
  acceptable.

Core boundary:

- Core `external` targets use `namespace + key`.
- HDL module names, parameters, and blackbox declarations are feature data.

## `combinational-assigns`

Purpose: realize small combinational HDL behavior without binding a child LUI
to a separate module. This is useful for primitive arithmetic, bitwise, compare,
constant, concat, reduction, mux, and cast expressions after type/signal layout
is known.

Suggested attachment:

- `LUCore.extensions` for behavior generated inside the current HDL module.
- `LUI.extensions` only when the assignment payload explicitly scopes to that
  instance through endpoint refs.

Example payload shape:

```ts
type CombinationalAssignsPayload = {
  assigns: {
    to: EndpointRef;
    expr:
      | { kind: 'endpoint'; endpoint: EndpointRef }
      | { kind: 'constant'; value: string | number | boolean; width?: number }
      | { kind: 'unary'; op: '~' | '!' | '-'; expr: Expression }
      | { kind: 'reduction'; op: '&' | '|' | '^' | '~&' | '~|' | '~^'; expr: Expression }
      | { kind: 'binary'; op: '+' | '-' | '*' | '&' | '|' | '^'; left: Expression; right: Expression }
      | { kind: 'mux'; cond: Expression; then: Expression; else: Expression }
      | { kind: 'concat'; items: Expression[] }
      | { kind: 'cast'; expr: Expression; signed?: boolean; width?: number };
  }[];
};
```

Requirement guidance:

- `required` when losing the assignment would remove required HDL behavior.
- `optional` for hints when equivalent module binding or generated behavior is
  acceptable.

Core boundary:

- Core still only expresses topology, ports, endpoint refs, and connections.
- HDL expressions are target realization data and must stay in this feature.

## `state-registers`

Purpose: realize explicit HDL register updates for sequential or stateful
projection while keeping register mechanics outside LogicIR core.

Suggested attachment:

- `LUCore.extensions` when the current HDL module owns the register behavior.
- `LUI.extensions` only when the payload explicitly scopes to that instance
  through endpoint refs.

Example payload shape:

```ts
type StateRegistersPayload = {
  registers: {
    target: EndpointRef;
    enable?: HDLExpression;
    next: HDLExpression;
    resetValue?: HDLExpression;
    clockResetDomain?: string;
  }[];
};
```

Requirement guidance:

- `required` when losing the register update would remove required sequential
  or stateful HDL behavior.
- `optional` for naming or implementation hints when an equivalent module
  binding exists.
- The current lowering supports optional 1-bit `enable` expressions. Wider
  enable expressions are rejected with `HDL-006` rather than guessed or
  truncated.

Core boundary:

- Core marks stateful/sequential topology and retained-current contacts.
- HDL register update, nonblocking assignment, and reset behavior are
  projection realization data. They must be paired with `clock-reset` for
  executable HDL lowering.

## `elaboration`

Purpose: describe static elaboration constraints, generate policies, or
compile-time specialization rules.

Suggested attachment:

- `LUCore.extensions` for whole-core elaboration policy.
- `LUI.extensions` for repeated/generated instances.
- `Connection.extensions` for target-specific wiring constraints.

Example payload shape:

```ts
type ElaborationPayload = {
  selector?: { luiId?: string; connectionId?: string };
  policy: 'static-only' | 'generate-loop' | 'unroll' | 'specialize';
  parameters?: Record<string, string | number | boolean>;
};
```

Requirement guidance:

- `required` when failing to elaborate statically would change topology.
- `optional` for preferred optimization strategy.

Core boundary:

- Core structural composition expresses logical topology.
- HDL generate/unroll/specialization mechanics are projection realization.

## `structural-slices`

Purpose: lower structural `exportAnchors` into HDL modules or partitions while
preserving core slice and connection identities.

Suggested attachment:

- `LUCore.extensions` on structural cores.
- Extension payload selectors should reference `anchorKey`, `outletKey`, or
  `connectionId` rather than adding ids to composition leaves.

Example payload shape:

```ts
type StructuralSlicesPayload = {
  slices: Record<
    string,
    {
      moduleName?: string;
      placement?: string;
      txPort?: string;
      rxPort?: string;
      tx?: SliceInterface;
      rx?: SliceInterface;
    }
  >;
  bus?: {
    routing: 'payload-path' | 'pin-channel' | 'custom';
    channelPath?: (string | number)[];
  };
  fanIn?: Record<
    string,
    {
      policy: 'or' | 'and' | 'xor';
    }
  >;
};

type SliceInterface = {
  portName?: string;
  width: number;
  signed?: boolean;
  packed?: boolean;
  encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
};
```

Requirement guidance:

- `required` when distributed slice lowering has semantic obligations beyond
  ordinary core topology.
- `optional` for placement or naming hints.
- A required `structural-slices` payload must define every required structural
  `exportAnchor`; the current planner emits `HDL-008` if a required export
  anchor is omitted.

Current planner/lowering status:

- The planner derives one slice plan per structural `exportAnchor`.
- Each slice plan preserves the export anchor key, requiredness, configured or
  default module name, placement, RX/TX hints or typed RX/TX interface data,
  bus routing data, the root `exportAnchorFills` leaf, and the core's
  `luiFills` child anchor context. The planner also derives a conservative
  static footprint for each slice by walking the root leaf and reachable child
  anchor fills: child LUI ids, child outlet references, external outlet
  dependencies, and child anchor fills referenced by the slice.
- The current Verilog skeleton emits these slice boundaries as explicit
  artifact metadata, declares top-level wires for planned slice RX/TX
  interfaces, instantiates planned slice modules, and emits one conservative
  module stub per planned slice. Stub ports can be derived from legacy
  `rxPort` / `txPort` name hints as 1-bit placeholders, or from typed `rx` /
  `tx` interface entries with explicit width, signedness, packing, and
  encoding metadata. These names are generated slice-module port names, not
  references to existing LogicIR core ports. Slice footprints are emitted as
  metadata comments. When a consumer slice footprint references another slice's
  root LUI outlet, and the provider slice declares a typed `tx` while the
  consumer declares a compatible typed `rx`, the current skeleton emits a
  conservative top-level `assign` from provider TX wire to consumer RX wire. If
  a required slice payload creates such a static dependency but the typed TX/RX
  interfaces are incompatible, HDL planning emits `HDL-009` instead of silently
  dropping the link. If multiple compatible provider TX dependencies would
  drive the same consumer RX interface, HDL planning emits `HDL-010` unless
  `fanIn[consumerAnchorKey]` declares a supported bitwise policy. The current
  lowering supports typed same-interface `or`, `and`, and `xor` fan-in as a
  single top-level assignment into the consumer RX wire.
  Full child module placement inside slices, multi-hop/routed buses, fan-in
  policies beyond bitwise merge, arbitration, and serialization policies are
  still future work.

Core boundary:

- Core supports spatial slices through `exportAnchors` and
  `exportAnchorFills`.
- RX/TX buses, placement, serialization, and cross-slice routing policy are HDL
  or distributed-projection features.

## HDL Projector Capability Checklist

A Verilog projector should declare support for:

- Core schema versions.
- Supported LU kinds and any lowering restrictions.
- Port interaction subset that can be represented in HDL, with diagnostics for
  unsupported push/retained-current semantics.
- `payloadPath` support or required flattening/lowering passes.
- Clock/reset feature support for sequential and stateful cores.
- Module binding and external target policies.
- Static elaboration requirements for structural composition.
- Closure/upstream fulfillment support or diagnostics when not statically
  resolvable.
- Each concrete Verilog feature ref and extension key.
