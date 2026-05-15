# Design Notes

## 边界

这个 task 吸收的是 domain/provider catalog 语义，不是外部 SDK。

- 不安装 `@marcbachmann/cel-js`。
- 不安装或调用 `@mariozechner/pi-ai`。
- 不启动真实 Hono server。
- 不把 provider key、API key、HTTP router lifecycle 写进 core schema。

## 吸收的语义

- Domain node 可以作为 catalog row 进入 LogicIR feature/tool review。
- `cel.cel` 是无状态 compute node，输入包含可 object destructuring 的
  `context` 和通常隐藏的 static `expression`。
- `pi-ai.provider` 是 provider binding seed，后续 `complete` / `stream`
  通过 dependency/service method 使用它。
- `pi-ai.stream` 的 event/toolCall 是 stream output，不是普通 return value。
- Hono 路由更像 structural composition：`app -> route -> get` materialize
  成 route table，而不是立即运行 HTTP server。

## 未吸收的语义

- 完整 CEL 语言。
- 真实 LLM provider、tool execution、retry、rate limit、auth。
- Hono middleware、request/response lifecycle、HTTP server binding。
- 正式 feature/profile/provider contract。

## 后续 review 重点

1. 是否需要把 CEL 作为 generic expression feature，还是作为 domain
   provider/catalog node。
2. pi-ai provider dependency 应该落入 provider contract、requirement
   fulfillment，还是 software execution binding。
3. Hono 路由 structural composition 是否应与 UI structural component
   使用同一类 composition surface，还是单独 server-route feature。
