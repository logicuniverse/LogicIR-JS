# Proposal

## 背景

`2026-05-15-stdlib-nodes-replica` 从 legacy stdlib 中复制并验证了 104 个 node
key / catalog row / provider / smoke case。它证明 legacy node catalog 有可系统化
迁移的素材。

本 change 为人工 review 准备 stdlib catalog slice 工作台。

## 问题

104 个 node 不能整块 promotion。正式项目需要先决定：

- catalog data、provider implementation、smoke fixture 如何分层。
- JS stdlib semantics 与 core schema 的边界。
- 哪些 node 子集应作为第一批 formal catalog slice。

## 目标

- 汇总 stdlib replica 的覆盖和验证证据。
- 准备按子集 review 的入口。
- 明确不要让 legacy node function 反向驱动 core schema。

## 非目标

- 不 promotion 104-node catalog。
- 不实现正式 stdlib package。
- 不把 callback/function smoke representation 写入 core。
- 不决定 HDL lowering/rejection 的完整策略。

## 成功标准

- Reviewer 能选择第一批 stdlib review 子集。
- Catalog / provider / fixture / coverage gate 的边界清楚。
- 不把 legacy package layout 当成正式 layout。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-stdlib-nodes-replica`
- Related workbenches:
  - `2026-05-17-review-legacy-coverage-map`
  - `2026-05-17-review-basic-software-interpreter-s1-s5`
  - `2026-05-17-review-reactive-runtime-slice`
  - `2026-05-17-review-domain-provider-catalog-slice`

## Review 范围

- In scope:
  - Source audit evidence。
  - 104-key coverage evidence。
  - Catalog/provider/smoke 分层。
  - 第一批 stdlib slice 选择。
- Out of scope:
  - 全量 node migration。
  - 正式 provider dispatch implementation。
  - UI/editor metadata migration。

## Promotion 候选

候选仅供人工 review：

- `src/catalog.ts` 的 pure identity/port evidence。
- `src/providers.ts` 的 JS runtime behavior seed。
- `src/smoke-cases.ts` 的 regression cases。
- `src/logic-unit-fixture.ts` 的 one-node fixture builder concept。
- `src/coverage-check.ts` 的 coverage gate concept。
