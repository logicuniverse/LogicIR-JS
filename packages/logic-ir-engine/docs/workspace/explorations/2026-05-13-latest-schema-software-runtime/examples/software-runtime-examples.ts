import type { LogicUnit, Port } from '../../../../../schema/core/v0-draft/types';
import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../../../../../schema/core/v0-draft/types';
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

const pushOutput = (role?: 'primary-result'): Port => ({
  boundary: 'output',
  role,
  interaction: {
    pullReadable: false,
    pushNotifiable: true,
    retainedCurrent: false,
  },
});

const retainedOutput = (role?: 'primary-result'): Port => ({
  boundary: 'output',
  role,
  interaction: {
    pullReadable: true,
    pushNotifiable: true,
    retainedCurrent: true,
  },
});

export const addOneUnit: LogicUnit = {
  schemaVersion: LOGIC_IR_CORE_SCHEMA_VERSION,
  features: {
    software: {
      namespace: 'logicir.software-runtime',
      key: 'basic',
      version: '0.0.0-exploration',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      input: pullInput(),
      result: retainedOutput('primary-result'),
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
          result: pushOutput('primary-result'),
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'software',
            key: 'provider-contract',
            payload: {
              inputPolicy: 'pull-current-inputs',
              outputPolicy: 'primary-result',
            },
          },
        ],
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
    extensions: [
      {
        featureKey: 'software',
        key: 'completion-policy',
        payload: {
          defaultStepCompletion: 'await-before-next-step',
        },
      },
    ],
    ports: {
      input: pullInput(),
      result: retainedOutput('primary-result'),
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
          result: retainedOutput('primary-result'),
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
          result: pushOutput('primary-result'),
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

