# Software Runtime Model

这份文档只讨论 software interpreter 视角下，`LU`、`Closure`、`LUI` 应当如何
运行，以及 runtime interface 应该长什么样。

它不是 core schema 本身；它描述的是一种面向 software target 的 realization
模型。若与 essay、`schema/` 或 `packages/core` 的已接受语义冲突，以后者为准。

## 1. 目标

这份文档解决三个问题：

1. `LU`、`Closure`、`LUI` 各自是不是运行单位。
2. `run`、`manifest`、`read`、`push`、`apply` 之间分别是什么关系。
3. software interpreter 的最小统一接口应该收敛成什么样，而不把旧
   software-runtime 细节误当成 core 语义。

## 2. 基本判断

### 2.1 `LU` 和 `LUI` 都有 `run` 概念

认定：

- `LU` 有 `run` 概念。
- `LUI` 也有 `run` 概念。
- `Closure` 也应当被看作一个可运行的局部 core scope。

但三者的粒度不同：

- `LU.run`
  - 打开一次 root core scope 的运行 session。
  - 它代表“这一次对该逻辑单元的求值/执行/组合”。
- `Closure.run`
  - 打开一次嵌套 core scope 的运行 session。
  - 它与 root LU 遵守同样的局部规则，只是边界不同。
- `LUI.run`
  - 在某个已打开的 core scope session 中，运行一个局部单元实例。
  - 它不是独立世界；它运行时总处于某个 LU 或 Closure 的 session 内。

因此，`LU / Closure / LUI` 并不是同一种对象，但都可以说“有 run”。

### 2.2 `manifest` 和 `run` 的关系

建议区分三个层次：

- `manifest`
  - 把一个 schema object 变成可复用的 runtime runner / factory。
  - 它本身不是一次具体运行，也不应承载某次运行的 current。
- `run`
  - 由 runner / factory 执行一次 LU run。
  - 这次 run 至少覆盖 `Phase A/B/C`。
  - 对 `stateful LU` 而言，run 在 `Phase C` 之后还会建立 `Phase D` 响应阶段。
- `handle`
  - `stateful LU` 的 `Phase D` 对应的 response handle。
  - 它不代表所有 post-return 行为；它只代表 retained-current 响应阶段。
  - 它承载后续 `push` 响应、property 更新和相关 subscription。

可以理解为：

```text
schema object
-> manifest runner/factory
-> run A/B/C
-> if stateful, enter D
-> maybe get one stateful response handle
```

因此：

- 同一个 runner 可以多次 `run`
- 没有 `Phase D` 时，`Phase C` 返回后本次 run 就结束，不需要长期 handle
- 只有 `stateful` 进入 `Phase D` 时，才需要 response handle

如果未来 API 不想同时暴露 `manifest` 和 `run` 两个词，也至少要保留这个分层：

- 可复用的上层对象
- 一次 `A/B/C` run
- 可选的 stateful `D`-handle

## 3. Core Scope 是统一运行上下文

software interpreter 不应把 root `LU` 和 `Closure` 看成两套不同规则。

二者都只是一个 `Core Scope`：

- 有本地 `ports`
- 有本地 `connections`
- 有本地 `luis`
- 有本地 `closures`
- 有本地 requirement / fulfillment rule
- 有本地 kind organization

因此 interpreter 应把 root LU 和 Closure 都收敛成同一种 scope runtime。

可用术语：

- `ScopeRuntime`
- `CoreScopeRuntime`

而不是：

- “LU runtime 一套，closure runtime 另一套”

## 4. 统一模型：Scope run + LUI run

推荐 software runtime 采用两层统一模型。

### 4.1 Scope 层

scope runtime 负责：

- 保存本次 session 的 boundary current
- 解析 connection
- memoize 本次 session 内已经求值过的 LUI result
- 管理本次 session 内的 stateful child instance
- 解析 closure fulfillment
- 暴露 boundary read / push / structural apply 等入口

### 4.2 LUI 层

LUI runtime 负责：

- 在当前 scope session 中运行某一个 LUI
- 根据 `lui.kind` 采用不同语义
- 必要时向上游继续读取依赖
- 必要时向下游发出 push / property 更新

所以不应把 interpreter 想成：

