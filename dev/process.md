# 开发流程

这份文档说明 LogicIR 项目“怎么推进”。它是写入协议和操作规程，不是路线图，也不是 schema 权威。

职责边界：

- 当前要做什么、优先级和阶段进度见 [roadmap.md](roadmap.md)。
- 理论原则见 [operational-theory.md](operational-theory.md)。
- Schema 和 projection 约束见 [schema-principles.md](schema-principles.md)。
- Feature 方向见 [feature-catalog.md](feature-catalog.md)。
- AI task 目录格式见 [`../ai/tasks/README.md`](../ai/tasks/README.md)。
- 人 + AI 共同底线规则见 [shared-rules.md](shared-rules.md)。

## 开发节奏

- 每一轮都必须端到端打通，而不是先堆完整 feature catalog、profile 或 engine。
- 每一轮只增加少量语义，保持可审阅、可晋升。
- 每一轮至少包含：LogicIR fixture、最小 profile/stack 声明、validator/resolver
  检查、projection 或 execution plan、runtime/`iverilog` 验证、diagnostic 记录。
- 每一轮必须声明本轮支持的 LU kind、每种 kind 的处理入口、明确拒绝的 kind，
  以及 unsupported 时的 diagnostic。
- 不能把 `LUCore.luis` 默认拍平成 eager node list；只有 profile 明确声明
  flatten/lowering 并保留语义时，才可以生成平面 execution plan。
- 不为下一轮提前实现复杂抽象。下一轮开始前再根据上一轮验证结果决定是否扩展。

## AI Task 流程

适合 `/goal`、roadmap round、parallel-agent work 或其它明确可审阅的自动化
任务，应进入 `ai/tasks/YYYY-MM-DD-<task>/`。

每个 AI task 必须：

- 独立写入一个 task 子目录。
- 从 [`../ai/templates/task/`](../ai/templates/task/) 开始，除非已有明确理由。
- 记录 `README.md`、`source-map.md`、`design-notes.md`、`verification.md` 和
  `promotion-checklist.md`。
- 如果包含 JS/TS 可运行代码，在 task 根目录提供 `package.json` 和 task-local
  verification scripts。
- 如果包含 Verilog HDL，激活 `E:\oss-cad-suite\environment.ps1` 后直接运行
  `iverilog`。
- 通过相对路径读取正式仓库文件时，把这些文件记录为只读 source evidence。
- 完成时同步 [`../ai/tasks/material-index.md`](../ai/tasks/material-index.md)。

AI task 不得：

- 写入其它 task 目录。
- 写入 `packages/`、`schema/`、`docs/`、`examples/`、`fixtures/` 或其它正式
  项目目录，除非人类明确要求做 task 之外的已审阅文档更新。
- 让正式 workspace package import task-local code。
- 把 task-local schema subset 或 runtime shape 当作 accepted schema。

## Roadmap Round 验收

Roadmap round 类 task 必须证明端到端链路。不能只生成中间 schema、plan 或
artifact；必须从 fixture 跑到 runtime、engine、projector result、`iverilog`
simulation 或其它最终验证点。

最低验收记录：

- 输入 fixture。
- 使用的 profile/stack 或 task-local equivalent。
- validator/resolver/capability check 结果，或当前 round 不包含这些工具的说明。
- 生成的 projection、execution plan 或 artifact。
- runtime/engine/simulator 命令。
- 最终观测结果。
- unsupported path 的 structured diagnostic。
- 未验证路径的 concrete blocker。

## 最小 Round 规则

每个 round 只保留当前端到端业务路径实际使用的数据结构、schema 片段、profile
字段、stack 字段、feature contract、runtime plan 字段和 helper。

不要因为后续 round 可能需要，就提前声明 future feature catalog、stage、provider
contract、diagnostic、capability、execution plan field、validator 或 runtime
abstraction。

如果正式 schema 类型要求空字段，例如 `featureContracts: []`、`stages: []` 或
`providerContracts: []`，task 可以保留这些字段，但必须说明这是 schema-shape
constraint，不是业务预留。

## 审阅和晋升

AI task output 是素材，不是项目结果。人工晋升时：

- 只迁移经过审阅的最小成果。
- 重新放入正确正式目录，例如 `packages/`、`schema/`、`examples/`、`fixtures/`
  或 `dev/`。
- 重新满足正式目录的 package、schema、documentation、fixture 和 verification
  规则。
- 不整包复制 task。
- 不晋升 task-local generated reports、exploratory logs、宽泛 README
  material 或整个 sandbox directory，除非它们被明确审阅为正式 artifact。

晋升前至少检查：

- `verification.md` 是否记录最终命令和结果。
- `promotion-checklist.md` 是否列出可 promotion / 不可 promotion 内容。
- `material-index.md` 是否同步分类、证据、风险和 review ticket。
- task-local 构建产物是否已清理，或明确作为 review artifact 保留。
- promoted piece 是否能在正式 project context 中重新验证。

## 计划先于实现

重大 schema、API、运行时语义、投影语义调整必须先写入
[plans/](plans/) 中的聚焦计划。计划应说明：

- 目标和成功标准。
- 理论映射。
- 当前旧实现参考点。
- Core / feature / extension / profile / stack 边界。
- Tool、projector、engine、provider capability 变化。
- JS/TS runtime impact。
- Verilog HDL impact。
- 兼容策略和 migration 风险。
- 测试和验收方式。

小型文档修正或明显局部修复可以直接执行，但最终说明仍要清楚。
