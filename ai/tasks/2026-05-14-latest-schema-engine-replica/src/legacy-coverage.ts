import type { CoverageRow } from './types';

export const legacyCoverageRows: CoverageRow[] = [
  {
    capability: 'provider invocation',
    legacyReference: 'packages/legacy/engine/src/projector.ts:createLUProjector',
    latestSchemaMapping:
      'External LUI target compiled to provider execution node with explicit provider key.',
    status: 'covered',
    notes: 'Smoke covers synchronous provider invocation and output mapping.',
  },
  {
    capability: 'state store retained-current',
    legacyReference: 'packages/legacy/engine/src/types/runtime.ts:StateStore',
    latestSchemaMapping:
      'State store behavior is represented by software runtime-operation extensions on stateful LUIs.',
    status: 'covered',
    notes: 'Smoke covers read current, write current, and later read of updated state.',
  },
  {
    capability: 'thenable completion',
    legacyReference: 'packages/legacy/engine/src/types/runtime.ts:ThenableReturnResult',
    latestSchemaMapping:
      'Promise and task-local Thenable providers are accepted by runAsync while sync run rejects async completion.',
    status: 'covered',
    notes: 'Smoke covers Promise provider completion, Thenable completion, and sync-run async rejection diagnostic.',
  },
  {
    capability: 'closure fulfillment',
    legacyReference: 'packages/legacy/engine/src/types/models.ts:LUClosure',
    latestSchemaMapping:
      'Core Closure stores serializable core/forwardedPortKeys; runtime function remains in execution layer.',
    status: 'covered',
    notes: 'Smoke covers local closure fulfillment without putting functions in core schema.',
  },
  {
    capability: 'upstream fulfillment',
    legacyReference: 'packages/legacy/engine/src/types/models.ts:Provider',
    latestSchemaMapping:
      'Requirement target plus upstream-unit fulfillment compiles to upstream provider execution node.',
    status: 'covered',
    notes: 'Smoke covers upstream provider resolution through an explicit provider key.',
  },
  {
    capability: 'sequential await',
    legacyReference: 'packages/legacy/engine/src/types/models.ts:SequentialStep.isAwaited',
    latestSchemaMapping:
      'Control-flow semantics live in a software runtime-operation extension and are executed by interpreter plan.',
    status: 'covered',
    notes: 'Smoke covers async plan execution and Thenable provider completion; per-step event names are represented by plan-level hook events.',
  },
  {
    capability: 'go-back-if',
    legacyReference: 'packages/legacy/engine/src/types/models.ts:SequentialStepKind.GoBackIf',
    latestSchemaMapping:
      'Loop control is represented as a runtime-operation extension, not core sequential steps.',
    status: 'covered',
    notes: 'Smoke covers go-back-style loop execution and onGoBack hook emission.',
  },
  {
    capability: 'return-if',
    legacyReference: 'packages/legacy/engine/src/types/models.ts:SequentialStepKind.ReturnIf',
    latestSchemaMapping:
      'Return condition is represented in the same control-flow extension family.',
    status: 'covered',
    notes: 'Smoke covers return-if-style completion and onReturnIf hook emission.',
  },
  {
    capability: 'payload path',
    legacyReference: 'packages/legacy/engine/src/utils.ts:getResultByPath',
    latestSchemaMapping:
      'Core EndpointRef.payloadPath is the stable schema field; runtime path extraction helper should move into engine package later.',
    status: 'covered',
    notes: 'Smoke covers source payload selection, target payload assembly, and transformDataAfterRead.',
  },
  {
    capability: 'plugin hooks',
    legacyReference: 'packages/legacy/engine/src/hooks',
    latestSchemaMapping:
      'EnginePlugin hooks can observe events and transform data reads, emits, LUI inputs, and LUI outputs at execution-plan level.',
    status: 'covered',
    notes: 'Smoke verifies LUI input, data-after-read, data-before-emit, go-back, and return hook events.',
  },
  {
    capability: 'structural composition',
    legacyReference: 'packages/legacy/engine/src/utils.ts:transformComposable',
    latestSchemaMapping:
      'Structural LU plus runtime module-structure extension compiles to structural-render plan node.',
    status: 'covered',
    notes: 'Smoke covers nested button(text) composition through providers.',
  },
  {
    capability: 'diagnostics',
    legacyReference: 'packages/legacy/engine/src/types/runtime.ts:LUError',
    latestSchemaMapping:
      'Compiler and runtime return structured diagnostics instead of unhandled throw for expected failures.',
    status: 'covered',
    notes: 'Runtime can report missing provider, invalid plan, and runtime failure; negative matrix can grow later.',
  },
  {
    capability: 'legacy port id runtime table',
    legacyReference: 'packages/legacy/engine/src/utils.ts:getRuntimePorts',
    latestSchemaMapping:
      'Latest core uses owner/portKey endpoint refs; runtime may derive indexes but does not store them in core.',
    status: 'drop-intentionally',
    notes: 'Opaque port ids are an execution optimization, not a schema requirement.',
  },
  {
    capability: 'editor/model conveniences',
    legacyReference: 'packages/legacy/flow-core/src/common/types/editor-models.ts',
    latestSchemaMapping:
      'Editor concerns remain outside this engine replica.',
    status: 'defer',
    notes: 'Should be handled by a future authoring/edit model task, not interpreter runtime.',
  },
];
