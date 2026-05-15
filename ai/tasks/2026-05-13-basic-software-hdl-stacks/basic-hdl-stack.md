# Basic HDL Stack Draft

Status: AI task draft.

Historical planning note: this document describes a broad future stack shape.
It is not the scope template for a runnable HDL round. Round tasks should
introduce only the concrete feature payloads, diagnostics, projector data, and
simulator inputs they consume in that round.

Working stack name: `logicir.stack.basic-hdl`.

Goal: define the smallest useful HDL stack for Verilog HDL projection. Unlike
`basic-software`, this stack is not intended to be language-neutral across all
hardware description languages. It targets Verilog HDL explicitly.

This stack is based on:

- Active core topology: ports, endpoint refs, payload paths, connections, LU
  kinds, retained-current contact semantics, requirement/fulfillment, closure,
  and structural composition.
- Current Verilog draft exploration: signal types, clock/reset, module binding,
  combinational assigns, state registers, elaboration, and structural slices.

It intentionally does not include:

- Software completion/thenable semantics.
- Dynamic provider switching as a runtime feature.
- Host subscription/state-store mechanics.
- JS/Python runtime lifecycle APIs.

## Stack Composition

```text
Stack:
  logicir.stack.basic-hdl

IR Pipeline Profile:
  logicir.profile.basic-hdl-ir

Projection Profile:
  logicir.profile.basic-verilog-hdl

Execution Profile:
  none for build
  logicir.profile.basic-verilog-sim for simulation, optional
```

Two stack variants:

```text
basic-hdl-build:
  IR Pipeline Profile + Projection Profile

basic-hdl-sim:
  IR Pipeline Profile + Projection Profile + Execution Profile
```

## IR Pipeline Profile: `basic-hdl-ir`

Input/output:

```text
LogicIR -> LogicIR
```

Purpose:

- Validate core topology.
- Resolve external target/module contracts.
- Resolve requirement service contracts.
- Check static fulfillability.
- Check type/signal evidence.
- Lower or reject unsupported dynamic/software semantics.
- Prepare projection-ready LogicIR for Verilog.

Future candidate stages:

1. `core-validate`
2. `resolve-target-contracts`
3. `resolve-requirement-contracts`
4. `check-extension-capabilities`
5. `type-and-signal-check`
6. `hdl-static-suitability-check`
7. `normalize-payload-paths`
8. `validate-module-bindings`
9. `static-specialization`

Conditionally required stages:

1. `validate-clock-reset`
2. `validate-structural-slices`

Recommended stages:

1. `adapter-insertion`
2. `payload-path-flattening`
3. `strip-authoring-data`

Core source and spec notes:

- `packages/core/src/types.ts` as current TS authoring source.
- `schema/core/v0-draft/README.md` as curated specification notes.

Required core support:

- Combinational LU.
- Structural LU.
- Stateful LU when `clock-reset` and `state-registers` evidence exists.
- Sequential LU only under explicit HDL lowering policy.
- Port interactions:
  - `pullReadable` for combinational signal reads.
  - `pushNotifiable` only if lowered into clocked/event-equivalent HDL
    structure or rejected.
  - `retainedCurrent` only if realized as register/wire state with explicit
    clock/reset/state feature data.
- `EndpointRef.payloadPath` with flattening or packed-layout policy.
- Static requirement fulfillment.
- Closure fulfillment only when closure core can be statically elaborated.
- Structural composition and export anchors as slice/module boundaries.

Unsupported by default:

- Runtime late-bound fulfillment.
- Switchable providers.
- Dynamic service lookup.
- Host lifecycle hooks.
- Software continuation completion.
- Unbounded dynamic collections/maps.

## Projection Profile: `basic-verilog-hdl`

Input/output:

```text
LogicIR -> Verilog HDL artifact set
```

Projection target:

```text
verilog-hdl
```

Artifact kinds:

- `.v` module files.
- Optional testbench skeletons.
- Optional projection metadata.
- Optional diagnostics report.

Future candidate stages:

1. `plan-signals`
2. `flatten-payload-paths`
3. `plan-modules`
4. `plan-combinational-assigns`
5. `plan-state-registers`
6. `plan-clock-reset`
7. `plan-structural-slices`
8. `emit-verilog`
9. `emit-projection-metadata`

Required features:

- `logicir.type-system / core`
- `logicir.verilog-hdl / signal`
- `logicir.verilog-hdl / module`
- `logicir.verilog-hdl / elaboration`
- `logicir.diagnostics / unsupported-semantics`

Conditionally required features:

- `logicir.verilog-hdl / clocking`
  - required for sequential/stateful/register projection.
- `logicir.verilog-hdl / state`
  - required when retained-current or stateful behavior becomes registers.
- `logicir.verilog-hdl / combinational`
  - required when behavior is emitted as expressions instead of module
    instances.
- `logicir.partition / structural-slices`
  - required when structural export anchors are lowered into slice modules or
    partitions.

