# Feature 目录

这份文档只记录 feature 方向和状态，不制定 feature 数据结构。正式数据结构以
`packages/features/*` 为准；新 feature 必须由人类主导设计，并在 core-only examples
和基础 validator 稳定后再推进。

## 状态约定

- `accepted`: 已有正式 package 或正式 schema draft。
- `candidate`: 有明确价值，但当前不承诺实现。
- `research`: 中长期 pressure test，不驱动当前 core/schema。
- `deferred`: 暂缓；等待 core examples、validator 或 stack 需求明确。

## 当前策略

- 当前主线先做无 feature 的 core-only examples。
- Plain external provider invocation、closure、requirement 和 fulfillment 不应为了能运行
  就先造 software feature；它们首先要按 core / architecture 边界表达清楚。
- `property` 是 core retained-current contact，不是 software state-store feature
  创造出来的能力。
- Feature 只在确实需要 target/runtime/tool/domain 附加语义时引入。

## Accepted

- `logicir.type-system / core`
  - 状态：`accepted`
  - 来源：`packages/features/type-system`、`packages/tools/type-system`
  - 范围：payload type reference、type declaration、value shape checking、
    projection-facing type metadata。
  - 当前不作为 core-only examples 的 required feature。

## Candidate

- `logicir.value / core`
  - literal/default/value compatibility。
- `logicir.diagnostics / core`
  - shared diagnostic shape、unsupported semantics、phase/source subject。
- Software feature family
  - completion、state-store binding、lifecycle、scheduling、transport、error policy。
  - 暂缓到 core examples 和 software interpreter seed 重新设计后。
- HDL feature family
  - signal、module、clocking、state、combinational constraint、elaboration、
    structural slices。
  - 暂缓到 core examples 和 HDL sim seed 重新设计后。
- `logicir.control-flow / core`
  - guard、branch、loop、return、go-back 等 sequential `steps` 之外的控制语义。
- `logicir.adapter / core`
  - adapter / lowering trace。
- `logicir.observation / core`
  - probe、trace、assertion、analysis-only observation point。

## Research

以下方向保留在 [long-term-vision.md](long-term-vision.md)，不驱动当前实现：

- explicit resource / effect feature family。
- no-GC / ownership / lifetime feature family。
- catalog database / dependency index / AI tool-routing query。
- distributed runtime、remote transport、visual editor productization 等。
