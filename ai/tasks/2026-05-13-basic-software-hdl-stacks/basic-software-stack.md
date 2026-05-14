# Basic Software Stack Draft

Status: AI task draft.

Working stack name: `logicir.stack.basic-software`.

Goal: define the smallest useful software stack that can be interpreted directly
or compiled to host software without depending on JS- or Python-specific
mechanics.

This stack is based on the semantic intersection visible in the current TS/JS
prototype:

- pull-readable values.
- push-notifiable delivery.
- retained-current property-like contacts.
- immediate or continuation-style completion.
- ordered sequential progression.
- state backing.
- closure/local fulfillment.
- external/native provider binding.
- result/error value convention.

It intentionally does not include:

- JS `Promise` as a schema concept.
- Python coroutine/asyncio/threadpool as schema concepts.
- Browser/Node lifecycle APIs.
- Host exception mechanics as core semantics.

## Stack Composition

```text
Stack:
  logicir.stack.basic-software

IR Pipeline Profile:
  logicir.profile.basic-software-ir

Projection Profile:
  logicir.profile.basic-software-plan

Execution Profile:
  logicir.profile.basic-software-execution
```

This stack can support both:

```text
LogicIR -> interpreter-ready plan -> execution
LogicIR -> generated software plan/code -> execution
```

The projection profile may be identity-like for direct interpretation.

## IR Pipeline Profile: `basic-software-ir`

Input/output:

```text
LogicIR -> LogicIR
```

Purpose:

- Validate core shape.
- Resolve local and external target contracts.
- Resolve requirement service contracts.
- Check feature extension support.
- Type-check where `logicir.type-system / core` is present.
- Normalize payload path and port-surface references.
- Insert explicit adapter LUIs where a required feature demands preserving
  conversion behavior.
- Strip or retain authoring-only data according to policy.

Required stages:

1. `core-validate`
2. `resolve-target-contracts`
3. `resolve-requirement-contracts`
4. `check-extension-capabilities`
5. `normalize-surfaces`
6. `validate-fulfillment`
7. `validate-composition`

Recommended stages:

1. `type-check`
2. `path-schema-check`
3. `adapter-insertion`
4. `strip-authoring-data`

Core source and spec notes:

- `packages/core/src/types.ts` as current TS authoring source.
- `schema/core/v0-draft/README.md` as curated specification notes.

Required core support:

- All four LU kinds: combinational, sequential, stateful, structural.
- Port interactions:
  - `pullReadable`.
  - `pushNotifiable`.
  - `retainedCurrent`.
- `EndpointRef.payloadPath`.
- Requirement fulfillment:
  - closure fulfillment.
  - upstream unit fulfillment.
  - upstream shared-service supplier fulfillment.
- Structural composition:
  - export anchors.
  - external outlets.
  - LUI outlets/anchors.
  - export anchor fills.
  - LUI fills.

Feature handling:

- Required and conditional-required feature or extension contracts must be
  understood or rejected.
- Optional feature and extension contracts may be ignored only if profile
  semantics remain unchanged.
- Type-system extensions may be consumed by the IR pipeline and stripped before
  projection if the projection profile no longer needs them.

## Projection Profile: `basic-software-plan`

Input/output:

```text
LogicIR -> executable software plan
```

For direct interpretation, the plan may be a thin wrapper around the validated
LogicIR plus resolved contracts. For generated-code projection, the plan is a
target-neutral software execution plan that a JS/Python/etc. emitter can lower.

Projection target:

```text
basic-software-plan
```

Required stages:

1. `collect-execution-units`
2. `plan-provider-calls`
3. `plan-port-routing`
4. `plan-retained-current`
5. `plan-sequential-completion`
6. `plan-fulfillment-bindings`
7. `emit-executable-plan`

Required features:

- `logicir.software-runtime / invocation`
- `logicir.software-runtime / completion`
- `logicir.software-runtime / retained-current`
- `logicir.fulfillment / static-binding`
- `logicir.value / literals`
- `logicir.execution / error`

Recommended features:

- `logicir.type-system / core`
- `logicir.software-runtime / lifecycle`

Optional features:

- `logicir.software-runtime / observation`

Projection rules:

- Combinational LUI calls must complete immediately unless a required completion
  feature explicitly allows a preserving adapter or diagnostic.
- Sequential `steps: LUIId[]` preserve order. Completion feature data decides
  whether a step is `before-next-step` or `detached-delivery`.
