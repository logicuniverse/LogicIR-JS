# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Extracted legacy keys | 104 |
| Catalog rows | 104 |
| Providers | 104 |
| Smoke cases | 104 |
| Coverage | every legacy key has catalog row, provider, smoke case, lookup entry |

## Boundary

- Core:
  - 不包含 stdlib node catalog。
  - 不包含 JS callback/function representation。
- Feature/catalog:
  - stdlib node identity。
  - input/output shape evidence。
  - category/tag metadata after review。
- Provider/runtime:
  - JS provider implementations。
  - engine dispatch behavior。
- Projector/profile:
  - HDL target 对 unsupported stdlib nodes 应有 rejection 或 explicit lowering。

## Suggested Review Slices

| Slice | Why first | Dependencies |
| --- | --- | --- |
| constants / pass-through | Low semantic risk | S1 invocation |
| scalar number/string operators | Common provider seed | type-system optional |
| array/object packaging | Tests payloadPath/result structure | type-system and payload policy |
| state/property nodes | Requires retained-current semantics | S2 / reactive runtime |
| async nodes | Requires completion policy | S3 / completion result model |
| event nodes | Requires event-stream model | reactive runtime |
| html/react/domain nodes | Requires structural/domain provider boundaries | structural/domain workbenches |

## Review Checklist

- 104 legacy keys 是否完整、是否需要人工抽样核对 source audit？
- 第一批 formal catalog 是否应该小于 10 个 node？
- Catalog row 是否应只保留 pure data，不包含 provider behavior？
- Provider package 是否依赖 formal software interpreter seed？
- Smoke fixture 是否应该先转成 selected regression cases？
- HDL profile 是否必须同时定义 rejection path？
- Old editor UI metadata 是否全部 out of scope？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| Selected catalog rows | future stdlib feature/catalog package | Need namespace and slice decision |
| Selected providers | future software provider package | Need interpreter/provider contract |
| Selected smoke cases | formal tests/fixtures | Need accepted fixtures |
| Coverage checker concept | migration tooling | Need decide if full legacy coverage is desired |

## 待人工判断

- 是否先 review constants/scalars，而不是全量 stdlib？
- stdlib namespace 是否属于 `logicir.stdlib` 或更细 feature packages？
- Provider implementation 是否应和 catalog package 分离？
- 是否要把 unsupported HDL rejection 纳入第一批 tests？
