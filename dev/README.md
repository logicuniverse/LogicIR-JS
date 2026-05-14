# LogicIR Development Docs

这个目录是 LogicIR 项目的内部开发文档区，用来沉淀工程化理论、设计计划、交接记录和人+AI 协作规则。

[`docs/essay.md`](../docs/essay.md) 是理论源头，描述 LogicIR 的核心模型。`dev/` 不替代 essay，而是把理论同步到代码过程中的计划、约束和交接记录保存下来。

## 文档分类

- [shared-rules.md](shared-rules.md): 人与 AI 都要遵守的共同规则。
- [operational-theory.md](operational-theory.md): 从完整 essay 提取出的工程执行版理论。
- [schema-principles.md](schema-principles.md): 新 schema 的理论来源、旧实现定位和 projection target 约束。
- [logicir-architecture.md](logicir-architecture.md): LogicIR document、feature、profile、stack、projection 和 execution 的生态架构说明。
- [plans/](plans/): 设计计划目录。重大 schema、API、运行时语义或投影语义调整先在这里写清楚。
- [handoffs/](handoffs/): 交接目录。用于让后续的人或 AI 不依赖聊天上下文继续工作。
- [skills/logicir-schema-designer/](skills/logicir-schema-designer/): 可复用的 LogicIR schema/projection 设计 skill 源目录。

## 使用规则

1. 涉及 LogicIR 理论同步的工作，先阅读 [`docs/essay.md`](../docs/essay.md)。
2. 涉及 schema、projection 或 runtime 设计时，先阅读 [operational-theory.md](operational-theory.md) 和 [schema-principles.md](schema-principles.md)。
3. 改代码前先确认是否需要设计计划。重大结构变更必须先写计划。
4. 工作中形成的关键决策、风险和未决问题要落到计划或 handoff 中。
5. 未经人工确认的全自动 AI 工作只能写入根目录 `ai/tasks/` 下的任务子目录；经人工整理后，才可以晋升到正式项目目录。
6. 文档记录事实、决策和下一步，不记录一次性闲聊。
7. 实现完成后记录验证方式。无法验证时写明原因。
