import type { LogicUnit, Port } from './types';

const input = (retainedCurrent = false): Port => ({
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent,
  },
});

const output = (retainedCurrent = false): Port => ({
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: false,
    pushNotifiable: true,
    retainedCurrent,
  },
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
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      left: input(),
      right: input(),
      override: input(),
      sum: output(),
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
          left: input(),
          right: input(),
          override: input(),
          sum: output(),
        },
        fulfillments: {},
      },
    },
    connections: {
      leftToAdd: {
        from: { owner: { kind: 'lu' }, portKey: 'left' },
        to: { owner: { kind: 'lui', luiId: 'add' }, portKey: 'left' },
      },
      rightToAdd: {
        from: { owner: { kind: 'lu' }, portKey: 'right' },
        to: { owner: { kind: 'lui', luiId: 'add' }, portKey: 'right' },
      },
      overrideToAdd: {
        from: { owner: { kind: 'lu' }, portKey: 'override' },
        to: { owner: { kind: 'lui', luiId: 'add' }, portKey: 'override' },
      },
      addToSum: {
        from: { owner: { kind: 'lui', luiId: 'add' }, portKey: 'sum' },
        to: { owner: { kind: 'lu' }, portKey: 'sum' },
      },
    },
  },
};

export const statefulRetainedFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: {
      next: input(),
      current: output(true),
      written: output(true),
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
        ports: { current: output(true) },
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
        ports: { next: input(), written: output(true) },
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
        from: { owner: { kind: 'lui', luiId: 'readCounter' }, portKey: 'current' },
        to: { owner: { kind: 'lu' }, portKey: 'current' },
      },
      nextToWrite: {
        from: { owner: { kind: 'lu' }, portKey: 'next' },
        to: { owner: { kind: 'lui', luiId: 'writeCounter' }, portKey: 'next' },
      },
      writeToWritten: {
        from: { owner: { kind: 'lui', luiId: 'writeCounter' }, portKey: 'written' },
        to: { owner: { kind: 'lu' }, portKey: 'written' },
      },
    },
  },
};

export const asyncCompletionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { value: input(), doubled: output() },
    closures: {},
    luis: {
      double: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.async',
          key: 'double',
        },
        ports: { value: input(), doubled: output() },
        fulfillments: {},
      },
    },
    connections: {
      valueToDouble: {
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'double' }, portKey: 'value' },
      },
      doubleToOutput: {
        from: { owner: { kind: 'lui', luiId: 'double' }, portKey: 'doubled' },
        to: { owner: { kind: 'lu' }, portKey: 'doubled' },
      },
    },
  },
};

export const fulfillmentFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {
    math: {
      kind: 'inline',
      service: {
        fulfillmentScope: 'independent-units',
        units: {
          increment: {
            kind: 'combinational',
            ports: { value: input(), result: output() },
            requirements: {},
          },
        },
      },
    },
  },
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { value: input(), local: output(), upstream: output() },
    closures: {
      localIncrement: {
        forwardedPortKeys: { inputs: ['value'], outputs: ['result'] },
        core: {
          kindOrganization: { kind: 'combinational' },
          ports: { value: input(), result: output() },
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
        ports: { value: input(), result: output() },
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
        ports: { value: input(), result: output() },
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
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'localIncrement' }, portKey: 'value' },
      },
      localToOut: {
        from: { owner: { kind: 'lui', luiId: 'localIncrement' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'local' },
      },
      valueToUpstream: {
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'upstreamIncrement' }, portKey: 'value' },
      },
      upstreamToOut: {
        from: { owner: { kind: 'lui', luiId: 'upstreamIncrement' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'upstream' },
      },
    },
  },
};

