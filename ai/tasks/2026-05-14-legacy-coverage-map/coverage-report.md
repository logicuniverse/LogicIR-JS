# Legacy Coverage Report

## Summary

`basic-software-interpreter` S1-S5 covers the minimum interpreter spine, not
the full legacy feature set.

Legacy code is evidence and prioritization input, not schema truth. A
`covered-by-s1-s5` or `partially-covered` status means the sandbox has a useful
baseline, not that the old implementation route or task-local algorithm should
be promoted unchanged.

Covered or meaningfully seeded:

- Provider invocation.
- Basic state store get/set.
- Minimal retained-current read/write.
- Async provider completion and rejection diagnostic.
- Minimal closure/upstream fulfillment.
- Basic diagnostic report pattern.

Still missing or partial:

- Event streams, emit/subscribe, packet path propagation.
- Hooks and plugin override/transform surfaces.
- Session/run bookkeeping.
- General recursive LU/LUI projection and multi-LUI scheduling.
- Sequential control flow.
- Structural/component composition.
- Editor operations, reconciliation, and editor-to-runtime lowering.
- Most old node catalog entries and node functions.

## Status Counts

| Status | Meaning |
| --- | --- |
| `covered-by-s1-s5` | The S1-S5 sandbox rounds directly verify the capability's core behavior. |
| `partially-covered` | S1-S5 prove a seed behavior but not the full legacy capability. |
| `missing` | No S1-S5 task covers it yet. |
| `defer` | Valuable evidence, but not part of the near-term interpreter MVP. |
| `drop-intentionally` | Should not be ported as a LogicIR feature or runtime capability. |

Machine-readable rows live in `coverage.json`. The following matrix mirrors the
same ids and recommendations.

## Coverage Matrix

| ID | Category | Capability | Status | S Rounds | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `runtime.provider-invocation` | runtime core | provider invocation | `covered-by-s1-s5` | S1 | Promote explicit provider binding and invocation seed after review. |
| `runtime.state-store` | runtime core | state store get/set/snapshot | `covered-by-s1-s5` | S2 | Use S2 as seed for a formal state-store provider contract. |
| `runtime.property-current` | runtime core | Property / retained-current contact | `partially-covered` | S2 | Create Round S6 retained-current-notification. |
| `runtime.thenable-completion` | runtime core | Thenable completion resolve/reject | `partially-covered` | S3, S5 | Create Round S7 completion-result-model. |
| `runtime.emit-subscribe` | runtime core | emit / subscribe event stream | `missing` |  | Create Round S8 event-stream. |
| `runtime.hooks` | runtime core | runtime hooks and plugin event taps | `missing` |  | Defer until core interpreter behavior is promoted; classify as observation/execution policy/plugin packaging. |
| `runtime.session-bookkeeping` | runtime core | session/run id and nested runtime bookkeeping | `missing` |  | Create Round S9 runtime-session. |
| `runtime.plugin-as-core` | runtime core | Plugin as core ecosystem concept | `drop-intentionally` |  | Do not migrate Plugin as a LogicIR core concept; preserve behavior as provider/pass/execution packaging strategy. |
| `projection.lu-lui-projection` | projection | LU/LUI projection into executable runtime plan | `partially-covered` | S1, S2, S3, S4 | Create Round S10 multi-lui-plan. |
| `projection.closure-projection` | projection | closure projection | `partially-covered` | S4 | Extend S4 with formal closure-core fixture before promotion. |
| `projection.dependency-injection` | projection | dependency injection and provider source | `partially-covered` | S1, S4, S5 | Create Round S11 provider-resolution. |
| `projection.override-transform-hooks` | projection | override and transform hooks | `missing` |  | Defer as execution tooling or observation/adapter features, not core. |
| `control.sequential-steps` | control flow | sequential step order | `missing` |  | Create Round S12 sequential-basic. |
| `control.awaited-step` | control flow | awaited sequential step | `missing` |  | Add to S12 or S7 after basic sequential execution exists. |
| `control.go-back-if` | control flow | go-back-if loop control | `missing` |  | Create Round S13 control-flow. |
| `control.return-if` | control flow | return-if early return | `missing` |  | Add to S13 control-flow. |
| `structural.composition` | structural/editor | component/composable composition | `missing` |  | Create Round S14 structural-composition after multi-LUI topology. |
| `structural.edit-operations` | structural/editor | editor edit operations | `defer` |  | Defer to authoring/edit-model roadmap. |
| `structural.reconciliation` | structural/editor | editor reconciliation | `defer` |  | Defer until edit model is intentionally designed. |
| `structural.editor-lowering` | structural/editor | editor model lowering to runtime model | `partially-covered` |  | Create later authoring-to-logicir or editor-lowering task. |
| `node-catalog.stdlib-constants` | node catalog | stdlib constants | `missing` |  | Create Round C1 node-catalog-seed. |
| `node-catalog.stdlib-number-string-operators` | node catalog | stdlib number/string/operators | `missing` |  | Create Round C2 stdlib-scalar-catalog. |
| `node-catalog.stdlib-array-object` | node catalog | stdlib array/object packaging and destructuring | `missing` |  | Create Round C3 payload-structure-catalog. |
| `node-catalog.stdlib-event` | node catalog | stdlib event nodes | `missing` |  | Depend on Round S8 event-stream. |
| `node-catalog.stdlib-async` | node catalog | stdlib async nodes | `partially-covered` | S3 | Add await/delay catalog fixtures after S7. |
| `node-catalog.stdlib-state` | node catalog | stdlib state/property nodes | `partially-covered` | S2 | Add typed property node catalog fixtures after S6. |
| `node-catalog.html-react` | node catalog | html/react/component nodes | `defer` |  | Defer to structural/UI projection roadmap; do not include in core. |
| `node-catalog.cel-hono-pi-ai` | node catalog | cel/hono/pi-ai domain nodes | `defer` |  | Defer until provider/catalog packaging model is formalized. |