```text
run whole LU eagerly
```

而应想成：

```text
open one scope session
-> when demanded, run related LUI lazily or stepwise
```

## 5. LU Run Phase Model

从 software interpreter 角度，一个 LU run 更准确地说包含 `A/B/C` 三个通用 phase，
以及一个只属于 `stateful` 的 `Phase D`：

- `Phase A`
  - 执行当前 scope 内所有 stateful LUIs。
  - 目的不是“读 result”，而是建立和刷新 retained current，使后续 phase 可以观察到
    当前 state。
  - 它很像 Arduino / Processing 中的 `setup`，但更准确地说是 session-scoped
    setup：它属于一次 LU session 的前置阶段，而不是必然只发生一次的进程级初始化。
- `Phase B`
  - 按 `steps: { luiId }[]` 的顺序执行当前 scope 内的 sequential LUIs。
  - 这是显式 schedule phase。
- `Phase C`
  - 读取当前 LU 对外暴露的可观察 surface。
  - 不同 kind 的 LU，Phase C 读取的 surface 不同：
    - combinational / sequential: `result`
    - stateful: `property outputs`
    - structural: `anchors`
- `Phase D`
  - `stateful LU` 在 `Phase C` 之后的响应阶段。
  - 它只负责 retained current / property 的后续响应，不负责泛化所有延后发射。
  - `handle` 对应的正是这个 phase，而不是 `A/B/C` 本身。

可以概括为：

```text
Phase A: run all stateful LUIs in scope
Phase B: run sequential LUIs by declared step order
Phase C: read the LU's observable boundary/structural surface
Phase D: stateful-only response phase after the initial observation
```

不同 kind 的 LU 由不同 phase 组成：

- `combinational`: `C`
- `sequential`: `A + B + C`
- `stateful`: `A + C + D`
- `structural`: `A + C`

这里的重点是：

- phase model 说的是“一个 LU run 的总执行结构”
- 它不否认某些 phase 内部还会发生 lazy read、memoization 或局部递归求值
- 但从整体语义上，stateful current 的建立优先于最终 surface 的读取
- sequential step execution 也是独立 phase，而不是纯 demand-driven pull 的副产品
- `Phase C` 负责产出初始可观察面
- `Phase D` 只负责 stateful 响应
- 普通 `emit` 不是一个 phase，而是 execution context 中可传递、可延后使用的 capability

从解释结构上看，这里还形成了一组很有价值的对照：

- `A / C` 更接近与时间弱相关的状态建立与观察截面
- `B / D` 更接近与时间强相关的推进与响应

因此 `A/B/C/D` 不是任意切分，而是一组静态截面与时间演化相互对照的对称结构。

## 6. Combinational

### 6.1 `Combinational LU`

`combinational LU` 只包含 `Phase C`。

它的外部触发动作是读取 boundary `result`。

更精确地说：

1. 调用 `LU.run()` 或等价入口，开启一次 combinational run。
2. 读取 boundary `result`。
3. interpreter 从 `result` 对应 endpoint 逆依赖追溯上游 source。
4. 当追溯到某个 `LUI.result` 时，才触发该 `LUI.run(...)`。
5. 该 `LUI.run(...)` 再按需读取自己的输入，于是继续向上游追溯。
6. 一直追到外部 input、常量或其它不需要继续展开的边界。
7. 本次 run 中每个 LUI 应 memoize，避免重复运行。

这意味着 combinational 的本质是：

- demand-driven
- lazy
- reverse dependency read
- run-local memoization

在 realization 层，只要不改变语义，`combinational LU` 还天然适合自动并行：

- runtime 可以根据依赖树 / 依赖 DAG 分析独立子树
- 对彼此无依赖的 demand frontier 做并行求值
- 在 join 点再汇合结果

这属于 realization optimization，不属于 core contract。也就是说：

- core 不要求必须并行
- core 也不要求必须串行
- 只要求并行 realization 不得改变 combinational 语义

### 6.2 `Combinational LUI`

`Combinational LUI.run` 不应被理解成一个长期存活对象的生命周期动作。

它更像：

- 在当前 scope session 中
- 对某个 LUI 的一次局部求值
- 产出 `result`

它可以是：

