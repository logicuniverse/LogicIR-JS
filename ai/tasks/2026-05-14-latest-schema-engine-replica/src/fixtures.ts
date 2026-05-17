import type { EndpointRef, LogicUnit } from './types';

const input = () => ({ contact: 'pull' as const });
const pushInput = () => ({ contact: 'push' as const });
const pushOutput = () => ({ contact: 'push' as const });
const propertyOutput = () => ({ contact: 'property' as const });

const result = (...pins: string[]) =>
  pins.length > 0
    ? { contact: 'pull' as const, pins: { kind: 'keyed' as const, keys: pins } }
    : { contact: 'pull' as const };

const inputs = (...keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, input()]));

const pushInputs = (...keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, pushInput()]));

const propertyOutputs = (...keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, propertyOutput()]));

const pushOutputs = (...keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, pushOutput()]));

const luInput = (
  key: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'input', key },
  ...(payloadPath ? { payloadPath } : {}),
});

const luOutput = (
  key: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'output', key },
  ...(payloadPath ? { payloadPath } : {}),
});

const luResult = (payloadPath?: (string | number)[]): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'result' },
  ...(payloadPath ? { payloadPath } : {}),
});

const luiInput = (
  luiId: string,
  key: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'input', key },
  ...(payloadPath ? { payloadPath } : {}),
});

const luiOutput = (
  luiId: string,
  key: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'output', key },
  ...(payloadPath ? { payloadPath } : {}),
});

const luiResult = (
  luiId: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'result' },
  ...(payloadPath ? { payloadPath } : {}),
});

const featureManifest = {
  invocation: {
    namespace: 'logicir.software',
    key: 'invocation',
    version: '0.0.0-replica',
  },
  runtimePlan: {
    namespace: 'logicir.software',
    key: 'execution-plan',
    version: '0.0.0-replica',
  },
};

export const combinationalFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: inputs('left', 'right', 'override'),
      result: result(),
    },
    closures: {},
    luis: {
      add: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: 'add',
        },
        ports: {
          inputs: inputs('left', 'right', 'override'),
          result: result(),
        },
        fulfillments: {},
      },
    },
    connections: {
      leftToAdd: {
        from: luInput('left'),
        to: luiInput('add', 'left'),
      },
      rightToAdd: {
        from: luInput('right'),
        to: luiInput('add', 'right'),
      },
      overrideToAdd: {
        from: luInput('override'),
        to: luiInput('add', 'override'),
      },
      addToSum: {
        from: luiResult('add'),
        to: luResult(),
      },
    },
  },
};

export const statefulRetainedFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: {
      inputs: inputs('next'),
      outputs: propertyOutputs('current', 'written'),
    },
    closures: {},
    luis: {
      readCounter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.software.state-store',
          key: 'counter',
        },
        ports: { inputs: {}, outputs: propertyOutputs('current') },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: { kind: 'state-read', storeKey: 'counter' },
          },
        ],
      },
      writeCounter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.software.state-store',
          key: 'counter',
        },
        ports: { inputs: inputs('next'), outputs: propertyOutputs('written') },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: { kind: 'state-write', storeKey: 'counter' },
          },
        ],
      },
    },
    connections: {
      readToCurrent: {
        from: luiOutput('readCounter', 'current'),
        to: luOutput('current'),
      },
      nextToWrite: {
        from: luInput('next'),
        to: luiInput('writeCounter', 'next'),
      },
      writeToWritten: {
        from: luiOutput('writeCounter', 'written'),
        to: luOutput('written'),
      },
    },
  },
};

export const asyncCompletionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('value'), result: result() },
    closures: {},
    luis: {
      double: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.async',
          key: 'double',
        },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {},
      },
    },
    connections: {
      valueToDouble: {
        from: luInput('value'),
        to: luiInput('double', 'value'),
      },
      doubleToOutput: {
        from: luiResult('double'),
        to: luResult(),
      },
    },
  },
};

export const fulfillmentFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {
    math: {
      kind: 'inline',
      service: {
        fulfillmentScope: 'independent-units',
        units: {
          increment: {
            kind: 'combinational',
            ports: { inputs: inputs('value'), result: result() },
            requirements: {},
          },
        },
      },
    },
  },
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('value'), result: result('local', 'upstream') },
    closures: {
      localIncrement: {
        forwardedPortKeys: { inputs: ['value'], pushOutputs: [] },
        core: {
          kindOrganization: { kind: 'combinational' },
          ports: { inputs: inputs('value'), result: result() },
          connections: {},
          closures: {},
          luis: {},
        },
      },
    },
    luis: {
      localIncrement: {
        kind: 'combinational',
        target: { kind: 'requirement', serviceKey: 'math', unitKey: 'increment' },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {
          math: {
            kind: 'independent-units',
            units: {
              increment: { kind: 'closure', closureId: 'localIncrement' },
            },
          },
        },
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: { kind: 'closure', closureId: 'localIncrement' },
          },
        ],
      },
      upstreamIncrement: {
        kind: 'combinational',
        target: { kind: 'requirement', serviceKey: 'math', unitKey: 'increment' },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {
          math: {
            kind: 'independent-units',
            units: {
              increment: {
                kind: 'upstream-unit',
                reachabilityPath: [],
                supplierServiceKey: 'math',
                supplierUnitKey: 'increment',
              },
            },
          },
        },
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: {
              kind: 'upstream',
              serviceKey: 'math',
              unitKey: 'increment',
              providerKey: 'logicir.examples.math/increment-upstream',
            },
          },
        ],
      },
    },
    connections: {
      valueToLocal: {
        from: luInput('value'),
        to: luiInput('localIncrement', 'value'),
      },
      localToOut: {
        from: luiResult('localIncrement'),
        to: luResult(['local']),
      },
      valueToUpstream: {
        from: luInput('value'),
        to: luiInput('upstreamIncrement', 'value'),
      },
      upstreamToOut: {
        from: luiResult('upstreamIncrement'),
        to: luResult(['upstream']),
      },
    },
  },
};

