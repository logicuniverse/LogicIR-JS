# AI Scratch

这个目录用于尚未形成可 review 证据的临时 AI 探索。

适合放入 `ai/scratch/` 的内容：

- 快速 spike。
- 失败尝试。
- 临时笔记。
- 不完整的自动化输出。
- 还没有明确目标、边界或验证计划的 agent 实验。

`ai/scratch/` 默认被 git 忽略。版本管理中只保留这个 README。

当某个 scratch 结果值得 review 时，不要直接 promotion scratch 目录。应新建或更新
一个 `ai/tasks/YYYY-MM-DD-<task>/` 任务目录，并补齐：

- 明确目标和 scope。
- `source-map.md`。
- task-local source、fixtures 或 reports。
- 可运行验证证据。
- `promotion-checklist.md`。

正式项目文件不得 import 或依赖 `ai/scratch/` 或 `ai/tasks/`。
