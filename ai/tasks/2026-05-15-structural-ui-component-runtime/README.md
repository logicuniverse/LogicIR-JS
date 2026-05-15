# Structural UI Component Runtime

## 目标

吸收 legacy `flow-core` 中 `react-dom`、`html` 和 stdlib component nodes
的核心语义，但不接真实 ReactDOM，不做 browser UI。

本 task 验证一个 headless component context：

- `html.raw` 把 reactive property 映射成 text node。
- `html.div` 把 props、children 和 events 组合成 element node。
- `component.fromArray` / `component.fromObject` 组合 children。
- `reactDom.reactApp` 的 DOM mount 被解释为 execution binding，而不是 core
  schema。

## 状态

`ready-for-review`

## 目录

- `src/types.ts`: headless component tree 和 legacy snapshot 类型。
- `src/legacy-ui-snapshot.ts`: 从旧 UI node 中提炼出的最小语义快照。
- `src/runtime.ts`: headless component context 和 reactive property 实现。
- `src/fixtures.ts`: raw/div/component/react-app fixtures。
- `src/smoke.ts`: 端到端验证入口。
- `source-map.md`: legacy 证据来源。
- `verification.md`: 验证命令和输出。
- `promotion-checklist.md`: promotion 建议。
