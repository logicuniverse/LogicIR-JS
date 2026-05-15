import type { LogicUnit, Port } from '@logic-universe/logic-ir-core';
import type {
  JsonValue,
  LogicIREditOperation,
  LogicIREditTransaction,
  TypedHole,
} from './types';
import { baselineInterpretation } from './types';
import { hashJson } from './hash';

const inputPort: Port = {
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const outputPort: Port = {
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const hole = (
  id: string,
  expected: TypedHole['$hole']['expected'],
  reason: string,
  contract?: string,
): TypedHole => ({
  $hole: {
    id,
    expected,
    reason,
    contract,
  },
});

export const partialLogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {},
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      left: inputPort,
      right: inputPort,
      sum: outputPort,
    },
    closures: {},
    luis: {
      add: hole(
        'lui.add',
        'lui',
        'The user intent left an invocation site without a concrete external-target LUI.',
        'external-target combinational invocation',
      ),
    },
    connections: {},
  },
} as const;

export const completedLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {},
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      left: inputPort,
      right: inputPort,
      sum: outputPort,
    },
    closures: {},
    luis: {
      add: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: 'add-pair',
          version: '0.0.0-mvp',
        },
        ports: {
          left: inputPort,
          right: inputPort,
          sum: outputPort,
        },
        fulfillments: {},
        extensions: [],
      },
    },
    connections: {
      leftToAdd: {
        from: {
          owner: { kind: 'lu' },
          portKey: 'left',
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'left',
        },
      },
      rightToAdd: {
        from: {
          owner: { kind: 'lu' },
          portKey: 'right',
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'right',
        },
      },
      addToSum: {
        from: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'sum',
        },
        to: {
          owner: { kind: 'lu' },
          portKey: 'sum',
        },
      },
    },
  },
};

export const editOperations: LogicIREditOperation[] = [
  {
    kind: 'set',
    path: ['core', 'luis', 'add'],
    value: completedLogicUnit.core.luis.add as unknown as JsonValue,
  },
  {
    kind: 'connect',
    connectionId: 'leftToAdd',
    from: completedLogicUnit.core.connections.leftToAdd.from,
    to: completedLogicUnit.core.connections.leftToAdd.to,
  },
  {
    kind: 'connect',
    connectionId: 'rightToAdd',
    from: completedLogicUnit.core.connections.rightToAdd.from,
    to: completedLogicUnit.core.connections.rightToAdd.to,
  },
  {
    kind: 'connect',
    connectionId: 'addToSum',
    from: completedLogicUnit.core.connections.addToSum.from,
    to: completedLogicUnit.core.connections.addToSum.to,
  },
];

export const executionBindings = [
  {
    subject: {
      kind: 'external-target',
      namespace: 'logicir.examples.math',
      key: 'add-pair',
      version: '0.0.0-mvp',
    },
    providerKey: 'add-pair-provider',
  },
] as const;

export const editTransaction: LogicIREditTransaction = {
  schemaVersion: 'logicir.edit-transaction.mvp/0.1',
  interpretation: baselineInterpretation('typed-hole-edit-transaction-replay', [
    'Typed holes, edit operations, replay, validation, and smoke execution are demonstrated as one task-local route.',
    'The transaction shape is review evidence and should be narrowed before any formal edit protocol promotion.',
  ]),
  intent:
    'Complete a partial LogicIR add-pair invocation by adding an external-target LUI and wiring LU ports to it.',
  scope: {
    kind: 'logic-unit',
    ref: 'task.fixture/add-pair-invocation',
  },
  before: {
    ref: 'partial-add-pair@before',
    hash: hashJson(partialLogicUnit as unknown as JsonValue),
    data: partialLogicUnit as unknown as JsonValue,
  },
  operations: editOperations,
  after: {
    ref: 'partial-add-pair@after',
    hash: hashJson(completedLogicUnit as unknown as JsonValue),
    data: completedLogicUnit as unknown as JsonValue,
  },
  rationale:
    'The user-facing authoring surface left a typed hole for the external-target LUI. The transaction fills that hole and adds the required connections, producing a core-valid LogicUnit. Provider selection is supplied separately by task-local execution binding data.',
};
