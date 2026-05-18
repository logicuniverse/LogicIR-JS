# 共同规则

这些规则适用于人与 AI 在本仓库中共同推进 LogicIR。

## 权威入口

- `docs/essay.md` 是理论源头。
- `packages/core`、`packages/architecture`、`packages/features/*` 是当前已接受
  TS authoring source。
- `dev/` 是人类开发规则和决策摘要。
- `ai/` 是 AI 自动化材料和详细证据。
- legacy packages 是历史 evidence，不是 schema authority。

## 人类主导 Schema

- IR / feature / extension 数据结构由人类主写和最终决策。
- AI 可以在对话中辅助分析、对照、草案、风险提示和局部编辑。
- AI task 不能自动制定高自由度语义。
- AI task 可以在 schema/feature 已固定后探索 validator、type-system、wrapper、
  fixture、coverage、diagnostic reporter 等低自由度工作。
- 正式 TS 实现优先 plain data、pure/helper functions、factory 和 closure；避免
  `class` 和 OOP 风格，以提高可移植性并减少 host-language 绑定。

## Change 和 Review

- 重大 schema、API、runtime、projection 或 package 边界变化先记录到
  [../changes/](../changes/)。
- `dev/changes` 面向人类 review，默认粗粒度、短文件、决策导向。
- 默认 change 只需要 `review.md`；只有进入正式 promotion / implementation 时才展开
  proposal/design/tasks/spec-delta。
- 小型文档修正或明显局部修复可以直接执行，但最终说明要清楚。

## AI 自动探索隔离

- `/goal`、roadmap round、parallel-agent work 默认进入 `ai/tasks/`。
- 不确定、探索性或可丢弃内容进入 `ai/scratch/`。
- Task output 是素材，不是正式项目结果。
- 正式 package 不得 import task-local code。
- Promotion 只能移动最小、已审阅、可验证的 piece，不能整包复制 task。

## 工作区保护

- 不覆盖用户或他人未授权改动。
- 发现无关改动时记录并避开。
- 已有改动影响当前任务时，先理解并在其基础上继续；无法安全继续再询问。

## 验证纪律

- 代码实现后运行相关 build/test/smoke。
- 纯文档整理不要求构建，但应运行 `git diff --check`，并确认工作区只出现预期变更。
- 无法验证时必须写明原因。
