# LogicIR Workspace Docs

这个目录是人与 AI 共同使用的操作层文档区，用来沉淀设计计划、交接记录和协作规则。

[../essay.md](../essay.md) 是理论源头，描述 LogicIR 的核心模型。`docs/workspace/` 不替代 essay，而是把理论同步到代码过程中的计划、约束和交接记录保存下来。

## 文档分类

- [shared-rules.md](shared-rules.md): 人与 AI 都要遵守的共同规则。
- [operational-theory.md](operational-theory.md): 从完整 essay 提取出的工程执行版理论。
- [schema-principles.md](schema-principles.md): 新 schema 的理论来源、旧实现定位和 projection target 约束。
- [plans/](plans/): 设计计划目录。重大 schema、API、运行时语义或投影语义调整先在这里写清楚。
- [handoffs/](handoffs/): 交接目录。用于让后续的人或 AI 不依赖聊天上下文继续工作。
- [explorations/](explorations/): 探索材料目录。用于保存阶段性草案、自动生成素材、成果地图和开放问题，不作为最终规范源。
- [skills/logicir-schema-designer/](skills/logicir-schema-designer/): 可复用的 LogicIR schema/projection 设计 skill 源目录。

## 使用规则

1. 涉及 LogicIR 理论同步的工作，先阅读 [../essay.md](../essay.md)。
2. 涉及 schema、projection 或 runtime 设计时，先阅读 [operational-theory.md](operational-theory.md) 和 [schema-principles.md](schema-principles.md)。
3. 改代码前先确认是否需要设计计划。重大结构变更必须先写计划。
4. 工作中形成的关键决策、风险和未决问题要落到计划或 handoff 中。
5. 未经人工确认的自动生成草案先归档到 explorations，作为后续互动素材，不直接启用为 schema 或 projection 文件。
6. 文档记录事实、决策和下一步，不记录一次性闲聊。
7. 实现完成后记录验证方式。无法验证时写明原因。
