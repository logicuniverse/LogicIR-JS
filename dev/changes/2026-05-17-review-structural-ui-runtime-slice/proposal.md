# Proposal

## 背景

`2026-05-15-structural-ui-component-runtime` 验证了一个 headless structural UI
runtime：raw text、div props/children/events、array/object child composition、
react app headless mount binding。

本 change 为人工 review 准备 structural UI runtime slice 工作台。

## 问题

Structural UI task 很容易被误读为 ReactDOM 实现。实际它只证明 headless
component tree 和 structural composition route，不包含真实 DOM lifecycle、
hooks 或 browser rendering。

## 目标

- 汇总 structural UI task 证据。
- 对照当前 `anchor/outlet` composition 规则。
- 明确 React provider compatibility 与 core structural semantics 的边界。

## 非目标

- 不实现 ReactDOM。
- 不把 `class -> className` 写入 core。
- 不定义 browser lifecycle。
- 不 promotion task-local runtime。

## 成功标准

- Reviewer 能判断它是否可作为 structural/component feature seed。
- Headless component tree、provider contract、structural anchors/outlets 的边界清楚。
- UI/domain-specific details 不污染 core。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-structural-ui-component-runtime`
- Related workbenches:
  - `2026-05-17-review-reactive-runtime-slice`
  - `2026-05-17-review-domain-provider-catalog-slice`
  - `2026-05-17-review-legacy-coverage-map`

## Review 范围

- In scope:
  - Headless component tree evidence。
  - Structural child composition。
  - Event binding evidence。
  - React provider compatibility notes。
- Out of scope:
  - Real ReactDOM rendering。
  - Browser layout/testing。
  - Hooks/lifecycle。

## Promotion 候选

候选仅供人工 review：

- Headless component tree type concept。
- Structural UI fixtures。
- Provider contract questions for HTML/React。
- Child composition smoke evidence。
