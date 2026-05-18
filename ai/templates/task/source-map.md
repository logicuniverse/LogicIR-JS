# Source Map 模板

记录本 AI 自动 task 使用过的 source。

## 当前项目 Sources

- `packages/core/src/`: 当前 LogicIR core 的 TS authoring source。
- `packages/architecture/src/`: 当前 architecture/profile/stack/provider 的
  TS authoring source。
- `packages/features/*/src/`: 已接受的 feature schema sources。
- `schema/`: language-neutral generated 或 curated specification surface；
  不是主要 TS authoring source。
- `docs/`: 面向读者的 theory 和用户文档。
- `dev/theory/operational-theory.md`: 工程化理论摘录。
- `dev/theory/schema-principles.md`: schema 和 projection 纪律。

## Legacy Evidence

- `packages/legacy/engine/src/`: 旧 LogicIR JS/TS engine 证据。
- `packages/legacy/flow-runtime-core/`: 更早 runtime 证据。
- `packages/legacy/flow-core/`: 更早 editor-core、lowering、node/LUI
  catalog 和 node function 证据。

## Task-Specific Sources

列出精确文件路径，以及每个文件为什么被使用：

| Source | 使用原因 |
| --- | --- |
|  |  |

Task-local 代码可以通过相对路径把这些 source 作为只读输入引用，包括 JS/TS
imports、Verilog HDL include/file arguments、Python imports、fixture paths
或 generated-artifact inputs。所有外部 source 路径都应记录在这里，方便
review 时区分只读证据和可 promotion 的 task output。

## Source 优先级说明

- Theory 和已接受 schema docs 优先于 legacy code。
- 当前 packages 优先于 exploration drafts。
- `schema/` route files 和 generated/curated artifacts 在 promotion 前应与
  对应 package source 对齐。
- Legacy code 是 evidence，不是 schema authority。
- 当前 task 的输出在人工 promotion 前都只是 sandbox material。