- “给它准备好的 inputs，直接算出 result”

也可以是：

- “给它一个 input reader，它按需读取输入再算 result”

在 software interpreter 里，后者通常更贴近 lazy pull model。

### 6.3 不要引入不必要 lifecycle

combinational 不应默认有：

- initialize
- setup/teardown
- subscribe lifecycle
- background retained state

它的核心语义就是一次只读求值 run，在 `Phase C` 返回后即结束，不需要 `Phase D`
handle。

即使实现体拿到了 `emit` capability，也不因此引入 `Phase D`；普通发射仍可被理解为
run context 参数的使用，而不是 retained-state 响应阶段。

## 7. Sequential

### 7.1 `Sequential LU`

`sequential LU` 包含 `Phase A + Phase B + Phase C`。

基础模型：

1. 开启一次 sequential scope session。
2. `Phase A`: 先执行所有 stateful LUIs，建立本次 session 可见的 current。
3. `Phase B`: 按 `steps: { luiId }[]` 的顺序依次触发相关 `LUI.run(...)`。
4. 每一步可以读取当前 inputs、已有 current、以及前面步骤造成的可见变化。
5. `Phase C`: 最后读取 boundary `result`，或把 boundary push outputs 视为运行中产生
   的可观察事件。

在当前 seed API 中，建议再收紧一步：

- `sequential` 的 root / closure scope 应显式调用 `run()` 完成 `A + B + C`
- 不把 `readResult()` 当作 sequential 的执行入口
- `readResult()` 更适合作为 `combinational` 的 demand-read helper

当前 core 只保证：

- 有 step order

并建议把它理解成：

- `steps` 只表达线性时间线，不表达 branch graph 或 loop graph
- sequential 自身不分叉；所有分支通过高阶 `LUI` / `closure` 实现
- 因此 `steps` 表示“执行时间点序列”，而不是一般控制流图

不自动保证：

- async
- await
- branch
- loop back
- suspension

这些都属于更高层 feature 或 target realization。

即使 future sequential feature 允许 async / delayed emit，这也不自动引入 `Phase D`。
更自然的理解是：计算体拿到了一个 `emit` capability，可以同步或异步使用它；这属于
execution contract，而不是 stateful response phase。

如果未来增加控制 feature，建议遵守以下规则：

- `goBack`
  - 可以把执行游标返回到某个已存在的 step 时间点
  - 但必须清除该 step 及其之后建立的 latch/current/cache 等内部运行状态
- `return`
  - 可以提前结束当前时间线
- `read unrun step`
  - 读取尚未运行到的 step 结果应视为错误，而不是 `undefined`

这里尤其要强调：

- `goBack` 清除的是当前 LU run 内部、可由 sequential runtime 控制的时间痕迹
- 已经逃逸到外部世界的 effect 不应被假定自动回滚

因此，相比在 core sequential 中直接内建 branch/loop graph，更推荐：

- core 保持线性 `steps`
- 控制复杂度通过高阶 `LUI` / `closure` 承担
- `goBack` / `return` 作为后续 feature 或 lowering/runtime contract 引入

### 7.2 `Sequential LUI`

在 sequential scope 中，`LUI.run(...)` 的语义是：

- 被 step scheduler 显式触发
- 在当前 step 上读取它需要的输入/current
- 产出 result 或 side effect

因此 sequential 的“触发”不是 demand-only，而是 schedule-driven。

## 8. Stateful

### 8.1 `Stateful LU`

`stateful LU` 包含 `Phase A + Phase C + Phase D`。

它的关键不在“读一次 result”，而在“维护 current 并响应更新”。

常见模式：

- 一个或多个 `pull` input 提供 initial current
- 一个或多个 `push` input 提供更新事件
- 一个或多个 `property` output 暴露 retained current

因此：

- `Phase A` 建立或刷新 current
- `Phase C` 读取对外可观察的 `property outputs`
- `Phase D` 在 `Phase C` 之后继续保持 live，使后续 `push`、property 更新和发射成为
  可能

因此，stateful 的真正 runtime handle 也正是在 `Phase D` 中成立。

这里的 `Phase D` 不等于“任意晚于返回的动作”，而是专指 retained current 继续响应。

### 8.2 `Stateful LUI`

