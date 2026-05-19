# Software vs HDL Comparison

这份文档把
[software-runtime-model.md](software-runtime-model.md) 和
[hdl-model.md](hdl-model.md) 放在同一个对照面上。

目的不是重新定义 schema，而是压缩出一张更容易 review 的对照表：

1. 哪些东西在 software 和 HDL 中语义相同。
2. 哪些东西只是 realization 不同。
3. 哪些东西在某一侧自然、另一侧需要 lowering 或 diagnostic。

## 1. 共同骨架

二者共享的不是实现机制，而是同一份 LogicIR 拓扑：

- `LU / LUI / Closure`
- `ports / result / outputs`
- `connections`
- `anchors / outlets / fills`
- `requirements / fulfillments`
- 四种 `LU kind`

因此可以把它们理解成：

- software runtime：同一逻辑对象的动态执行 realization
- HDL projection：同一逻辑对象的静态电路 lowering / elaboration realization

## 2. 总对照

| 主题 | Software Runtime | HDL Projection |
| --- | --- | --- |
| 主对象 | `Core Scope Runtime` | module / elaborated subgraph |
| `manifest` | 产出可复用 runner/factory | elaboration / lowering |
| `run` | 一次 `A/B/C` 执行，stateful 可进入 `D` | 在仿真/综合上下文中观察电路 |
| `handle` | 仅 stateful `Phase D response handle` | 通常不对应核心语义对象；硬件本体持续存在 |
| `emit` | execution context capability，可同步/异步使用 | 需 lower 成 pulse / valid / handshake 等显式信号 |
| `timing context` | 通常不是主导语义 | 通过 structural mount 继承，首先包含 `clock/reset` |
| `Closure` | nested scope runtime | nested module / inlined specialization / elaborated local scope |
| `structural` result | late-bound structural result surface，可继续 `applyOutlets(...)` | 优先解释为静态 elaboration-time composition |
| 不支持语义 | runtime 可抛错/拒绝 | projector 应 diagnostic / assertion / lowering |

## 3. `A/B/C/D` 对照

| Phase | Software Runtime | HDL Projection |
| --- | --- | --- |
| `A` | session-scoped setup，先跑所有 stateful LUIs，建立 current | reset / initial-state establishment / known-state policy |
| `B` | sequential `steps` 时间线推进 | step register / FSM / clocked progression |
| `C` | 读取当前可观察面：`result` / `property outputs` / `anchors` | 当前电路截面：组合输出、寄存器输出、结构可见面 |
| `D` | 仅 stateful 响应阶段；response handle 在这里成立 | 持久状态电路本体继续在后续时钟下响应 |

这里最关键的对齐是：

- `A/C` 在两侧都更像“状态建立与观察截面”
- `B` 在两侧都表达“时间推进”
- `D` 在两侧都只属于 stateful，但 software 用 handle 表达，HDL 用持续存在的状态电路表达

同时还要明确区分两类不同关系：

- `dataflow connection`
- `context inheritance`

在 software 中，这种区分未必总是突出；但在 HDL 中它非常关键，尤其当 `clock/reset`
被视为 structural 传播的 timing context 时更是如此。

## 4. 四种 `LU` 的对照

| LU kind | Software Runtime | HDL Projection | 备注 |
| --- | --- | --- | --- |
| `combinational` | lazy, demand-driven, run-local memoization，可自动并行 | 组合逻辑锥，天然并发 | 两侧语义最对齐 |
| `sequential` | 线性 `steps` 时间线；branch 不进 core | step register / FSM / PC-like lowering | `goBack/return` 适合作为 feature/lowering |
| `stateful` | retained current + `Phase D` response | 寄存器、next-state 逻辑、持续响应 | software handle 在 HDL 中被“电路本体”吸收 |
| `structural` | 结构结果面，不是普通值；可 late-bind outlet | 静态装配、generate/elaboration-time composition、shared context inheritance | runtime reapply 在 HDL 中通常不自然 |

## 5. Port contact 对照

| Contact | Software Runtime | HDL Projection |
| --- | --- | --- |
| `pull` | 可读 current/value | 可读信号值 |
| `push` | 事件/触发/更新入口或出口 | 需要显式 lowering 成 pulse / strobe / valid / handshake |
| `property` | retained-current + notify semantics | 可读寄存器 current；notify 需额外约定 change pulse / valid |

