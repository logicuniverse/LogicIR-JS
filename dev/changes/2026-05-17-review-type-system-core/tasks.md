# Tasks

Status: `draft`

## Intake

- [x] 关联 task 已在 `ai/tasks/material-index.md` 中登记。
- [x] `verification.md` 已记录 `yarn verify` passed。
- [x] `promotion-checklist.md` 已列出可 promotion / 不可 promotion 内容。
- [x] Review 范围、成功标准和非目标已写入 `proposal.md`。

## Evidence Reading

- [ ] 阅读 task `README.md`、`source-map.md`、`design-notes.md`。
- [ ] 阅读 `verification.md` 和 intentional negative fixture。
- [ ] 阅读 `promotion-checklist.md`。
- [ ] 对照 `packages/features/type-system`。
- [ ] 对照 `packages/tools/type-system`。
- [ ] 对照 `packages/core/src/types.ts` 当前 result/pins/payloadPath/ports。

## Review Checklist

- [ ] 判断 ADT payload shape 是否采纳、重写或归档。
- [ ] 判断 assignability policy。
- [ ] 判断 connection type policy 归属。
- [ ] 判断 diagnostic 与 S5/shared diagnostic 的关系。
- [ ] 判断 requirement/composition binding 是否继续 deferred。
- [ ] 判断 formal package 的最小 fixture set。

## Promotion Planning

- [ ] 判断是否打开后续 implementation change。
- [ ] 判断哪些 task-local files 可作为概念 seed。
- [ ] 判断哪些必须重写以匹配现有 package。
- [ ] 不整包复制 sandbox。

## 验证任务

- [x] `git diff --check -- dev/changes`
- [ ] Reviewer 决定是否重新运行 task `yarn verify`。
- [ ] 若后续 promotion，运行 `yarn build` 和 type-system package tests。

## Review 记录

- Reviewer:
- Review date:
- Decision:
- Notes:
