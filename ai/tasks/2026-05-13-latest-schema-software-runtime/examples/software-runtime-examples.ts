import type { LogicUnit, Port } from '@logic-universe/logic-ir-core';
import { LOGIC_IR_CORE_SCHEMA_VERSION } from '@logic-universe/logic-ir-core';
import {
  Continuation,
  createProviderRegistry,
  Immediate,
  Ok,
  type ProviderRegistry,
  Some,
} from '../runtime/software-runtime';

const pullInput = (): Port => ({
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
});

const computedOutput = (role?: 'primary-result'): Port => ({
  boundary: 'output',
  role,
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
});

export const addOneUnit: LogicUnit = {
  schemaVersion: LOGIC_IR_CORE_SCHEMA_VERSION,
  features: {},
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      input: pullInput(),
      result: computedOutput('primary-result'),
    },
    luis: {
      addOne: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.example',
          key: 'add-one',
          version: '0.0.0-exploration',
        },
        ports: {
          value: pullInput(),
          result: computedOutput('primary-result'),
        },
        fulfillments: {},
      },
    },
    connections: {
      input_to_add: {
        from: { owner: { kind: 'lu' }, portKey: 'input' },
        to: { owner: { kind: 'lui', luiId: 'addOne' }, portKey: 'value' },
      },
      add_to_result: {
        from: { owner: { kind: 'lui', luiId: 'addOne' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
    closures: {},
  },
};

export const sequentialDoubleThenAddUnit: LogicUnit = {
  schemaVersion: LOGIC_IR_CORE_SCHEMA_VERSION,
  features: addOneUnit.features,
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'sequential',
      steps: ['double', 'addOne'],
    },
    ports: {
      input: pullInput(),
      result: computedOutput('primary-result'),
    },
    luis: {
      double: {
        kind: 'sequential',
        target: {
          kind: 'external',
          namespace: 'logicir.example',
          key: 'double-async',
          version: '0.0.0-exploration',
        },
        ports: {
          value: pullInput(),
          result: computedOutput('primary-result'),
        },
        fulfillments: {},
      },
      addOne: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.example',
          key: 'add-one',
          version: '0.0.0-exploration',
        },
        ports: {
          value: pullInput(),
          result: computedOutput('primary-result'),
        },
        fulfillments: {},
      },
    },
    connections: {
      input_to_double: {
        from: { owner: { kind: 'lu' }, portKey: 'input' },
        to: { owner: { kind: 'lui', luiId: 'double' }, portKey: 'value' },
      },
      double_to_add: {
        from: { owner: { kind: 'lui', luiId: 'double' }, portKey: 'result' },
        to: { owner: { kind: 'lui', luiId: 'addOne' }, portKey: 'value' },
      },
      add_to_result: {
        from: { owner: { kind: 'lui', luiId: 'addOne' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
    closures: {},
  },
};

export const exampleProviders: ProviderRegistry = createProviderRegistry({
  'logicir.example/add-one@0.0.0-exploration': ({ inputs }) => {
    const value = inputs.value;
    if (value?.kind !== 'ok' || value.value.kind !== 'some') {
      return Immediate(Ok(Some(1)));
    }
    return Immediate(Ok(Some(Number(value.value.value) + 1)));
  },
  'logicir.example/double-async@0.0.0-exploration': ({ inputs }) =>
    Continuation((resolve) => {
      const value = inputs.value;
      if (value?.kind !== 'ok' || value.value.kind !== 'some') {
        resolve(Ok(Some(0)));
        return;
      }
      resolve(Ok(Some(Number(value.value.value) * 2)));
    }),
});