- Stateful retained-current outputs require a retained-current realization plan.
- Push delivery must preserve packet path semantics where used.
- Dynamic fulfillment must default to `static-at-startup` unless a required
  feature declares later binding or switching and the projection profile
  supports it.
- Host/provider errors must be normalized according to the selected error
  feature or rejected when unsupported.

Diagnostics:

- Missing provider contract.
- Unsupported required or conditional-required feature or extension contract.
- Unsupported completion policy.
- Unsupported retained-current realization.
- Unsupported dynamic fulfillment policy.
- Ambiguous multi-driver/merge without resolver.
- Payload path support gap.

## Execution Profile: `basic-software-execution`

Input/output:

```text
LogicIR | executable software plan | generated software artifact -> execution
```

Execution target examples:

- `interpreter`
- `generated-js`
- `generated-python`
- `native-host`
- `distributed-software-runtime`

Execution environment examples:

- Node.js process.
- Browser runtime.
- Python process.
- Native host process.
- Cloud worker.
- Remote service mesh.

The profile should describe semantics, not force one environment.

Required provider contracts:

### `software-unit-provider`

Purpose:

- Execute an external or requirement-backed LUI.

Abstract call shape:

```text
invoke(inputs, context) -> Completion<Result<outputs>>
```

Context may include:

- emission function.
- subscription function.
- retained-current read context.
- requirement provider resolver.
- execution metadata.

### `state-store-provider`

Purpose:

- Store retained-current values and stateful backing data.

Minimal operations:

```text
get(key)
set(key, value)
delete(key)
```

This is evidence-backed by old `StateStore`.

### `fulfillment-provider`

Purpose:

- Resolve requirement services and units to execution providers.

Minimal modes:

- `static-at-startup`
- `late-bound`
- `switchable`

Only `static-at-startup` should be mandatory in the basic stack.

### `completion-provider`

Purpose:

- Realize immediate and continuation-style completion.

Minimal modes:

- `immediate`.
- `continuation`.

This abstracts old `ReturnResult.Immediate | Thenable`.

### `event-observation-provider` optional

Purpose:

- Observe runtime events for tools.
- Provide transform/override hooks only when the execution profile explicitly
  allows behavior-changing providers.

## Execution Bindings

Execution bindings are item-level profile data.

Candidate binding kinds:

- `external-target`
- `requirement-service`
- `requirement-unit`
- `state-store`
- `completion-scheduler`
- `error-channel`
- `lifecycle-resource`
- `transport`

Example shape:

```text
binding:
  kind: external-target
  target: { namespace, key }
  provider: { namespace, key }
  config: { ... }
```

## Current Code Mapping

Old prototype item:

- `createLUProjector(entryId, lus, plugins, getKVStore)`

Architecture mapping:

- execution target: `interpreter`.
- execution environment: JS process.
- execution providers:
  - `LUProjector` functions.
  - `StateStore`.
  - local plugin methods.
- execution bindings:
  - `getServiceProjector(packageId, methodKey)`.
  - `inject(serviceKey, unitKey)`.
  - `getKVStore(sessionId)`.
- optional observation providers:
  - hooks.

Old prototype item:

- `ReturnResult = Immediate | Thenable`

Architecture mapping:

- `logicir.software-runtime / completion`.

Old prototype item:

- `PropertyPort`

Architecture mapping:

- core `retainedCurrent: true`.
- `logicir.software-runtime / retained-current` realization.

Old prototype item:

- `dependencies`, `Provider`, `SovereignSource`, closure mappings.

Architecture mapping:

- core requirement/fulfillment relation plus execution bindings/providers.

## Minimal Conformance Fixtures

The stack should eventually validate and execute:

1. `combinational-add`
   - pull-readable inputs.
   - pull-readable primary result.
   - immediate provider.
2. `stateful-retained-counter`
   - push input.
   - retained-current output.
   - state store provider.
3. `sequential-pipeline`
   - ordered steps.
   - immediate and continuation completion.
4. `requirement-with-closure`
   - local closure fulfillment.
   - forwarded ports.
5. `shared-service-supplier`
   - shared supplier binding.
6. `structural-composition`
   - anchors/outlets and software-render-like structural output.

## Promotion Criteria

Before this becomes formal package/schema/profile material:

- Define stable feature identities and extension keys.
- Decide whether `basic-software-plan` is a real artifact or an execution
  profile can interpret validated LogicIR directly.
- Write provider contract data shapes.
- Define minimal diagnostics.
- Add examples and conformance fixtures.
- Keep feature/profile requiredness aligned with
  [feature-profile-matrix.md](feature-profile-matrix.md).
