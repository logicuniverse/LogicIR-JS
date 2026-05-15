# Domain Provider Catalog

## 目标

吸收 legacy `flow-core` 中 CEL、pi-ai 和 Hono node/package 的核心语义，
形成一个可 review 的 provider/domain catalog sandbox。

本 task 不接真实外部服务：

- CEL 使用 task-local 的小型表达式子集 evaluator。
- pi-ai 使用 mock provider，不调用网络、不读取真实 API key。
- Hono 使用 headless route tree，不启动 HTTP server。

## 状态

`ready-for-review`

## 吸收点

- `cel.cel`: compute node、`context` object destructuring、hidden static
  `expression` input。
- `pi-ai.provider`: stateful/provider binding 概念。
- `pi-ai.complete`: sequence node 通过 provider dependency 调用 complete。
- `pi-ai.stream`: sequence node 通过 provider dependency 输出 event/toolCall stream。
- `hono.app` / `hono.route` / `hono.get`: server-route 结构组合。

## 目录

- `src/legacy-domain-snapshot.ts`: legacy node/package 最小语义快照。
- `src/cel.ts`: CEL 子集 evaluator。
- `src/pi-ai.ts`: mock pi-ai provider。
- `src/hono.ts`: headless route composition。
- `src/fixtures.ts`: 三组 fixture。
- `src/smoke.ts`: 端到端验证入口。
- `source-map.md`: legacy 证据来源。
- `verification.md`: 验证命令和输出。
- `promotion-checklist.md`: promotion 建议。
