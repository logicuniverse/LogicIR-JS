# Proposal

## 背景

`2026-05-15-domain-provider-catalog` 验证了三个 domain provider/catalog 方向：
CEL expression、pi-ai mock provider/stream、Hono route structure。该 task 是
provider catalog 边界素材，不是 core schema 变更。

本 change 为人工 review 准备 domain provider catalog slice 工作台。

## 问题

Domain provider 容易把 SDK behavior、API key、HTTP lifecycle 或 expression
runtime 泄漏进 core。需要人工 review 明确：

- domain catalog data 与 provider implementation 的边界。
- stream/tool-call/server-route 是否需要独立 feature。
- 哪些 fixtures 可以作为 formal smoke seed。

## 目标

- 汇总 domain provider task 的验证证据。
- 对照 provider contract、feature catalog、structural composition 和 event stream。
- 准备 CEL / pi-ai / Hono 三个子方向的待判断问题。

## 非目标

- 不实现真实 CEL evaluator。
- 不调用真实 pi-ai SDK 或 API key。
- 不实现 Hono HTTP lifecycle。
- 不把 SDK behavior 写入 core。

## 成功标准

- Reviewer 能判断是否拆分成 expression/provider/server-route 三个后续 changes。
- Domain-specific 行为与 LogicIR core 边界清楚。
- Mock provider 只作为 test evidence。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-domain-provider-catalog`
- Related workbenches:
  - `2026-05-17-review-stdlib-catalog-slice`
  - `2026-05-17-review-reactive-runtime-slice`
  - `2026-05-17-review-structural-ui-runtime-slice`

## Review 范围

- In scope:
  - CEL catalog/evaluator smoke。
  - pi-ai complete/stream mock provider。
  - tool call event evidence。
  - Hono route tree materialization。
- Out of scope:
  - Real SDK integration。
  - Secrets/API key policy。
  - Production HTTP server lifecycle。
  - Full provider registry package。

## Promotion 候选

候选仅供人工 review：

- `src/legacy-domain-snapshot.ts` as catalog evidence。
- `src/cel.ts` as smoke helper concept。
- `src/pi-ai.ts` as mock provider contract test seed。
- `src/hono.ts` as server-route structural fixture seed。
