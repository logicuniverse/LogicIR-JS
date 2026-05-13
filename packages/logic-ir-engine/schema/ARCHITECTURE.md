# LogicIR Schema Architecture

This document defines the working architecture for LogicIR schema, profiles,
projection, and execution support. It is a development guide for future schema
work, not a replacement for the theory documents in `docs/`.

## Two Primary Data Artifacts

LogicIR development is centered on two portable data artifacts:

- **LogicIR Document**: the mutable logical object. It carries the topology being
  authored, validated, transformed, projected, or executed.
- **Profile Document**: a read-only compatibility contract for one processing
  layer. It tells tools what rules, features, stages, target constraints, or
  execution bindings apply.

Generated code, Verilog files, reports, executable plans, providers, compilers,
and engines are derived artifacts or implementations. They are not the core
portable source objects of the LogicIR protocol.

## LogicIR Document

A LogicIR document answers:

```text
What is the logic?
```

It contains the target-neutral core topology:

- `LogicUnit`, `LUCore`, and `LUI`.
- Ports, endpoints, pins, and connections.
- Requirement services and fulfillment relations.
- Closures.
- Structural composition.
- A `LogicUnit.features` manifest that declares the feature dependencies used by
  that independent LU.
- Feature-scoped extension records attached to stable owner or relation nodes.

A LogicIR document may be read and written by authoring tools and IR pipeline
tools. Projection compilers and execution engines usually consume it read-only.

LogicIR core must not contain runtime functions, host callbacks, state store
handles, JS/Python async mechanics, Verilog clock/reset mechanics, provider
registries, or profile references.

## Feature And Extension

Feature and extension form the horizontal semantic layer.

- **Feature**: a namespaced semantic capability unit, such as a type system,
  software completion policy, Verilog clocking, or distributed routing.
- **Feature use**: a `LogicUnit`-local manifest entry that inlines a feature's
  namespace, key, and optional version.
- **Extension kind**: a feature-owned extension shape, including where it may
  attach, what content schema it uses, and whether that extension kind is
  required by a profile.
- **Extension record**: the actual node-local declaration inside a LogicIR
  document. It references a `LogicUnit.features` local key, an extension key,
  and content.

Feature definitions specify semantics and compatibility obligations. Extension
records place those semantics onto concrete LogicIR nodes.

Example:

```text
Feature:
  logicir.type-system / payload-types

LogicUnit feature manifest:
  type = { namespace: logicir.type-system, key: core }

Extension record:
  attached to a Port
  featureKey = type
  key = payload-type
  content = { typeRef: ... }
```

Feature and profile contracts define which extension kinds are required for a
pipeline, projection, or execution target. Required extension kinds must be
understood by a tool before that tool may preserve, transform, project, or
execute the affected semantics. Unsupported required feature or extension
contracts must produce diagnostics, not silent degradation.

`FeatureUseKey` is only a local alias. Tools must resolve it through the
containing `LogicUnit.features` map before capability checking. A package or
document container may index many LUs, but it must not be the source of an LU's
semantic feature dependencies.

All core references that point at an external `namespace + key` may also carry
an optional `version`. The version pins the external feature, target, or
requirement-service contract when deterministic validation or projection needs
that stability. Feature-level behavior configuration should be modeled as a
feature-owned extension, profile policy, or execution binding, not as generic
core config.

Feature-level dependency and conflict metadata is a known future need. For the
current draft, profiles explicitly compose the full feature set required by a
pipeline, projection, or execution target. Later feature catalogs may add
`requires` and `conflictsWith` metadata once the initial stack shapes are proven.

## Three Profile Types

Profiles are single-layer compatibility contracts. A tool may implement one
profile type without implementing the others.

### IR Pipeline Profile

An IR pipeline profile governs transformations that remain in LogicIR form:

```text
LogicIR -> LogicIR
```

It is implemented by validators, resolvers, normalizers, type checkers, lowerers,
and adapter insertion tools.

It declares:

- Accepted core version range.
- Accepted or required features and extension kinds.
- Stage order.
- Required pass capabilities.
- Validation and diagnostic policy.
- Feature lowering policy.
- Strip or retain policy for authoring-only or analysis-only data.

Example names:

- `basic-software-ir`
- `verilog-hdl-ir`
- `authoring-to-canonical`

### Projection Profile

A projection profile governs leaving LogicIR form:

```text
LogicIR -> target artifact | executable plan
```

It is implemented by projection compilers, code generators, HDL emitters, report
generators, and interpreter-plan generators.

It declares:

- Required input LogicIR shape.
- Projection target.
- Artifact or plan kind.
- Projection stages.
- Target constraints.
- Required feature support.
- Unsupported semantics policy.
- Diagnostics policy.

