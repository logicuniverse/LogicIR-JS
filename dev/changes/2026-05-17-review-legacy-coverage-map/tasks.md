# Tasks

Status: `draft`

## Intake

- [x] 关联 task 已在 `ai/tasks/material-index.md` 中登记。
- [x] `verification.md` 已记录 `yarn verify` passed。
- [x] `promotion-checklist.md` 已列出可 promotion / 不可 promotion 内容。
- [x] Review 范围、成功标准和非目标已写入 `proposal.md`。

## Evidence Reading

- [ ] 阅读 `ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md`。
- [ ] 阅读 `ai/tasks/2026-05-14-legacy-coverage-map/coverage.json`。
- [ ] 阅读 `README.md`、`source-map.md`、`verification.md`、`promotion-checklist.md`。
- [ ] 对照 S1-S5 工作台确认 covered/partial rows。
- [ ] 对照 stdlib/reactive/structural/domain 工作台确认 defer/missing rows。

## Review Checklist

- [ ] 判断 coverage taxonomy 是否准确。
- [ ] 判断 status 命名是否需要从 `covered-by-s1-s5` 改为更保守 wording。
- [ ] 判断 follow-up rounds 是否进入 roadmap。
- [ ] 判断哪些 rows 应标 `archive-only`、`needs-rework` 或 `review-after-foundation`。
- [ ] 判断 coverage map 是否需要正式化为 `dev/` migration tracker。

## Promotion Planning

- [ ] 如果接受，选择最小 promotion slice。
- [ ] 不 promotion task-local verifier 为正式 coverage gate，除非单独 review。
- [ ] 不 promotion legacy algorithms。

## 验证任务

- [x] `git diff --check -- dev/changes`
- [ ] Reviewer 决定是否重新运行 coverage task `yarn verify`。

## Review 记录

- Reviewer:
- Review date:
- Decision:
- Notes:
