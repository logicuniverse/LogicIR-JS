# Source Map

| Source | 作用 |
| --- | --- |
| `packages/legacy/flow-core/src/nodes/cel/cel.ts` | `cel.cel` compute node、`context` object destructuring、hidden `expression` input、default expression。 |
| `packages/legacy/flow-core/src/node-functions/cel/cel.ts` | 使用 CEL evaluator 对 `expression + context` 求值的旧实现证据。 |
| `packages/legacy/flow-core/src/nodes/pi-ai/index.ts` | `provider`、`complete`、`stream` 三类 node template、provider dependency、toolCall/event stream ports。 |
| `packages/legacy/flow-core/src/node-functions/pi-ai/index.ts` | provider node 注入 `complete` / `stream` service method 的旧实现证据。 |
| `packages/legacy/flow-core/src/nodes/hono/hono.ts` | `hono.app`、`hono.route`、`hono.get` 的 structural/server-route template。 |
| `packages/legacy/flow-core/src/nodes/hono/index.ts` | Hono package catalog children 和 node template registry。 |

这些文件是历史证据，不是新 schema 权威。真实 CEL/pi-ai/Hono 库也不进入
本 task；本 task 只吸收 provider dependency、domain node catalog、stream
和 structural route composition 这些可迁移语义。
