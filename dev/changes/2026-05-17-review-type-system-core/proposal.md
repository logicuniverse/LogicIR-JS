# Proposal

## 背景

`2026-05-15-algebraic-type-system-feature-tools` 验证了一个代数类型系统 feature
和配套工具的 task-local 版本：ADT registry、value checker、connection type
checker，以及一个 intentional negative fixture。

本 change 为人工 review 准备 type-system 工作台。

## 问题

Type system 是 high-leverage feature，但不能进入 LogicIR core。人工 review
需要决定：

- 哪些 ADT payload shape 可进入 `packages/features/type-system`。
- 哪些 checker behavior 可进入 `packages/tools/type-system`。
- 与当前 core port/result/payloadPath/anchor/outlet 规则如何对齐。

## 目标

- 汇总 type-system task 的验证证据。
- 对照现有 `packages/features/type-system` 和 `packages/tools/type-system`。
- 列出 value assignability、connection type policy、diagnostic shape 的待判断点。

## 非目标

- 不直接替换现有 type-system package。
- 不把 type information 放入 core。
- 不引入泛型 schema abstraction。
- 不实现 codegen、HDL lowering 或 requirement/composition binding。

## 成功标准

- Reviewer 能判断是否开启正式 type-system package 收窄 change。
- Promotable pieces 与 task-local pieces 清楚分离。
- Negative fixture 的诊断意义明确。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-algebraic-type-system-feature-tools`
- Current packages:
  - `packages/features/type-system`
  - `packages/tools/type-system`
  - `packages/core/src/types.ts`
- Current docs:
  - `dev/schema-principles.md`
  - `dev/feature-catalog.md`
  - `ai/tasks/material-index.md`

## Review 范围

- In scope:
  - ADT payload shape。
  - Type registry / checker behavior。
  - LogicIR connection type policy。
  - Diagnostic evidence。
- Out of scope:
  - Full formal type language。
  - Host language codegen。
  - HDL layout lowering。
  - Requirement/composition type binding activation。

## Promotion 候选

候选仅供人工 review：

- `src/types.ts` -> feature payload concept。
- `src/feature.ts` -> feature definition concept。
- `src/registry.ts`、`src/checker.ts`、`src/logicir.ts` -> tool behavior seed。
- `src/fixtures.ts`、`src/smoke.ts` -> formal tests/fixtures seed。
