# Design

## 说明

本文是 HDL H1-H5 人工 review 工作台，不是 Verilog projector 设计定稿。

## 阅读顺序

1. `ai/tasks/2026-05-14-basic-hdl-sim-summary/summary-report.md`。
2. H1 和 H4：先确认 basic positive projection 和 unsupported rejection。
3. H2/H3/H5：再确认 width、sequential state 和 structural composition。
4. 对照 `dev/schema-principles.md` 和 `packages/core/src/types.ts`。

## Intake Matrix

| Round | Task | Verification | Capability | Main review focus |
| --- | --- | --- | --- | --- |
| H1 | `2026-05-14-basic-hdl-sim-h1-combinational-module` | `yarn verify` passed; `H1_PASS` | one-bit AND module/testbench | combinational result -> Verilog output |
| H2 | `2026-05-14-basic-hdl-sim-h2-signal-width` | `yarn verify` passed; `H2_PASS` | 4-bit unsigned add/wraparound | width metadata and unsigned vector semantics |
| H3 | `2026-05-14-basic-hdl-sim-h3-sequential-state` | `yarn verify` passed; `H3_PASS` | register with active-high reset | sequential state lowering, clock/reset feature boundary |
| H4 | `2026-05-14-basic-hdl-sim-h4-unsupported-semantics` | `yarn verify` passed; structured rejection | required software invocation rejected | capability checker / diagnostic path |
| H5 | `2026-05-14-basic-hdl-sim-h5-structural-composition` | `yarn verify` passed; `H5_PASS` and 8 vectors | `and3` from two `and2` instances | hierarchy, internal wire, anchor/outlet alignment |

## Current Schema 对照点

- HDL-specific width、signedness、clock/reset、module binding 应属于 feature /
  projection profile，不进入 core。
- `combinational` 只有 inputs + result；Verilog output 可以由 projector 从
  result surface 生成。
- `sequential` core step 只保存 `{ luiId }[]`；clock/reset/register semantics
  需要 HDL feature/payload 或 lowering 决策。
- Structural composition 现在按 `outlet -> anchor` 理解；H5 payload 不能不经
  review 变成正式 structural schema。
- Projector 必须 reject unsupported required/conditional-required feature，
  不能 silent degradation。

## Legacy / Existing Evidence

本专题主要对照当前 HDL tasks 和 schema-principles。旧 JS runtime 不决定 HDL
semantics。可参考的现有证据：

- `ai/tasks/2026-05-14-basic-hdl-sim-summary/summary-report.md`
- `ai/tasks/2026-05-14-round-schema-alignment/verification.md`
- `dev/schema-principles.md` projection target 约束

## Round Review Checklist

### H1

- AND fixture 是否是正式 Verilog projector seed 的合适最小正向 fixture？
- result 到 Verilog output 的命名和 surface 映射是否需要正式规则？
- Testbench vector style 是否可作为 formal runner seed？

### H2

- Width metadata 当前放置位置是否正确？
- 4-bit wraparound 是否属于 Verilog lowering 自然结果，还是需要 explicit type
  feature？
- Signedness 未覆盖是否应成为 follow-up blocker？

### H3

- Register / clock / reset 是否必须保持 HDL feature，不进入 core？
- Active-high reset 是否只是 fixture choice？
- Sequential state 与 software `stateful property` 是否需要统一描述，还是分
  target/profile 处理？

### H4

- Diagnostic code `HDL_UNSUPPORTED_REQUIRED_FEATURE` 是否可作为 formal seed？
- H4 是否必须与 H1-H3/H5 一起进入第一批 projector regression？
- Capability checker 应在 projection 前还是 projection 中触发？

### H5

- H5 structural hierarchy 是否已足够证明 module instance lowering？
- Internal wire 命名和 module library resolution 是否只是 task-local？
- H5 是否需要改写到当前 `anchors/outlets/anchorFills/luiFills` 词汇后再
  promotion？

## Promotion Candidate Map

| Candidate | Source | Possible formal area | Main blocker |
| --- | --- | --- | --- |
| Verilog signal declaration helper | H1/H2 | future `packages/projectors/verilog` | Need accepted HDL feature payload |
| Module/testbench emitter | H1 | future projector tests | Need shared API and fixture layout |
| Width/vector helper | H2 | HDL feature/projector helper | Need signed/packed policy |
| Register emitter | H3 | HDL feature/projector helper | Need clock/reset contract |
| Unsupported diagnostic path | H4 | shared diagnostics/projector preflight | Need diagnostic taxonomy review |
| Structural instance helper | H5 | structural HDL lowering | Need anchor/outlet alignment |

## 待人工判断

- 是否先做 `packages/projectors/verilog` seed，还是先做 HDL feature package？
- H4 diagnostic 是否与 software S5 diagnostic 一起合并成 shared diagnostic
  change？
- H1-H5 fixtures 是否进入 `fixtures/logicir/basic-hdl/`，还是先留在 task？
- 需要先做 H6 unified projector，还是可以 promotion 独立 helpers？
