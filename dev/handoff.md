# 新会话交接

这份文档是新 AI 会话或新协作者的快速入口。目标是不用依赖聊天上下文，也能继续当前工作。

## 必读顺序

1. [README.md](../README.md): 仓库结构和 package 边界。
2. [dev/process.md](process.md): 当前开发流程、AI task 边界、review/promotion 规则。
3. [dev/roadmap.md](roadmap.md): 当前确定路线。
4. [dev/schema-principles.md](schema-principles.md): core/schema/projection 约束。
5. [dev/operational-theory.md](operational-theory.md): 工程化理论摘要。
6. [dev/logicir-architecture.md](logicir-architecture.md): profile、stack、provider、
   execution 等生态术语。

需要 AI task 证据时再读 [ai/tasks/material-index.md](../ai/tasks/material-index.md)。

## 当前状态

- `packages/core` 是当前 core schema 的 TS authoring source。
- `packages/architecture` 是 architecture definition 的 TS authoring source。
- `packages/features/type-system` 和 `packages/tools/type-system` 是已启动的 type-system seed。
- `schema/` 是语言无关 specification surface，不是主要 authoring source。
- `ai/tasks/` 是自动化输出和证据区，不是正式实现。
- `dev/changes/` 已收窄为人类粗粒度 review/decision 记录；默认只需要 `review.md`。

## 当前工作方向

先做 **core-only examples**，暂不引入 feature：

1. combinational add。
2. stateful counter。
3. sequential pipeline。
4. structural UI/DOM。
5. multi-LUI core composition。
6. Z requirement + closure。

这些 examples 现在通过正式 package
`packages/engines/core-software-interpreter/` 统一 build/run，用来校准当前 IR 本身；
不再让每个 example 自己临时手写执行逻辑。旧 `basic-software-interpreter` S1-S5
不再作为直接 promotion 来源，只作为误差分析和历史 evidence。

## 关键规则

- IR / feature / extension 数据结构由人类主写和决策；AI 只在对话中辅助。
- AI task 不制定高自由度语义；它适合在规则固定后做 examples、fixtures、
  wrappers、coverage、validator/type-system 等低自由度工作。
- `dev/` 面向人类，应保持短、稳定、决策导向。
- `ai/` 面向 AI 和自动化 review，可以保存详细证据、日志、长 checklist 和
  material index。
- 旧代码是 evidence，不是 schema authority。
- 正式变更必须最小化，不能整包 promotion AI task。

## 下一步

最自然的下一步是继续扩展 `examples/core-only/` 和
`packages/engines/core-software-interpreter/`：在已落地的 combinational add /
stateful counter / sequential pipeline / structural UI/DOM 基础上，继续补
multi-LUI 与 Z-axis 最小例子。
