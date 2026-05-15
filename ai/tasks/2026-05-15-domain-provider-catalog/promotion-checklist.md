# Promotion Checklist

人工 review 前不要 promotion。

## 可 promotion 素材

| Sandbox Path | 可能正式位置 | 备注 |
| --- | --- | --- |
| `src/legacy-domain-snapshot.ts` | future feature/provider catalog fixtures | 可作为 CEL/pi-ai/Hono catalog review seed。 |
| `src/cel.ts` | future tool fixture only | 只保留小型 evaluator 作为 smoke helper，不作为正式 CEL 实现。 |
| `src/pi-ai.ts` | future provider contract tests | mock provider 可用于 provider dependency smoke。 |
| `src/hono.ts` | future server-route structural fixtures | route tree materialization 可作为 structural/server-route fixture。 |

## 不要 promotion

- 整个 sandbox 目录。
- `dist/`。
- mock API key 或真实 provider assumption。
- 把 CEL/pi-ai/Hono SDK 行为写入 core schema。
- 把 Hono HTTP lifecycle 写成 generic structural 规则。
