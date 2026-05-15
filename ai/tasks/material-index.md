# AI Task Material Index

This index summarizes reviewable material produced under `ai/tasks/`.

AI task output is evidence, not authority. The rows below identify what can be
used as promotion input, what should only guide future work, and what should be
kept as background. Do not promote whole task directories.

## Review Categories

- `review-first`: strong candidate for near-term human review and narrow
  promotion.
- `review-after-foundation`: useful, but should wait until a dependent package
  or feature boundary is reviewed.
- `reference-only`: keep as design evidence or roadmap input, not direct
  implementation material.
- `archive-only`: historical task material that has been superseded.

## High-Value Material

| Area | Tasks | Category | Evidence | Best Promotion Use | Main Risk |
| --- | --- | --- | --- | --- | --- |
| Basic software interpreter spine | `2026-05-14-basic-software-interpreter-s1` through `s5`, plus `2026-05-14-basic-software-interpreter-summary` | `review-first` | S1-S5 verified invocation, retained-current, completion/await, fulfillment/closure, and diagnostics. Summary says seeded-not-integrated. | Narrow seed for `packages/engines/software`, interpreter-plan data, profile resolver seed, shared diagnostics, and fixtures. | The rounds are separate baselines, not one unified interpreter. Do not promote task-local schema subsets or runtime-function closure shape. |
| Basic HDL simulation spine | `2026-05-14-basic-hdl-sim-h1-combinational-module` through `h5`, plus `2026-05-14-basic-hdl-sim-summary` | `review-first` | H1-H5 verified combinational module, signal width, sequential state, unsupported-semantics rejection, and structural hierarchy; most use `iverilog`/`vvp`. | Narrow Verilog projector seed, HDL fixtures, signal/register emitters, testbench runner, rejection diagnostic path. | Emitters and hard-coded payloads are task-local; formal projector may need different lowering and diagnostics. |
| Legacy coverage map | `2026-05-14-legacy-coverage-map` | `review-first` | `coverage.json` maps runtime, projection, control, structural/editor, and node-catalog coverage against legacy sources. | Roadmap and review queue authority for what to cover next. | Coverage status means sandbox evidence exists, not that old algorithms are accepted. |
| LogicIR edit transaction MVP | `2026-05-15-logicir-edit-transaction-mvp` | `review-first` | Verified `partial LogicIR -> edit transaction -> replay -> validation -> invocation smoke`; output sum is `5`. | Seed for edit transaction model, typed holes, replay validation, AI-assisted authoring flow. | Operation paths, hash model, and validator are task-local MVP choices. |
| Algebraic type-system feature/tools | `2026-05-15-algebraic-type-system-feature-tools` | `review-first` | Verified ADT registry/checker and LogicIR connection type checks; 8 value checks and 5 connection checks. | Seed for `packages/features/type-system` and `packages/tools/type-system` review. | Requirement/composition type bindings and codegen are not active; recursive assignability is conservative. |
| Stdlib node replica | `2026-05-15-stdlib-nodes-replica` | `review-after-foundation` | Verified 104 legacy stdlib keys, 104 catalog rows, 104 providers, 104 smoke cases, and source audit. | Seed for stdlib/provider catalog after interpreter/provider boundaries are reviewed. | Full catalog is too large to promote as a block; JS stdlib semantics should not drive core schema. |
| Headless reactive node runtime | `2026-05-15-headless-reactive-node-runtime` | `review-after-foundation` | Verified retained-current property updates, event merge/mux forwarding, derived operator recomputation; final counter `8`, total `21`. | Seed for event-stream / retained-current-notification follow-up rounds. | Small synchronous runtime only; no subscription teardown, async stream policy, or formal engine architecture. |

## Background And Superseded Material

| Area | Tasks | Category | How To Use |
| --- | --- | --- | --- |
| Stack and feature exploration | `2026-05-13-basic-software-hdl-stacks` | `archive-only` | Pre-stable-schema exploration. Keep only as historical context; later schema-aligned summaries and coverage maps supersede it for review and promotion. |
| Latest-schema software runtime exploration | `2026-05-13-latest-schema-software-runtime` | `archive-only` | Pre-stable-schema runtime sketch. Do not use for promotion planning; prefer S1-S5 and the software summary. |
| Projection stack goal | `2026-05-13-projection-stack-goal` | `archive-only` | Pre-stable-schema projection/stack exploration. Do not promote directly and do not use as current review input. |
| Latest-schema engine replica | `2026-05-14-latest-schema-engine-replica` | `reference-only` | Use as implementation reference when comparing old engine replication choices. Prefer S1-S5 and stdlib replica for verified behavior. |
| Round schema alignment | `2026-05-14-round-schema-alignment` | `reference-only` | Use as evidence for schema alignment cleanup across rounds. |

## Recommended Review Order

1. Review the task safety model itself:
   - `ai/tasks/README.md`
   - this `material-index.md`
   - representative `promotion-checklist.md` files.
2. Review `2026-05-14-legacy-coverage-map`.
   It should guide what gets promoted and what remains missing.
3. Review the basic software interpreter vertical slice:
   - start from `2026-05-14-basic-software-interpreter-summary/summary.json`
   - inspect S1 and S5 first for invocation and diagnostics
   - then inspect S2/S3/S4 as additive behavior.
4. Review the basic HDL simulation vertical slice:
   - start from `2026-05-14-basic-hdl-sim-summary/summary.json`
   - inspect H1/H4 first for positive and negative projector gates
   - then inspect H2/H3/H5 for width, sequential, and structural expansion.
5. Review edit transaction MVP.
   This is a separate authoring path, but it depends on stable validation and
   fixture conventions.
6. Review type-system feature/tools.
   It should be narrowed into formal feature data and formal tool behavior.
7. Review stdlib and headless reactive tasks after the interpreter/provider and
   event/retained-current boundaries are clear.

## Promotion Strategy

Promote by smallest useful units:

- fixture first when it captures a stable behavior;
- shared type or diagnostic shape second;
- tool/runtime function only after the fixture and expected diagnostics are
  reviewed;
- package README and verification scripts last.

Do not promote:

- whole sandbox directories;
- generated `dist/` or simulation artifacts;
- task-local schema subsets as final schemas;
- old-code-inspired algorithms as mandatory architecture;
- JS runtime behavior into core schema;
- HDL implementation metadata into core schema.

## Near-Term Review Tickets

| Ticket | Input Material | Expected Formal Output |
| --- | --- | --- |
| `review-software-interpreter-slice` | software S1-S5 summary plus selected fixtures | first formal software interpreter package seed and smoke fixtures |
| `review-hdl-projector-slice` | HDL H1-H5 summary plus generated Verilog examples | first formal Verilog projector seed and HDL fixture runner |
| `review-diagnostic-shape` | software S5, HDL H4, type-system negative fixture | shared diagnostic data shape and policy notes |
| `review-type-system-core` | algebraic type-system task | narrowed type-system feature and checker package plan |
| `review-edit-transaction-mvp` | edit transaction MVP | draft edit transaction schema and replay validator plan |
| `review-stdlib-catalog-slice` | stdlib replica, legacy coverage map | selected stdlib catalog slice, not the full 104-node block |
| `review-reactive-runtime-slice` | headless reactive runtime, legacy coverage `runtime.emit-subscribe` | retained-current notification / event-stream follow-up plan |
