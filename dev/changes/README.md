# 变更审阅

`dev/changes/` 保存人类粗粒度 review / decision 记录。它不是 schema authority，
也不是每个 AI task 的细粒度审阅队列。

详细证据、长 checklist、source map、失败尝试和自动化输出应留在 `ai/`；change
只记录人类需要确认的结论、取舍和后续动作。

## 何时新增

只有出现以下情况时才开 change：

- Core schema、architecture schema、feature/extension、profile 或 stack 语义变化。
- Runtime、projector、compiler、provider contract 或 capability 语义变化。
- 一批 AI task 输出需要粗筛、分类或筛出可晋升部分。
- 旧实现证据需要被正式吸收、替代或明确丢弃。
- 变更影响兼容性、migration、验证策略或多个子系统。

明显低质量、概念错误较多或已被新方向覆盖的 task，可以直接在
`ai/tasks/material-index.md` 标记为 `archive-only` / `needs-rework`。

## 粒度

推荐粒度：

- 一个 LU kind 或一个 core 语义切片。
- 一批同类 AI tasks 的粗筛。
- 一个最小 promotion slice。
- 一组被确认废弃、重做或后移的材料。

不推荐：

- 每个 task 一个 change。
- 每个文件一个 change。
- 为明显错误的探索结果建立完整长文档。
- 为尚未准备 promotion 的材料写逐文件 checklist。

## 文件结构

默认只需要：

```text
dev/changes/<change-id>/review.md
```

`review.md` 记录：

- 范围。
- 粗结论。
- 决策表。
- 关键语义判断。
- 后续动作。

只有进入正式 promotion / implementation 时，才按需增加 proposal、design、tasks 或
spec-delta；这些文件不是默认要求。

## 状态

- `draft`: 正在讨论。
- `triage-ready`: 已整理粗筛材料，等待人工判断。
- `accepted-for-promotion`: 有最小 slice 值得进入正式实现或规范变更。
- `implemented`: 已实现并验证。
- `superseded`: 被其它 change 替代。
- `archive-only`: 只保留为历史证据。
- `rejected`: 明确不采用。

## AI Task 边界

AI task 不是 IR / feature / extension 制定 authority。它可以提供证据、错误样本、
生成物、wrapper 和受限工具实现；高自由度语义决策必须由人类确认。
