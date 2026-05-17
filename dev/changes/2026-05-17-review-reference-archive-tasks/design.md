# Design

## Reference / Archive Matrix

| Task | 分类 | 可用方式 | 禁用方式 |
| --- | --- | --- | --- |
| `2026-05-14-latest-schema-engine-replica` | `reference-only` | 对照旧 engine 行为复刻选择；确认 S1-S5 之外的 runtime coverage ideas | 不直接 promotion runtime plan types、hook/event/session mechanics |
| `2026-05-14-round-schema-alignment` | `reference-only` | 作为 task schema ownership guardrail 和 alignment audit evidence | 不把 alignment script 直接当 formal validator |
| `2026-05-13-basic-software-hdl-stacks` | `archive-only` | 历史上下文：早期 basic-software/basic-hdl stack feasibility | 不作为当前 profile/stack schema 示例 |
| `2026-05-13-latest-schema-software-runtime` | `archive-only` | 历史上下文：早期 runtime sketch | 不作为当前 software engine seed；优先看 S1-S5 |
| `2026-05-13-projection-stack-goal` | `archive-only` | 历史上下文：自动运行 draft 和 projection stack ideas | 不恢复 archived files 到 formal `schema/` |

## Reference Task Notes

### Latest-schema engine replica

验证过 provider invocation、override hook、retained-current、completion、
fulfillment、sequential go-back/return、payload path、transform hooks、event replay、
nested session、structural composition。它的价值是 coverage 对照，不是近期
implementation seed。正式 review 应优先参考 S1-S5、legacy coverage map 和后续
专题工作台。

### Round schema alignment

验证 S/H rounds 从 task-local schema copies 转向 import current packages。它的
价值是 AI task 规则和模板 guardrail。若要正式化，应写进 task template/process，
而不是把 script 当成长期 validator。

## Archive Task Notes

05-13 tasks 发生在 IR schema 稳定前，包含过时词汇和 broad draft。它们只保留为
历史上下文，不参与当前 promotion planning。

## 待人工判断

- 是否在 `ai/tasks/material-index.md` 给 05-13 tasks 加更醒目的 archive 标记？
- `round-schema-alignment` 的规则是否已经充分写入 `dev/process.md` 和 task
  template？
- `latest-schema-engine-replica` 是否需要拆出少量未覆盖行为进入 future review
  queue，还是完全由 coverage map 接管？

## Promotion Boundary

默认不 promotion。任何仍有价值的片段必须进入新专题 change，并重新对齐当前
schema。
