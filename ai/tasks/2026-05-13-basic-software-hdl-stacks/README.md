# Basic Software And Basic HDL Stack Exploration

Status: AI task material, not accepted project source.

This pack drafts two initial LogicIR stacks using the architecture in
`dev/logicir-architecture.md`:

- `basic-software`: a language-neutral software stack based on the semantic
  intersection visible in the current TS/JS prototype.
- `basic-hdl`: a Verilog-oriented HDL stack based on core topology plus HDL
  projection constraints.

The goal is to produce human/AI discussion material for later schema work. These
files should not be copied into formal `packages/`, `schema/`, `examples/`, or
`fixtures/` locations as final profile definitions without review.

## Current Feasibility Read

The current draft indicates that both primary stacks are feasible:

- `basic-software` is feasible because the old TS/JS prototype already proves
  interpreter-style execution, provider fulfillment, retained-current behavior,
  and continuation-like completion can be realized. The exploration extracts
  those semantics into features, profiles, and execution bindings instead of
  treating the old runtime shape as schema authority.
- `basic-hdl` is feasible because the current core already contains the static
  topology needed for Verilog projection: LU/LUI boundaries, ports, pins,
  connections, payload paths, structural composition, external targets, and
  feature-scoped extensions. HDL-specific width, module binding, clock/reset,
  register, and elaboration semantics can stay in `logicir.verilog-hdl/*` and
  shared features.

The useful architectural signal is that the two stacks share the same core but
diverge cleanly through profiles and feature extensions. Software proves that
LogicIR can be interpreted or realized by providers. HDL proves that the same
core can be made static and strict enough for hardware projection.

`basic-software` and `basic-hdl` are stack/profile family names, not feature
namespaces. Features are reusable semantic units such as `logicir.type-system`,
`logicir.value`, `logicir.software-runtime`, `logicir.verilog-hdl`,
`logicir.partition`, and `logicir.diagnostics`.

## Reference Probes

This exploration keeps `basic-software` and `basic-hdl` as the initial primary
stacks. Circuit/netlist, mechanical assembly, product enclosure, and broader
heterogeneous system realization are useful north-star probes, but they are not
part of this pack's implementation target.

Those future routes should stay projection/profile/feature work. They can test
whether LogicIR core remains a clean logical-topology carrier, but they should
not be used to move electrical, physical, mechanical, manufacturing, placement,
routing, or tool-export details into core schema.

## Source Inputs

- `dev/logicir-architecture.md`: current profile/stack architecture.
- `packages/core/src/types.ts`: current core schema TS authoring source.
- `schema/core/v0-draft/README.md`: curated core v0 draft specification notes,
  not the TS authoring source.
- `packages/legacy/engine/src/types/models.ts`: old TS/JS prototype data
  model, used as evidence only.
- `packages/legacy/engine/src/types/runtime.ts`: old runtime
  result/completion/provider evidence.
- `packages/legacy/engine/src/projector.ts`: old interpreter/provider
  configuration evidence.
- `packages/legacy/engine/src/projection.ts`: old execution behavior evidence.
- Archived automatic-run drafts under
  `ai/tasks/2026-05-13-projection-stack-goal/artifacts/`,
  used only as exploration material.

## Pack Contents

- [source-evidence.md](source-evidence.md): code and draft evidence used by this
  pack.
- [feature-catalog.md](feature-catalog.md): feature candidates shared or owned
  by the two stacks.
- [feature-profile-matrix.md](feature-profile-matrix.md): per-stack
  requiredness for feature/profile contracts.
- [basic-software-stack.md](basic-software-stack.md): full stack draft for
  language-neutral software interpretation/codegen.
- [basic-hdl-stack.md](basic-hdl-stack.md): full stack draft for basic Verilog
  HDL projection and optional simulation.
- [stack-matrix.md](stack-matrix.md): side-by-side comparison.
- [open-questions.md](open-questions.md): decisions to make before promotion.

The earlier TypeScript code drafts for this pack were deleted after the current
architecture schema source moved to `packages/architecture/src/types.ts`. Future
machine-readable stack/profile drafts should be rewritten from that schema
rather than recovered from the obsolete exploration code.

## Architecture Assumption

The pack uses this data model:

```text
LogicIR Document
  mutable logic object

IR Pipeline Profile
  LogicIR -> LogicIR

Projection Profile
  LogicIR -> artifact | executable plan

Execution Profile
  LogicIR | plan | artifact -> execution

Stack
  IR Pipeline Profile + Projection Profile + optional Execution Profile
```

## Naming

Working names:

- `logicir.stack.basic-software`
- `logicir.stack.basic-hdl`
- `logicir.profile.basic-software-ir`
- `logicir.profile.basic-software-plan`
- `logicir.profile.basic-software-execution`
- `logicir.profile.basic-hdl-ir`
- `logicir.profile.basic-verilog-hdl`
- `logicir.profile.basic-hdl-sim`

These names are placeholders for discussion.