export const sequentialControlFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'sequential', steps: ['loop'] },
    ports: { start: input(), result: output() },
    closures: {},
    luis: {
      loop: {
        kind: 'sequential',
        target: {
          kind: 'external',
          namespace: 'logicir.software.control-flow',
          key: 'loop-until',
        },
        ports: { start: input(), result: output() },
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
        from: { owner: { kind: 'lu' }, portKey: 'start' },
        to: { owner: { kind: 'lui', luiId: 'loop' }, portKey: 'start' },
      },
      loopToResult: {
        from: { owner: { kind: 'lui', luiId: 'loop' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
  },
};

export const payloadPathFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { source: input(), picked: output() },
    closures: {},
    luis: {
      pick: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.payload',
          key: 'pick',
        },
        ports: { value: input(), out: output() },
        fulfillments: {},
      },
    },
    connections: {
      sourceToPick: {
        from: {
          owner: { kind: 'lu' },
          portKey: 'source',
          payloadPath: ['nested', 'value'],
        },
        to: { owner: { kind: 'lui', luiId: 'pick' }, portKey: 'value' },
      },
      pickToOutput: {
        from: {
          owner: { kind: 'lui', luiId: 'pick' },
          portKey: 'out',
          payloadPath: ['payload', 'answer'],
        },
        to: {
          owner: { kind: 'lu' },
          portKey: 'picked',
          payloadPath: ['value'],
        },
      },
    },
  },
};

export const thenableCompletionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { value: input(), tripled: output() },
    closures: {},
    luis: {
      triple: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.thenable',
          key: 'triple',
        },
        ports: { value: input(), tripled: output() },
        fulfillments: {},
      },
    },
    connections: {
      valueToTriple: {
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'triple' }, portKey: 'value' },
      },
      tripleToOutput: {
        from: { owner: { kind: 'lui', luiId: 'triple' }, portKey: 'tripled' },
        to: { owner: { kind: 'lu' }, portKey: 'tripled' },
      },
    },
  },
};

export const emitFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: { message: input(), ack: output() },
    closures: {},
    luis: {
      emitMessage: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.events',
          key: 'emit-message',
        },
        ports: { message: input(), ack: output() },
        fulfillments: {},
      },
    },
    connections: {
      messageToEmitter: {
        from: { owner: { kind: 'lu' }, portKey: 'message' },
        to: { owner: { kind: 'lui', luiId: 'emitMessage' }, portKey: 'message' },
      },
      emitterToAck: {
        from: { owner: { kind: 'lui', luiId: 'emitMessage' }, portKey: 'ack' },
        to: { owner: { kind: 'lu' }, portKey: 'ack' },
      },
    },
  },
};

export const nestedInnerFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { value: input(), result: output() },
    closures: {},
    luis: {
      inc: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: 'increment-nested',
        },
        ports: { value: input(), result: output() },
        fulfillments: {},
      },
    },
    connections: {
      valueToInc: {
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'inc' }, portKey: 'value' },
      },
      incToResult: {
        from: { owner: { kind: 'lui', luiId: 'inc' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
  },
};

export const nestedOuterFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: { value: input(), result: output() },
    closures: {},
    luis: {
      nested: {
        kind: 'combinational',
        target: { kind: 'lu', luId: 'nested-inner' },
        ports: { value: input(), result: output() },
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
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'nested' }, portKey: 'value' },
      },
      nestedToResult: {
        from: { owner: { kind: 'lui', luiId: 'nested' }, portKey: 'result' },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
  },
};

export const reactiveSubscribeFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: { tick: input(), latest: output() },
    closures: {},
    luis: {
      mirror: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.events',
          key: 'mirror-event',
        },
        ports: { tick: input(), latest: output() },
        fulfillments: {},
      },
    },
    connections: {
      tickToMirror: {
        from: { owner: { kind: 'lu' }, portKey: 'tick' },
        to: { owner: { kind: 'lui', luiId: 'mirror' }, portKey: 'tick' },
      },
      mirrorToLatest: {
        from: { owner: { kind: 'lui', luiId: 'mirror' }, portKey: 'latest' },
        to: { owner: { kind: 'lu' }, portKey: 'latest' },
      },
    },
  },
};

export const structuralCompositionFixture: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: featureManifest,
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'structural',
      exportAnchors: { root: { required: true } },
      externalOutlets: {},
      exportAnchorFills: { root: { kind: 'empty' } },
      luiFills: {},
    },
    ports: { label: input(), text: input(), root: output() },
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
