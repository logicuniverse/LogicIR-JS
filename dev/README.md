# LogicIR 开发文档

这个目录是 LogicIR 项目的内部开发文档区，用来沉淀工程化理论、设计计划和人+AI 协作规则。

[`docs/essay.md`](../docs/essay.md) 是理论源头，描述 LogicIR 的核心模型。`dev/` 不替代 essay，而是把理论同步到代码过程中的计划、约束和交接记录保存下来。

## 文档分类

- [handoff.md](handoff.md): 新 AI 会话或新协作者的当前状态交接入口。
- [shared-rules.md](shared-rules.md): 人与 AI 都要遵守的共同规则。
- [operational-theory.md](operational-theory.md): 从完整 essay 提取出的工程执行版理论。
- [schema-principles.md](schema-principles.md): 新 schema 的理论来源、历史实现边界和 projection target 约束。
- [logicir-architecture.md](logicir-architecture.md): LogicIR document、feature、profile、stack、projection 和 execution 的生态架构说明。
- [roadmap.md](roadmap.md): LogicIR feature、profile、stack、tool、projector、engine 和 provider 的项目级路线图。
- [plans/](plans/): 设计计划目录。重大 schema、API、运行时语义或投影语义调整先在这里写清楚。
- [`../ai/skills/logicir-schema-designer/`](../ai/skills/logicir-schema-designer/): 可复用的 LogicIR 设计 skill 源目录。它是自包含发布源，可以重复少量核心规则；普通开发规则以本目录前几篇文档为准。

## 阅读路线

1. 新会话交接先读 [handoff.md](handoff.md)。
2. 通用协作规则读 [shared-rules.md](shared-rules.md)。
3. 理论到工程实现的映射读 [operational-theory.md](operational-theory.md)。
4. schema、feature、projection 或 runtime 设计读 [schema-principles.md](schema-principles.md)。
5. profile、stack、provider、execution binding 等生态概念读 [logicir-architecture.md](logicir-architecture.md)。
6. AI 协同编辑、partial IR、edit transaction 和可验证 authoring 前景读
   [operational-theory.md](operational-theory.md) 与
   [logicir-architecture.md](logicir-architecture.md) 的相关章节。
7. 项目对象清单和阶段优先级读 [roadmap.md](roadmap.md)。
8. 重大变更的实施计划写入 [plans/](plans/)；AI 全自动探索写入 [`../ai/tasks/`](../ai/tasks/)。
