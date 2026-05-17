# Design

## Intake Summary

| Item | Evidence |
| --- | --- |
| Task status | `ready-for-review` |
| Verification | `yarn verify` passed |
| Root item | `div` |
| Text before / after | `hello` -> `updated` |
| Emitted events | 1 |
| Child count | 2 |

## Boundary

- Core:
  - Structural composition 使用 `outlet -> anchor`。
  - Core 不包含 HTML/React/DOM terms。
- Feature/provider:
  - HTML raw/div component catalog。
  - React compatibility provider。
  - class/className adapter behavior。
- Runtime:
  - Headless component tree materialization。
  - Event binding route。
  - Reactive text update route。

## Review Checklist

- Headless component tree 是否是 structural runtime 的合适 formal fixture？
- `component.fromArray/fromObject` 是否映射到 current anchor shape？
- Property input as props 是否应作为 structural LUI input pattern？
- Event output 是否属于 push output / event stream feature？
- React app mount binding 是否只是 provider contract？
- `class -> className` 是否明确留在 React provider adapter？

## Promotion Candidate Map

| Candidate | Possible formal area | Main blocker |
| --- | --- | --- |
| Headless component tree fixture | future structural UI tests | Need structural feature contract |
| Child composition fixtures | structural composition tests | Need anchor/outlet alignment |
| Event binding fixture | event-stream/provider tests | Need event policy |
| React compatibility notes | provider contract docs | Need avoid core pollution |

## 待人工判断

- 是否在 structural UI 前先 review generic structural composition？
- UI task 是否应该等 H5 anchor/outlet lowering review 后再 promotion？
- 是否需要一个独立 `html/react provider catalog` review？
