# Proposal

## 背景

`2026-05-15-headless-reactive-node-runtime` 验证了一个 headless reactive runtime
切片：property update、event merge/mux forwarding、derived recomputation。

本 change 为人工 review 准备 reactive runtime slice 工作台。

## 问题

Reactive runtime 与 core `property` contact、event stream、retained-current
notification 都相关，但 task 只是同步 headless prototype。人工 review 需要决定：

- 哪些行为是 retained-current 的正式后续。
- 哪些属于 event-stream feature。
- 哪些只是 old node runtime behavior evidence。

## 目标

- 汇总 reactive task 的验证证据。
- 对照 S2 property、legacy event/subscribe、stdlib state/event nodes。
- 准备 retained-current notification / event-stream 后续工作的问题清单。

## 非目标

- 不实现 subscription teardown。
- 不引入 browser / ReactDOM / visual editor behavior。
- 不定义正式 engine architecture。
- 不把 old node behavior 写入 core。

## 成功标准

- Reviewer 能判断 reactive runtime 是否作为 S6/S8 seed。
- Property retained-current、push notification、event stream 的边界清楚。
- 不把 synchronous headless runtime 当作正式 engine。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-headless-reactive-node-runtime`
- Related workbenches:
  - `2026-05-17-review-basic-software-interpreter-s1-s5`
  - `2026-05-17-review-legacy-coverage-map`
  - `2026-05-17-review-stdlib-catalog-slice`

## Review 范围

- In scope:
  - property update behavior。
  - event merge/mux forwarding。
  - derived recomputation。
  - trace evidence。
- Out of scope:
  - Full FRP runtime。
  - Async stream/backpressure。
  - UI/browser integration。

## Promotion 候选

候选仅供人工 review：

- Runtime shape concepts。
- Selected behavior fixtures。
- Legacy node snapshot as source evidence。
- Retained-current notification follow-up plan。
