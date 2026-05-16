# Task README 模板

把这个模板作为单个 AI 全自动 task 目录的根 `README.md`：

```text
ai/tasks/YYYY-MM-DD-<task>/
```

## 目标

用一两句话说明这个 task 要完成的具体目标。

## Round 目标

如果这个 task 是 `dev/roadmap.md` 中的端到端 round，填写本节：

- Stack:
- Round:
- 端到端链路（End-to-end chain）:
- 必需 fixture:
- 必需验证命令:
- 预期可 promotion 输出:

## 范围

范围内（In scope）:

- 列出本 task 探索的 feature、tool、validator、runtime、projector、
  fixture 或文档范围。
- 只保留当前端到端路径实际消费的结构和字段。

范围外（Out of scope）:

- 列出本 task 不得修改的正式项目目录或语义边界。
- 列出明确推迟到后续 round 的 future feature、stage、provider contract、
  diagnostic、plan field 或 abstraction。

## 状态

- `in-progress`: 正在处理，尚未 ready for review。
- `ready-for-review`: task output 已经足够进入人工 review；必要的 JS/TS
  和/或 Verilog HDL 验证路径已经运行，或者已记录 concrete blocker；
  `verification.md`、`promotion-checklist.md` 和 `../material-index.md`
  都已同步。
- `promoted`: 选定部分已 review 并移入正式目录。
- `archived`: 保留为证据，但不应驱动当前工作。

当前状态: `in-progress`

## 阅读顺序

推荐阅读顺序：

1. `source-map.md`
2. `design-notes.md`
3. implementation 或 draft 目录
4. `verification.md`
5. `promotion-checklist.md`

## 目录说明

- `source-map.md`: 使用过的 source files、docs 和 legacy evidence。
- `design-notes.md`: 设计决策、边界、替代方案和风险。
- `package.json`: task 包含可运行 JS/TS 代码时必须提供；task-local
  verification scripts 放在这里。
- `implementation/`: 代码实验、prototype 或 draft package shape。
- `fixtures/`: task-local fixtures。
- `docs/`: task-local 文档草稿。
- `reports/`: 生成报告、diagnostics 或日志。
- `verification.md`: 运行过的命令、结果和已知缺口。
- `promotion-checklist.md`: 人工 review 后可移动到正式目录的最小片段。

## 写入边界

这个 task 可以读取仓库内容，但只能写入当前 task 目录。正式 package 不得
import 这个 task 的输出。

`packages/`、`schema/`、`docs/`、`dev/`、`examples/`、`fixtures/`
等正式项目目录只能作为只读输入引用。需要进入这些目录的改动必须写入
`promotion-checklist.md`，并且只在人工 review 后执行。

Task-local 代码和 fixture 可以通过相对路径读取或导入仓库外部文件作为只读
输入，包括 JS/TS、Verilog HDL、Python、generated artifact、fixture 和
docs。方向只能是单向的：sandbox 可以引用正式项目文件，正式项目文件不能
import 或依赖 sandbox 代码。

如果 task 包含可运行 JS/TS 代码，task 根目录应包含自己的 `package.json`，
并提供 `typecheck`、`test`、`build` 或 `smoke` 等 scripts。Task 可以把
正式 workspace package 当作只读依赖，但验证应能从 task sandbox 内运行，
不要求正式 package import task-local 代码。

## 最小 Round 规则

这个 task 必须保持最小化。不要预声明 future feature contract、stage、
provider contract、diagnostic、capability catalog、execution plan field、
validator 或 runtime abstraction，除非当前 task 的 fixture-to-verification
路径已经实际消费它们。

如果当前正式 schema 要求某个空字段，保留它时必须在 `design-notes.md`
中说明这是 schema-shape constraint，不是业务预留。

## 完成规则

切换到 `ready-for-review` 前，必须更新：

- `verification.md`: 最终命令和输出。
- `promotion-checklist.md`: 可 promotion、不可 promotion 的内容，以及
  promotion 后需要运行的检查。
- `../material-index.md`: 当前 task 的分类、证据、风险和新增 review ticket。

同时清理 task-local 构建产物，例如 `dist/`、`.cache/`、`coverage/`、
`.vvp`、`.vcd` 和临时日志；除非它们被明确作为 review artifact 保留。
