# LogicIR 开发文档

这个目录是 LogicIR 项目的内部开发文档区，用来沉淀工程化理论、变更提案和人+AI 协作规则。

[`docs/essay.md`](../docs/essay.md) 是理论源头，描述 LogicIR 的核心模型。`dev/` 不替代 essay，而是把理论同步到代码过程中的变更提案、约束和交接记录保存下来。

## 语言约定

`dev/` 和 [`../ai/`](../ai/) 下的项目协作文档默认使用中文。正式源码、package、schema、面向用户的 `docs/`、examples、fixtures 等目录继续使用英文，除非目标读者明确需要中文。

## 文档分类

- [handoff.md](handoff.md): 新 AI 会话或新协作者的当前状态交接入口。
- [shared-rules.md](shared-rules.md): 人与 AI 都要遵守的共同规则。
- [process.md](process.md): 开发节奏、AI task、roadmap round、审阅和晋升操作规程。
- [operational-theory.md](operational-theory.md): 从完整 essay 提取出的工程执行版理论。
- [schema-principles.md](schema-principles.md): 新 schema 的理论来源、历史实现边界和 projection target 约束。
- [logicir-architecture.md](logicir-architecture.md): LogicIR document、feature、profile、stack、projection 和 execution 的生态架构说明。
- [feature-catalog.md](feature-catalog.md): 已确认和近期需要沉淀的 feature 方向。
- [roadmap.md](roadmap.md): 当前确定推进的 stack、tool、projector、engine、fixture 和 AI task 进度路线图。
- [long-term-vision.md](long-term-vision.md): 不确定的中长期愿景、研究分支和 architecture pressure tests。
- [changes/](changes/): 重大变更提案目录。借鉴 OpenSpec 的 proposal / design / tasks / spec-delta 形状，但不引入外部工具。
- [`../ai/skills/logicir-schema-designer/`](../ai/skills/logicir-schema-designer/): 可复用的 LogicIR 设计 skill 源目录。它是自包含发布源，可以重复少量核心规则；普通开发规则以本目录前几篇文档为准。

## 阅读路线

1. 新会话交接先读 [handoff.md](handoff.md)。
2. 通用协作规则读 [shared-rules.md](shared-rules.md)。
3. 开发流程和晋升规则读 [process.md](process.md)。
4. 理论到工程实现的映射读 [operational-theory.md](operational-theory.md)。
5. schema、projection 或 runtime 设计读 [schema-principles.md](schema-principles.md)。
6. feature 方向读 [feature-catalog.md](feature-catalog.md)。
7. profile、stack、provider、execution binding 等生态概念读 [logicir-architecture.md](logicir-architecture.md)。
8. 当前阶段优先级和进度读 [roadmap.md](roadmap.md)。
9. 不确定中长期方向读 [long-term-vision.md](long-term-vision.md)。
10. 重大变更先开 [changes/](changes/)；AI 全自动探索写入 [`../ai/tasks/`](../ai/tasks/)，晋升前再收窄为 change。
