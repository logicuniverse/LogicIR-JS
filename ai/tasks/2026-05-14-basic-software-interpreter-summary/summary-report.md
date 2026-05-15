# basic-software-interpreter Route Summary

## Summary

S1-S5 prove the minimum software interpreter spine, but they do not yet form one
integrated interpreter MVP. Each round intentionally added one semantic slice
and verified it end to end inside its own sandbox.

These rounds are baselines for review, not engine law. Legacy behavior and
task-local execution choices are design evidence. A promoted interpreter may use
different plan shapes, scheduling, state storage, completion/result modeling, or
fulfillment resolution if profile contracts and verification prove semantic
preservation.

The route is ready for human review as a set of seeds:

- Invocation can resolve a stack/profile contract and call an explicit provider.
- Retained-current can read and write current state through a state-store
  provider.
- Completion can await provider output and convert provider rejection to a
  diagnostic.
- Fulfillment can execute a requirement through closure or upstream provider.
- Diagnostics can turn common projector/engine failures into structured report
  data.

## Round Matrix

| Round | Capability Proven | Verification | Promotion Use |
| --- | --- | --- | --- |
| S1 pure invocation | Provider invocation through interpreter plan. | `yarn verify` passed. | Seed resolver, interpreter-plan shape, provider engine, pure invocation fixture. |
| S2 retained-current | Memory state-store get/write/current behavior. | `yarn verify` passed after catching a state erase bug. | Seed retained-current feature/contract, state-store provider, retained fixture. |
| S3 completion / await | Promise-style resolve and reject diagnostic. | `yarn verify` passed after type fix. | Seed completion policy and async engine behavior. |
| S4 fulfillment / closure | Closure fulfillment, upstream provider, missing provider diagnostic. | `yarn verify` passed. | Seed fulfillment plan nodes and requirement fixtures. |
| S5 error / diagnostic | Provider missing, invalid plan, unsupported semantics, runtime failure reports. | `yarn verify` passed. | Seed shared diagnostic model and failure fixture suite. |

## Not A Full MVP Yet

Do not treat S5 as the software summary. S5 is the diagnostic round, not the
integrated route. The current route still lacks:

- One shared interpreter-plan type used by S1-S5.
- One shared engine that can execute all S1-S5 operations together.
- General recursive LU/LUI projection.
- Multi-LUI scheduling.
- Formal closure-core projection.
- Event stream and subscription behavior.
- Sequential control flow.
- A promoted diagnostic package and source-location policy.

## Recommended Promotion Slice

The first formal promotion should be narrow:

1. Shared diagnostic shape and report summary helper.
2. Minimal profile resolver seed.
3. Minimal interpreter-plan data shape.
4. Provider invocation engine path.
5. Memory state-store provider path.
6. S1-S5 fixtures as formal regression candidates, after adapting them to
   accepted core/architecture types.

Avoid promoting the task-local schema subsets. They were useful for sandbox
speed, but formal code should import accepted types from `packages/`.

Also avoid promoting any S1-S5 algorithm as the only valid runtime strategy:
primary-result lazy pull, task-local state store, Promise-style completion,
closure/upstream fulfillment, and S5 diagnostics are current baselines. They
should be redesigned or retained intentionally during formal review.

## Recommended Follow-Up Rounds

| Round | Why It Comes Next |
| --- | --- |
| S6 retained-current-notification | S2 covers current read/write but not subscriptions, update notification, or packet paths. |
| S7 completion-result-model | S3 covers Promise resolve/reject but not Result/Option, cancellation, or nested completion. |
| S8 event-stream | Legacy coverage shows emit/subscribe is a major missing runtime surface. |
| S10 multi-lui-plan | Needed before a formal interpreter can handle realistic LU/LUI graphs. |
| S12 sequential-basic | Needed to cover ordered sequential steps from core theory and legacy evidence. |
| S13 control-flow | Needed for guard, go-back-if, return-if, and related diagnostics. |

## Do Not Promote

- Whole S1-S5 sandbox directories.
- Generated `dist/` output.
- Task-local schema subsets.
- Runtime-function closure representation as final schema.
- Diagnostic taxonomy as final without review.
- Any old-code-inspired algorithm as mandatory engine architecture.

## Conclusion

`basic-software-interpreter` is viable and has enough evidence to start formal
promotion planning. The next engineering step should be an integration task,
not another isolated semantic slice: define one formal interpreter-plan package
surface and port only the smallest S1-S5 behaviors into it with formal tests.
