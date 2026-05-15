import type { LogicUnit, LogicUnitFixture, Port } from './types';

const input: Port = {
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const output: Port = {
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: false,
    pushNotifiable: true,
    retainedCurrent: false,
  },
};

const makeLogicUnit = (targetKey: string): LogicUnit => ({
  schemaVersion: '0.0.0-draft',
  features: {
    invocation: {
      namespace: 'logicir.software',
      key: 'invocation',
      version: '0.0.0-s5',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      left: input,
      right: input,
      sum: output,
    },
    connections: {
      leftToProvider: {
        from: { owner: { kind: 'lu' }, portKey: 'left' },
        to: { owner: { kind: 'lui', luiId: 'provider' }, portKey: 'left' },
      },
      rightToProvider: {
        from: { owner: { kind: 'lu' }, portKey: 'right' },
        to: { owner: { kind: 'lui', luiId: 'provider' }, portKey: 'right' },
      },
      providerToSum: {
        from: { owner: { kind: 'lui', luiId: 'provider' }, portKey: 'sum' },
        to: { owner: { kind: 'lu' }, portKey: 'sum' },
      },
    },
    closures: {},
    luis: {
      provider: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: targetKey,
        },
        ports: {
          left: input,
          right: input,
          sum: output,
        },
        fulfillments: {},
      },
    },
  },
});

const makeFixture = (
  key: string,
  targetKey: string,
  outputMap: Record<string, string> = { sum: 'sum' },
): LogicUnitFixture => {
  const logicUnit = makeLogicUnit(targetKey);
  const target = logicUnit.core.luis.provider.target;

  if (target.kind !== 'external') {
    throw new Error('S5 fixture expected an external provider target.');
  }

  return {
    key,
    logicUnit,
    target,
    inputMap: {
      left: 'left',
      right: 'right',
    },
    outputMap,
  };
};

export const validInvocationFixture: LogicUnitFixture = makeFixture(
  'valid-invocation',
  'add',
);

export const missingProviderFixture: LogicUnitFixture = makeFixture(
  'missing-provider',
  'missing',
);

export const invalidPlanFixture: LogicUnitFixture = makeFixture(
  'invalid-plan',
  'add',
  {},
);

export const unsupportedSemanticsFixture: LogicUnitFixture = {
  ...makeFixture('unsupported-semantics', 'add'),
  unsupportedSemantics: ['logicir.software.transport.remote-call'],
};

export const runtimeFailureFixture: LogicUnitFixture = makeFixture(
  'runtime-failure',
  'throws',
);
