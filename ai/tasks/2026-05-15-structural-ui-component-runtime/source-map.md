# Source Map

| Source | 作用 |
| --- | --- |
| `packages/legacy/flow-core/src/nodes/react-dom/react-app.ts` | `React App` state machine、DOM mount input、composite/stateful render dependency。 |
| `packages/legacy/flow-core/src/node-functions/react-dom/index.ts` | `compose`、`useSyncExternalStore`、`class -> className`、render subflow dispatch。 |
| `packages/legacy/flow-core/src/nodes/html/div.ts` | `props`、`children`、`events` ports 和 destructuring 证据。 |
| `packages/legacy/flow-core/src/node-functions/utils/tag2compute.ts` | tag -> reactive component function 的旧实现。 |
| `packages/legacy/flow-core/src/node-functions/html/raw-content.ts` | reactive raw content property 映射。 |
| `packages/legacy/flow-core/src/nodes/stdlib/components/index.ts` | `component.fromObject` / `component.fromArray` children composition 证据。 |

这些文件是历史证据，不是新 schema 权威。
