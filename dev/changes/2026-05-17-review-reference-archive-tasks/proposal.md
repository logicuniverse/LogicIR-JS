# Proposal

## 背景

部分 AI tasks 是当前 schema 稳定前的历史材料，或只适合作为对照证据。本 change
为这些 `reference-only` 和 `archive-only` tasks 建立低优先级 review 工作台，防止
它们被误用为当前规范或实现模板。

## 问题

05-13 tasks 和部分 05-14 reference tasks 包含旧 schema 词汇、旧 architecture
设想或广泛 draft。它们仍有历史价值，但不能直接指导当前 code/schema promotion。

## 目标

- 分类 reference-only 和 archive-only tasks。
- 说明每个 task 的可用方式和禁用方式。
- 给 reviewer 一个低优先级入口。

## 非目标

- 不逐行 review 历史 drafts。
- 不恢复 archived automatic-run files。
- 不把 archive material promotion 到正式目录。
- 不修正旧 task 到当前 schema。

## 成功标准

- Reviewer 知道哪些 task 不应参与近期 promotion。
- 05-13 材料被明确视为 schema 稳定前历史。
- Reference task 的 guardrail 用途清楚。

## 相关证据

- Reference-only:
  - `ai/tasks/2026-05-14-latest-schema-engine-replica`
  - `ai/tasks/2026-05-14-round-schema-alignment`
- Archive-only:
  - `ai/tasks/2026-05-13-basic-software-hdl-stacks`
  - `ai/tasks/2026-05-13-latest-schema-software-runtime`
  - `ai/tasks/2026-05-13-projection-stack-goal`
- Index:
  - `ai/tasks/material-index.md`

## Review 范围

- In scope:
  - 分类确认。
  - 防误用说明。
  - 可作为 future evidence 的位置。
- Out of scope:
  - Promotion。
  - Rewrite。
  - Full historical audit。

## Promotion 候选

本工作台默认没有 promotion 候选。若 reviewer 后续发现某个片段仍有价值，应先
开新的专题 change，而不是从 archive task 直接 promotion。
