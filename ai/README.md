# AI 工作区

这个目录保存仓库内的人+AI 协作材料，尤其是尚未 promotion 的 AI 全自动任务输出。

## 语言约定

`ai/` 和 `dev/` 下的项目协作文档默认使用中文。正式源码、package、schema、面向用户的 `docs/`、examples、fixtures 等目录继续使用英文，除非目标读者明确需要中文。

## 目录

- [`scratch/`](scratch/): 临时 AI 探索区，用于不可 review、失败尝试、临时笔记或未完成自动化输出。
- [`tasks/`](tasks/): AI 全自动任务的写隔离 sandbox。
- [`templates/`](templates/): AI task 目录和 promotion review 材料模板。
- [`skills/`](skills/): 仓库本地可复用 Codex skills 源目录。

不要把已接受的项目源码放在这里。正式项目内容经过人工确认后，应进入
`packages/`、`schema/`、`docs/`、`dev/`、`examples/`、`fixtures/` 或其它正式目录。

AI task 输出可能包含有价值的代码、数据、笔记、测试或报告，但它在人工 review 和 promotion 前都只是素材。Promotion 时只移动最小、明确、已验证的部分。

## 文档读者边界

`ai/` 下的文档主要给 AI agent 和自动化 review 使用，可以比 `dev/` 更详尽。
这里适合保存结构化证据、source map、长 checklist、失败尝试、coverage report、
verification log、promotion checklist 和 material index。

`dev/` 下的文档主要给人类协作者使用，应保持短、稳定、决策导向。AI 文档中的长
过程和证据不要直接搬进 `dev/`；需要进入 `dev/` 时，只提炼成人类需要判断和记住的
原则、边界、路线或结论。

## 默认路由

- `/goal`、roadmap round、parallel-agent work 或其它明确可 review 的自动化任务，进入 `tasks/`。
- 不确定、探索性、可丢弃、需求不完整的工作，进入 `scratch/`。
- 如果 agent 不确定应该进入 `tasks/` 还是 `scratch/`，必须选择 `scratch/`。

Sandbox isolation 是写隔离，不是读隔离。Task-local 代码可以用相对路径读取或导入正式仓库文件作为只读输入，包括 JS/TS、Verilog HDL、Python、fixtures、docs 和生成 artifact。正式项目文件不能 import 或依赖 task-local 代码。

AI 全自动 task 必须提供可运行验证证据。JS/TS task 应该在 task 根目录提供 `package.json` 和 task-local scripts，并运行相关 typecheck、build、test 或 smoke。Verilog HDL task 应使用 `E:\oss-cad-suite`，激活 `E:\oss-cad-suite\environment.ps1` 后直接运行 `iverilog`。如果 task 声称同时支持 JS/TS 和 HDL，就必须验证两条路径，或者记录未验证路径的具体 blocker。

AI task 完成时必须同步 [`tasks/material-index.md`](tasks/material-index.md)。
这个索引是 task 素材总目录和后续 review 队列。任何 task 标记为
`ready-for-review` 前，都必须已经更新自己的 `verification.md`、
`promotion-checklist.md`，并把分类、证据、风险和后续 review ticket 写入
`material-index.md`。

## 最小 Round 规则

每个 AI task round 只保留当前端到端业务路径实际使用的数据结构、schema 片段、profile 字段、stack 字段、feature contract、runtime plan 字段和 helper。

不要因为后续 round 可能需要，就提前声明未来 feature、stage、provider contract、diagnostic、capability、execution plan 字段或 validation output。等后续 round 的 fixture、projector、engine、compiler、simulator 或 smoke path 真正使用时再加入。

如果正式 schema 要求某些空字段，例如 `featureContracts: []`、`stages: []` 或 `providerContracts: []`，task 可以保留这些字段，但必须说明这是 schema-shape constraint，不是业务预留。
