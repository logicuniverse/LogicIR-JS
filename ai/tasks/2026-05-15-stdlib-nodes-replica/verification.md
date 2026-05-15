# Verification

## Commands

Run from `ai/tasks/2026-05-15-stdlib-nodes-replica`:

```powershell
yarn verify
```

Latest run:

```text
yarn run v1.22.22
$ yarn typecheck && yarn build && yarn source-audit && yarn smoke && yarn coverage
$ node ../../../node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
$ node ../../../node_modules/typescript/bin/tsc -p tsconfig.json
$ node dist/legacy-source-audit.js
{
  "extractedLegacy": 104,
  "uniqueExtractedLegacy": 104,
  "catalog": 104,
  "uniqueCatalog": 104
}
$ node dist/smoke.js
{
  "smokeCases": 104
}
$ node dist/coverage-check.js
{
  "legacyKeys": 104,
  "catalog": 104,
  "providers": 104,
  "smokeCases": 104,
  "smokeCovered": 104
}
```

## Gates

- TypeScript strict no-emit check passes.
- TypeScript build passes.
- Source audit extracts the actual legacy stdlib key set from legacy template
  source and compares it to the task catalog.
- Smoke executes every replicated node through `LogicUnit` fixture -> plan ->
  runtime -> provider.
- Coverage checks that every legacy stdlib key has:
  - a catalog row,
  - a provider,
  - a smoke case,
  - a catalog lookup entry.

## Known Limits

- The task does not claim formal feature/schema promotion.
- The task does not validate old editor UI metadata beyond input/output shape
  evidence needed for runtime behavior.
- The task does not provide HDL lowering for JS stdlib semantics.
