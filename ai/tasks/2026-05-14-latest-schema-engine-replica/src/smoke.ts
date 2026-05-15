import {
  asyncCompletionFixture,
  combinationalFixture,
  emitFixture,
  fulfillmentFixture,
  nestedInnerFixture,
  nestedOuterFixture,
  payloadPathFixture,
  reactiveSubscribeFixture,
  sequentialControlFixture,
  statefulRetainedFixture,
  structuralCompositionFixture,
  thenableCompletionFixture,
} from './fixtures';
import { compileLogicUnit } from './compiler';
import { createEngine, ok, some, thenable } from './runtime';
import type { EnginePlugin, ProviderFunction } from './types';

const assertDeepEqual = (actual: unknown, expected: unknown): void => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`);
  }
};

const pluginEvents: string[] = [];

const hooksPlugin: EnginePlugin = {
  name: 'hooks',
  hooks: {
    onEvent: (event) => {
      pluginEvents.push(event.name);
    },
    overrideLUIExecution: (_context, node, inputs) => {
      if (node.id === 'add' && inputs.override === true) {
        return { sum: 99 };
      }
      return undefined;
    },
    overrideClosureExecution: (_context, node, inputs) => {
      if (node.id === 'localIncrement' && inputs.value === 7) {
        return { result: 77 };
      }
      return undefined;
    },
    transformLUIInputs: (_context, _node, inputs) => ({
      ...inputs,
      hookTouched: ok(some(true)),
    }),
    transformDataAfterRead: (_context, node, portKey, value) => {
      if (
        node.id === 'pick' &&
        portKey === 'value' &&
        value.kind === 'ok' &&
        value.value.kind === 'some' &&
        typeof value.value.value === 'number'
      ) {
        return ok(some(value.value.value + 1));
      }
      return undefined;
    },
    transformDataBeforeEmit: (_context, _node, portKey, value) => {
      if (
        portKey === 'events' &&
        value.kind === 'ok' &&
        value.value.kind === 'some' &&
        typeof value.value.value === 'string'
      ) {
        return ok(some(value.value.value.toUpperCase()));
      }
      return undefined;
    },
  },
};

const engineProviders: Record<string, ProviderFunction> = {
  'logicir.examples.math/add': (inputs: Record<string, unknown>) => ({
    sum: Number(inputs.left) + Number(inputs.right),
  }),
  'logicir.examples.math/increment-nested': (
    inputs: Record<string, unknown>,
  ) => ({
    result: Number(inputs.value) + 100,
  }),
  'logicir.examples.async/double': async (
    inputs: Record<string, unknown>,
  ) => ({
    doubled: Number(inputs.value) * 2,
  }),
  'logicir.examples.thenable/triple': (inputs: Record<string, unknown>) =>
    thenable((resolve) => {
      resolve(ok(some({ tripled: Number(inputs.value) * 3 })));
    }),
  'logicir.examples.payload/pick': (inputs: Record<string, unknown>) => ({
    out: { payload: { answer: inputs.value } },
  }),
  'logicir.examples.math/increment-upstream': (
    inputs: Record<string, unknown>,
  ) => ({
    result: Number(inputs.value) + 10,
  }),
  'logicir.examples.events/emit-message': (
    inputs: Record<string, unknown>,
    context,
  ) => {
    context.emit('events', {
      result: ok(some(String(inputs.message))),
      path: ['latest'],
    });
    return { ack: true };
  },
  'logicir.examples.events/mirror-event': (inputs: Record<string, unknown>) => ({
    latest: inputs.tick,
  }),
  'logicir.examples.ui/button': (inputs: Record<string, unknown>) => ({
    render: (children: unknown) => ({
      tag: 'button',
      label: inputs.label,
      children,
    }),
  }),
  'logicir.examples.ui/text': (inputs: Record<string, unknown>) => ({
    render: () => ({ tag: 'text', text: inputs.text }),
  }),
};

const engine = createEngine({
  plugins: [hooksPlugin],
  providers: engineProviders,
});

const main = async (): Promise<void> => {
  const combinational = engine.run(
    compileLogicUnit(combinationalFixture),
    { left: 2, right: 5 },
  );
  assertDeepEqual(combinational.outputs, { sum: 7 });

  const overriddenAdd = engine.run(
    compileLogicUnit(combinationalFixture),
    { left: 2, right: 5, override: true },
  );
  assertDeepEqual(overriddenAdd.outputs, { sum: 99 });
  if (!pluginEvents.includes('onDidOverrideLUIManifestation')) {
    throw new Error('Expected override LUI hook event.');
  }

  const statePlan = compileLogicUnit(statefulRetainedFixture);
  const stateRead1 = engine.run(statePlan, {});
  const stateWrite = engine.run(statePlan, { next: 11 });
  const stateRead2 = engine.run(statePlan, {});
  assertDeepEqual(stateRead1.outputs, { current: 1 });
  assertDeepEqual(stateWrite.outputs, { current: 1, written: 11 });
  assertDeepEqual(stateRead2.outputs, { current: 11 });

  const asyncResult = await engine.runAsync(
    compileLogicUnit(asyncCompletionFixture),
    { value: 6 },
  );
  assertDeepEqual(asyncResult.outputs, { doubled: 12 });

  const syncAsyncDiagnostic = engine.run(
    compileLogicUnit(asyncCompletionFixture),
    { value: 6 },
  );
  assertDeepEqual(syncAsyncDiagnostic.status, 'error');
  assertDeepEqual(syncAsyncDiagnostic.diagnostics[0]?.code, 'ASYNC_PROVIDER_IN_SYNC_RUN');

  const thenableResult = await engine.runAsync(
    compileLogicUnit(thenableCompletionFixture),
    { value: 5 },
  );
  assertDeepEqual(thenableResult.outputs, { tripled: 15 });

  const closureResult = engine.run(compileLogicUnit(fulfillmentFixture), {
    value: 4,
  });
  assertDeepEqual(closureResult.outputs, {
    local: 5,
    upstream: 14,
  });

  const closureOverride = engine.run(compileLogicUnit(fulfillmentFixture), {
    value: 7,
  });
  assertDeepEqual(closureOverride.outputs, {
    local: 77,
    upstream: 17,
  });
  if (!pluginEvents.includes('onDidOverrideClosureProjection')) {
    throw new Error('Expected override closure hook event.');
  }

  const sequential = await engine.runAsync(
    compileLogicUnit(sequentialControlFixture),
    { start: 0 },
  );
  assertDeepEqual(sequential.outputs, { result: 3 });
  if (!pluginEvents.includes('onGoBack')) {
    throw new Error('Expected go-back hook event.');
  }

  const sequentialReturn = await engine.runAsync(
    compileLogicUnit(sequentialControlFixture),
    { start: 3 },
  );
  assertDeepEqual(sequentialReturn.outputs, { result: 4 });

  const payloadPath = engine.run(compileLogicUnit(payloadPathFixture), {
    source: { nested: { value: 40 } },
  });
  assertDeepEqual(payloadPath.outputs, { picked: { value: 41 } });

  const emitted = engine.run(compileLogicUnit(emitFixture), {
    message: 'ready',
  });
  assertDeepEqual(emitted.outputs, { ack: true });
  assertDeepEqual(emitted.emitted, {
    events: [{ result: ok(some('READY')), path: ['latest'] }],
  });
  if (!pluginEvents.includes('onDidTransformDataBeforeEmit')) {
    throw new Error('Expected before-emit hook event.');
  }

  const reactive = await engine.runReactive(
    compileLogicUnit(reactiveSubscribeFixture),
    {},
    {
      tick: [{ result: ok(some('pulse')), path: ['latest'] }],
    },
  );
  assertDeepEqual(reactive.outputs, { latest: 'pulse' });

  const nestedEngine = createEngine({
    plugins: [hooksPlugin],
    providers: engineProviders,
    plans: {
      'nested-inner': compileLogicUnit(nestedInnerFixture),
    },
  });
  const nested = nestedEngine.run(compileLogicUnit(nestedOuterFixture), {
    value: 1,
  });
  assertDeepEqual(nested.outputs, { result: 101 });
  if (!nested.sessions.some((session) => session.parentRunId)) {
    throw new Error('Expected nested session bookkeeping.');
  }

  const structural = engine.run(compileLogicUnit(structuralCompositionFixture), {
    label: 'Run',
    text: 'Hello',
  });
  assertDeepEqual(structural.outputs, {
    root: {
      tag: 'button',
      label: 'Run',
      children: {
        tag: 'text',
        text: 'Hello',
      },
    },
  });

  if (!pluginEvents.includes('onDidTransformLUIInputs')) {
    throw new Error('Expected transform hook event.');
  }

  console.log(
    JSON.stringify(
      {
        combinational,
        stateRead1,
        stateWrite,
        stateRead2,
        asyncResult,
        syncAsyncDiagnostic,
        thenableResult,
        closureResult,
        sequential,
        sequentialReturn,
        payloadPath,
        emitted,
        reactive,
        nested,
        structural,
        pluginEvents,
      },
      null,
      2,
    ),
  );
};

void main();
