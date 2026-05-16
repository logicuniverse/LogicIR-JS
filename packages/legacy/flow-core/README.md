# Flow Core Snapshot

This is a curated legacy snapshot from the earlier FlowForge-era
`packages/ff-core` package.

It is kept as historical evidence for editor-core, compiler/lowering, editing operations, and old standard node design. It is not an active package and should not be imported by current packages.

## Included

- `src/common/types/`
- `src/common/utils/`
- `src/compile/transforms/`
- `src/edit/operations/`
- `src/edit/reconciliation/`
- `src/edit/types/`
- `src/edit/utils/`
- `src/node-functions/`
- `src/nodes/`
- `src/nodes/utils.ts`
- `src/nodes/index.ts`
- `package.snapshot.json`

## Excluded

- `src/render/`
- `ff-editor`
- build outputs and installed dependencies

## Evidence value

This snapshot is useful when reasoning about:

- Editor model and node template structure.
- Editor-to-runtime lowering.
- Sequence/control-flow lowering.
- Component composition updates.
- Graph editing operations and updater-style mutation APIs.
- Reserved nodes such as go-back and conditional return.
- Node templates as old LUI catalog evidence.
- Node function implementations as provider/execution evidence.
- Software stdlib evidence for async, state/property, event, object, array, and constant nodes.
- Host/domain node evidence such as HTML, React DOM, Hono, CEL, and AI integration nodes.

Do not treat this code as the current LogicIR schema authority. UI view models, geometry, themes, and renderer-specific data should be redesigned later as editor/tooling features if needed.

The host/domain node folders are retained to preserve scenario coverage. They are not part of a proposed basic core profile.
