# Proposal

## 背景

`basic-hdl-sim` H1-H5 已经验证一条最小 HDL 路线：LogicIR fixture 可以投影到
Verilog，使用 `iverilog`/`vvp` 验证，并在遇到软件专属语义时产生拒绝路径。

本 change 为人工 review 准备 HDL H1-H5 工作台。

## 问题

H1-H5 是分离 round，不是统一 Verilog projector。人工 review 前需要明确：

- 哪些 emitter / fixture / diagnostic path 可以作为 formal seed。
- 哪些 task-local payload、module library 和 thrown error 不能直接 promotion。
- H5 structural payload 与当前 `anchor/outlet` schema 的关系。

## 目标

- 汇总 H1-H5 的 intake、验证和 promotion 候选。
- 列出 HDL projector seed 的 schema、profile、feature 和 diagnostic 对照点。
- 提供逐轮 review checklist。
- 保持所有结论为待人工判断。

## 非目标

- 不修改 H1-H5 task 代码。
- 不实现 `packages/projectors/verilog`。
- 不 migration 任何 fixture。
- 不把 H1-H5 emitter algorithm 固化为 projector law。

## 成功标准

- Reviewer 能判断是否开启正式 Verilog projector seed change。
- H1-H5 每轮的正向和负向证据清楚可查。
- Unsupported required feature rejection 与 positive projection 一起进入 review。

## 相关证据

- AI tasks:
  - `ai/tasks/2026-05-14-basic-hdl-sim-h1-combinational-module`
  - `ai/tasks/2026-05-14-basic-hdl-sim-h2-signal-width`
  - `ai/tasks/2026-05-14-basic-hdl-sim-h3-sequential-state`
  - `ai/tasks/2026-05-14-basic-hdl-sim-h4-unsupported-semantics`
  - `ai/tasks/2026-05-14-basic-hdl-sim-h5-structural-composition`
  - `ai/tasks/2026-05-14-basic-hdl-sim-summary`
- Current docs:
  - `dev/schema-principles.md`
  - `dev/operational-theory.md`
  - `dev/feature-catalog.md`
  - `ai/tasks/material-index.md`
- Current packages:
  - `packages/core/src/types.ts`
  - `packages/architecture/src/types.ts`

## Review 范围

- In scope:
  - H1-H5 evidence intake。
  - HDL projection / rejection review questions。
  - Formal projector seed 的最小候选切片。
- Out of scope:
  - 新 Verilog projector implementation。
  - HDL feature schema 正式落地。
  - 多 clock、signed/packed、module library 完整设计。

## Promotion 候选

这些只是候选，等待人工 review：

- H1 module/testbench emission fixture。
- H2 width/vector arithmetic helper。
- H3 register clock/reset seed。
- H4 unsupported required feature diagnostic path。
- H5 structural instance/wire helper。
- H1-H5 adapted formal regression fixtures。
