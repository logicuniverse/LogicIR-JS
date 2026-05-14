import type { LogicUnitFixture } from './types';

export const validInvocationFixture: LogicUnitFixture = {
  key: 'valid-invocation',
  features: ['logicir.software.invocation'],
  target: {
    namespace: 'logicir.examples.math',
    key: 'add',
  },
  inputMap: {
    left: 'left',
    right: 'right',
  },
  outputMap: {
    sum: 'sum',
  },
};

export const missingProviderFixture: LogicUnitFixture = {
  ...validInvocationFixture,
  key: 'missing-provider',
  target: {
    namespace: 'logicir.examples.math',
    key: 'missing',
  },
};

export const invalidPlanFixture: LogicUnitFixture = {
  ...validInvocationFixture,
  key: 'invalid-plan',
  outputMap: {},
};

export const unsupportedSemanticsFixture: LogicUnitFixture = {
  ...validInvocationFixture,
  key: 'unsupported-semantics',
  unsupportedSemantics: ['logicir.software.transport.remote-call'],
};

export const runtimeFailureFixture: LogicUnitFixture = {
  ...validInvocationFixture,
  key: 'runtime-failure',
  target: {
    namespace: 'logicir.examples.math',
    key: 'throws',
  },
};
