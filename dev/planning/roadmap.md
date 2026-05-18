# LogicIR 路线图

这份文档只跟踪当前确定要推进的工作。它面向人类协作者，保持短、稳定、决策导向。
详细证据、长 checklist、AI task 计划和历史过程放在 `ai/`。

本文不是 schema 权威。已接受的数据结构以 `packages/` 为准；语言无关规范入口在
`schema/`；开发流程见 [../workflow/process.md](../workflow/process.md)。

## 当前判断

- 先校准 core IR，再讨论 feature。
- 近期不再细读旧的 `basic-software-interpreter` S1-S5 作为 promotion 来源；它们
  可以作为误差分析和历史 evidence。
- 新一轮应从不引入任何 feature 的典型 core examples 开始。
- AI task 不负责制定 IR / feature / extension 数据结构；AI 可在规则固定后生成
  examples、fixtures、wrapper、validator/type-system 等低自由度工具切片。

## 当前主线：Core-Only Examples

目标：基于当前 `packages/core`，建立一组可 build/run 的正式 examples，用最小例子
验证四类 LU organization 和 Z 轴关系。所有 example 默认不引入 feature。

建议统一放在一个可运行 package 或 examples runner 下，例如：

```text
examples/core-only/
```

第一组例子：

1. **Combinational add**
   - 单 LUI。
   - `pull inputs + result`。
   - 证明 combinational 是同步 lazy computation，除 `result` 外没有输出。
2. **Stateful counter**
   - 单 LUI。
   - `pull initial` + 若干 `push` update inputs + `property` output。
   - 证明 property 是运行内 retained-current / register-like current。
3. **Sequential pipeline**
   - 多 step pipeline。
   - `kindOrganization.steps: { luiId }[]`。
   - 证明 sequential 的 result 可被外部锁存；async/await 只属于 sequential
     realization，不属于 combinational。
4. **Structural UI/DOM**
   - 单 structural LU 或 LUI。
   - anchors / outlets / fills。
   - 证明 structural 产生 composition / elaboration result，不是普通 provider list。
5. **Multi-LUI core composition**
   - 多 LUI connection。
   - 验证 boundary、child LUI result/source、payloadPath 和 Core Scope 规则。
6. **Z requirement + closure**
   - requirement target、closure fulfillment、upstream fulfillment 的最小例子。
   - 证明 Z 不是普通 dataflow，也不需要 software feature gate。

验收标准：

- 只依赖 `@logic-universe/logic-ir-core`。
- 运行统一走正式 package
  `@logic-universe/logic-ir-engine-core-software-interpreter`，而不是每个 example
  单独手写执行器。
- `featureUses` 为空或只保留 schema 必需空结构。
- 每个 example 有 fixture、简短说明和 smoke。
- 统一命令可以运行全部 examples。
- 任何不支持或未建模语义都以明确说明或 diagnostic 体现。

## 下一阶段：Core Validator 和 Diagnostics

Core-only examples 稳定后，推进最小工具链：

- Core schema validator。
- Endpoint / connection / port surface consistency checker。
- LU kind organization checker。
- Requirement / fulfillment / closure consistency checker。
- Shared diagnostic shape。

这些工具可以由 AI task 探索算法和 coverage，但输入语义必须以当前 core schema 和
人工确认的规则为准。

## 后续阶段：Architecture Tools

Core examples 和 validator 稳定后，再推进：

- Architecture definition validator。
- Profile resolver。
- Capability checker。
- Fixture runner。

这时再决定哪些 profile、stack、provider contract 和 execution binding 需要进入
正式 package。

## 后续阶段：Software / HDL Stack

在 core examples 和基础工具链稳定后，重新设计：

- `basic-software-interpreter`
  - `LogicIR -> interpreter plan -> software engine run`。
  - 当前已先建立 feature-free 的
    `packages/engines/core-software-interpreter` seed，后续在它上面渐进加入
    closure / requirement / feature 支持。
  - 不从旧 S1-S5 直接 promotion；只吸收经人工确认的最小语义和 evidence。
- `basic-hdl-sim`
  - `LogicIR -> Verilog HDL -> iverilog simulation`。
  - 用来持续约束 core 不吸收 JS runtime 假设。

## 暂缓

- 正式 software feature family。
- 正式 HDL feature family。
- Generated JS/TS artifact。
- HDL synthesis/build。
- Edit transaction MVP。
- Catalog database / dependency index。
- No-GC / explicit resource and effect feature family。
- Zero-to-LogicIR dataset / local model。

这些方向保留在 [feature-catalog.md](feature-catalog.md) 或
[long-term-vision.md](long-term-vision.md)，不驱动当前实现。
