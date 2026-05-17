# Proposal

## 背景

`2026-05-14-legacy-coverage-map` 对 legacy engine / runtime / node catalog 能力
做了覆盖图，说明 S1-S5 已覆盖、部分覆盖、缺失、延后和明确丢弃的能力。

本 change 为人工 review 这个 coverage map 准备工作台。

## 问题

Coverage map 很容易被误读为 migration 计划或 schema 结论。它实际应该是：

- review 队列输入。
- 缺口识别工具。
- legacy evidence 的整理索引。

它不应该把旧代码路线变成强制实现，也不应该直接决定 feature 优先级。

## 目标

- 汇总 coverage rows 和 status 含义。
- 给 reviewer 提供逐类缺口判断清单。
- 明确 coverage map 与 S1-S5、stdlib、reactive、structural UI、domain provider
  tasks 的关系。
- 将后续 round 建议转成待人工判断问题。

## 非目标

- 不修改 coverage task。
- 不把 `coverage.json` 直接变成 roadmap。
- 不决定 legacy feature 是否全部迁移。
- 不做任何代码 promotion。

## 成功标准

- Reviewer 能判断 coverage map 是否可信、是否需要修订。
- Reviewer 能用 coverage map 驱动后续 review 排序。
- Coverage rows 的 `drop-intentionally`、`defer`、`missing` 不被误 promotion。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-14-legacy-coverage-map`
- Key files:
  - `coverage-report.md`
  - `coverage.json`
  - `verification.md`
  - `promotion-checklist.md`
- Related workbenches:
  - `2026-05-17-review-basic-software-interpreter-s1-s5`
  - `2026-05-17-review-stdlib-catalog-slice`
  - `2026-05-17-review-reactive-runtime-slice`
  - `2026-05-17-review-structural-ui-runtime-slice`
  - `2026-05-17-review-domain-provider-catalog-slice`

## Review 范围

- In scope:
  - Coverage status review。
  - Missing/partial/defer rows 的后续路线判断。
  - Legacy evidence 与当前 schema 边界对照。
- Out of scope:
  - 直接实现 missing rows。
  - 全量 legacy migration。
  - node catalog promotion。

## Promotion 候选

候选仅供 review：

- `coverage.json` 的 row id / category / status 作为 migration tracking seed。
- `coverage-report.md` 的缺口分组作为 review queue 输入。
- Follow-up round list 作为 roadmap 候选，不直接接受。