所以：

- `property` 的“current”两侧都自然
- `property` 的“notify”在 HDL 中不应被当成隐式机制，必须显式投影

## 6. `result`、`outputs`、`anchors`

| Surface | Software Runtime | HDL Projection |
| --- | --- | --- |
| `result` | combinational / sequential 的主观察面 | 一个 output 或 output bundle |
| `outputs` | push/property surface | 普通输出信号，必要时附带 event/valid 语义 |
| `anchors` | structural 的主观察面 | 更像静态结构可见面，通常由 elaborated topology 决定 |

这里有一个重要区别：

- software structural 的 `Phase C` 可能返回一个“还可继续应用”的结构结果
- HDL structural 的 `Phase C` 更像“已 elaborated 的结构截面”

## 7. `emit` 与 `handle`

这是两边最容易混淆的地方。

### 在 software 中

- `emit` 是 capability，不是 phase
- delayed emit 不自动推出 `D`
- `D` 只属于 stateful response
- `handle` 也只属于 stateful `D`

### 在 HDL 中

- “发射”必须变成显式信号协议
- 不存在 software 式 callback handle 作为核心语义
- 若 simulator/testbench 有句柄，那是工具句柄，不是 LogicIR 核心语义句柄

## 8. `Closure` 与高阶控制

| 主题 | Software Runtime | HDL Projection |
| --- | --- | --- |
| `Closure` | nested scope，可 run，可作为高阶局部逻辑 | nested module / specialization / inline elaboration |
| sequential branching | 通过高阶 `LUI / closure` 承担 | projector 可生成条件化局部逻辑或 specialization |
| 好处 | 不污染 runtime 主骨架 | 不污染 HDL 时序主骨架 |

这说明你对 sequential 的收敛：

- `steps` 只保留时间线
- 分支交给高阶 `closure`

在 software 和 HDL 两侧都成立，而且两侧都受益。

## 9. Structural 与 timing context

这一点在 HDL 里尤其重要：

- `structural` 不只是“拼结构”
- 它也天然适合表达共享 context

在 software 侧，这个 context 不一定突出。

但在 HDL 侧，这个 context 首先就包含：

- `clock`
- `reset`

因此更准确地说：

- outlet 挂到某个 anchor 下
- 就继承该 anchor 所在 structural subtree 的 timing context
- 顶层 anchor / 父 LUI / 父 scope 负责提供这个 context

所以在 HDL 中应明确区分：

- 业务数据连接
- structural context inheritance

`clock/reset` 属于后者，不应默认当普通数据线处理。

## 10. 哪些东西两侧自然对齐

最自然对齐的部分是：

1. `combinational`
2. `stateful current`
3. `sequential` 的线性时间线
4. `Closure` 作为局部递归 scope
5. `structural` 作为装配/组合语义

这说明四种 `LU` 不是只对 software 有意义，也不是只对 HDL 有意义，而是确实形成了跨 target 的稳定骨架。

## 11. 哪些东西需要 projector / feature 介入

这些主题不适合假装“天然一一对应”：

- async emit
- software subscription object
- runtime structural reapplication
- timing context 的具体 Verilog 端口/域策略
- `push` 的具体握手机制
- `property notify` 的具体硬件编码
- `goBack / return` 的精确定义
- 读取未运行 step 的错误表达方式

这些都更适合由：

- feature contract
- projection profile
- lowering pass
- diagnostic policy

来承接。

## 12. 结论

如果只看实现机制，software runtime 和 HDL 很不一样：

- 一个偏 session / capability / execution context
- 一个偏 module / signal / clock / elaboration

但如果看 LogicIR 主骨架，它们其实共享同一套东西：

- 同一份拓扑
- 同一组 `LU kind`
- 同一组 `A/B/C/D` 解释框架
- 同一组 boundary / structure / fulfillment 关系

因此更准确的结论不是“software 和 HDL 是否相似”，而是：

> LogicIR 已经足够强，可以让 software runtime 和 HDL projection 作为两种非常不同的 realization，共同消费同一份逻辑骨架。
