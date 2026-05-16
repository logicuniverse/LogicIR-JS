# 新会话交接

这份文档是给新的 AI 会话或新协作者的快速入口。目标是让一句“阅读现有项目”之后，后续工作不依赖聊天上下文。

## 必读顺序

1. [`README.md`](../README.md): 仓库结构和正式 package 边界。
2. [`dev/shared-rules.md`](shared-rules.md): 人 + AI 协作、sandbox 和验证底线规则。
3. [`dev/process.md`](process.md): 开发节奏、AI task、roadmap round、审阅和晋升操作规程。
4. [`dev/operational-theory.md`](operational-theory.md): LogicIR 理论到工程实现的执行版，包含 AI 协同编辑和 edit transaction 前景。
5. [`dev/schema-principles.md`](schema-principles.md): core、feature、extension、profile、projection 和 target-neutral 约束。
6. [`dev/logicir-architecture.md`](logicir-architecture.md): LogicIR document、architecture definition、profile、stack、provider 和 execution 术语。
7. [`dev/feature-catalog.md`](feature-catalog.md): 已确认和近期需要沉淀的 feature 方向。
8. [`dev/roadmap.md`](roadmap.md): 当前确定推进的路线图、优先 stack、AI task round 和进度。
9. [`dev/long-term-vision.md`](long-term-vision.md): 不确定的中长期愿景、研究分支和 pressure tests。
10. 只在需要晋升或复盘时读取 [`ai/tasks/`](../ai/tasks/) 中的具体 task；不要把 task 输出当作正式实现。

## 当前正式状态

当前已接受的 TS/JS authoring source 在 `packages/`：

- [`packages/core`](../packages/core): LogicIR core protocol 数据结构。
- [`packages/architecture`](../packages/architecture): feature、profile、stack、capability、provider contract、stage、policy 和 execution binding 数据结构。
- [`packages/features/type-system`](../packages/features/type-system): type-system feature 数据结构。
- [`packages/tools/type-system`](../packages/tools/type-system): type-system 工具种子。
- [`packages/legacy/engine`](../packages/legacy/engine): 旧 LogicIR JS/TS engine package，作为迁移和实现证据。

`packages/legacy/flow-runtime-core` 和 `packages/legacy/flow-core` 是 source-only 历史快照，不是 active workspace package，也不是 schema 权威。

语言无关的 specification surface 在 [`schema/`](../schema/)。当前 `schema/` 主要是 route 和 curated notes；主要 authoring source 仍在 `packages/`。

当前 core 规则里，**Core Scope（核心作用域）** 表示一份 `LUCore` 的局部规则上下文：它既可以是 root `LogicUnit.core`，也可以是任意 `Closure.core`。Endpoint、connection、kind organization、structural composition 和 validator 规则都在当前 Core Scope 内通用。`EndpointRef.owner.kind === "boundary"` 表示当前 Core Scope 的自身边界；`LUITarget.kind === "lu"` 才表示 LUI 指向某个 LogicUnit 目标。

## 当前方向

近期优先目标是两个 stack：

- `basic-software-interpreter`: `LogicIR -> interpreter execution plan -> software engine run`。这是最高优先级。
- `basic-hdl-sim`: `LogicIR -> Verilog HDL -> iverilog simulation`。这是第二优先级，用来约束 core 不吸收 JS runtime 假设。

`basic-software-generated` 和 `basic-hdl-build` 已知但暂缓；其它更远方向放在
[`dev/long-term-vision.md`](long-term-vision.md)。

不确定中长期 pressure-test 方向已经记录在
[`dev/long-term-vision.md`](long-term-vision.md)，包括：

- 显式资源和副作用管理。
- No-GC / embedded / high-performance runtime memory model。
- Catalog database、dependency index 和 AI tool-routing query。
- Zero-to-LogicIR / edit transaction corpus，作为独立 research / dataset
  分支，不是 LogicIR 的终极目标。

