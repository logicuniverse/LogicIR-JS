# Promotion Checklist 模板

任何 task output 成为正式项目内容前，都必须人工 review。

## Review 摘要

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Roadmap round:
- 已 review 端到端验证: yes / no

## 可 Promotion 片段

只把最小、已 review 的片段移动到正式项目目录。

| Sandbox path | 预期正式路径 | Status | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## 必需正式更新

- Package exports:
- Schema docs:
- Dev docs or plans:
- 已同步 `ai/tasks/material-index.md`，包含分类、证据、风险和 review ticket:
- Fixtures:
- Examples:
- Tests:
- README/docs:
- Migration notes:

## Promotion 后必需验证

- `yarn build`
- `yarn test`
- JS/TS smoke 或 fixture command；当 promoted piece 影响 software runtime、
  tools、projectors、compilers、examples 或 fixtures 时填写：
- Verilog HDL smoke command；当 promoted piece 影响 HDL features、
  projectors、examples 或 fixtures 时填写：
  `. E:\oss-cad-suite\environment.ps1; iverilog <files>`
- Additional checks:

## 最小 Round Review

- 未使用的数据结构已删除或说明原因:
- Future-only feature/stage/provider/diagnostic declarations 已删除或明确说明原因:
- 空 schema-required fields 已说明为 schema-shape constraints:
- Promoted pieces 是最小 review 单元，不是整个 sandbox folder:
- 已清理 task-local 构建产物:
- `verification.md` 和 `material-index.md` 都与最终 task 结果一致:

## 不要 Promotion

列出应保留在 sandbox 内的 task files 或 ideas：

- 

除非人类明确决定它们就是正式 artifact，否则不要 promotion generated
reports、exploratory logs、宽泛 task README material 或整个 sandbox
directory。
