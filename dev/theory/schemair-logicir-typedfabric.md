# SchemaIR / LogicIR / TypedFabric

这份文档说明三个相邻系统各自是什么、彼此如何依赖，以及哪些边界不要混在一起。

它不是详细规格；它是协作者进入项目时的路标页。

## 1. 三层定位

```text
SchemaIR    = static type as data
LogicIR     = dynamic logic as data
TypedFabric = domain-neutral typed runtime platform
```

更具体地说：

- `SchemaIR` 负责静态类型图和类型系统。
- `LogicIR` 负责动态逻辑表达、分析、投影、验证与运行。
- `TypedFabric` 负责承载领域无关的 typed data runtime，并把 schema、data、relation、view、logic binding 等平台对象组织起来。

三者合在一起的长期目标是：

```text
schema + data + logic => data-driven domain platform
```

这里的重点不是把三个项目揉成一个大系统，而是让它们共享同一个 typed substrate，同时保持职责正交。

## 2. SchemaIR

`SchemaIR` 是静态类型层。

它负责：

- 定义可序列化的类型图。
- 表达 primitive、literal、record、array、union、ref 等类型组合。
- 提供 payload validation、schema definition validation、type comparison、assignability、diff、freeze、ref rewrite 等类型系统能力。
- 投影到 JSON Schema、Standard JSON Schema、OpenAPI、form/view adapter 等外部消费面。

`SchemaIR` 不负责：

- 运行领域逻辑。
- 存储业务事实。
- 管理平台对象生命周期。
- 决定宿主系统如何解析 ref。

`SchemaIR.refPath` 应保持 host-agnostic。具体 ref 在 authoring、freeze、runtime validation 中如何解析，由宿主系统决定。

## 3. LogicIR

`LogicIR` 是动态逻辑层。

它负责：

- 表达 logic unit、logic unit instance、closure、connection、composition、requirement fulfillment 等逻辑拓扑。
- 表达 combinational、sequential、stateful、structural 等运行组织方式。
- 支持 logic 的 validation、projection、execution、runtime engine 和 target lowering。
- 在 software、HDL、UI、automation 等不同 target 上保留可诊断的语义边界。

`LogicIR` 应直接使用或引用 `SchemaIR` 来描述：

- input payload type
- output payload type
- result type
- property current type
- closure boundary type
- structural anchor/outlet material type
- execution input/output contract

`LogicIR` 不应重新发明一套独立 payload schema。除非有明确理由，payload type surface 应尽量与 `SchemaIR.SchemaNode` 对齐。

`LogicIR` 不负责：

- 保存领域事实。
- 决定业务对象生命周期。
- 充当 TypedFabric 的数据库或平台运行时。

## 4. TypedFabric

`TypedFabric` 是领域无关的 typed runtime platform。

它负责：

- 保存 schema、schema_snapshot、object、trace_relation、trace_link 等平台事实。
- 通过 `SchemaIR` 管理领域数据类型、payload 校验、版本冻结和 ref 生命周期。
- 通过 pack / plugin 加载领域内容，而不是把 CRM、ERP、CMS、HR 等领域写进 core。
- 后续通过 `LogicIR` 表达 workflow、rule、automation、derived data、proposal apply 等动态逻辑。
- 给人类和 AI 提供可审查、可追踪、可版本化的领域语义底座。

`TypedFabric` 不应退回到：

```text
RDS tables + ad-hoc business code
```

它的长期方向应是：

```text
SchemaIR schema + typed objects + typed relations + LogicIR logic bindings
```

也就是说，领域应用不靠固定业务表和散落代码硬撑，而是通过 typed data 和 typed logic 组合出来。

## 5. 依赖方向

推荐依赖方向是单向的：

```text
SchemaIR
  ↑
LogicIR
  ↑
TypedFabric
```

含义是：

- `SchemaIR` 不依赖 `LogicIR`，也不依赖 `TypedFabric`。
- `LogicIR` 可以依赖 `SchemaIR` 作为类型系统。
- `TypedFabric` 可以同时依赖 `SchemaIR` 和 `LogicIR`。
- 不允许形成循环依赖。

更细地说：

```text
@schemair/core
@schemair/type-system
@schemair/validator
@schemair/json-schema

@logicir/core          -> may reference SchemaIR type surface
@logicir/validator     -> may use SchemaIR validation/type APIs
@logicir/engine        -> may use SchemaIR for runtime payload checking

TypedFabric backend    -> hosts SchemaIR registry and LogicIR execution binding
TypedFabric frontend   -> renders SchemaIR-driven data and LogicIR-driven interactions
TypedFabric packs      -> provide schemas, relations, views, and logic definitions
```

## 6. Boundary Rules

Keep these boundaries sharp:

- `SchemaIR` owns static type shape, not dynamic behavior.
- `LogicIR` owns dynamic logic topology, not business fact storage.
- `TypedFabric` owns platform hosting, governance, persistence, pack/plugin loading, and user-facing runtime.
- Domain packs own domain content.
- AI can assist with drafts, analysis, validation, wrappers, and low-freedom generation; high-freedom IR/schema semantics remain human-led.

Do not put these in the wrong layer:

- Do not put LogicIR runtime behavior into `SchemaIR`.
- Do not put TypedFabric host policy into `SchemaIR` core.
- Do not put CRM/ERP/CMS domain objects into TypedFabric core.
- Do not make LogicIR depend on TypedFabric platform services.
- Do not make SchemaIR know about LogicIR ports, LUIs, or closures.

## 7. Practical Integration Path

A conservative integration path is:

1. Keep `SchemaIR` independent and stable as the static type layer.
2. Add optional SchemaIR type references to LogicIR port/result/property surfaces.
3. Use SchemaIR validator/type-system in LogicIR examples and engines for payload checking.
4. Let TypedFabric store LogicIR definitions as platform data only after the LogicIR schema and runtime seed are stable enough.
5. Add TypedFabric logic binding records that connect object types, relation types, events, and LogicIR units.
6. Let domain packs ship both SchemaIR definitions and LogicIR definitions.

This keeps the system useful early without forcing premature coupling.

## 8. Mental Model

A compact way to remember the relationship:

```text
SchemaIR tells the system what data is.
LogicIR tells the system how logic runs.
TypedFabric tells the system where typed domain reality lives.
```

Together they aim at a platform where domain systems are not primarily assembled from hand-coded tables and services, but from typed definitions, typed facts, typed relations, and typed logic.
