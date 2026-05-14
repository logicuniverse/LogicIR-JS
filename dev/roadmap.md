# LogicIR Roadmap

This roadmap is a project coordination document. It describes the intended
build-out of LogicIR features, profiles, stacks, tools, projectors, compilers,
engines, fixtures, and AI task candidates.

It is not schema authority. Accepted data shapes live in `packages/` authoring
packages and the language-neutral specification surface under `schema/`.
Concrete implementation work still needs a focused plan under `dev/plans/` or
an isolated AI task under `ai/tasks/`.

## Success Lines

The near-term project should prove two primary stacks:

- **basic-software**: LogicIR can be validated, normalized, projected to an
  interpreter plan or generated JS/TS-oriented artifact, and executed with
  explicit provider bindings.
- **basic-hdl**: LogicIR can be validated, normalized, rejected or lowered for
  unsupported software-only semantics, and projected to Verilog HDL.

These two stacks are the first compatibility pressure test. Software verifies
runtime/provider semantics; HDL verifies that core has not absorbed software
runtime assumptions.

## Phase 0: Repository And Protocol Grounding

Status: mostly in progress.

Needed outcomes:

- Monorepo boundaries are stable enough for active development.
- `packages/core` owns accepted TypeScript core shapes.
- `packages/architecture` owns accepted TypeScript architecture definition
  shapes.
- `packages/features/*` owns accepted feature data and extension payload
  shapes.
- `schema/` remains the language-neutral specification and generated artifact
  surface, not the main authoring workspace.
- `ai/tasks/` remains the only write area for fully autonomous task output
  before human promotion.