`Stateful LUI.run(...)` 不能只理解成一次纯函数求值。

更贴切的理解是：

- manifest 一个 child instance handle
- 由该 handle 保存 retained current
- `push` 输入驱动 current 更新
- `property` 输出暴露 current，并在更新时通知

所以 stateful 更接近：

```text
manifest child instance
-> initialize current
-> receive pushes / refresh pulls
-> emit property or push outputs
```

这也是为什么 stateful 比 combinational 更自然地需要 response handle。

## 9. Structural

### 9.1 核心纠正

structural 的 `outlet` 不应被简单视为 scope 普通输入。

旧实现证据表明，structural/composable 的结果更像：

- 先生成一个 composition handle / template / continuation
- 再由外部提供 outlet material

旧代码中的 `ComposableReturn` 实际是：

```text
context -> composableInputs -> value
```

也就是说，在旧 JS/TS realization 里，structural result 往往直接表现为一个
“接收 outlet/component inputs 的函数”。

因此 structural 应拆成两个阶段：

1. 运行 structural scope，生成 structural result handle
2. 再对该 handle 提供 outlet values，完成 materialization / application

### 9.2 `Structural LU`

`structural LU` 通常包含 `Phase A + Phase C`。

`Structural LU.run(...)` 不应直接等同于“得出最终 rendered value”。

更准确地说，它应当：

- `Phase A`: 先执行 scope 中所有 stateful LUIs，建立 structural 计算可见的 current
- `Phase C`: 读取 `anchors` 作为当前 LU 的 structural observable surface
- 在当前 scope 中解析 internal structural LUI
- 解析 anchor fills / lui fills
- 产出一个 late-bound structural handle

这个 handle 之后再接收：

- outlet values

从而产出最终 materialized result。

因此可以同时接受两种表述，但要知道它们描述的是同一件事的不同抽象层：

- 从旧 JS/TS realization 看：它常常是一个 outlet function
- 从更一般的 software model 看：它是一个 late-bound structural handle

structural 的 late outlet application 不属于 `Phase D`。它更接近 `Phase C` 结果的一部分：

- `Phase C` 返回的可能不是最终宿主值，而是一个可继续 `applyOutlets(...)` 的 structural
  result
- 这描述的是 structural result surface，而不是 stateful response handle

### 9.3 `Structural LUI`

`Structural LUI.run(...)` 应当：

- 读取普通 `inputs`
- 接收已解析的 `anchors`
- 产出自己的 `outlets`

但这里的“产出 outlets”不要误解成“立刻得到最终宿主对象”。

更准确说，它产出的是 structural contribution surface，供更高层组合继续使用。

### 9.4 当前 API 偏差

因此，类似下面这种软件接口：

- `setOutletValue(...)`

很容易把 structural outlet 误建模成 setup input current。

更贴切的接口应更像：

- `readStructure()`
- `applyOutlets(...)`
- `materialize(...)`

即：

```text
run structural scope
-> get structure handle
-> apply outlets
-> obtain final materialized value
```

## 10. Closure

`Closure` 不是 host callback，也不是普通 provider invocation。

在 software interpreter 里，它应被视为：

- 一个嵌套的 core scope
- 可以被 manifest
- 可以被 run
- 有自己的 boundary、connections、luis、closures

因此 closure 的运行接口应尽量与 root LU 对称。

建议不要把 closure 单独特判成“某个 target runtime 的特殊函数参数”。

更自然的方式是：

- `runClosure(closureId, boundarySetup)`
- 或直接把 closure manifest 成一个 nested `ScopeRuntime`

## 11. 接口收敛建议

下面不是最终 TS API，只是语义上建议收敛出的最小接口层次。

### 11.1 Scope manifest

```ts
type ScopeRunner = {
  kind: 'combinational' | 'sequential' | 'stateful' | 'structural';
  run: (setup?: ScopeSetup) => ScopeRunResult;
};
```

### 11.2 Scope run result

```ts
type ScopeRunResult = {
  initialObservation: unknown;
  handle?: StatefulResponseHandle;
};
```

这里：

- `initialObservation` 对应 `Phase C`
- `handle` 只在 `stateful` 进入 `Phase D` 时存在
- 当前 seed 故意保持这个结果类型较薄，不在类型层面对不同 `kind` 做完全判别式细分

