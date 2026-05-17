# Tasks

Status: `draft`

可选状态：`draft` / `ready-for-review` / `accepted` / `implemented` /
`superseded` / `rejected`。

## Intake

- [ ] 关联 task 已在 `ai/tasks/material-index.md` 中登记。
- [ ] 关联 task 的 `verification.md` 已记录命令、结果或 concrete blocker。
- [ ] 关联 task 的 `promotion-checklist.md` 已列出可 promotion / 不可 promotion 内容。
- [ ] Review 范围、成功标准和非目标已写入 `proposal.md`。

## Review

- [ ] 已阅读 task `README.md`、`source-map.md`、`design-notes.md`、
      `verification.md` 和 `promotion-checklist.md`。
- [ ] 已检查相关 legacy source evidence。
- [ ] 已检查当前正式 `packages/`、`schema/`、`dev/` 规则。
- [ ] 已在 `design.md` 记录语义结论和边界判断。
- [ ] 已在 `tasks.md` 记录需要交互修改的问题。

## Promotion

- [ ] 已确认最小 promotion slice。
- [ ] 未整包复制 task 目录。
- [ ] 未 promotion task-local generated report、探索日志或宽泛 README material。
- [ ] 已把选定成果迁移到正确正式目录。
- [ ] 已同步 `spec-delta.md`。

## Stabilization

- [ ] 已更新 `dev/roadmap.md` 或说明无需更新。
- [ ] 已更新 `dev/feature-catalog.md` 或说明无需更新。
- [ ] 已更新来源 task 的 `promotion-checklist.md`。
- [ ] 已更新 `ai/tasks/material-index.md`。
- [ ] 已清理或说明 task-local 构建产物。

## 验证任务

- [ ] `git diff --check`
- [ ] `yarn build` 或说明本 change 不需要。
- [ ] Software smoke command:
- [ ] HDL smoke command:
- [ ] Additional checks:

## Review 记录

- Reviewer:
- Review date:
- Decision:
- Notes:
