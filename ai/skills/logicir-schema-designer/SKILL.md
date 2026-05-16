---
name: logicir-schema-designer
description: "用于设计、审查或实现 LogicIR 生态工作：core schema、architecture schema、feature extension、profile、stack、validator、tool、projector、runtime engine、execution provider、legacy migration 或 AI task promotion。"
---

# LogicIR Designer

这个 skill 用来让 LogicIR 的 schema、architecture、feature、tool、
projection 和 runtime 工作保持一致：尊重理论来源，保持 core 目标中立，
维护 package 边界，并把 AI task 输出视为待 review 素材。

## 必需工作流

1. 先建立项目上下文：
   - 如果仓库有 `dev/handoff.md`，先读它，确认当前状态和 review 入口。
   - 如果仓库有 `dev/shared-rules.md`，再读它，确认协作、sandbox、
     promotion 和验证规则。
   - 如果仓库有 `dev/operational-theory.md`，读它来理解 theory-to-engineering
     映射，包括 AI-assisted LogicIR editing 和 edit transactions。
   - 如果仓库有 `dev/schema-principles.md`，读它来确认 schema 与 projection
     边界。
   - 如果仓库有 `dev/logicir-architecture.md`，读它来确认 feature、
     profile、stack、provider 和 execution 术语。
   - 如果仓库有 `dev/roadmap.md`，在 roadmap round、`/goal`、promotion
     或 implementation planning 前读它。
   - 把 `packages/core`、`packages/architecture` 和 `packages/features/*`
     视为已接受 protocol 与 feature data shape 的 TypeScript authoring
     packages。
   - 把 `schema/` 视为语言无关的 specification surface。
   - 把 `packages/legacy/engine/src/` 视为旧 LogicIR JS/TS engine prototype
     和 reference，不视为 schema authority，也不视为唯一有效实现路线。
   - 把 `packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/`
     视为更早 FlowForge-era source-only evidence，不视为 schema authority。
   - 把 `ai/tasks/` 视为 autonomous AI sandbox material，直到人工 promotion。
2. 先分类当前任务：
   - Core schema change。
   - Architecture/profile/stack/capability schema change。
   - Feature/extension change。
   - Validator、tool、package 或 fixture change。
   - Projection/projector capability change。
   - Runtime implementation 或 compatibility change。
   - Legacy migration 或 source-evidence extraction。
   - Theory extraction 或 documentation change。
3. 保持 core 边界：
   - Core 只放跨 target 的 logical topology semantics。
   - Target/runtime/tool-specific detail 放进 namespaced feature 或 extension。
   - Profile、stack、capability、provider contract 和 execution binding
     definitions 属于 architecture schema，不属于 LogicIR core。
   - Tool、validator、projector、engine 和 provider 必须先声明 capability
     再使用。
4. 遵守 package 与 promotion 边界：
   - 已接受 TS/JS implementation 放在 `packages/`。
   - 语言无关 docs 和 generated protocol artifacts 放在 `schema/`。
   - Promoted examples 和 fixtures 放在 `examples/` 与 `fixtures/`。
   - 全自动工作在人工 review 前只写入一个 `ai/tasks/YYYY-MM-DD-<task>/`
     目录。
   - 新 autonomous task 优先从 `ai/templates/task/` 开始。
   - Sandbox isolation 是写隔离，不是读隔离。Task-local code 可以用相对路径
     read/import 仓库正式文件作为 read-only inputs，包括 JS/TS、Verilog HDL、
     Python、fixtures、docs 和 generated artifacts。Formal project files
     不能 import 或依赖 task-local code。
   - Autonomous task output 必须包含可运行验证证据。JS/TS task 应在 task
     根目录提供 `package.json` 和 task-local scripts，并运行相关 typecheck、
     build、test 或 smoke。Verilog HDL task 激活
     `E:\oss-cad-suite\environment.ps1` 后直接调用 `iverilog`。若某条路径
     声称支持但无法运行，必须记录 concrete blocker，不能称为 verified。
   - Roadmap round task 必须证明从 fixture 到最终 runtime、engine 或
     `iverilog` result 的端到端链路。只生成中间 schema、plan 或 artifact
     不能称为完成。
5. 检查 projection 和 execution target：
   - 始终评估 JS/TS runtime impact。
   - 始终评估 Verilog HDL impact。
   - 如果 target 无法保持 declared semantics，必须产生 diagnostic、
     profile rejection 或显式 lowering/projection pass，不能 silent
     degradation。
6. Design plan 必须包含：
   - 当前旧实现参考点。
   - Essay/theory mapping。
   - Core/feature/extension/profile/stack boundary。
   - Required、conditional-required、recommended 或 optional contract status。
   - Tool、projector、engine 和 provider capability changes。
   - JS/TS projection impact。
   - Verilog HDL projection impact。
   - Compatibility 和 migration strategy。
   - 对中长期 tooling/platform 计划，要判断 resource/effect declarations、
     no-GC/high-performance target constraints、catalog database、dependency
     index 或 AI tool-routing query 应属于 feature/profile/tooling 层，还是
     暴露了 core 缺失的 target-neutral topology relation。

## References

