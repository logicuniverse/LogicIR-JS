# Design Notes

## 边界

这个 task 吸收的是 structural UI 语义，不是 ReactDOM runtime 本身。

ReactDOM mount、`document.getElementById` 和 `createRoot` 都属于 browser/react
execution provider。它们不进入 core，也不进入本 task 的 headless runtime。

## 吸收的语义

- component function 是 structural output。
- component context 提供 `compose` 和 `useProperty`。
- HTML-like element 能接收 props、children 和 event handlers。
- `class` prop 在 React provider 中会变成 `className`；headless context 也保留这个转换，方便后续对照。
- children 可以是 array 或 object，object children 按 value 顺序组合。
- reactive property 更新后，重新 materialize component tree 能看到最新值。

## 未吸收的语义

- 真实 React hooks 生命周期。
- DOM mount 和 browser rendering。
- teardown / unsubscribe 的完整 runtime 策略。
- JSX/HTML codegen。
