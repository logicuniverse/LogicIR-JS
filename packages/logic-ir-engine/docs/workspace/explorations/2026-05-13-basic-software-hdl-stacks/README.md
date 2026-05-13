# Basic Software And Basic HDL Stack Exploration

Status: exploration material, not active schema.

This pack drafts two initial LogicIR stacks using the architecture in
`schema/ARCHITECTURE.md`:

- `basic-software`: a language-neutral software stack based on the semantic
  intersection visible in the current TS/JS prototype.
- `basic-hdl`: a Verilog-oriented HDL stack based on core topology plus HDL
  projection constraints.

The goal is to produce human/AI discussion material for later schema work. These
files should not be copied into active `schema/` as final profile definitions
without review.

## Source Inputs

- `schema/ARCHITECTURE.md`: current profile/stack architecture.
- `schema/core/v0-draft/types.ts`: active core schema shape.
- `schema/core/v0-draft/README.md`: current core invariants.
- `src/types/models.ts`: old TS/JS prototype data model, used as evidence only.
- `src/types/runtime.ts`: old runtime result/completion/provider evidence.
- `src/projector.ts`: old interpreter/provider configuration evidence.
- `src/projection.ts`: old execution behavior evidence.
- Archived automatic-run drafts under
  `docs/workspace/explorations/2026-05-13-projection-stack-goal/artifacts/`,
  used only as exploration material.

## Pack Contents

- [source-evidence.md](source-evidence.md): code and draft evidence used by this
  pack.
- [feature-catalog.md](feature-catalog.md): feature candidates shared or owned
  by the two stacks.
- [basic-software-stack.md](basic-software-stack.md): full stack draft for
  language-neutral software interpretation/codegen.
- [basic-hdl-stack.md](basic-hdl-stack.md): full stack draft for basic Verilog
  HDL projection and optional simulation.
- [stack-matrix.md](stack-matrix.md): side-by-side comparison.
- [open-questions.md](open-questions.md): decisions to make before promotion.
- [code/README.md](code/README.md): TypeScript exploration code for stack,
  profile, feature catalog, registry, and smoke-check drafts.

## Code Drafts

The `code/` folder mirrors the prose draft as executable TypeScript data:

- `architecture-types.ts`: minimal types for profiles, stacks, stages,
  execution bindings, providers, and feature catalog entries.
- `features.ts`: shared, `basic-software`, and `basic-hdl` feature catalog.
- `basic-software.ts`: complete software IR/projection/execution profile draft
  and stack variants.
- `basic-hdl.ts`: complete HDL IR profile, Verilog projection profile, optional
  simulator execution profile, and build/sim stack variants.
- `stacks.ts`: registry exports for stacks and profiles.
- `smoke.ts`: assertions that the drafted stacks are wired consistently.

These files reference the active core schema version but are not active schema
definitions.

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