## Recommended Follow-Up Rounds

| Round | Purpose | Depends On |
| --- | --- | --- |
| S6 retained-current-notification | Push notification, subscriptions, packet path, property node variants. | S2 |
| S7 completion-result-model | Result/Option, nested thenable composition, cancellation, awaited-step compatibility. | S3 |
| S8 event-stream | Emit/subscribe, stream nodes, path-level event packets, listener teardown. | S1, S5 |
| S9 runtime-session | LU/LUI run ids and nested closure/subflow session stacks. | S4, S8 |
| S10 multi-lui-plan | General graph scheduling, recursive LU targets, reusable interpreter-plan schema. | S1-S5 |
| S11 provider-resolution | defaultProvider, source lineage, fallback closure, dynamic/switchable provider behavior. | S4, S10 |
| S12 sequential-basic | Ordered sequential steps and sequence return. | S3, S10 |
| S13 control-flow | Guard, go-back-if, return-if, and control-flow diagnostics. | S12 |
| S14 structural-composition | Structural/component composition and composition context. | S10 |
| C1 node-catalog-seed | Constants and simple pass-through utilities. | S1 |
| C2 stdlib-scalar-catalog | Number, string, and operator providers. | C1 |
| C3 payload-structure-catalog | Array/object packing, destructuring, payloadPath compatibility. | C1, type-system work |

## Should Not Enter Core

- Promise/Thenable mechanics.
- State store handles and persistence.
- Subscribe/unsubscribe implementation.
- Runtime hooks and plugin packaging.
- Editor edit operations and selection state.
- React/HTML/domain node details.
- Concrete provider implementation functions.
- Old engine algorithms as mandatory LogicIR semantics.

These can become software features, execution policies, provider contracts,
authoring tools, or catalog packages, but not LogicIR core topology.