### 11.3 Stateful response handle

```ts
type StatefulResponseHandle = {
  pushInput(key: string, value: unknown): void;

  readOutput(key: string): unknown;
  subscribeOutput(key: string, listener: (value: unknown) => void): () => void;
};
```

这里最重要的是分清三类动作：

- `Phase C` 的初始观察结果
- `Phase D` 的 stateful response 能力
- 与 phase 无关的 `emit` capability

并且当前 seed 已经明确区分：

- `readOutput(...)` 只面向可读 current 的 `property` output
- `push` output 只能通过 connection / `subscribeOutput(...)` 观察
- `push` output 不应被当成 retained current 来读取

对于没有 `Phase D` 的 run：

- `run(...)` 只需要返回 `initialObservation`
- 不需要长期 response handle

对于当前 seed：

- `setInputCurrent(...)` 仍属于 runner / session setup surface，而不属于 `StatefulResponseHandle`
- `applyOutlets(...)` 也属于 structural result surface 的补全动作，而不属于 `Phase D`

对于 structural：

- `applyOutlets(...)` 更自然地属于 `initialObservation` 的 structural result surface
- 它不属于 `Phase D` handle
- 当前 seed 已开始把 structural `run().initialObservation` 收敛成一个 late-bound
  surface，而不是直接把某个 anchor 的 materialized 值当作 run 返回值

### 11.4 LUI run context

```ts
type LUIRunContext = {
  readInput(key: string): unknown;
  emitOutput(key: string, value: unknown): void;
  readAnchor?(key: string): unknown;
};
```

然后不同 kind 的 `LUI.run(...)` 再使用这份上下文。

关键不是 TS 类型长什么样，而是：

- combinational LUI 是 demand-read
- sequential LUI 是 scheduled-step
- stateful LUI 是 retained instance
- structural LUI 是 structure producer
- `emitOutput` 是 capability，不是 phase

## 12. 当前 `core-software-interpreter` 的主要偏差

以当前 seed 而言，最值得继续收敛的点有：

1. nested LU / closure 已经开始按 nested scope 自身的 `Phase C initialObservation`
   读取，而不是一律强压成 `readResult()`；closure owner endpoint 也已经具备 direct
   scope `input/result` 与 forwarded `push output` 的基本 runtime 路径。
2. stateful child instance 的 lifecycle 仍偏向旧 software runtime，而不是更薄的 core realization。
3. structural 的 API 已经开始回到 late-bound surface，但内部仍靠 runner-level
   `outletValues` map realization，距离旧 composable 路径还有差距。
4. root LU 与 closure 还没有真正收敛到同一种 scope runtime。
5. `LUI.run(...)` 还没有被抽象成统一语义接口，而是散落在 interpreter 内部。
6. `Phase A/B` 已经在 seed 中显式化，但 `run()` 与 `read*()` 入口之间仍有一部分重复调度逻辑。
7. `handle` 已经收敛为仅 stateful `Phase D` 才成立，但 runner 仍同时承载 setup、read、
   push、subscription 等多类职责，session 边界还可以继续做薄。

## 13. 当前建议

在继续实现之前，建议先接受以下工程判断：

1. `LU`、`Closure`、`LUI` 都有 run 概念，但粒度不同。
2. software interpreter 的统一对象应是 `Core Scope Runtime`，root LU 和 closure 对称。
3. combinational 是 lazy read session。
4. sequential 是 step-scheduled session。
5. stateful 是 retained instance + current update + `Phase D` response。
6. structural 是 structure handle + late outlet application。
7. `outlet` 不是普通 input。
8. `handle` 只在 stateful 的 `Phase D` 成立；没有 `Phase D` 时，`Phase C` 返回就结束。
9. `emit` 是 capability，不是 phase；delayed emit 不自动推出 `Phase D`。
10. 对当前 `core-software-interpreter` seed，默认优先沿用旧 runtime 的可运行执行路径；
    只有在收益明确时，才偏离旧实现做新的 realization 结构。

在此基础上，再回头改 `packages/engines/core-software-interpreter` 的 API，会比继续局部补丁更稳。
