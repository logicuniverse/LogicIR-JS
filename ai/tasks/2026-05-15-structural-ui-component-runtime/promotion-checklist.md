# Promotion Checklist

人工 review 前不要 promotion。

## 可 promotion 素材

| Sandbox Path | 可能正式位置 | 备注 |
| --- | --- | --- |
| `src/types.ts` | future UI/structural feature or provider contract package | 只作为 headless component tree seed。 |
| `src/runtime.ts` | future `packages/engines/software` or UI projector test helper | 需要先决定 structural UI execution profile。 |
| `src/fixtures.ts` / `src/smoke.ts` | future fixtures/tests | 可作为 UI structural fixture seed。 |

## 不要 promotion

- 整个 sandbox 目录。
- `dist/`。
- ReactDOM/browser execution 假设。
- 把 `class -> className` 写入 core schema。
