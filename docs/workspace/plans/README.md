# Plans

这个目录保存设计计划。计划的目标是让实现者不需要重新判断方向，就能按照已确认的意图推进代码或文档变更。

## 何时新增计划

- LogicIR schema 或公开类型需要调整。
- 投影器、运行时、hook、依赖履约或 Closure 语义需要改变。
- 需要把 [../../essay.md](../../essay.md) 中的理论概念同步到代码。
- 需要判断旧 TS/JS 实现与新 schema 的关系。
- 变更影响兼容性、迁移路径或测试策略。

## 计划内容

每份计划应尽量包含：

- 目标和成功标准。
- 当前状态和问题背景。
- 当前旧实现参考点，说明旧 TS/JS 代码提供了哪些参考、哪些不能沿用。
- 理论映射，明确关联 LU/LUI、X/Y、Z、Closure、Requirement/Fulfillment 或 Projection/Runtime 分离。
- 实现范围，说明要改哪些子系统，不只列文件名。
- 公开类型、API、数据形状或行为语义的变化。
- Core schema、feature/extension 或应用层 feature bundle 的边界变化。
- required/optional feature/extension contract 判断，以及命名空间。
- Projector capability set 的新增或变更。
- JS/TS runtime projection impact。
- Verilog HDL projection impact。
- 暂不支持某个 projection target 时的明确原因。
- 兼容策略，说明是否 additive、是否需要 major version、migration 或 compat layer。
- 测试和验收方式。
- 风险、兼容约束和未决问题。

Schema 计划还必须遵守 [../schema-principles.md](../schema-principles.md)。

## 命名建议

使用小写英文和日期前缀，例如：

```text
2026-05-11-v2-schema-alignment.md
2026-05-11-z-fulfillment-model.md
```
