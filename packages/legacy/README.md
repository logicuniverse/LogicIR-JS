# Legacy Snapshots

This directory contains historical implementation snapshots used as evidence for LogicIR schema, feature, projection, runtime, and tooling design.

These snapshots are not schema authority. Current protocol work should treat them as old implementation pressure and compatibility evidence only.

## Active vs snapshot packages

- `engine/` is the migrated old LogicIR JS engine package.
- `flow-runtime-core/` and `flow-core/` are curated snapshots from the earlier FlowForge-era codebase.

The snapshot directories intentionally use `package.snapshot.json` instead of `package.json` so they are not picked up as active workspace packages.

## Exclusions

Snapshots should not include build artifacts, installed dependencies, editor product shells, or view/render-only code:

- `dist/`
- `node_modules/`
- `.claude/`
- `.vscode/`
- `yarn.lock`
- `ff-editor`
- `ff-core/src/render`

