# LogicIR Profiles And Stacks

LogicIR core does not define profiles as part of the LogicIR object model. A
profile is a read-only compatibility contract used by tools, compilers, runtimes,
and applications when processing or realizing a LogicIR document.

Profiles are not just feature bundles. A profile references features, but it also
declares the processing layer, input/output expectations, stage or execution
requirements, policies, diagnostics, and capability obligations.

## Profile Types

Use three single-layer profile types:

- **IR Pipeline Profile**: `LogicIR -> LogicIR`. Used by validators, resolvers,
  normalizers, type checkers, lowerers, and authoring-data strippers.
- **Projection Profile**: `LogicIR -> artifact | executable plan`. Used by
  projection compilers, code generators, HDL emitters, report generators, and
  interpreter-plan generators.
- **Execution Profile**: `LogicIR | plan | artifact -> execution`. Used by
  interpreters, runtime engines, generated-code hosts, simulators, deployment
  environments, and provider registries.

Tools implement profiles. Users usually select stacks.

## Stack

A stack is an end-to-end composition that references profiles:

```text
Stack =
  IR Pipeline Profile
  + Projection Profile
  + optional Execution Profile
```

Example stack shapes:

- `basic-software`: software IR pipeline, software executable-plan projection,
  and language-neutral software execution profile.
- `basic-software-generated`: software IR pipeline, generated-software
  projection, and generated-code execution profile.
- `verilog-hdl-build`: HDL IR pipeline and Verilog emission projection, with no
  execution profile.
- `verilog-hdl-sim`: HDL IR pipeline, Verilog emission projection, and simulator
  execution profile.

Longer-term reference stacks may target circuit/netlist, mechanical assembly,
product enclosure, or heterogeneous system realization flows. Treat those as
future projection routes and architecture probes unless concrete feature,
profile, provider, and artifact contracts exist. They should validate the
profile model, not expand LogicIR core with target-domain implementation data.

## Rules

- Profiles and stacks stay outside the canonical LogicIR object shape.
- Profiles must reference explicit feature identities and compatible core schema
  version ranges.
- A profile name alone is not a capability proof. It must be resolved into
  features, extension points, stages, policies, provider contracts, and bindings.
- Projection compilers, tools, engines, and providers must declare concrete capabilities.
- Required, conditional, recommended, and optional extension semantics are
  profile contract properties. Feature definitions define extension points and
  payload schema references; LogicIR extension records carry only local feature
  key, extension key, and payload data.
- Execution profile bindings are item-level mapping data from abstract needs to
  providers.
- `Plugin` is not a profile-level concept. A plugin is only one local packaging
  strategy for a provider or pass implementation.

Concrete profile and stack drafts must bind actual features, pipeline stages,
projection targets, or execution provider contracts. The architecture schema
defines the content shape only; registry identity, index exports, package
layout, and database storage are separate concerns.
