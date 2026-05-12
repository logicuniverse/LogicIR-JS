---
name: logicir-schema-designer
description: Use when designing, reviewing, or implementing LogicIR schema, feature extensions, projection, projector capability, or runtime-alignment changes; especially when work must reconcile the LogicIR essay theory, old TS/JS prototype schema, JS/TS runtime projection, and Verilog HDL projection constraints.
---

# LogicIR Schema Designer

Use this skill to keep LogicIR schema and projection work aligned with the theory while preserving long-term compatibility and target-neutral design.

## Required Workflow

1. Ground in the project:
   - If the repo has `docs/workspace/operational-theory.md`, read it first.
   - If the repo has `docs/workspace/schema-principles.md`, read it next.
   - If source code exists, treat current TS/JS schema and projector code as old prototype/reference, not as schema authority.
2. Classify the task:
   - Core schema change.
   - Feature/extension change.
   - Projection/projector capability change.
   - Runtime implementation or compatibility change.
   - Theory extraction or documentation change.
3. Preserve the core boundary:
   - Put only cross-target logical topology semantics in core.
   - Put target/runtime/tool-specific details in namespaced features or extensions.
   - Require projectors to declare capability before projection.
4. Check projection targets:
   - Always assess JS/TS runtime impact.
   - Always assess Verilog HDL impact.
   - If a target cannot preserve declared semantics, require a diagnostic or projection pass, not silent degradation.
5. For design plans, include:
   - Current old implementation reference points.
   - Essay/theory mapping.
   - Core/feature/extension boundary.
   - Required vs optional extension status.
   - Projector capability set changes.
   - JS/TS projection impact.
   - Verilog HDL projection impact.
   - Compatibility and migration strategy.

## References

Load only the reference needed for the current task:

- `references/core-theory.md`: LU/LUI, X/Y/Z, Closure, LogicIR representation obligations.
- `references/schema-protocol.md`: core/feature/extension, versioning, compatibility, projector capability rules.
- `references/projection-targets.md`: JS/TS runtime and Verilog HDL projection constraints.

## Non-Negotiable Rules

- Do not let the old TS/JS implementation decide new schema semantics.
- Do not place JS runtime artifacts such as Promise/Thenable, subscription machinery, state store handles, or lifecycle hooks in core schema.
- Do not place HDL-specific clock/reset or module elaboration details in core schema unless they express target-neutral logical topology.
- Do not treat `Composable` in old code as binding theory; prefer essay terminology such as `Structural` when designing the new schema.
- Do not let requirement fulfillment collapse into ordinary data flow, parameter passing, naming lookup, callbacks, or ambient context.
- Do not allow a projector to ignore unsupported required extensions.
- Keep the current v0 core draft thin: `kindOrganization` stores only target-neutral organization skeletons, and kind-specific metadata belongs in owner-level extensions such as `LUCore.extensions`.

## Current Prototype Reading Heuristics

When reviewing `src/types/models.ts`, `src/projection.ts`, or `src/types/runtime.ts` in the LogicIR JS engine:

- Read `PortKind.Pull` and `PortKind.Push` as old boundary/contact evidence; keep unit-level X-axis drive separate from port-level contact capability.
- Read `Property` as retained-current contact evidence; read its store/cache/subscription mechanics as software runtime feature evidence.
- Read `Thenable`, `subscribe`, `StateStore`, and lifecycle ids as software runtime feature evidence.
- Read `SequentialStep` as old sequential organization evidence, with `isAwaited` as JS async projection detail.
- Read `dependencies`, `Provider`, `SovereignSource`, `AbstractLUT`, and `closures` as old Z-axis approximation.
- Read `Composable` and composition maps as old structural/feature evidence, not final theory vocabulary.
