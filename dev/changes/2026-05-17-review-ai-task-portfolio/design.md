# Design

## 工作台说明

本文是 AI task portfolio 的人工 review 总览，不是最终设计结论。所有分类只
表示 review 路线和优先级；是否采纳、重做、归档或 promotion，需要在对应专题
工作台中由 reviewer 判断。

## 分类总表

| 分类 | Tasks | 对应工作台 | Review 目的 |
| --- | --- | --- | --- |
| 已有工作台 | `2026-05-14-basic-software-interpreter-s1` 到 `s5`，`2026-05-14-basic-software-interpreter-summary` | `2026-05-17-review-basic-software-interpreter-s1-s5` | 软件解释器 S1-S5 人工 review |
| `review-first` | `2026-05-14-basic-hdl-sim-h1-*` 到 `h5-*`，`2026-05-14-basic-hdl-sim-summary` | `2026-05-17-review-basic-hdl-sim-h1-h5` | Verilog projector seed 和 HDL rejection path |
| `review-first` | `2026-05-14-legacy-coverage-map` | `2026-05-17-review-legacy-coverage-map` | legacy 缺口和后续 review 队列 |
| `review-first` | `2026-05-15-algebraic-type-system-feature-tools` | `2026-05-17-review-type-system-core` | ADT feature/tool 的正式边界 |
| `review-first` | `2026-05-15-logicir-edit-transaction-mvp` | `2026-05-17-review-edit-transaction-mvp` | edit transaction / typed holes / replay validation |
| `review-after-foundation` | `2026-05-15-stdlib-nodes-replica` | `2026-05-17-review-stdlib-catalog-slice` | stdlib catalog/provider 切片，不是 104-node 整块 |
| `review-after-foundation` | `2026-05-15-headless-reactive-node-runtime` | `2026-05-17-review-reactive-runtime-slice` | retained-current notification / event-stream runtime seed |
| `review-after-foundation` | `2026-05-15-structural-ui-component-runtime` | `2026-05-17-review-structural-ui-runtime-slice` | structural UI/component headless runtime seed |
| `review-after-foundation` | `2026-05-15-domain-provider-catalog` | `2026-05-17-review-domain-provider-catalog-slice` | CEL / pi-ai / Hono provider catalog 边界 |
| `reference-only` | `2026-05-14-latest-schema-engine-replica` | `2026-05-17-review-reference-archive-tasks` | 旧 engine 复刻行为对照，不直接 promotion |
| `reference-only` | `2026-05-14-round-schema-alignment` | `2026-05-17-review-reference-archive-tasks` | schema ownership / task alignment guardrail |
| `archive-only` | `2026-05-13-basic-software-hdl-stacks` | `2026-05-17-review-reference-archive-tasks` | schema 稳定前历史材料 |
| `archive-only` | `2026-05-13-latest-schema-software-runtime` | `2026-05-17-review-reference-archive-tasks` | schema 稳定前 runtime sketch |
| `archive-only` | `2026-05-13-projection-stack-goal` | `2026-05-17-review-reference-archive-tasks` | schema 稳定前 projection/stack draft |

## 推荐 Review 顺序

1. 已有的 software S1-S5 工作台。
2. HDL H1-H5 工作台。
3. Legacy coverage map 工作台。
4. Type-system 和 edit transaction 两个 foundation workbench。
5. Stdlib、reactive、structural UI、domain provider 四个 after-foundation
   workbench。
6. Reference/archive 工作台，只用于防误用和历史追溯。

## Cross-Workbench 约束

- Legacy code 只能作为 evidence，不能作为 schema authority。
- 05-13 task 不能作为当前 schema 示例。
- Task-local runtime route 不能直接变成 engine law。
- `review-after-foundation` task 不能早于 core / feature / interpreter /
  projector 边界做大范围 promotion。
- 所有交互 review 结论必须落回对应 change 的 `design.md`、`tasks.md` 或
  `spec-delta.md`。

## 待人工判断

- 当前专题拆分是否足够细，还是需要把 diagnostics 单独拆成独立 change？
- Stdlib / reactive / structural UI / domain provider 是否等 software
  interpreter foundation 后再 review？
- Reference/archive 工作台是否只保留索引，还是需要逐个写明确 archive
  decision？
- Review 后是否要回写 `ai/tasks/material-index.md` 的 ticket 状态？

## Promotion Boundary

本总览不产生直接 promotion。任何正式迁移都必须从具体专题中选出最小可审阅
单元，并重新在正式 project context 验证。