- The default development environment supports HDL verification through
  [OSS CAD Suite](https://github.com/YosysHQ/oss-cad-suite-build). The local
  Windows install is expected at `E:\oss-cad-suite`; activate it with
  `E:\oss-cad-suite\environment.ps1` before running HDL verification. HDL
  smoke tests should call `iverilog` directly; `where.exe iverilog` in
  PowerShell or `where iverilog` in `cmd` is only a PATH troubleshooting check.

Current formal packages:

- `packages/core`
- `packages/architecture`
- `packages/features/type-system`
- `packages/tools/type-system`

Important source-only evidence:

- `packages/legacy/engine`
- `packages/legacy/flow-runtime-core`
- `packages/legacy/flow-core`

## Phase 1: Minimal Protocol Toolchain

Goal: make LogicIR and architecture definitions mechanically checkable before
building larger engines.

Required tools:

- Core schema validator: validates LogicIR core shape, local feature manifest
  resolution, extension attachment positions, endpoint references, and basic
  graph consistency.
- Architecture definition validator: validates feature, profile, stack,
  capability, provider contract, provider capability, stage, policy, and binding
  definitions.
- Profile resolver: expands a stack into IR pipeline, projection, and optional
  execution profile requirements.
- Capability checker: verifies tools, passes, projectors, engines, and providers
  against resolved profile requirements.
- Diagnostic model: shared structured diagnostics for validators, resolvers,
  projectors, compilers, and engines.

First acceptance criteria:

- A LogicIR fixture can be validated against `packages/core`.
- A feature definition can declare extension points with attachment kinds and
  payload schemas.
- A profile can mark feature and extension point contracts as `required`,
  `conditional-required`, `recommended`, or `optional`.
- A stack can resolve to concrete profile requirements.
- Unsupported required or conditional-required contracts fail with diagnostics.

## Phase 2: Feature Catalog

Goal: define small, reusable semantic features. Features are not stacks. Both
software and HDL may reference the same feature when the semantics overlap.

### Shared Features

Initial shared features:

- `logicir.type-system / core`: payload type references, type declarations,
  value shape checking, and projection-facing type metadata.
- `logicir.value / core`: literal values, constant payloads, default values,
  and value compatibility rules.
- `logicir.diagnostics / unsupported-semantics`: explicit unsupported semantic
  markers and rejection policy data for profiles and projectors.

Likely later shared features:

- `logicir.control-flow / core`: branch, guard, loop, return, go-back, and
  lowering metadata that remains outside core sequential `steps`.
- `logicir.adapter / core`: explicit adapter/lowering traces when automatic
  adapter insertion becomes reviewable project data.
- `logicir.observation / core`: probes, traces, assertions, and non-semantic
  observation points.

### Software-Oriented Features

Initial software features:

- `logicir.software.completion / core`: completion, failure, cancellation, and
  thenable-compatible await semantics as projection/runtime contracts.
- `logicir.software.invocation / core`: callable/service invocation semantics,
  argument and result mapping, and provider contract linkage.
- `logicir.software.retained-current / core`: retained-current state surfaces,
  current value reads, update notification, and state-store contract linkage.
- `logicir.software.fulfillment / core`: provider fulfillment shape, static
  startup binding, and explicit contracts for dynamic or switchable providers.
- `logicir.software.error / core`: error propagation, recoverability, and
  diagnostic/result mapping.

Likely later software features:

- `logicir.software.lifecycle / core`: startup, shutdown, resource lifetime,
  hooks, and teardown policy.
- `logicir.software.scheduling / core`: scheduling policy, task queues,
  concurrency limits, and backpressure.
- `logicir.software.transport / core`: service boundary, remote invocation,
  message bus, serialization, and distributed runtime hints.

### HDL-Oriented Features

Initial HDL features:

- `logicir.hdl.signal / core`: bit/vector signals, signedness, packed shapes,
  and port signal metadata.
- `logicir.hdl.module / core`: module boundary, instance naming, parameter
  mapping, and static structural constraints.
- `logicir.hdl.clocking / core`: clock/reset domains and sequential process
  binding.
- `logicir.hdl.state / core`: registers, retained hardware state, initial
  values, and reset behavior.
- `logicir.hdl.combinational / core`: combinational block constraints and
  continuous assignment constraints.
- `logicir.hdl.elaboration / core`: generate-time structure, parameters, and
  static binding constraints.
- `logicir.hdl.structural-slices / core`: structural export anchors and
  slice-oriented hardware projection rules.

Likely later HDL features:

- `logicir.hdl.simulation / core`: testbench hooks, probes, waveform metadata,
  and simulator integration.
- `logicir.hdl.synthesis / core`: synthesis constraints, target family hints,
  and synthesis diagnostics.

## Phase 3: Profiles

Profiles are single-layer compatibility contracts. Tools implement profiles;
users normally select stacks.

Required IR pipeline profiles:

- `basic-software-ir`: validates core, resolves feature manifests, checks
  software feature contracts, supports type/value checking when present, and
  lowers only semantics declared by the selected profile.
- `basic-hdl-ir`: validates core, resolves feature manifests, checks HDL
  contracts, requires HDL-compatible type/signal information, and rejects or
  lowers unsupported software semantics.

Required projection profiles:

- `to-interpreter-plan`: projects LogicIR into an executable interpreter plan
  while preserving provider and execution binding requirements.
- `to-generated-js`: projects LogicIR into JS/TS-oriented generated artifacts.
- `to-verilog-hdl`: projects LogicIR into Verilog HDL artifacts and diagnostics.
- `to-analysis-report`: projects LogicIR into reports useful for validation,
  capability gaps, and unsupported semantics review.

Required execution profiles:

- `software-interpreter-execution`: runs LogicIR or an interpreter plan in a
  JS/TS runtime with explicit providers.
- `generated-software-execution`: runs generated software artifacts with the
  selected provider bindings.
- `verilog-sim-execution`: consumes generated Verilog through a simulator
  environment.

Potential later profiles:

- `authoring-to-canonical`
- `distributed-software-ir`
- `to-netlist`
- `to-python`
- `to-mechanical-report`

## Phase 4: Stacks

Stacks compose profiles into user-facing workflows. They are not capability
proofs by themselves.

First stacks:

- `basic-software-interpreter`
  - IR profile: `basic-software-ir`
  - Projection profile: `to-interpreter-plan`
  - Execution profile: `software-interpreter-execution`
- `basic-software-generated`
  - IR profile: `basic-software-ir`
  - Projection profile: `to-generated-js`
  - Execution profile: `generated-software-execution`
- `basic-hdl-build`
  - IR profile: `basic-hdl-ir`
  - Projection profile: `to-verilog-hdl`
  - Execution profile: none
- `basic-hdl-sim`
  - IR profile: `basic-hdl-ir`
  - Projection profile: `to-verilog-hdl`
  - Execution profile: `verilog-sim-execution`

Later stack probes:

- `software-distributed`
- `hdl-synthesis`
- `logicir-analysis-report`
- `logicir-netlist-probe`

## Phase 5: Tools

Tools are accepted implementations under `packages/tools/*`. A tool must
declare capabilities rather than claiming support by stack name alone.

Near-term tools:

- `tools/core-validator`: LogicIR core validation and reference resolution.
- `tools/architecture-validator`: architecture definition validation.
- `tools/profile-resolver`: stack/profile expansion.
- `tools/capability-checker`: profile requirement coverage checks.
- `tools/type-system`: type registry and type checking. Already started.
- `tools/fixture-runner`: runs validation/projection/execution fixtures.

Later tools:

- `tools/migration`: schema migration and compat checks.
- `tools/lint`: authoring and style diagnostics.
- `tools/report`: human-readable capability and projection reports.
- `tools/adapter-lowering`: explicit adapter insertion or lowering analysis.

## Phase 6: Projectors And Compilers

Projectors consume validated LogicIR plus resolved profiles and produce target
artifacts or executable plans.

Near-term projectors:

- `projectors/interpreter-plan`: LogicIR to software interpreter plan.
- `projectors/js`: LogicIR to JS/TS-oriented generated artifact.
- `projectors/verilog`: LogicIR to Verilog HDL.
- `projectors/report`: LogicIR to analysis/capability report.

Projector requirements:

- Declare supported core versions.
- Declare supported features and extension points.
- Declare supported LU kinds and fulfillment forms.
- Reject unsupported required or conditional-required contracts.
- Preserve diagnostics for semantic loss or unsupported target constructs.

## Phase 7: Engines And Providers

Execution is realization, not core LogicIR transformation, unless it explicitly
writes a new LogicIR artifact.

Near-term engines:

- `engines/software`: JS/TS interpreter/runtime for LogicIR or interpreter
  plans.
- `engines/generated-software-host`: host helpers for generated JS/TS-oriented
  artifacts.
- `engines/verilog-sim`: simulator-facing execution wrapper for generated HDL.

Near-term provider contracts:

- State store provider.
- Invocation/function provider.
- Requirement service provider.
- Scheduler provider.
- Diagnostics provider.
- HDL clock/reset binding provider.
- HDL simulation probe provider.

Provider rule:

- `Plugin` is not a core term. A plugin is only one packaging/loading strategy
  for a provider or pass provider.

## Phase 8: Fixtures And Examples

Fixtures should prove compatibility and prevent the roadmap from becoming only
conceptual.

Required fixture groups:

- Minimal combinational LU.
- Minimal sequential LU.
- Minimal stateful retained-current LU.
- Structural LU with export anchors and outlet fills.
- Requirement fulfillment with closure.
- Requirement fulfillment through upstream lineage.
- Payload path connection and single-driver overlap checks.
- Type-system payload examples.
- basic-software interpreter example.
- basic-software generated artifact example.
- basic-hdl combinational module.
- basic-hdl sequential/state module.
- basic-hdl unsupported-semantics rejection.
- Verilog syntax/simulation smoke checks using `iverilog` from OSS CAD Suite.

Example directories should remain small and reviewable:

- `examples/basic-software`
- `examples/basic-hdl`
- `fixtures/logicir`
- `fixtures/profiles`
- `fixtures/features`

## AI Task Candidates

Fully autonomous AI tasks should each write to one child directory under
`ai/tasks/`. Useful candidates:

- Prototype `tools/profile-resolver` from current architecture schema.
- Prototype `tools/capability-checker` with feature/profile fixtures.
- Explore `logicir.software.completion / core` extension payloads.
- Explore `logicir.software.retained-current / core` state-store contracts.
- Explore `logicir.hdl.signal / core` and `logicir.hdl.module / core`.
- Prototype `projectors/interpreter-plan`.
- Prototype `projectors/verilog` on a tiny HDL fixture set.
- Extract reusable node/LUI catalog evidence from `packages/legacy/flow-core`.

Promotion rule:

- AI task output is source material only. Human promotion should migrate the
  smallest reviewed piece into `packages/`, `schema/`, `examples/`, `fixtures/`,
  or `dev/`, then re-run validation in the formal project context.

## Not Yet Project Plan

The following are north-star probes, not near-term required work:

- Circuit/netlist projection.
- PCB or board-level realization.
- Mechanical assemblies and product enclosures.
- Python runtime/projection.
- Distributed runtime beyond basic provider and transport seams.
- Visual editor productization.

They are useful for architectural pressure testing, but they should not drive
core schema changes unless they reveal a missing target-neutral topology
relation.
