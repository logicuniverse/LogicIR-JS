# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Checked values | 8 |
| Checked connections | 5 |
| Intentional issue | `incompatible-type`, `connection:invalidNumberToInteger` |
| Known gaps | requirement/composition bindings inactive; no codegen/HDL lowering; conservative recursive assignability |

## Core / Feature / Tool Boundary

- Core:
  - 不包含具体 ADT registry。
  - 不包含泛型 schema abstraction。
  - 只提供 port/result/payloadPath/anchor/outlet 等可被 type feature 引用的
    topology surface。
- Feature / extension:
  - type definitions。
  - payload type annotation。
  - connection type policy。
- Tool:
  - registry build。
  - assignability check。
  - LogicIR connection check。
  - diagnostics。
- Profile:
  - 决定 type-system feature 是 required、recommended 还是 optional。

## Current Schema 对照点

- `Port.contact` 的 `pull/push/property` 不等同于 type category。
- result 可以是 whole result，也可以有 pins；type checker 需要支持两者。
- `payloadPath` 处理深层值，不应要求 result pins 表达所有结构。
- Structural composition 当前使用 `outlet -> anchor`；composition type binding 暂未
  激活。
- Schema 不能使用 TypeScript generics 作为跨语言 abstraction。

## Existing Package 对照点

Reviewer 应对照：

- `packages/features/type-system`
- `packages/tools/type-system`

待判断：

- Task-local type AST 是否比现有 package 更清楚。
- 现有 package 是否已经吸收 task 的核心行为。
- 是否需要迁移 fixture 或 diagnostic，不迁移代码形状。

## Review Checklist

- ADT primitive / record / union / tuple shape 是否足够作为第一版？
- `integer` vs `number` assignability policy 是否符合当前目标？
- Recursive assignability 保守策略是否可接受？
- Connection type policy 是否应该在 feature definition 中表达？
- Diagnostics 是否跟 S5 shared diagnostic 统一？
- Type checker 是否应支持 property initial value 的 type check？
- Type checker 是否要等待 formal validator / resolver 稳定后再 promotion？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| ADT payload types | `packages/features/type-system` | Need compare existing package |
| Feature definition | `packages/features/type-system` | Need requiredness/profile decision |
| Registry/checker | `packages/tools/type-system` | Need formal diagnostics and tests |
| LogicIR connection checker | `packages/tools/type-system` | Need current core schema alignment |
| Fixtures/smoke | formal tests/fixtures | Need accepted fixture naming |

## 待人工判断

- Type-system 是否作为近期 foundation 必须先 review？
- 第一版是否只覆盖 connection/payload type，不覆盖 requirement/composition？
- 是否需要把 type diagnostic 放进 shared diagnostic change？
- 是否需要先写 spec-delta，再改 package？
