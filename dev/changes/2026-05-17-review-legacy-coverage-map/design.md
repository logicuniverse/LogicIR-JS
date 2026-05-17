# Design

## 说明

本文整理 coverage map 的人工 review 入口。Coverage status 是 task evidence，
不是最终 migration 决议。

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Row count | 28 rows |
| Covered | 2 |
| Partially covered | 8 |
| Missing | 13 |
| Defer | 4 |
| Drop intentionally | 1 |

## Status 语义

- `covered-by-s1-s5`: S1-S5 直接验证了 seed behavior。
- `partially-covered`: 有 baseline，但不是完整 legacy capability。
- `missing`: 当前 S1-S5 没覆盖。
- `defer`: 有价值，但不属于近期 interpreter MVP。
- `drop-intentionally`: 不应迁移为 LogicIR core/runtime 概念。

## Category Review Matrix

| Category | Review focus | Related future work |
| --- | --- | --- |
| runtime core | provider invocation, state store, property, completion, event, hooks, session | S6-S9, reactive runtime workbench |
| projection | LU/LUI plan, closure projection, provider resolution, hooks | S10-S11, software interpreter workbench |
| control flow | sequential, awaited step, go-back, return-if | S12-S13 |
| structural/editor | composition, edit operations, reconciliation, editor lowering | structural UI, edit transaction |
| node catalog | constants/scalars/arrays/events/async/state/html/domain | stdlib/domain/structural workbenches |

## Current Schema 对照点

- Core 不包含 Promise、state store handle、subscribe/unsubscribe、hooks、editor
  operations、React/HTML/domain details。
- Runtime/session、event stream、completion policy、provider resolution 应进入
  software feature/profile/runtime/tooling 层。
- Node catalog 是 feature/provider catalog 问题，不是 core schema 问题。
- `drop-intentionally` 的 `runtime.plugin-as-core` 应保持不迁移到 core。

## 待人工判断

- Coverage row taxonomy 是否足够表达 legacy 缺口？
- `covered-by-s1-s5` 是否需要改成更保守的 `seeded`？
- `runtime.state-store` 是否应和 `property-current` 分开 review？
- `projection.override-transform-hooks` 是否应从 missing 改为 defer？
- `structural.editor-lowering` 目前标为 partially-covered 是否合理？
- Follow-up rounds S6-S14 / C1-C3 是否应该进入 roadmap，还是只保留在 coverage
  report？
- Coverage map 是否需要成为正式 `dev/` 下的 migration tracking 文档？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| Coverage row ids and categories | `dev/` migration tracking | Need reviewer accepts taxonomy |
| Missing/partial matrix | `dev/roadmap.md` or separate review queue | Need prioritize current roadmap |
| Follow-up round list | future AI tasks / changes | Need split into concrete accepted work |
| Legacy evidence index | `dev/` appendix | Need keep evidence-only wording |

## 不应采纳为正式结论

- Legacy capability 必须全部迁移。
- S1-S5 已经是 full interpreter。
- 旧 engine hook/plugin model 是 core concept。
- 旧 node catalog layout 是未来正式 catalog layout。
