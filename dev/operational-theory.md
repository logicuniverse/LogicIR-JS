# 工程化理论摘录

这份文档把 [docs/essay.md](../docs/essay.md) 中对工程实现有直接约束力的原则提炼
出来。它不是新的理论来源；如果冲突，以 essay 为准。

## 核心主张

LogicIR 的工程目标不是把代码换一种语法，而是把逻辑拓扑作为可检查、可变换、
可投影、可执行的源对象。代码、运行时、HDL、report、execution plan 和其它宿主
产物都是 projection 或 realization，不是 LogicIR 本身。

LogicIR 面向 AI + 可计算工业时代，但工程文档保持克制：当前任务是建立稳定
schema、validator、examples、projector 和 engine seed，而不是用远期愿景反向驱动
core schema。

## 来源和证据

- `docs/essay.md` 是理论源头。
- `packages/core` 和 `packages/architecture` 是当前已接受 TS authoring source。
- `packages/legacy/engine`、`packages/legacy/flow-runtime-core` 和
  `packages/legacy/flow-core` 只作为历史实现证据，不是 schema authority。
- `ai/tasks/` 是自动化探索素材，不是正式设计来源。

## 既有生态

LogicIR 不要求世界重写。现有 JS/TS、Python、C/C++、HDL、服务、数据库、UI node、
测试和部署工具可以通过 provider、external target、adapter、fixture 和 projection
接入。

策略：

```text
wrap first
-> replicate when useful
-> replace only with clear value and verification
```

## Logic Unit 模型

LogicIR 的核心对象围绕：

- **LU**: 逻辑单元。当前工程中通常指一个 root `LogicUnit`。
- **LUI**: 当前 Core Scope 内的逻辑单元实例。
- **Core Scope**: 一份 `LUCore` 的局部规则上下文。它可以是 root
  `LogicUnit.core`，也可以是任意 `Closure.core`。
- **X / boundary**: unit-level boundary drive 和端口接触方式。
- **Y / organization**: LU kind organization。
- **Z / requirement fulfillment**: requirement、closure、upstream supplier 和
  fulfillment relation。

## X：Boundary Contact

端口 contact 是边界能力，不是新的 X 轴方向：

- `pull`: 可被读取。
- `push`: 可接收或发出事件/更新。
- `property`: retained-current reactive contact，可读取当前值，并在更新时通知。

`property` 的基本语义是运行内 current / register-like current，不是默认跨运行持久化。
外置 store 可以实现跨运行保存，但那是 runtime realization，不是 core 语义。

## Y：LU Kind Organization

Runtime、projector、compiler 必须先按 `LUCore.kindOrganization.kind` 分派。不能把
`LUCore.luis` 默认拍平成 eager node list。

- `combinational`
  - 同步 lazy computation。
  - 端口 surface 只有 `inputs + result`。
  - 不应有普通 output；result 默认是 whole result，需要 demux/tuple-like surface
    时才声明 pins。
- `sequential`
  - pipeline / step list。
  - core 只保存 `steps: { luiId }[]`。
  - async/await、go-back、return、branch、guard 等属于 feature/lowering/runtime
    realization，不进入 core step 字段。
  - sequence result 是 pull，但可以被外部锁存；sequence 不应有其它 pull output。
- `stateful`
  - 运行内 retained current / state。
  - 常见 property pattern：一个 `pull` input 提供 initial value，若干 `push`
    inputs 表达更新，一个 `property` output 暴露 current。
  - stateful LUIs 之间默认不表达时序差异；如果存在顺序，应使用 sequential。
- `structural`
  - 产生 composition / elaboration result。
  - anchors、outlets、fills 表达结构组合；不是普通 provider list execution。
  - property input 与 structural LUI 很搭配，可类比前端 props。

上述 baseline 是当前工程解释，不是唯一实现算法。任何替代 execution、projection、
flattening 或 lowering 必须显式声明 strategy，并验证语义保留。

## Z：Requirement / Fulfillment

Z 轴表达 dependency 和 requirement fulfillment，不是普通 dataflow、参数传递、
命名查找、callback 或 ambient context。

- LUI target 可以指向 requirement。
- Fulfillment 说明某个 requirement service/unit 由 closure 或 upstream supplier
  满足。
- 如果 LUI 的 target 是 requirement，而目标 unit 自身没有 requirements，则该
  LUI 的 `fulfillments` 应为空；target 供应选择不能误塞进 LUI 内部 dependency
  fulfillment。
- Closure、requirement、fulfillment 是 core/Z-axis 概念，不需要 software feature
  gate 才能表达。

## Closure

Closure 是嵌套的 LogicIR core scope。它不是 host language closure，也不是运行时
callback。Closure 内部继续使用相同的 endpoint、connection、kind organization 和
requirement/fulfillment 规则。

Closure 可以用于 requirement fulfillment，也可以作为结构化 authoring、封装和复用的
边界。

## Composition Direction

普通 data connection 使用：

```text
from source endpoint -> to destination endpoint
```

Structural composition 使用几何约定：

```text
outlet source -> anchor destination
```

LU/LUI 可以各自有 anchors/outlets；内外接口可通过 LUI 隔离和转换，避免把内部使用形态
和外部表现形态强行等同。

## Core / Feature / Projection

- Core 只放 target-neutral topology semantics。
- Feature / extension 放 target、runtime、tool 或 domain 附加约束。
- Profile / stack 属于 architecture 层兼容契约，不属于 core object model。
- Projector、compiler、engine 必须声明支持的 core version、features、LU kinds、
  fulfillment forms 和 target constraints。
- 无法保持语义时必须 diagnostic、profile rejection 或显式 lowering，不能静默降级。

## AI 协作原则

LogicIR 的长期价值不是让 AI 直接写更多目标代码，而是让 AI 在受约束的语义结构中提交
小步、原子、可验证的 edit transaction。

当前工程规则：

- IR / feature / extension 数据结构由人类主写和决策。
- AI 可以在对话中辅助分析、对照、草案和局部编辑。
- AI task 不自动制定高自由度语义；只在规则明确后做低自由度生成、验证、wrapper、
  coverage 或工具探索。
