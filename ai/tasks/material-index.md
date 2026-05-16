# AI Task 素材索引

这个索引用来汇总 `ai/tasks/` 下已经形成的可 review 素材。

AI task 输出是证据，不是权威。下面的分类只说明哪些内容适合作为
promotion 输入、哪些只适合作为后续设计参考、哪些应该归档保留。不要整包
promote 一个 task 目录。

## 当前 schema 同步状态

- `review-first` 的 05-14 basic software S1-S5、05-14 basic HDL H1-H5、05-15
  algebraic type-system 和 05-15 edit transaction MVP 已同步到当前 core
  端口模型：`Port.contact`、`EndpointRef.port`、kind-specific `PortSurface`。
- `combinational` task fixture 不再声明普通 `ports.outputs`；组合逻辑只有
  `ports.inputs + ports.result`，多个结果通过 `result.pins` 和
  `payloadPath` 表达。
- 除 05-13 历史归档外，05-14 / 05-15 task 的 LogicIR core fixture 已同步到
  当前 schema。task-local execution plan、HDL library module、headless runtime
  等仍可能使用自己的 `portKey`、`direction` 或消息 `role` 字段；这些不是
  core `EndpointRef` 或 `Port` schema。
- 05-13 tasks 仍可能保留 `boundary/interaction/portKey/primary-result` 等历史
  写法；它们只能作为 IR schema 稳定前的历史证据，不能作为当前 schema 示例。

## Review 分类

- `review-first`: 近期优先人工 review，并且可能窄范围 promotion。
- `review-after-foundation`: 有价值，但需要等待依赖的 package、feature 或运行时边界先稳定。
- `reference-only`: 只作为设计证据或 roadmap 输入，不直接作为实现素材。
- `archive-only`: 已被后续任务替代的历史材料。

## 高价值素材

| 方向 | Tasks | 分类 | 证据 | 最适合的 promotion 用法 | 主要风险 |
| --- | --- | --- | --- | --- | --- |
| Basic software interpreter 主干 | `2026-05-14-basic-software-interpreter-s1` 到 `s5`，以及 `2026-05-14-basic-software-interpreter-summary` | `review-first` | S1-S5 已验证 invocation、retained-current、completion/await、fulfillment/closure 和 diagnostics。summary 明确状态是 seeded-not-integrated。 | 作为 `packages/engines/software`、interpreter-plan 数据结构、profile resolver seed、shared diagnostics 和 fixtures 的窄切片种子。 | 这些 round 是分离 baseline，不是统一 interpreter。不要 promote task-local schema subset 或 runtime-function closure 形状。 |
| Basic HDL simulation 主干 | `2026-05-14-basic-hdl-sim-h1-combinational-module` 到 `h5`，以及 `2026-05-14-basic-hdl-sim-summary` | `review-first` | H1-H5 已验证组合模块、信号宽度、时序状态、unsupported-semantics 拒绝和结构化层级；多数通过 `iverilog`/`vvp`。 | 作为 Verilog projector seed、HDL fixtures、signal/register emitters、testbench runner 和 rejection diagnostic path 的窄切片种子。 | emitter 和 hard-coded payload 都是 task-local；正式 projector 可能需要不同 lowering 和 diagnostics。 |
| Legacy coverage map | `2026-05-14-legacy-coverage-map` | `review-first` | `coverage.json` 把 runtime、projection、control、structural/editor、node-catalog 能力对照 legacy source 做了覆盖图。 | 作为后续 roadmap 和 review 队列的依据。 | coverage 状态只表示 sandbox evidence 存在，不表示旧算法被接受。 |
| LogicIR edit transaction MVP | `2026-05-15-logicir-edit-transaction-mvp` | `review-first` | 已验证 `partial LogicIR -> edit transaction -> replay -> validation -> invocation smoke`，输出 `sum = 5`。 | 作为 edit transaction model、typed holes、replay validation 和 AI-assisted authoring flow 的种子。 | operation path、hash model 和 validator 都是 task-local MVP 选择。 |
| Algebraic type-system feature/tools | `2026-05-15-algebraic-type-system-feature-tools` | `review-first` | 已验证 ADT registry/checker 和 LogicIR connection type check；8 个 value checks、5 个 connection checks。 | 作为 `packages/features/type-system` 和 `packages/tools/type-system` 的 review 起点。 | requirement/composition type bindings 和 codegen 未激活；recursive assignability 仍然保守。 |
| Stdlib node replica | `2026-05-15-stdlib-nodes-replica` | `review-after-foundation` | 已验证 104 个 legacy stdlib keys、104 个 catalog rows、104 个 providers、104 个 smoke cases，并有 source audit。 | 在 interpreter/provider 边界稳定后，作为 stdlib/provider catalog 的种子。 | 104 个 node 不能整块 promotion；JS stdlib 语义不能反向驱动 core schema。 |
| Headless reactive node runtime | `2026-05-15-headless-reactive-node-runtime` | `review-after-foundation` | 已验证 retained-current property update、event merge/mux forwarding、derived operator recomputation；最终 counter 为 `8`，total 为 `21`。 | 作为 event-stream / retained-current-notification 后续 round 的种子。 | 只是小型同步 headless runtime；没有 subscription teardown、async stream policy 或正式 engine 架构。 |
| Structural UI component runtime | `2026-05-15-structural-ui-component-runtime` | `review-after-foundation` | 已验证 `html.raw` reactive text、`html.div` props/children/events、`component.fromArray/fromObject` child composition、`reactDom.reactApp` headless mount binding；输出 root `div`，更新后文本为 `updated`。 | 作为 structural UI/component execution profile、headless component tree fixture、ReactDOM provider contract review seed。 | 不包含真实 ReactDOM、hooks、DOM lifecycle 或 browser rendering；`class -> className` 只能作为 React provider 兼容证据，不能进入 core。 |
| Domain provider catalog | `2026-05-15-domain-provider-catalog` | `review-after-foundation` | 已验证 7 个 catalog entries：`cel.cel`、`pi-ai.provider/complete/stream`、`hono.app/route/get`；CEL 结果 `3`，pi-ai mock stream 4 个 events，Hono 生成 1 条 route。 | 作为 expression/domain catalog、provider dependency、stream output、server-route structural composition 的 review seed。 | CEL evaluator 和 pi-ai provider 都是 mock；Hono 没有真实 HTTP lifecycle。不要把 SDK 行为或 API key/provider 实现写进 core。 |

