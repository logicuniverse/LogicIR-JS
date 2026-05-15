# Source Map

## Legacy Template Evidence

- `packages/legacy/flow-core/src/nodes/stdlib/index.ts`
- `packages/legacy/flow-core/src/nodes/stdlib/constants`
- `packages/legacy/flow-core/src/nodes/stdlib/operators`
- `packages/legacy/flow-core/src/nodes/stdlib/number`
- `packages/legacy/flow-core/src/nodes/stdlib/string`
- `packages/legacy/flow-core/src/nodes/stdlib/array`
- `packages/legacy/flow-core/src/nodes/stdlib/object`
- `packages/legacy/flow-core/src/nodes/stdlib/async`
- `packages/legacy/flow-core/src/nodes/stdlib/event`
- `packages/legacy/flow-core/src/nodes/stdlib/state`
- `packages/legacy/flow-core/src/nodes/stdlib/components`

## Legacy Runtime Evidence

- `packages/legacy/flow-core/src/node-functions/stdlib/constants.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/operators.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/number.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/string.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/array.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/object.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/async.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/event.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/state.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/component.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/utils/object-method.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/utils/identity.ts`
- `packages/legacy/flow-core/src/node-functions/stdlib/utils/passthrough.ts`

## Latest-Schema Engine Replica Reference

- `ai/tasks/2026-05-14-latest-schema-engine-replica/src/types.ts`
- `ai/tasks/2026-05-14-latest-schema-engine-replica/src/compiler.ts`
- `ai/tasks/2026-05-14-latest-schema-engine-replica/src/runtime.ts`
- `ai/tasks/2026-05-14-latest-schema-engine-replica/src/smoke.ts`

## Current Schema Reference

- `packages/core/src/types.ts`

The task-local fixture builder imports `LogicUnit` and `Port` from
`@logic-universe/logic-ir-core`. Runtime behavior remains task-local provider
logic and is not treated as core schema.
