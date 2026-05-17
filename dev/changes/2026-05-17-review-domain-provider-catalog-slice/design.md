# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Catalog entries | 7 |
| CEL result | 3 |
| pi-ai complete | mock result |
| Stream events | 4 |
| Tool calls | 1 |
| Routes | 1 |

## Boundary

- Core:
  - 不包含 CEL/pi-ai/Hono concepts。
  - 不包含 API key、SDK object、HTTP lifecycle。
- Feature/catalog:
  - expression node catalog。
  - provider contract shape。
  - stream event semantics。
  - server route structural model。
- Runtime/provider:
  - mock or real provider invocation。
  - stream event emission。
  - route tree materialization。

## Sub-Direction Checklist

### CEL

- CEL expression 是否作为 domain feature，而不是 generic core expression？
- Task-local evaluator 是否只保留 smoke helper？
- Type-system 是否需要先支持 expression input/output types？

### pi-ai

- Complete 和 stream 是否属于同一个 provider contract？
- Stream events 是否依赖 event-stream feature？
- Tool call 是否是 provider-specific push output，还是通用 tool invocation feature？
- Mock provider 是否足够作为 formal test seed？

### Hono

- Route tree 是否 structural composition output？
- HTTP lifecycle 是否完全 out of scope？
- Handler function 是否需要 fulfillment/closure 支撑？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| CEL catalog fixture | expression/domain feature tests | Need expression feature scope |
| pi-ai mock complete/stream fixture | provider contract tests | Need stream/tool-call policy |
| Hono route fixture | structural/server-route tests | Need structural composition contract |
| Domain snapshot | provider catalog review evidence | Need catalog namespace decision |

## 待人工判断

- 是否拆成 `expression-provider`、`ai-provider-stream`、`server-route-structural`
  三个 changes？
- Domain provider catalog 是否等待 stdlib catalog 基础稳定？
- Tool-call semantics 是否进入 long-term provider plan，还是近期 feature？