只加载当前任务需要的 reference：

- `references/core-theory.md`: LU/LUI、X/Y/Z、Closure、LogicIR representation
  obligations。
- `references/schema-protocol.md`: core/architecture/feature/extension/profile/
  stack、versioning、compatibility、capability rules。
- `references/projection-targets.md`: JS/TS runtime 与 Verilog HDL projection
  constraints。

## 不可违反规则

- 不能让旧 TS/JS 实现决定新 schema semantics。
- 不能把旧实现 algorithm 提升成 mandatory schema 或 engine law。Legacy code
  是 evidence 和 design input；只要 profile、lowering trace、diagnostics
  和 verification 能证明语义保持，新 projector 和 engine 可以使用不同算法。
- 不能把 Promise/Thenable、subscription machinery、state store handles、
  lifecycle hooks 等 JS runtime artifacts 放进 core schema。
- 不能把 HDL-specific clock/reset 或 module elaboration details 放进 core
  schema，除非它们表达 target-neutral logical topology。
- 不能把旧代码里的 `Composable` 当成理论绑定；设计新 schema 时优先使用 essay
  术语 `Structural`。
- 不能让 requirement fulfillment 退化成普通 data flow、parameter passing、
  naming lookup、callback 或 ambient context。
- Projector 不能忽略 selected profile 中 unsupported required 或
  conditional-required feature/extension contracts。
- 不能把 `LUCore.luis` 当成 eager flat node list。Runtime engine、projector、
  compiler 和 execution plan 必须按 `LUCore.kindOrganization.kind` 分派，并
  声明 realization strategy。当前 basic baseline 对 combinational 使用
  `ports.result` lazy pull，对 sequential 使用 pipeline/step-list execution，
  对 stateful 使用 durable retained-current/current state realization，对
  structural 使用 composition-function/elaboration-result realization。这个
  baseline 不是唯一有效算法。任何 flattening、lowering 或替代 execution model
  都必须显式、profile-supported、diagnostic-friendly，并证明 semantic
  preservation。
- 当前 v0 core draft 保持 thin：`kindOrganization` 只存 target-neutral
  organization skeleton，kind-specific metadata 放在 owner-level extensions，
  例如 `LUCore.extensions`。
- `LogicUnit.features` 是 LU-local feature manifest；extension record 使用
  local `featureKey` alias，而不是直接引用 feature namespace/key。
- Architecture schema 保持 pure data：不能有 factory、callback、provider
  implementation、runtime function，也不能用 TypeScript 泛型或 utility type
  作为 schema abstraction。Schema shape 应显式写成 object、union、
  intersection、array 和 index-signature types。
- Profile 是 single-layer compatibility contract；stack 是 user-facing
  profile composition。
- Explicit resource management、side-effect discipline、no-GC memory strategy、
  catalog database、dependency index 和 AI tool-routing index 默认属于
  feature/profile/tooling concerns，除非它们暴露了缺失的 target-neutral
  topology relation。
- 未经人工 review 和 narrowing，不能把 AI sandbox output promotion 到
  `packages/`、`schema/`、`examples/` 或 `fixtures/`。

## 当前旧原型阅读启发

阅读 `packages/legacy/engine/src/types/models.ts`、
`packages/legacy/engine/src/projection.ts` 或
`packages/legacy/engine/src/types/runtime.ts` 时：

- 把 `PortKind.Pull` 和 `PortKind.Push` 读作旧 boundary/contact evidence；
  unit-level X-axis drive 仍要和 port-level contact capability 分开。
- 把 `Property` 读作 retained-current contact evidence；它的 store/cache/
  subscription mechanics 只是 software runtime feature evidence。
- 把 `Thenable`、`subscribe`、`StateStore` 和 lifecycle ids 读作 software
  runtime feature evidence。
- 把旧 `readLUOutput` 和 `readTargetPort` 读作从 demanded result contacts
  做 combinational lazy pull 的一种实现路线；它不是唯一 runtime algorithm，
  也不是 eager execution 的证据。
- 把 `manifestSteps` 读作 sequential pipeline / step-list execution 的一种
  实现路线。`GoBackIf` 和 `ReturnIf` 是 explicit control extension evidence；
  不要从中推导 core 需要 general branch graph。
- 把 `initializeState` 读作 durable state/current realization 的一种实现路线；
  不要把它当成 mandatory state-store architecture，也不要把 stateful 读成
  dependency-graph execution。
- 把 `projectCompositions` 和 `transformComposable` 读作 composable/structural
  LUI 生成 composable return values 或 functions，再和 context/component
  inputs 结合的一种实现路线。
- 把 `SequentialStep` 读作旧 sequential organization evidence，其中
  `isAwaited` 是 JS async projection detail。
- 把 `dependencies`、`Provider`、`SovereignSource`、`AbstractLUT` 和 `closures`
  读作旧 Z-axis approximation。
- 把 `Composable` 和 composition maps 读作旧 structural/feature evidence，
  不是最终理论词汇，也不是普通 provider invocation。
- `packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 只作为
  runtime behavior、editing operations、lowering、旧 node/LUI catalog
  coverage 和 provider/function examples 的历史证据。