## 背景和已替代材料

| 方向 | Tasks | 分类 | 使用方式 |
| --- | --- | --- | --- |
| Stack 和 feature 早期探索 | `2026-05-13-basic-software-hdl-stacks` | `archive-only` | IR schema 稳定前探索。只保留为历史上下文；后续 schema-aligned summaries 和 coverage map 已经替代它用于 review/promotion。 |
| 早期 software runtime 探索 | `2026-05-13-latest-schema-software-runtime` | `archive-only` | IR schema 稳定前 runtime sketch。不要用于 promotion planning；优先看 S1-S5 和 software summary。 |
| 早期 projection stack goal | `2026-05-13-projection-stack-goal` | `archive-only` | IR schema 稳定前 projection/stack 探索。不要直接 promote，也不要作为当前 review 输入。 |
| Latest-schema engine replica | `2026-05-14-latest-schema-engine-replica` | `reference-only` | 已同步到当前 core fixture，用来比较旧 engine 复刻选择。验证行为优先看 S1-S5 和 stdlib replica。 |
| Round schema alignment | `2026-05-14-round-schema-alignment` | `reference-only` | 作为各 round schema alignment 清理的证据。 |

## 推荐 review 顺序

1. 先 review task 安全模型：
   - `ai/tasks/README.md`
   - 本文档 `material-index.md`
   - 代表性的 `promotion-checklist.md`
2. Review `2026-05-14-legacy-coverage-map`。
   它应该指导哪些内容先 promote、哪些仍然缺失。
3. Review basic software interpreter 纵向切片：
   - 从 `2026-05-14-basic-software-interpreter-summary/summary.json` 开始；
   - 先看 S1 和 S5，确认 invocation 与 diagnostics；
   - 再看 S2/S3/S4，作为 additive behavior。
4. Review basic HDL simulation 纵向切片：
   - 从 `2026-05-14-basic-hdl-sim-summary/summary.json` 开始；
   - 先看 H1/H4，确认正向 projector 和负向 rejection；
   - 再看 H2/H3/H5，确认 width、sequential 和 structural 扩展。
5. Review edit transaction MVP。
   这是独立 authoring 路线，但依赖稳定的 validation 和 fixture 约定。
6. Review type-system feature/tools。
   目标是收窄成正式 feature data 和正式 tool behavior。
7. 在 interpreter/provider 和 event/retained-current 边界明确后，再 review
   stdlib 和 headless reactive tasks。

## Promotion 策略

按最小可用单元 promotion：

- fixture 优先，如果它捕获了稳定行为；
- shared type 或 diagnostic shape 其次；
- tool/runtime function 必须等 fixture 和期望 diagnostics review 后再 promote；
- package README 和 verification scripts 最后补齐。

不要 promote：

- 整个 sandbox 目录；
- 生成的 `dist/` 或仿真 artifact；
- task-local schema subset 作为最终 schema；
- 旧代码启发出来的算法作为强制架构；
- JS runtime 行为进入 core schema；
- HDL 实现 metadata 进入 core schema。

## 近期 review tickets

| Ticket | 输入素材 | 期望正式输出 |
| --- | --- | --- |
| `review-software-interpreter-slice` | software S1-S5 summary 加 selected fixtures | 第一版正式 software interpreter package seed 和 smoke fixtures |
| `review-hdl-projector-slice` | HDL H1-H5 summary 加 generated Verilog examples | 第一版正式 Verilog projector seed 和 HDL fixture runner |
| `review-diagnostic-shape` | software S5、HDL H4、type-system negative fixture | shared diagnostic data shape 和 policy notes |
| `review-type-system-core` | algebraic type-system task | 收窄后的 type-system feature 和 checker package plan |
| `review-edit-transaction-mvp` | edit transaction MVP | edit transaction schema 草案和 replay validator plan |
| `review-stdlib-catalog-slice` | stdlib replica、legacy coverage map | 选定 stdlib catalog 切片，不是 104-node 整块 |
| `review-reactive-runtime-slice` | headless reactive runtime、legacy coverage `runtime.emit-subscribe` | retained-current notification / event-stream 后续计划 |
| `review-structural-ui-runtime-slice` | structural UI component runtime、legacy `react-dom/html/component` nodes | structural UI/component feature 或 provider contract 的最小切片 |
| `review-domain-provider-catalog-slice` | domain provider catalog、legacy `cel/pi-ai/hono` nodes | expression/provider/server-route catalog 的边界决策和 selected fixtures |
