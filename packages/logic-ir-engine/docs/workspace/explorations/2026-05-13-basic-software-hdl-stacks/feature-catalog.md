# Feature Catalog Draft

This catalog lists feature candidates for the two initial stacks. Feature names
are working names. They should later become versioned and namespaced if promoted.
Requiredness is defined by profile contracts; see
[feature-profile-matrix.md](feature-profile-matrix.md).

## Shared Features

### `logicir.type-system / core`

Used by both stacks.

Candidate extension keys:

- `type-definitions`
- `payload-types`
- `path-schema`
- `port-compatibility`
- `requirement-compatibility`
- `composition-compatibility`

Purpose:

- Type port payloads and payload paths.
- Check connection compatibility.
- Check requirement fulfillment compatibility.
- Check structural anchor/outlet compatibility.
- Provide adapter evidence when exact compatibility is not enough.

## Basic Software Features

### `logicir.value / literals`

Candidate extension keys:

- `literal-values`
- `default-inputs`
- `initial-values`
- `host-value-shape`

Purpose:

- Represent software-level values without choosing JS/Python-specific syntax.
- Support constants and default inputs seen in the old prototype.
- Provide initial retained/state values where core only declares topology.

### `logicir.software-runtime / completion`

Candidate extension keys:

- `completion-contract`
- `step-await-policy`
- `completion-error-policy`

Purpose:

- Define a target-neutral software completion model.
- Abstract old `ReturnResult = Immediate | Thenable`.
- Define whether a sequential step must complete before the next step starts.

Recommended minimal model:

```text
Completion =
  immediate result
  | continuation/thenable result

Step await policy =
  before-next-step
  | detached-delivery
```

This is not JS `Promise` and not Python coroutine. It is a portable software
completion contract.

### `logicir.software-runtime / invocation`

Candidate extension keys:

- `call-contract`
- `input-read-policy`
- `push-delivery-policy`
- `packet-path-policy`

Purpose:

- Describe how LUI providers are invoked.
- Preserve pull reads, push delivery, packet paths, and primary results.
- Keep host function/coroutine/thread details out of the stack.

### `logicir.software-runtime / retained-current`

Candidate extension keys:

- `retained-current-realization`
- `state-backing`
- `latest-value-cache`

Purpose:

- Realize `Port.interaction.retainedCurrent`.
- Abstract old `PropertyPort` and `StateStore` behavior.
- Allow source-store, sink-cache, execution-engine adapter, or provider-backed
  realization.

### `logicir.fulfillment / static-binding`

Candidate extension keys:

- `provider-binding-policy`
- `dynamic-fulfillment`
- `late-bound-provider`
- `switching-policy`

Purpose:

- Bind requirement fulfillment to local or external providers.
- Support static startup binding as the minimal portable subset.
- Mark late-bound or switchable suppliers as required only when a runtime can
  preserve the semantics.

### `logicir.execution / error`

Candidate extension keys:

- `error-policy`
- `error-port`
- `error-channel`

Purpose:

- Decide how provider errors become LogicIR-visible results or side channels.
- Keep host exception/rejection mechanics out of core.

### `logicir.software-runtime / lifecycle`

Candidate extension keys:

- `resource-lifecycle`
- `start-stop`
- `dispose`

Purpose:

- Manage provider resources and execution environments.
- Keep hooks and resource handles outside core.

### `logicir.software-runtime / observation`

Candidate extension keys:

- `trace-events`
- `runtime-hooks`
- `override-policy`

Purpose:

- Support tooling hooks seen in the old runtime.
- Should usually be optional unless behavior depends on an override.

## Basic HDL Features

### `logicir.verilog-hdl / signal`

Candidate extension keys:

- `signal-types`
- `packed-layout`
- `path-flattening`
- `pin-layout`

Purpose:

- Convert logical payloads, pins, and payload paths into HDL signals.
- Define widths, signedness, packing, and flattening.

### `logicir.verilog-hdl / module`

Candidate extension keys:

- `module-binding`
- `port-map`
- `parameters`
- `blackbox`
- `module-registry`

Purpose:

- Bind external targets or LU-backed instances to Verilog modules.
- Check module interface compatibility before emission.

### `logicir.verilog-hdl / clocking`

Candidate extension keys:

- `clock-reset`
- `clock-domain`
- `reset-policy`

Purpose:

- Realize sequential/stateful topology in Verilog.
- Keep clock/reset out of core.

### `logicir.verilog-hdl / combinational`

Candidate extension keys:

- `combinational-assigns`
- `primitive-op`
- `expression-width-policy`

Purpose:

- Realize simple combinational behavior inside emitted HDL modules.
- Avoid forcing every primitive into an external module.

### `logicir.verilog-hdl / state`

Candidate extension keys:

- `state-registers`
- `register-enable`
- `reset-value`

Purpose:

- Realize retained-current/stateful behavior as registers.
- Require compatible clock/reset evidence.

### `logicir.verilog-hdl / elaboration`

Candidate extension keys:

- `static-only`
- `generate-loop`
- `unroll`
- `specialize`

Purpose:

- Ensure HDL projection is statically elaborable.
- Reject runtime-dynamic features before emission.

### `logicir.partition / structural-slices`

Candidate extension keys:

- `slice-interface`
- `rx-tx-bus`
- `routing-policy`
- `fan-in-policy`

Purpose:

- Lower structural export anchors into modules or partitions.
- Preserve slice identity and connection identity.
- Keep placement, bus routing, and fan-in policy outside core.

### `logicir.diagnostics / unsupported-semantics`

Candidate extension keys:

- `unsupported-push-policy`
- `unsupported-retained-policy`
- `unsupported-dynamic-fulfillment-policy`

Purpose:

- Make unsupported software-like semantics fail with diagnostics instead of
  being silently dropped.