Projection rules:

- Every HDL port or signal must have width/layout evidence or a safe inference.
- Every external LUI target must have a module binding or generated module plan.
- Sequential/stateful logic must have clock/reset policy unless a user-accepted
  default is declared by the projection profile.
- Retained-current contacts must lower to registers, wires with stable source,
  or explicit diagnostics.
- Payload paths must lower to packed part-selects, flattened signal names, or
  intermediate generated structures.
- Requirement fulfillment must be statically resolvable before emission.
- Closure cores must be inlined, module-emitted, or rejected with diagnostics.
- Structural export anchors may become modules, partitions, or metadata slices.
- Cross-slice communication must be explicit: wires, generated buses, or
  diagnostics.

Diagnostics:

- Missing signal width/layout.
- Unsupported push semantics.
- Retained-current without register/state policy.
- Missing clock/reset for stateful/sequential behavior.
- Missing module binding for external target.
- Module port mismatch.
- Unsupported dynamic fulfillment.
- Non-static structural composition.
- Ambiguous fan-in without merge policy.
- Payload path flattening failure.

## Optional Execution Profile: `basic-verilog-sim`

Input/output:

```text
Verilog HDL artifact set -> simulator execution
```

Execution target examples:

- `verilog-simulator`
- `verilog-testbench`

Execution environment examples:

- Icarus Verilog.
- Verilator.
- Commercial Verilog simulator.

Provider contracts:

### `hdl-simulator-provider`

Purpose:

- Compile and run emitted Verilog artifacts.

Minimal operations:

```text
compile(files, options) -> simulator-artifact
run(simulator-artifact, stimuli) -> waveform/results
```

### `testbench-provider`

Purpose:

- Supply clocks, resets, stimuli, and observation probes.

### `foreign-module-provider` optional

Purpose:

- Satisfy blackbox or DPI-like simulation dependencies.

Execution bindings:

- `module-binding` to simulator library or foreign module.
- `clock-reset` to testbench clock/reset generation.
- `probe` to waveform/output observation.
- `stimulus` to input vector source.

This execution profile is optional because HDL build does not require running a
simulator.

## Current Core Mapping

Core item:

- `Port.interaction.pullReadable`

HDL mapping:

- stable signal read or combinational input.

Core item:

- `Port.interaction.pushNotifiable`

HDL mapping:

- requires explicit clocked/event-equivalent lowering or diagnostic. HDL does
  not automatically preserve software push delivery semantics.

Core item:

- `Port.interaction.retainedCurrent`

HDL mapping:

- register, latch-like explicit feature, stable state wire, or diagnostic.

Core item:

- `EndpointRef.payloadPath`

HDL mapping:

- bit slice, packed field, flattened signal segment, generated bus lane, or
  diagnostic.

Core item:

- `RequirementServiceFulfillment`

HDL mapping:

- static module/provider binding or static inlining. Dynamic provider lookup is
  unsupported by default.

Core item:

- `exportAnchors`

HDL mapping:

- named structural slices, module boundaries, partitions, or metadata anchors.

## Current Draft Mapping

Archived `verilog-hdl.md` maps well to the basic HDL stack:

- `signal-types` -> `logicir.verilog-hdl / signal`
- `clock-reset` -> `logicir.verilog-hdl / clocking`
- `module-binding` -> `logicir.verilog-hdl / module`
- `combinational-assigns` -> `logicir.verilog-hdl / combinational`
- `state-registers` -> `logicir.verilog-hdl / state`
- `elaboration` -> `logicir.verilog-hdl / elaboration`
- `structural-slices` -> `logicir.partition / structural-slices`

The archived Verilog draft is more detailed than this stack draft and should be
mined later for concrete extension schemas and diagnostics. It should not be
promoted wholesale.

## Minimal Conformance Fixtures

The stack should eventually project:

1. `combinational-adder`
   - typed inputs and output.
   - combinational assign or module binding.
2. `registered-counter`
   - clock/reset.
   - retained-current output.
   - state register.
3. `external-module-instance`
   - external target.
   - module binding.
   - port map.
4. `payload-path-bus`
   - pins or payload path.
   - flattening/packing.
5. `structural-slice-pair`
   - two export anchors.
   - RX/TX or wire routing metadata.
6. `requirement-static-provider`
   - requirement-backed target resolved to static module/provider binding.

## Promotion Criteria

Before this becomes formal package/schema/profile material:

- Decide whether the stack name should be `basic-hdl` or `basic-verilog-hdl`.
- Define stable HDL feature namespace and extension keys.
- Define required versus optional support for stateful/sequential LU kinds.
- Define Verilog artifact manifest shape.
- Define simulator execution profile separately from build projection profile.
- Define diagnostics and conformance fixtures.
- Keep feature/profile requiredness aligned with
  [feature-profile-matrix.md](feature-profile-matrix.md).
