# Design Notes

## Main Decision

The old engine `models.ts` is not treated as the new schema. It mixes LogicIR
topology, runtime execution plan, projector convenience, editor-era
implementation details, and JS-specific completion machinery.

This task instead uses the current core schema for LogicIR topology and lowers
software/runtime details into a task-local interpreter plan.

## Boundary

- Core schema: current `LogicUnit`, `LUI`, `Connection`, `EndpointRef`,
  `Closure`, requirement and fulfillment data.
- Feature/extension layer: software `runtime-operation` and `module-structure`
  extensions inside fixtures.
- Projection layer: `compileLogicUnit` converts current schema to
  `InterpreterPlan`.
- Execution layer: `runtime.ts` executes providers, state, events, hooks,
  control flow, nested plans, and diagnostics.

## Replicated Legacy Behavior

- Provider invocation and provider-missing diagnostics.
- Retained-current state read/write with engine-level state persistence.
- Promise and task-local Thenable completion.
- Sync run diagnostic for async providers.
- Closure fulfillment and upstream fulfillment.
- Payload path extraction and target payload assembly.
- Data read and before-emit transform hooks.
- LUI and closure override hooks.
- Event emit and reactive event replay.
- Sequential go-back and return-style control.
- Structural composition rendering through providers.
- Nested LU plan execution and parent-child session bookkeeping.

## Intentional Non-Promotion

The runtime plan types in `src/types.ts` are task-local and intentionally not a
formal API. They are useful evidence for a later `packages/engines/software`
or `packages/tools/profile` promotion, but they should be redesigned during
human review.

## Remaining Non-Runtime Areas

Editor operations, editor reconciliation, visual model lowering, and large node
catalog migration remain outside this task. They belong to later authoring and
feature/catalog tasks.