Example names:

- `to-interpreter-plan`
- `to-generated-js`
- `to-verilog-hdl`
- `to-analysis-report`

### Execution Profile

An execution profile governs how a LogicIR document, artifact, or executable plan
is actually run or consumed:

```text
LogicIR | executable plan | artifact -> execution
```

It is implemented by interpreters, runtime engines, generated-code hosts,
simulators, deployment environments, and provider registries.

It declares:

- Execution target.
- Execution environment constraints.
- Provider contracts.
- Execution bindings.
- State, scheduler, transport, service, lifecycle, and diagnostics policies.

Execution profiles do not define LogicIR transformation stages unless they
explicitly produce a new LogicIR artifact. They configure realization.

## Stack

A stack is an end-to-end composition selected by a user or application. It
references profiles; it is not itself a replacement for profile-level
compatibility checks.

```text
Stack =
  IR Pipeline Profile
  + Projection Profile
  + optional Execution Profile
```

Examples:

```text
basic-software-interpreter stack
  ir: basic-software-ir
  projection: to-interpreter-plan
  execution: node-interpreter-execution

basic-software-js-codegen stack
  ir: basic-software-ir
  projection: to-generated-js
  execution: node-js-execution

verilog-hdl-build stack
  ir: verilog-hdl-ir
  projection: to-verilog-hdl
  execution: none

verilog-hdl-sim stack
  ir: verilog-hdl-ir
  projection: to-verilog-hdl
  execution: iverilog-sim-execution
```

Users normally choose a stack. Tools implement profiles. Profile resolvers expand
stacks into concrete profile requirements.

## Pipeline, Stage, And Pass

- **Pipeline**: an ordered processing flow declared or referenced by a profile.
- **Stage**: a logical slot in a pipeline, such as validate, resolve, normalize,
  lower, or emit.
- **Pass**: a concrete implementation of a stage.

IR pipeline stages produce LogicIR. Projection stages produce target artifacts or
executable plans. Execution profiles configure realization and should not be
called LogicIR stages unless they write a new LogicIR document.

## Execution Terms

Execution support is expressed by profile data and external providers.

- **Execution target**: the run shape, such as interpreter, generated JS,
  Verilog simulator, Verilog synthesis, or distributed runtime.
- **Execution environment**: the host context, such as Node.js, browser, Python,
  FPGA board, cloud deployment, or a Verilog simulator.
- **Execution binding**: an item-level mapping record in an execution profile. It
  maps an abstract requirement, external target, state store, transport, or other
  named need to a concrete provider identity and configuration.
- **Execution provider**: the real ability entity that satisfies a binding. It
  may be a function, module, linked library, remote service, database, message
  bus, hardware interface, or simulator foreign module.
- **Provider contract**: the interface and semantic obligations a provider must
  satisfy.
- **Provider capability**: what a provider declares it can actually support.

`Plugin` is not a core ecosystem term. A plugin is only one local packaging or
loading strategy for an execution provider or pass provider.

## Tool Roles

- **IR authoring tool**: reads profiles and reads/writes LogicIR.
- **IR pipeline tool**: implements an IR pipeline profile and reads/writes
  LogicIR.
- **Projection compiler**: implements a projection profile, reads LogicIR, and
  writes an artifact or executable plan.
- **Execution engine**: implements an execution profile and runs LogicIR, a plan,
  or a target artifact.
- **Execution provider**: satisfies provider contracts referenced by an execution
  profile.
- **Profile resolver**: expands a stack or profile into concrete features,
  stages, policies, and bindings.
- **Capability checker**: checks LogicIR extension records and profile
  requirements against tool, pass, compiler, engine, and provider capabilities.

## Compatibility Rule

The compatibility chain is:

```text
User selects Stack.
Stack references Profiles.
Tools implement Profiles.
Profiles reference Features.
LogicIR contains Extension Records.
Execution Profiles contain Bindings.
Providers satisfy Bindings.
Capability Checker verifies coverage.
```

A tool must not claim compatibility by profile name alone unless that profile has
been resolved into concrete features, stages, policies, and provider contracts
and the tool's declared capabilities cover them.

## Boundary Summary

```text
LogicIR Document
  mutable logic object

Feature
  horizontal semantic capability

Feature Use
  LogicUnit-local manifest entry for one feature dependency

Extension Record
  feature-owned declaration inside LogicIR

IR Pipeline Profile
  LogicIR -> LogicIR compatibility contract

Projection Profile
  LogicIR -> artifact/plan compatibility contract

Execution Profile
  realization compatibility contract

Stack
  end-to-end profile composition

Execution Binding
  item-level mapping data in an execution profile

Execution Provider
  real-world ability entity
```
