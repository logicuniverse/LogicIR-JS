# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn typecheck` passed; `yarn verify` passed |
| Flow | partial LogicIR -> transaction -> replay -> validation -> invocation smoke |
| Operation count | 4 |
| Smoke output | `result: 5` |
| Hash evidence | before `fnv1a32:08f89e56`, after `fnv1a32:848554cb` |

## Boundary 判断

- Core:
  - 不应包含 editor transaction protocol。
  - 可被 transaction 构造出的最终 object 必须符合 core schema。
- Tools / authoring:
  - edit transaction。
  - replay。
  - typed holes。
  - transaction validation。
  - diagnostics。
- Runtime:
  - 只消费 replay 后的 valid LogicIR 或 execution plan。
  - 不应依赖 authoring transaction。

## Review Checklist

- Transaction operation 是否需要 domain-specific operations，例如 `connect`
  而不是 raw JSON patch？
- Typed hole 表达是否适合 AI authoring？
- Replay 后 validation 是否足以成为正式工具边界？
- Hash 是否只作为 trace evidence，不作为正式 identity？
- Diagnostics 是否应复用 S5/shared diagnostic shape？
- Partial LogicIR 是否应该有独立 schema 或只存在于 tool layer？
- 是否需要 database-backed graph storage 之前先设计 transaction id / dependency
  relation？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| Transaction operation concepts | future edit/tool package | Need formal operation taxonomy |
| Replay engine | future edit/tool package | Need path addressing and conflict policy |
| Typed hole validation | future authoring tools | Need partial object contract |
| Invalid transaction fixtures | formal tests | Need diagnostic shape |
| Design notes | `dev/` edit model plan | Need concise accepted scope |

## 不应直接 promotion

- Exact JSON path model。
- Exact FNV hash implementation。
- Fixture-specific validator。
- Tiny invocation interpreter。
- Whole task directory or generated `dist/`。

## 待人工判断

- Edit transaction 是否应成为近期 foundation feature？
- 是否先做 transaction spec，再做 package？
- 是否需要与 AI task workflow / changes workflow 对齐？
- 是否把 transaction corpus 作为中长期 local micro-agent 数据来源？
