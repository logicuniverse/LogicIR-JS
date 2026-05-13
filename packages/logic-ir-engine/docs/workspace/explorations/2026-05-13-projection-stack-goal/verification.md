# Verification Snapshot

This page records the verification gates used by the archived automatic-run
draft. The last known full run passed before the draft was moved out of active
`schema/` paths. The archived files under
`artifacts/unsubmitted-working-tree/` are not active project files, so these
commands are replay instructions for a future review branch, not commands that
currently run against `schema/` unchanged.

## Strict TypeScript Draft Gate

```powershell
.\node_modules\.bin\tsc.cmd --strict --noEmit --target ES2022 --module ESNext --moduleResolution node .\schema\core\v0-draft\types.ts .\schema\core\v0-draft\examples.ts .\schema\core\v0-draft\validator.ts .\schema\core\v0-draft\validator-smoke.ts .\schema\extensions\drafts\types.ts .\schema\extensions\drafts\validator.ts .\schema\projection\types.ts .\schema\projection\preflight.ts .\schema\projection\target-plans.ts .\schema\projection\lowering.ts .\schema\projection\preflight-smoke.ts .\schema\projection\js-runtime-smoke.ts .\schema\projection\python-runtime-smoke.ts .\schema\projection\conformance-fixtures.ts .\schema\projection\conformance-smoke.ts
```

Meaning:

- Confirms the draft schema, validator, feature payloads, projection contracts,
  planners, lowerings, and smoke files typecheck as one strict TS unit.

## CommonJS Smoke Compile

```powershell
.\node_modules\.bin\tsc.cmd --strict --target ES2022 --module CommonJS --moduleResolution node --outDir .\tmp\logicir-smoke .\schema\core\v0-draft\types.ts .\schema\core\v0-draft\examples.ts .\schema\core\v0-draft\validator.ts .\schema\core\v0-draft\validator-smoke.ts .\schema\extensions\drafts\types.ts .\schema\extensions\drafts\validator.ts .\schema\projection\types.ts .\schema\projection\preflight.ts .\schema\projection\target-plans.ts .\schema\projection\lowering.ts .\schema\projection\preflight-smoke.ts .\schema\projection\js-runtime-smoke.ts .\schema\projection\python-runtime-smoke.ts .\schema\projection\conformance-fixtures.ts .\schema\projection\conformance-smoke.ts
```

Meaning:

- Produces runnable CommonJS smoke artifacts without requiring the package
  build to publish these drafts.

## Smoke Execution

```powershell
node .\tmp\logicir-smoke\core\v0-draft\validator-smoke.js
node .\tmp\logicir-smoke\projection\preflight-smoke.js
node .\tmp\logicir-smoke\projection\js-runtime-smoke.js
node .\tmp\logicir-smoke\projection\python-runtime-smoke.js
node .\tmp\logicir-smoke\projection\conformance-smoke.js
yarn build
```

Meaning:

- Exercises positive and negative validator checks.
- Exercises projection preflight and target planning.
- Executes generated JS and Python runtime artifacts.
- Checks target conformance fixtures and expected diagnostics.
- Confirms the package build still passes.

## Last Known Result

Before the exploration consolidation, while the automatic-run files still lived
under active `schema/`, the strict TS gate, CommonJS smoke compile, all listed
smoke executions, and `yarn build` passed.

## Caveats

- The automatic-run draft files are archived under
  `artifacts/unsubmitted-working-tree/`. Do not assume active `schema/`
  contains them.
- These gates prove draft consistency, not complete target runtime or HDL
  compiler completeness.
- Re-run the gates after reintroducing any archived file into active
  `schema/core`, `schema/extensions/drafts`, or `schema/projection`.
