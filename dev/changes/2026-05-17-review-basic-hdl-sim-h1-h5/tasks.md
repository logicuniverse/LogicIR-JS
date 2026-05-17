# Tasks

Status: `draft`

本 change 是人工 review 工作台。不要在本 change 内修改 H1-H5 task 代码，也
不要 promotion 到正式包。

## Intake

- [x] 关联 task 已在 `ai/tasks/material-index.md` 中登记。
- [x] H1 `verification.md` 已记录 `yarn verify` passed。
- [x] H2 `verification.md` 已记录 `yarn verify` passed。
- [x] H3 `verification.md` 已记录 `yarn verify` passed。
- [x] H4 `verification.md` 已记录 `yarn verify` passed。
- [x] H5 `verification.md` 已记录 `yarn verify` passed。
- [x] HDL summary `verification.md` 已记录 `yarn verify` passed。
- [x] H1-H5 和 summary 都有 `promotion-checklist.md`。
- [x] Review 范围、成功标准和非目标已写入 `proposal.md`。

## Evidence Reading

- [ ] 阅读 `ai/tasks/2026-05-14-basic-hdl-sim-summary/summary-report.md`。
- [ ] 阅读 H1 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 H2 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 H3 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 H4 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 H5 README / source-map / design-notes / verification / promotion checklist。

## Schema / Theory Cross-Check

- [ ] 对照 `packages/core/src/types.ts` 的 `kindOrganization`、ports、result、
      structural composition。
- [ ] 对照 `dev/schema-principles.md` 的 projection target 约束。
- [ ] 对照 `dev/feature-catalog.md` 的 HDL feature 状态。
- [ ] 对照 `dev/operational-theory.md` 的 LU kind organization 处理规则。

## Round Review Checklist

- [ ] H1: 判断 positive combinational module/testbench seed。
- [ ] H2: 判断 width/vector semantics 的 feature/profile 归属。
- [ ] H3: 判断 register/clock/reset 是否只作为 HDL feature seed。
- [ ] H4: 判断 unsupported required feature diagnostic seed。
- [ ] H5: 判断 structural instance/wire seed 和 anchor/outlet 对齐要求。
- [ ] 判断 H1-H5 是否足够开启 unified Verilog projector seed。
- [ ] 判断是否先拆 shared diagnostics change。

## Promotion Planning

- [ ] 判断最小 formal fixture set。
- [ ] 判断是否先建 `packages/projectors/verilog`。
- [ ] 判断 HDL feature payload 是否需要先单独 review。
- [ ] 判断哪些 H1-H5 task-local emitter 可以重写为 formal helper。
- [ ] 判断哪些内容标记为 `needs-rework`。

## 验证任务

- [x] `git diff --check -- dev/changes`
- [ ] Reviewer 决定是否重新运行 H1-H5 `yarn verify`。
- [ ] Reviewer 决定是否清理 task-local generated Verilog / `.vvp` artifact。

## Review 记录

- Reviewer:
- Review date:
- Decision:
- Notes:
