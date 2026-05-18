# AI Tasks

这个目录是 AI 全自动任务的可 review sandbox 区。

查看已有 sandbox 输出和推荐 review 顺序，先读 [`material-index.md`](material-index.md)。

这里用于 `/goal`、roadmap round、parallel agents，或其它明确要求“AI 自动完成、之后人工 review”的任务。Sandbox 输出是探索和 review 素材，不是已接受项目结果。

AI task 不用于实质性制定 LogicIR core IR、feature、extension、profile 或 stack
语义。这些高自由度设计必须由人工先在正式文档或 package 上下文中确认原则和边界。
所有 IR / feature / extension 数据结构都以人类为主要编写者和决策者；AI 可以在
对话中辅助分析和局部编辑，但不能通过 autonomous task 自动完成制定。
AI task 适合在规则明确后做低自由度工作，例如生成 examples/fixtures、wrapper、
mechanical migration、coverage map、negative cases、验证脚本或受限实现切片。
AI task 也可以探索基于固定 schema / feature contract 的独立工具，例如
validator、type system、lint/checker、fixture generator、diagnostic reporter 或
projection helper；这类 task 的自由度在工具算法和验证方式，不在 IR / feature /
extension 语义。

临时 spike、失败尝试、短期笔记或尚未准备好成为 review evidence 的内容，应进入 [`../scratch/`](../scratch/)。

## 默认路由

- `/goal`、roadmap round、parallel-agent work 或其它明确可 review 的自动化任务，进入 `ai/tasks/`。
- 不确定、探索性、可丢弃、需求不完整的工作，进入 `ai/scratch/`。
- 如果 agent 不确定，必须选择 `ai/scratch/`。

部分已有 task 目录包含从旧开发文档位置迁移来的早期 exploration pack。它们仍按 AI task material 处理，直到人工 promotion。归档 task 中的旧路径可以作为历史证据保留，但不要当作当前项目路径。

## 解释规则

AI task 输出是证据，不是权威。Task 使用的 legacy code 是设计输入和兼容性证据，不是 schema 真理，也不是唯一有效实现路线。

Task-local runtime、projector、compiler、HDL、catalog 或 validation behavior 应理解为该 task scope 内的 verified baseline。后续正式实现可以使用不同算法、数据布局、执行模型或 lowering strategy，只要 profile、feature contract、lowering trace、diagnostics 和 verification 能证明相关 LogicIR 语义被保留。

如果 task 内部为了跑通 smoke 临时引入了 schema subset、feature-like field、
extension-like payload、runtime plan 或 provider contract，它们默认只是 task-local
mechanism，不是设计提案，更不是 accepted protocol。需要进入正式设计时，必须先回到
`dev/` / `packages/` 的人工 review 流程。

特别是 2026-05-14 / 2026-05-15 的 software 和 HDL tasks 中出现的 lazy pull、pipeline、independent state realization、composition function、Verilog structural payload、legacy stdlib replica 等术语，只描述 task baseline。除非有正式 promotion 文档说明，否则不能把它们读成最终 core schema、最终 feature schema 或强制 engine/projector 架构。

## 最小 Round 规则

每个 task 必须保持当前 round 最小化。只保留当前端到端路径实际消费的数据结构、schema 片段、profile 字段、stack 字段、feature contract、runtime plan 字段和 helper。

不要在早期 round 中加入未来 feature catalog、stage、provider contract、diagnostic、capability、plan field、validator 或 runtime abstraction，除非该 round 的 fixture、projector、engine、compiler、simulator 或 smoke check 已经实际使用。

如果正式 schema 类型要求空字段，例如 `featureContracts: []`、`stages: []` 或 `providerContracts: []`，task 可以保留字段，但必须说明这是 schema-shape requirement，不是未来业务 contract 预留。

## 写边界

每个全自动 task 必须创建并只写入一个子目录：

```text
ai/tasks/YYYY-MM-DD-<task>/
```

新 task 应从 [`../templates/task/`](../templates/task/) 开始，把模板内容复制到新 task 目录后再填充。

在该 task 中，agent 可以：

- 读取任何必要的仓库文件；
- 只写入自己被分配的 `ai/tasks/YYYY-MM-DD-<task>/` 目录；
- 运行不会修改正式项目文件的本地验证命令。

在该 task 中，agent 不得：

- 写入其它 task 目录；
- 写入 `packages/`、`schema/`、`docs/`、`examples/`、`fixtures/` 或其它正式项目目录；
- 写入 `dev/`，除非人类明确要求做 task 之外的已 review 文档更新；
- 从正式 workspace package import task 输出；
- 把 task 文件当作 schema 权威或 accepted implementation。
- 自行决定新的 IR / feature / extension / profile 语义；遇到这类问题应写成
  open question 或 review blocker。

## 推荐内容

新 task 应尽量从 [`../templates/task/`](../templates/task/) 开始，并包含：

- `README.md`: 目标、scope、status 和阅读方式。
- `source-map.md`: 使用过的现有代码、文档和 legacy 证据。
- `design-notes.md`: 理论映射、边界、替代方案、风险和 open questions。
- `verification.md`: 运行过的命令、结果和已知缺口。
- `promotion-checklist.md`: 人工 review 后可以移入正式目录的最小 piece。

如果 task 包含可运行代码、fixtures 或报告，可以使用模板中的
`implementation/`、`fixtures/`、`docs/`、`reports/` 目录，也可以沿用已有任务常见
的 `src/`、`generated/`、`docs/` 等 task-local 结构。关键要求是：目录含义清楚，
`README.md` 说明阅读顺序，`source-map.md` 区分只读输入和 task 输出。

每个 task 完成时还必须同步更新 [`material-index.md`](material-index.md)。
`material-index.md` 是 `ai/tasks/` 的总目录和 review 队列，不是可选总结。
如果某个 task 只是失败探索，也要在索引中归为 `reference-only` 或
`archive-only`，或者明确说明为什么不进入 review 素材。

Task 只有在下面四件事都完成后，才能标记为 `ready-for-review`：

- 已运行必要验证，并把命令、结果或 concrete blocker 写入 `verification.md`。
- 已更新 `promotion-checklist.md`，列出可 promotion 和不可 promotion 的内容。
- 已同步 [`material-index.md`](material-index.md)，加入分类、证据、风险和后续 review ticket。
- 已清理 task-local 构建产物，例如 `dist/`、`.cache/`、`coverage/` 或仿真临时文件。

推荐 status values：

- `in-progress`: 正在处理，尚未 ready for review。
- `ready-for-review`: 已有验证证据，可以开始人工 review。
- `promoted`: 选定部分已 review 并移入正式目录。
- `archived`: 保留为证据，但不应驱动当前工作。

## Promotion

任何 task 输出成为正式项目内容前，都必须人工 review。Promotion 只移动最小、已 review 的 piece 到正确正式位置。不要把整个 task 目录复制进项目。

Promotion 后，对应正式内容必须满足其正式位置的 package、schema、documentation、fixture 和 verification 规则。