这些方向目前都不驱动 core schema 变更，也不进入当前 roadmap 承诺。它们应先作为
feature/profile/tooling 或 AI task 研究路线，等 validator、profile resolver、
capability checker、software interpreter seed 和 HDL sim seed 稳定后再决定是否推进。

## 已有 AI Task 证据

`ai/tasks/` 是全自动或半自动 AI 任务 sandbox。它们是审阅素材，不是正式项目结果。

重点审阅入口：

- [`ai/tasks/2026-05-14-basic-software-interpreter-summary/summary-report.md`](../ai/tasks/2026-05-14-basic-software-interpreter-summary/summary-report.md): S1-S5 software interpreter route 综述。
- [`ai/tasks/2026-05-14-basic-hdl-sim-summary/summary-report.md`](../ai/tasks/2026-05-14-basic-hdl-sim-summary/summary-report.md): H1-H5 HDL sim route 综述。
- [`ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md`](../ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md): legacy 能力覆盖和缺口。
- [`ai/tasks/2026-05-15-stdlib-nodes-replica/docs/coverage-report.md`](../ai/tasks/2026-05-15-stdlib-nodes-replica/docs/coverage-report.md): legacy stdlib node 复刻证据。

重要判断：

- S1-S5 证明 software interpreter 路线可行，但还不是一个正式集成 interpreter。
- H1-H5 证明 Verilog HDL simulation 路线可行，但还不是一个正式 Verilog projector。
- legacy coverage map 证明旧代码还有事件流、多 LUI plan、provider resolution、sequential/control-flow、structural composition、edit model、node catalog 等后续工作。
- task-local schema/type subset 不能晋升为正式 schema；正式实现应 import `packages/core` 和 `packages/architecture` 的 accepted types。

## AI 协同编辑原则

LogicIR 的长期价值不是让 AI 直接写更多目标代码，而是让 AI 在受约束的语义结构中提交小步、原子、可验证的 LogicIR edit transaction。完整理论和设计约束见 [`operational-theory.md`](operational-theory.md) 的“人 + AI 协同编辑前景”和 [`logicir-architecture.md`](logicir-architecture.md) 的相关接口说明。

## 工作规则

详细规则以 [`shared-rules.md`](shared-rules.md)、[`process.md`](process.md)、
[`../ai/README.md`](../ai/README.md) 和
[`../ai/tasks/README.md`](../ai/tasks/README.md) 为准。快速摘要：

- 正式项目文件在 `packages/`、`schema/`、`docs/`、`dev/`、`examples/`、`fixtures/`。
- `/goal`、roadmap round、并行 agent 或大规模自动生成工作默认写入一个新的 `ai/tasks/YYYY-MM-DD-<task>/` 子目录；不确定或临时探索写入 `ai/scratch/`。
- task 产物必须经人工审阅后，最小化晋升到正式目录；不要整包复制 task。
- JS/TS task 要有 task-root `package.json` 和验证脚本；HDL task 要激活 `E:\oss-cad-suite\environment.ps1` 并直接运行 `iverilog`。

## 下一步建议

当前最自然的审阅顺序：

1. 审阅 `basic-software-interpreter` S1-S5 summary。写晋升计划前必须同时读取该 task 的 `summary-report.md`、`promotion-checklist.md` 和 legacy coverage map，再决定第一个正式 `packages/engines/software` 或 `packages/projectors/interpreter-plan` seed。
2. 审阅 `basic-hdl-sim` H1-H5 summary。写晋升计划前必须同时读取该 task 的 `summary-report.md`、`promotion-checklist.md`，并对照 legacy coverage / roadmap 缺口，再决定第一个正式 `packages/projectors/verilog` seed。
3. 审阅 legacy coverage map，把 S6+、H6+、edit transaction MVP 和 node catalog seed 放进 roadmap 或具体 plan；不要只凭 summary 判断 legacy 覆盖已完整。
4. 做任何正式晋升前，先写或更新 `dev/plans/` 中的聚焦计划，并在计划里列出使用过的 summary、promotion checklist、coverage report 和 verification evidence。
