# Source Map

## Current Project Sources

| Source | Why It Matters |
| --- | --- |
| `dev/roadmap.md` | Defines `basic-software-interpreter` as highest-priority stack and S1 as pure provider invocation. |
| `dev/logicir-architecture.md` | Defines LogicIR document vs architecture definition, profile layers, stack composition, execution binding, and provider terminology. |
| `packages/core/src/types.ts` | Current core LogicIR authoring source used as the shape reference for `LogicUnit`, `LUI`, `Port`, `Connection`, and external target identity. |
| `packages/architecture/src/types.ts` | Current architecture authoring source used as the shape reference for feature, profile, stack, stage, provider contract, and execution binding data. |
| `packages/core/package.json` | Confirms formal package identity and that S1 should not modify package build configuration. |
| `packages/architecture/package.json` | Confirms architecture package identity and formal dependency direction. |

## Legacy Evidence

| Source | Why It Matters |
| --- | --- |
| `packages/legacy/engine/src/types/models.ts` | Old `Provider` evidence: provider is an external injectable capability, not core topology. |
| `packages/legacy/engine/src/types/runtime.ts` | Old `LUProjector`, `Context.inject`, and provider/projector runtime shape evidence. |
| `packages/legacy/engine/src/projector.ts` | Evidence for projection as the bridge from LU structure to executable runtime behavior. |
| `packages/legacy/engine/src/projection.ts` | Evidence for provider injection during projection/runtime execution. |
| `packages/legacy/flow-runtime-core/src/runner.ts` | Older runtime evidence for provider lookup/invocation patterns. |
| `packages/legacy/flow-runtime-core/src/run-flow.ts` | Older full-runner evidence; not used as schema authority. |

## Task-Specific Sources

Task-local files:

| Source | Why It Matters |
| --- | --- |
| `src/types.ts` | S1-local minimal serializable type subset mirroring the accepted schema portions used by this task. |
| `src/architecture.ts` | Minimal feature, stage capability, provider contract, profiles, execution binding, and stack data. |
| `src/fixture.ts` | Minimal combinational LogicIR fixture with one external provider LUI. |
| `src/resolver.ts` | Expands the stack into concrete profile, stage, feature, and binding requirements. |
| `src/projector.ts` | Projects the LogicIR fixture into an executable interpreter plan. |
| `src/engine.ts` | Executes the plan by invoking an explicitly registered provider. |
| `src/smoke.ts` | End-to-end assertion entry point. |

## Source Priority Notes

- Current `packages/` type sources outrank legacy code.
- Legacy code is implementation evidence, not schema authority.
- This task keeps a local minimal type subset so the sandbox can compile
  without emitting or building formal package source files.
- This task's output is sandbox material until human promotion.
