# LogicIR 开发文档

`dev/` 面向人类协作者，保存短、稳定、决策导向的开发文档。它现在按网站浏览方式组织，
分成入口、流程、理论和规划四栏。详细证据、长 checklist、自动化输出和失败尝试放在
[`../ai/`](../ai/)。

## 语言约定

`dev/` 和 `ai/` 下的项目协作文档默认使用中文。正式源码、package、schema、面向用户的
`docs/`、examples、fixtures 等目录继续使用英文，除非目标读者明确需要中文。

## 栏目

1. [开始阅读](getting-started/)
   - [新会话交接](getting-started/handoff.md)
2. [开发流程](workflow/)
   - [process.md](workflow/process.md)
   - [shared-rules.md](workflow/shared-rules.md)
   - [changes/](changes/)
3. [理论与原则](theory/)
   - [schema-principles.md](theory/schema-principles.md)
   - [operational-theory.md](theory/operational-theory.md)
   - [logicir-architecture.md](theory/logicir-architecture.md)
4. [当前规划](planning/)
   - [roadmap.md](planning/roadmap.md)
   - [feature-catalog.md](planning/feature-catalog.md)
   - [long-term-vision.md](planning/long-term-vision.md)

## 建议阅读路线

1. [开始阅读](getting-started/)
2. [开发流程](workflow/)
3. [当前规划](planning/roadmap.md)
4. [理论与原则](theory/)

## 当前原则

- IR / feature / extension 数据结构由人类主写和决策。
- AI task 不自动制定高自由度语义；它用于规则明确后的低自由度执行或工具探索。
- 当前主线先做无 feature 的 core-only examples，再考虑 feature、profile、runtime。
- 旧代码和 AI task 都是 evidence，不是 schema authority。

## 兼容入口

为避免打断旧链接，根目录下仍保留 `handoff.md`、`process.md`、`roadmap.md` 等兼容入口页；
它们会指向这里的 canonical 分栏路径。
