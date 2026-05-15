---
name: logicir-schema-designer
description: "Use when designing, reviewing, or implementing LogicIR ecosystem work: core schema, architecture schema, feature extensions, profiles, stacks, validators, tools, projectors, runtime engines, execution providers, legacy migration, or AI task promotion. Use especially when work must reconcile the LogicIR essay theory, package boundaries, old implementation evidence, JS/TS runtime constraints, and Verilog HDL projection constraints."
---

# LogicIR Designer

Use this skill to keep LogicIR schema, architecture, feature, tool, projection,
and runtime work aligned with the theory while preserving long-term
compatibility, target-neutral core design, and clean package boundaries.

## Required Workflow

1. Ground in the project:
   - If the repo has `dev/handoff.md`, read it first for current status and
     review entry points.
   - If the repo has `dev/shared-rules.md`, read it next for collaboration,
     sandbox, promotion, and verification rules.
   - If the repo has `dev/operational-theory.md`, read it for theory-to-engineering
     mapping, including AI-assisted LogicIR editing and edit transactions.
   - If the repo has `dev/schema-principles.md`, read it for schema and
     projection boundaries.
   - If the repo has `dev/logicir-architecture.md`, read it for feature,
     profile, stack, provider, and execution terminology.
   - If the repo has `dev/roadmap.md`, read it before roadmap round, `/goal`,
     promotion, or implementation planning work.
   - Treat `packages/core`, `packages/architecture`, and
     `packages/features/*` as current TS authoring packages for accepted
     protocol and feature data shapes.
   - Treat `schema/` as the language-neutral specification surface.
   - Treat `packages/legacy/engine/src/` as old LogicIR JS/TS engine
     prototype/reference, not as schema authority.
   - Treat `packages/legacy/flow-runtime-core/` and
     `packages/legacy/flow-core/` as older FlowForge-era source-only evidence,
     not as schema authority.
   - Treat `ai/tasks/` as autonomous AI sandbox material until human promotion.
2. Classify the task:
   - Core schema change.
   - Architecture/profile/stack/capability schema change.
   - Feature/extension change.
   - Validator, tool, package, or fixture change.
   - Projection/projector capability change.
   - Runtime implementation or compatibility change.
   - Legacy migration or source-evidence extraction.
   - Theory extraction or documentation change.
3. Preserve the core boundary:
   - Put only cross-target logical topology semantics in core.
   - Put target/runtime/tool-specific details in namespaced features or extensions.
   - Put profile, stack, capability, provider contract, and execution binding
     definitions in architecture schema, not in LogicIR core.
   - Require tools, validators, projectors, engines, and providers to declare
     capability before use.
4. Respect package and promotion boundaries:
   - Keep accepted TS/JS implementation under `packages/`.
   - Keep language-neutral docs and generated protocol artifacts under
     `schema/`.
   - Keep examples and fixtures under `examples/` and `fixtures/`.
   - Keep fully autonomous work inside one `ai/tasks/YYYY-MM-DD-<task>/`
     directory until human review.
   - Start autonomous tasks from `ai/templates/task/` when available.
   - Sandbox isolation is write isolation, not read isolation. Task-local code
     may use relative paths to read or import external repository files as
     read-only inputs, including JS/TS, Verilog HDL, Python, fixtures, docs, and
     generated artifacts. Formal project files must not import or depend on
     task-local code.
   - Autonomous task output must include runnable verification evidence.
     Runnable JS/TS work should include a task-root `package.json` with
     task-local scripts and run the relevant type check, build, test, or smoke
     path. Verilog HDL work activates `E:\oss-cad-suite\environment.ps1` and
     calls `iverilog` directly. If either path is claimed but cannot run, record
     the concrete blocker and do not call that path verified.
   - Roadmap round tasks must prove an end-to-end chain from fixture to final
     runtime, engine, or `iverilog` result. Do not call a round complete when it
     only generates an intermediate schema, plan, or artifact.
5. Check projection and execution targets:
   - Always assess JS/TS runtime impact.
   - Always assess Verilog HDL impact.
   - If a target cannot preserve declared semantics, require a diagnostic,
     profile rejection, or explicit lowering/projection pass, not silent
     degradation.
6. For design plans, include:
   - Current old implementation reference points.
   - Essay/theory mapping.
   - Core/feature/extension/profile/stack boundary.
   - Required, conditional-required, recommended, or optional contract status.
   - Tool, projector, engine, and provider capability changes.
   - JS/TS projection impact.
   - Verilog HDL projection impact.
   - Compatibility and migration strategy.

## References

Load only the reference needed for the current task:

- `references/core-theory.md`: LU/LUI, X/Y/Z, Closure, LogicIR representation obligations.
- `references/schema-protocol.md`: core/architecture/feature/extension/profile/stack, versioning, compatibility, capability rules.
- `references/projection-targets.md`: JS/TS runtime and Verilog HDL projection constraints.

## Non-Negotiable Rules

- Do not let the old TS/JS implementation decide new schema semantics.
- Do not place JS runtime artifacts such as Promise/Thenable, subscription machinery, state store handles, or lifecycle hooks in core schema.
- Do not place HDL-specific clock/reset or module elaboration details in core schema unless they express target-neutral logical topology.
- Do not treat `Composable` in old code as binding theory; prefer essay terminology such as `Structural` when designing the new schema.
- Do not let requirement fulfillment collapse into ordinary data flow, parameter passing, naming lookup, callbacks, or ambient context.
- Do not allow a projector to ignore unsupported required or conditional-required feature or extension contracts from the selected profile.
- Keep the current v0 core draft thin: `kindOrganization` stores only target-neutral organization skeletons, and kind-specific metadata belongs in owner-level extensions such as `LUCore.extensions`.
- Treat `LogicUnit.features` as the LU-local feature manifest; extension records use local `featureKey` aliases rather than direct feature namespace/key references.
- Keep architecture schema pure data: no factories, callbacks, provider
  implementations, runtime functions, or TypeScript generics as schema
  abstraction.
- Treat profiles as single-layer compatibility contracts, and stacks as
  user-facing profile compositions.
- Do not promote AI sandbox output into `packages/`, `schema/`, `examples/`, or
  `fixtures/` without human review and narrowing.

## Current Prototype Reading Heuristics

When reviewing `packages/legacy/engine/src/types/models.ts`, `packages/legacy/engine/src/projection.ts`, or `packages/legacy/engine/src/types/runtime.ts`:

- Read `PortKind.Pull` and `PortKind.Push` as old boundary/contact evidence; keep unit-level X-axis drive separate from port-level contact capability.
- Read `Property` as retained-current contact evidence; read its store/cache/subscription mechanics as software runtime feature evidence.
- Read `Thenable`, `subscribe`, `StateStore`, and lifecycle ids as software runtime feature evidence.
- Read `SequentialStep` as old sequential organization evidence, with `isAwaited` as JS async projection detail.
- Read `dependencies`, `Provider`, `SovereignSource`, `AbstractLUT`, and `closures` as old Z-axis approximation.
- Read `Composable` and composition maps as old structural/feature evidence, not final theory vocabulary.
- Read `packages/legacy/flow-runtime-core/` and `packages/legacy/flow-core/` only as historical evidence for runtime behavior, editing operations, lowering, old node/LUI catalog coverage, and provider/function examples.
