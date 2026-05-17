import type { LogicUnit, LogicUnitFixture, Port } from './types';

const input: Port = {
  contact: 'pull',
};

const output: Port = {
  contact: 'pull',
};

const makeLogicUnit = (targetKey: string): LogicUnit => ({
  schemaVersion: '0.0.0-draft',
  featureUses: {
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
      inputs: {
        left: input,
        right: input,
      },
      result: output,
    },
    connections: {
      leftToProvider: {
        from: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'left' } },
        to: {
          owner: { kind: 'lui', luiId: 'provider' },
          port: { kind: 'input', key: 'left' },
        },
      },
      rightToProvider: {
        from: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'right' } },
        to: {
          owner: { kind: 'lui', luiId: 'provider' },
          port: { kind: 'input', key: 'right' },
        },
      },
      providerToSum: {
        from: {
          owner: { kind: 'lui', luiId: 'provider' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
        },
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
          inputs: {
            left: input,
            right: input,
          },
          result: output,
        },
        fulfillments: {},
      },
    },
  },
});

const makeFixture = (
  key: string,
  targetKey: string,
  outputMap: Record<string, string> = { result: 'result' },
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
