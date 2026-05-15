# basic-software-interpreter Seed Plan

## 目标

把 `basic-software-interpreter` S1-S5 sandbox 中已经验证过的最小能力，提升为正式 package seed 的实施计划。这个计划不直接 promotion 整个 sandbox，也不把旧 engine 或 task-local algorithm 当成 schema 真理。

第一阶段目标是建立一个可 build、可测试、可继续扩展的正式 seed：

```text
LogicIR fixture
-> minimal profile/stack resolution
-> interpreter plan
-> software engine execution
-> structured diagnostics
```

## 使用证据

必须同时参考这些材料：

- `ai/tasks/2026-05-14-basic-software-interpreter-summary/summary-report.md`
- `ai/tasks/2026-05-14-basic-software-interpreter-summary/promotion-checklist.md`
- `ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md`
- S1-S5 task 的 `README.md`、`source-map.md`、`verification.md` 和 `promotion-checklist.md`
- `packages/legacy/engine` 作为旧实现证据，不作为正式形状来源

## Promotion 切片

首轮只 promotion 这些最小切片：

1. Shared diagnostic shape and report helper。
2. Minimal profile resolver seed。
3. Minimal interpreter-plan data shape。
4. Provider invocation engine path。
5. Memory state-store provider path。
6. 改写后的正式 regression fixtures，使用 `packages/core` 和 `packages/architecture` accepted types。

暂不 promotion：

- S1-S5 整个 task 目录。
- task-local schema/type subset。
- generated `dist/`。
- runtime-function closure representation as final schema。
- S1-S5 algorithm as mandatory engine architecture。
- old-code-inspired behavior as schema truth。

## 建议 package 边界

首轮可以拆成两个正式 package，也可以先只建一个 package，但边界必须清楚：

- `packages/projectors/interpreter-plan`
  - 输入：已验证或 task fixture 中的 LogicIR。
  - 输出：serializable interpreter plan。
  - 不运行 provider。
- `packages/engines/software`
  - 输入：interpreter plan、provider registry、state-store provider。
  - 输出：execution result 或 structured diagnostics。
  - 不修改 core schema。

如果为了速度先做一个 package，也必须在源码中保留 projector/engine 子模块边界，避免把 resolver、projection 和 execution 混成一个函数。

## 第一阶段范围

### 必须支持

- 一个 combinational provider invocation fixture。
- 一个 retained-current memory state fixture。
- provider missing diagnostic。
- invalid plan diagnostic。
- runtime failure diagnostic。
- root package `yarn build` 通过。
- package-local tests 或 smoke 通过。

### 可以参考但不必首轮支持

- async completion resolve/reject。
- closure / upstream fulfillment。

这些可以作为 fixture 或 TODO 留在计划中，但如果实现会扩大 package surface，放到第二阶段。

### 明确不支持

- multi-LUI general scheduling。
- recursive LU/LUI projection。
- event stream / emit / subscribe。
- sequential steps and control flow。
- structural composition。
- dynamic/switchable provider。
- source-location rich diagnostic。
- visual editor edit model。
- stdlib node catalog。

这些进入后续 S6+、S8+、S10+、S12+、S14 或 catalog task。

## 理论映射

- Core topology 仍由 `packages/core` 定义。
- Profile / stack / provider contract 仍由 `packages/architecture` 定义。
- Provider invocation 是 Z 轴 fulfillment / external target realization 的 software execution seed。
- Retained-current 是 port contact capability 与 software state-store provider 的 realization seed。
- Diagnostic 是 profile/capability/engine failure 的安全失败路径，不是 core 字段。

## Legacy 边界

旧代码可以提供：

- provider invocation 证据。
- state store / property current 证据。
- projection / runtime 分离证据。
- completion、closure、session、event、control-flow 的后续优先级证据。

旧代码不能决定：

- core schema 字段。
- interpreter plan 最终形状。
- provider registry 最终 API。
- diagnostic taxonomy final naming。
- engine scheduling strategy。

## 验收标准

实现完成时至少满足：

- `yarn build` from repo root passes。
- package-local test/smoke passes。
- no formal package imports from `ai/tasks`。
- fixtures use accepted `packages/core` and `packages/architecture` types where applicable。
- diagnostics are structured values, not uncaught throws, for expected failure paths。
- README documents what is seed behavior and what is explicitly out of scope。

## 后续阶段

第二阶段候选：

- S3 completion result model。
- S4 closure/upstream fulfillment。
- S6 retained-current notification。
- S8 event-stream。
- S10 multi-LUI plan。
- S12 sequential-basic。
- S13 control-flow。

进入第二阶段前，需要先 review 首轮 package API 是否足够小、是否避免了 task-local algorithm lock-in。

