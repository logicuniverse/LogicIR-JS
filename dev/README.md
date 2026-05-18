# LogicIR 开发文档

`dev/` 面向人类协作者，保存短、稳定、决策导向的开发规则和当前路线。详细证据、
长 checklist、自动化输出和失败尝试放在 [`../ai/`](../ai/)。

## 语言约定

`dev/` 和 `ai/` 下的项目协作文档默认使用中文。正式源码、package、schema、面向用户的
`docs/`、examples、fixtures 等目录继续使用英文，除非目标读者明确需要中文。

## 阅读路线

1. [handoff.md](handoff.md): 新会话快速入口。
2. [process.md](process.md): 开发流程、AI task 边界、review/promotion 规则。
3. [roadmap.md](roadmap.md): 当前确定路线。
4. [schema-principles.md](schema-principles.md): schema / feature / projection 约束。
5. [operational-theory.md](operational-theory.md): 工程化理论摘要。
6. [logicir-architecture.md](logicir-architecture.md): profile、stack、provider、
   execution 等生态术语。
7. [feature-catalog.md](feature-catalog.md): feature 状态和候选方向。
8. [long-term-vision.md](long-term-vision.md): 不确定中长期 pressure tests。
9. [changes/](changes/): 粗粒度人工 review / decision 记录。

## 当前原则

- IR / feature / extension 数据结构由人类主写和决策。
- AI task 不自动制定高自由度语义；它用于规则明确后的低自由度执行或工具探索。
- 当前主线先做无 feature 的 core-only examples，再考虑 feature、profile、runtime。
- 旧代码和 AI task 都是 evidence，不是 schema authority。
