# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Final counter | 8 |
| Final total | 21 |
| Forwarded events | 2 |
| Trace length | 24 |
| Known gaps | synchronous, headless, small old-node subset |

## Boundary

- Core:
  - `property` 是 retained-current contact。
  - Core 不包含 store/subscription implementation。
- Software runtime feature:
  - retained-current update notification。
  - event stream emit/subscribe。
  - derived recomputation scheduling。
- Provider/catalog:
  - property node、number property、event merge/mux、operators。

## Review Checklist

- Property update 是否通过 push-like notification 表达，还是作为单独 retained
  current protocol？
- Event stream 是否应独立于 property contact？
- Derived recomputation 是否需要 lazy pull + invalidation，而不是 eager trace？
- Forwarding event 的 packet/path 结构是否需要 formal diagnostic/trace？
- Subscription teardown、backpressure、async stream 是否全部 deferred？
- Runtime trace 是否作为 test helper，不进入 formal engine API？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| Retained-current notification fixture | future software runtime tests | Need S2 property decision |
| Event merge/mux fixtures | future event-stream feature | Need event protocol |
| Derived operator recomputation | future runtime behavior tests | Need scheduler/invalidation policy |
| Legacy node snapshot | stdlib catalog evidence | Need catalog slicing |

## 待人工判断

- 是否将此 task 作为 S6 retained-current-notification seed？
- Event stream 是否单独开 S8，而不是与 property 混合？
- property input as props / structural LUI relation 是否应该在 structural UI 工作台处理？