export const sequentialControlFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'sequential', steps: [{ luiId: 'loop' }] },
    ports: { inputs: inputs('start'), outputs: {}, result: result() },
    closures: {},
    luis: {
      loop: {
        kind: 'sequential',
        target: {
          kind: 'external',
          namespace: 'logicir.software.control-flow',
          key: 'loop-until',
        },
        ports: { inputs: inputs('start'), outputs: {}, result: result() },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: {
              kind: 'sequential-control',
              limit: 3,
              emitGoBack: true,
              returnIfReached: true,
            },
          },
        ],
      },
    },
    connections: {
      startToLoop: {
        from: luInput('start'),
        to: luiInput('loop', 'start'),
      },
      loopToResult: {
        from: luiResult('loop'),
        to: luResult(),
      },
    },
  },
};

export const payloadPathFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('source'), result: result() },
    closures: {},
    luis: {
      pick: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.payload',
          key: 'pick',
        },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {},
      },
    },
    connections: {
      sourceToPick: {
        from: luInput('source', ['nested', 'value']),
        to: luiInput('pick', 'value'),
      },
      pickToOutput: {
        from: luiResult('pick', ['payload', 'answer']),
        to: luResult(['value']),
      },
    },
  },
};

export const thenableCompletionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('value'), result: result() },
    closures: {},
    luis: {
      triple: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.thenable',
          key: 'triple',
        },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {},
      },
    },
    connections: {
      valueToTriple: {
        from: luInput('value'),
        to: luiInput('triple', 'value'),
      },
      tripleToOutput: {
        from: luiResult('triple'),
        to: luResult(),
      },
    },
  },
};

export const emitFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: { inputs: pushInputs('message'), outputs: pushOutputs('ack') },
    closures: {},
    luis: {
      emitMessage: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.events',
          key: 'emit-message',
        },
        ports: { inputs: pushInputs('message'), outputs: pushOutputs('ack') },
        fulfillments: {},
      },
    },
    connections: {
      messageToEmitter: {
        from: luInput('message'),
        to: luiInput('emitMessage', 'message'),
      },
      emitterToAck: {
        from: luiOutput('emitMessage', 'ack'),
        to: luOutput('ack'),
      },
    },
  },
};

export const nestedInnerFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('value'), result: result() },
    closures: {},
    luis: {
      inc: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: 'increment-nested',
        },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {},
      },
    },
    connections: {
      valueToInc: {
        from: luInput('value'),
        to: luiInput('inc', 'value'),
      },
      incToResult: {
        from: luiResult('inc'),
        to: luResult(),
      },
    },
  },
};

export const nestedOuterFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { inputs: inputs('value'), result: result() },
    closures: {},
    luis: {
      nested: {
        kind: 'combinational',
        target: { kind: 'lu', luId: 'nested-inner' },
        ports: { inputs: inputs('value'), result: result() },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'runtimePlan',
            key: 'runtime-operation',
            payload: { kind: 'nested-lu', luRef: 'nested-inner' },
          },
        ],
      },
    },
    connections: {
      valueToNested: {
        from: luInput('value'),
        to: luiInput('nested', 'value'),
      },
      nestedToResult: {
        from: luiResult('nested'),
        to: luResult(),
      },
    },
  },
};

export const reactiveSubscribeFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: { inputs: pushInputs('tick'), outputs: propertyOutputs('latest') },
    closures: {},
    luis: {
      mirror: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.events',
          key: 'mirror-event',
        },
        ports: { inputs: pushInputs('tick'), outputs: propertyOutputs('latest') },
        fulfillments: {},
      },
    },
    connections: {
      tickToMirror: {
        from: luInput('tick'),
        to: luiInput('mirror', 'tick'),
      },
      mirrorToLatest: {
        from: luiOutput('mirror', 'latest'),
        to: luOutput('latest'),
      },
    },
  },
};

export const structuralCompositionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: featureManifest,
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'structural',
      anchors: { root: { shape: 'single', required: true } },
      outlets: {},
      anchorFills: { root: { kind: 'empty' } },
      luiFills: {},
    },
    ports: { inputs: inputs('label', 'text'), outputs: pushOutputs('root') },
    connections: {},
    closures: {},
    luis: {},
    extensions: [
      {
        featureKey: 'runtimePlan',
        key: 'module-structure',
        payload: {
          composition: 'button(text)',
        },
      },
    ],
  },
};
