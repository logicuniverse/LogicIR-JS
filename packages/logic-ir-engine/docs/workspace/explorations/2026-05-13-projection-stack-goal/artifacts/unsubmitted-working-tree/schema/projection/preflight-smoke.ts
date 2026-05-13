/**
 * Lightweight projection preflight smoke tests.
 */

import {
  childWithRequirementContractExample,
  combinationalAdderExample,
  requirementClosureParentExample,
  sharedServiceConsumerContractExample,
  sharedServiceUpstreamSupplierExample,
  statefulRetainedCounterExample,
  structuralCompositionExample,
} from '../core/v0-draft/examples';
import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../core/v0-draft/types';
import type {
  ExtensionRecord,
  LogicUnit,
  LUI,
  RequirementService,
} from '../core/v0-draft/types';
import type { ProjectorCapabilitySet } from './types';
import { preflightProjection } from './preflight';
import type { ProjectionPreflightOptions } from './preflight';
import {
  projectJSRuntimePlan,
  projectPythonRuntimePlan,
  projectVerilogHDLPlan,
} from './target-plans';
import {
  lowerJSExecutableRuntime,
  lowerJSRuntimeSkeleton,
  lowerPythonExecutableRuntime,
  lowerPythonRuntimeSkeleton,
  lowerVerilogModuleSkeleton,
} from './lowering';

const baseCoreCapability = {
  coreVersions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  luKinds: [
    'combinational',
    'sequential',
    'stateful',
    'structural',
  ],
  fulfillmentScopes: ['independent-units', 'shared-service'],
  portInteractions: {
    pullReadable: true,
    pushNotifiable: true,
    retainedCurrent: true,
  },
  endpointAddressing: {
    pins: true,
    payloadPath: true,
    maxPayloadPathDepth: 8,
  },
  structuralComposition: {
    exportAnchors: true,
    externalOutlets: true,
    childAnchors: true,
    childOutlets: true,
    collections: true,
    maps: true,
  },
  requirements: {
    inlineServices: true,
    externalServices: true,
    nestedPlainRequirements: true,
    closureFulfillment: true,
    upstreamUnitFulfillment: true,
    upstreamSharedServiceFulfillment: true,
  },
} satisfies ProjectorCapabilitySet['core'];

const typeSystemCapabilities = {
  name: 'type-system-smoke',
  target: 'type-system',
  core: baseCoreCapability,
  features: [
    {
      feature: { namespace: 'logicir.type-system', key: 'core' },
      extensionKeys: [
        'type-definitions',
        'payload-types',
        'port-compatibility',
        'requirement-compatibility',
        'composition-compatibility',
        'path-schema',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
  ],
  typeSystem: {
    feature: { namespace: 'logicir.type-system', key: 'core' },
    typeForms: ['primitive', 'record', 'array', 'tuple', 'union', 'named'],
    compatibilityPolicies: [
      'exact',
      'assignable',
      'widening',
      'projector-adapter',
      'custom',
    ],
    pathSchema: true,
    requirementCompatibility: true,
    compositionCompatibility: true,
  },
} satisfies ProjectorCapabilitySet;

const jsCapabilities = {
  name: 'js-runtime-smoke',
  target: 'js-runtime',
  core: baseCoreCapability,
  features: [
    {
      feature: { namespace: 'logicir.js-runtime', key: 'core' },
      extensionKeys: [
        'async-policy',
        'retained-current-realization',
        'dynamic-fulfillment',
        'lifecycle',
        'error-policy',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
  ],
  jsRuntime: {
    feature: { namespace: 'logicir.js-runtime', key: 'core' },
    invocation: ['sync', 'promise', 'async-iterator'],
    retainedCurrentRealization: [
      'source-store',
      'sink-cache',
      'projector-adapter',
      'host-observable',
    ],
    dynamicFulfillment: ['static-at-startup', 'switchable', 'late-bound'],
    lifecycleHooks: ['mount', 'start', 'stop', 'dispose'],
    errorPolicies: ['fail-projection', 'reject', 'emit-error', 'use-error-port'],
  },
} satisfies ProjectorCapabilitySet;

const pythonCapabilities = {
  name: 'python-runtime-smoke',
  target: 'python-runtime',
  core: baseCoreCapability,
  features: [
    {
      feature: { namespace: 'logicir.python-runtime', key: 'core' },
      extensionKeys: [
        'async-policy',
        'retained-current-realization',
        'dynamic-fulfillment',
        'resource-lifecycle',
        'concurrency',
        'error-policy',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
  ],
  pythonRuntime: {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    invocation: [
      'sync-call',
      'coroutine',
      'async-generator',
      'generator',
      'threadpool-call',
    ],
    retainedCurrentRealization: [
      'source-property',
      'sink-cache',
      'asyncio-queue-latest',
      'observable',
      'projector-adapter',
    ],
    dynamicFulfillment: [
      'constructor-injected',
      'contextvar',
      'service-container',
      'late-bound',
      'switchable',
    ],
    resourceLifecycle: [
      'none',
      'context-manager',
      'async-context-manager',
      'start-stop',
      'custom',
    ],
    concurrency: [
      'same-thread',
      'asyncio-task',
      'thread',
      'process',
      'external-worker',
    ],
    errorPolicies: [
      'raise',
      'return-exception',
      'emit-error',
      'cancel-task',
      'use-error-port',
    ],
  },
} satisfies ProjectorCapabilitySet;

const verilogCapabilities = {
  name: 'verilog-hdl-smoke',
  target: 'verilog-hdl',
  core: baseCoreCapability,
  features: [
    {
      feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
      extensionKeys: [
        'signal-types',
        'clock-reset',
        'module-binding',
        'combinational-assigns',
        'state-registers',
        'elaboration',
        'structural-slices',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
  ],
  verilogHDL: {
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    signalTypes: true,
    clockReset: true,
    moduleBinding: true,
    combinationalAssigns: true,
    stateRegisters: true,
    elaboration: ['static-only', 'generate-loop', 'unroll', 'specialize'],
    structuralSlices: true,
    supportsPushNotifiable: true,
    supportsRetainedCurrent: true,
    unsupportedRequiredBehavior: 'diagnostic',
  },
} satisfies ProjectorCapabilitySet;

expectClean(
  'type-system payload/path schema',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        sum: {
          ...combinationalAdderExample.core.ports.sum,
          extensions: [
            {
              feature: { namespace: 'logicir.type-system', key: 'core' },
              key: 'payload-types',
              requirement: 'required',
              payload: {
                type: { kind: 'primitive', name: 'int' },
              },
            },
            {
              feature: { namespace: 'logicir.type-system', key: 'core' },
              key: 'path-schema',
              requirement: 'optional',
              payload: {
                root: { kind: 'leaf', type: 'int' },
              },
            },
          ],
        },
      },
    },
  },
  typeSystemCapabilities
);

expectClean(
  'type-system path-schema validates payloadPath',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        bus: {
          boundary: 'output',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [
            {
              feature: { namespace: 'logicir.type-system', key: 'core' },
              key: 'path-schema',
              requirement: 'required',
              payload: {
                root: {
                  kind: 'record',
                  fields: {
                    lanes: {
                      kind: 'array',
                      item: { kind: 'leaf', type: 'int' },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      connections: {
        ...combinationalAdderExample.core.connections,
        sumToBusLane: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 0],
          },
        },
      },
    },
  },
  typeSystemCapabilities
);

expectClean(
  'type-system exact compatible connection',
  withPortPayloadTypes(combinationalAdderExample, {
    lu: {
      a: primitiveType('int'),
      b: primitiveType('int'),
      sum: primitiveType('int'),
    },
    luis: {
      adder: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
    },
  }),
  typeSystemCapabilities
);

expectClean(
  'type-system named type registry lookup',
  {
    ...withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: namedType('logicir.examples.types', 'scalar'),
        b: namedType('logicir.examples.types', 'scalar'),
        sum: namedType('logicir.examples.types', 'scalar'),
      },
      luis: {
        adder: {
          a: primitiveType('int'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    extensions: [
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'type-definitions',
        requirement: 'required',
        payload: {
          definitions: {
            scalar: {
              namespace: 'logicir.examples.types',
              key: 'scalar',
              kind: 'primitive',
              name: 'int',
            },
          },
        },
      },
    ],
  },
  typeSystemCapabilities
);

expectClean(
  'type-system widening connection',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('float'),
      },
      luis: {
        adder: {
          a: primitiveType('float'),
          b: primitiveType('float'),
          sum: primitiveType('int'),
        },
      },
    }),
    'widening'
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system recursive widening connection',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'record',
          fields: {
            value: primitiveType('int'),
            lanes: {
              kind: 'tuple',
              items: [primitiveType('int'), primitiveType('int')],
            },
          },
        },
        b: primitiveType('int'),
        sum: {
          kind: 'array',
          item: primitiveType('float'),
          length: 2,
        },
      },
      luis: {
        adder: {
          a: {
            kind: 'record',
            fields: {
              value: primitiveType('float'),
              lanes: {
                kind: 'tuple',
                items: [primitiveType('float'), primitiveType('float')],
              },
            },
          },
          b: primitiveType('float'),
          sum: {
            kind: 'array',
            item: primitiveType('int'),
            length: 2,
          },
        },
      },
    }),
    'widening'
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system endpoint-scoped widening connection',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: primitiveType('float'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'widening',
    undefined,
    {
      from: { portKey: 'a' },
      to: { portKey: 'a' },
    }
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system projector adapter connection',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('string'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: primitiveType('int'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'projector-adapter',
    { namespace: 'logicir.examples.adapters', key: 'string-to-int' }
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system assignable optional record field',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: { kind: 'record', fields: { value: primitiveType('int') } },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: {
            kind: 'record',
            fields: {
              value: primitiveType('int'),
              label: { type: primitiveType('string'), optional: true },
            },
          },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system assignable record width subtype',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'record',
          fields: {
            value: primitiveType('int'),
            traceId: primitiveType('string'),
          },
        },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: { kind: 'record', fields: { value: primitiveType('int') } },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system assignable tuple to fixed array',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'tuple',
          items: [primitiveType('int'), primitiveType('int')],
        },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: {
            kind: 'array',
            item: primitiveType('float'),
            length: 2,
          },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities
);

expectClean(
  'type-system assignable into union',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: unionType(primitiveType('int'), primitiveType('string')),
      },
      luis: {
        adder: {
          a: primitiveType('int'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities
);

expectCode(
  'bad endpoint-scoped widening selector miss',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: primitiveType('float'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'widening',
    undefined,
    {
      from: { portKey: 'b' },
      to: { portKey: 'a' },
    }
  ),
  typeSystemCapabilities,
  'EXT-123'
);

expectCode(
  'bad structural widening compatibility',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'record',
          fields: {
            value: primitiveType('int'),
          },
        },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: {
            kind: 'record',
            fields: {
              value: primitiveType('float'),
              label: primitiveType('string'),
            },
          },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'widening'
  ),
  typeSystemCapabilities,
  'EXT-123'
);

expectCode(
  'bad projector adapter evidence',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: primitiveType('string'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: primitiveType('int'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'projector-adapter'
  ),
  typeSystemCapabilities,
  'EXT-137'
);

expectCode(
  'bad requirement adapter evidence',
  {
    ...combinationalAdderExample,
    extensions: [
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'requirement-compatibility',
        requirement: 'required',
        payload: {
          relation: 'adapter-required',
        },
      },
    ],
  },
  typeSystemCapabilities,
  'EXT-138'
);

expectClean(
  'type-system composition compatibility',
  withStructuralCompositionTypes(structuralCompositionExample),
  typeSystemCapabilities
);

expectClean(
  'js runtime retained-current',
  {
    ...statefulRetainedCounterExample,
    core: {
      ...statefulRetainedCounterExample.core,
      ports: {
        ...statefulRetainedCounterExample.core.ports,
        value: {
          ...statefulRetainedCounterExample.core.ports.value,
          extensions: [
            {
              feature: { namespace: 'logicir.js-runtime', key: 'core' },
              key: 'retained-current-realization',
              requirement: 'required',
              payload: {
                realization: 'source-store',
                notification: 'subscribe',
              },
            },
          ],
        },
      },
    },
  },
  jsCapabilities
);

expectClean(
  'python concurrency',
  {
    ...statefulRetainedCounterExample,
    core: {
      ...statefulRetainedCounterExample.core,
      extensions: [
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'concurrency',
          requirement: 'required',
          payload: {
            selector: { luiId: 'counterState' },
            execution: 'asyncio-task',
            backpressure: 'latest',
            ordering: 'preserve',
          },
        },
      ],
    },
  },
  pythonCapabilities
);

expectClean(
  'verilog structural slices',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      extensions: [
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'structural-slices',
          requirement: 'required',
          payload: {
            slices: {
              root: { moduleName: 'RootSlice' },
              aside: { moduleName: 'AsideSlice' },
            },
            bus: {
              routing: 'payload-path',
              channelPath: ['slice'],
            },
          },
        },
      ],
    },
  },
  verilogCapabilities
);

expectCode(
  'bad type expression',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        sum: {
          ...combinationalAdderExample.core.ports.sum,
          extensions: [
            {
              feature: { namespace: 'logicir.type-system', key: 'core' },
              key: 'payload-types',
              requirement: 'required',
              payload: {
                type: { kind: 'array', item: { kind: 'unknown' } },
              },
            },
          ],
        },
      },
    },
  } as unknown as LogicUnit,
  typeSystemCapabilities,
  'EXT-109'
);

expectCode(
  'bad path-schema payloadPath',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        bus: {
          boundary: 'output',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [
            {
              feature: { namespace: 'logicir.type-system', key: 'core' },
              key: 'path-schema',
              requirement: 'required',
              payload: {
                root: {
                  kind: 'record',
                  fields: {
                    lanes: {
                      kind: 'array',
                      item: { kind: 'leaf', type: 'int' },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      connections: {
        ...combinationalAdderExample.core.connections,
        sumToBusLane: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 'bad'],
          },
        },
      },
    },
  },
  typeSystemCapabilities,
  'EXT-120'
);

expectCode(
  'bad optional record field compatibility',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'record',
          fields: {
            value: primitiveType('int'),
            label: { type: primitiveType('string'), optional: true },
          },
        },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: {
            kind: 'record',
            fields: {
              value: primitiveType('int'),
              label: primitiveType('string'),
            },
          },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities,
  'EXT-123'
);

expectCode(
  'bad tuple to fixed array compatibility',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: {
          kind: 'tuple',
          items: [primitiveType('int'), primitiveType('string')],
        },
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: {
            kind: 'array',
            item: primitiveType('int'),
            length: 2,
          },
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities,
  'EXT-123'
);

expectCode(
  'bad union source assignability',
  withConnectionPolicy(
    withPortPayloadTypes(combinationalAdderExample, {
      lu: {
        a: unionType(primitiveType('int'), primitiveType('string')),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
      luis: {
        adder: {
          a: primitiveType('int'),
          b: primitiveType('int'),
          sum: primitiveType('int'),
        },
      },
    }),
    'assignable'
  ),
  typeSystemCapabilities,
  'EXT-123'
);

expectCode(
  'bad exact type compatibility',
  withPortPayloadTypes(combinationalAdderExample, {
    lu: {
      a: primitiveType('string'),
      b: primitiveType('int'),
      sum: primitiveType('int'),
    },
    luis: {
      adder: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
    },
  }),
  typeSystemCapabilities,
  'EXT-123'
);

const typedStructuralComposition = withStructuralCompositionTypes(
  structuralCompositionExample
);
expectCode(
  'bad composition compatibility',
  {
    ...typedStructuralComposition,
    core: {
      ...typedStructuralComposition.core,
      kindOrganization: {
        ...typedStructuralComposition.core.kindOrganization,
        luiFills: {
          ...structuralCompositionExample.core.kindOrganization.luiFills,
          header: {
            ...structuralCompositionExample.core.kindOrganization.luiFills.header,
            title: { kind: 'lui-outlet', luiId: 'content', outletKey: 'root' },
          },
        },
      },
    } as LogicUnit['core'],
  },
  typeSystemCapabilities,
  'EXT-134'
);

expectCode(
  'unknown named type',
  withPortPayloadTypes(combinationalAdderExample, {
    lu: {
      a: namedType('logicir.examples.types', 'missing'),
      b: primitiveType('int'),
      sum: primitiveType('int'),
    },
    luis: {
      adder: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
    },
  }),
  typeSystemCapabilities,
  'EXT-125'
);

const typedRequirementClosure = withRequirementClosureTypes(
  requirementClosureParentExample,
  childWithRequirementContractExample
);
expectClean(
  'type-system requirement closure compatibility',
  typedRequirementClosure.parent,
  typeSystemCapabilities,
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth' ? typedRequirementClosure.child : undefined,
  }
);

const structuralSubtypeRequirementClosure = withRequirementClosureTypes(
  requirementClosureParentExample,
  childWithRequirementContractExample,
  {
    subjectType: { kind: 'record', fields: { user: primitiveType('string') } },
    closureSubjectType: {
      kind: 'record',
      fields: {
        user: primitiveType('string'),
        traceId: primitiveType('string'),
      },
    },
  }
);
expectClean(
  'type-system requirement structural-subtype compatibility',
  structuralSubtypeRequirementClosure.parent,
  typeSystemCapabilities,
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth'
        ? structuralSubtypeRequirementClosure.child
        : undefined,
  }
);

const sameContractRequirementClosure = withRequirementClosureTypes(
  requirementClosureParentExample,
  childWithRequirementContractExample,
  {
    subjectType: { kind: 'record', fields: { user: primitiveType('string') } },
    closureSubjectType: {
      kind: 'record',
      fields: {
        user: primitiveType('string'),
        traceId: primitiveType('string'),
      },
    },
    relation: 'same-contract',
  }
);
expectCode(
  'bad requirement same-contract compatibility',
  sameContractRequirementClosure.parent,
  typeSystemCapabilities,
  'EXT-135',
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth'
        ? sameContractRequirementClosure.child
        : undefined,
  }
);

const badTypedRequirementClosure = withRequirementClosureTypes(
  requirementClosureParentExample,
  childWithRequirementContractExample,
  { closureAllowedType: primitiveType('string') }
);
expectCode(
  'bad requirement closure compatibility',
  badTypedRequirementClosure.parent,
  typeSystemCapabilities,
  'EXT-135',
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth' ? badTypedRequirementClosure.child : undefined,
  }
);

const typedUpstreamRequirement = withUpstreamRequirementTypes();
expectClean(
  'type-system upstream unit compatibility',
  typedUpstreamRequirement.parent,
  typeSystemCapabilities,
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth-upstream'
        ? typedUpstreamRequirement.child
        : undefined,
    resolveRequirementService: (namespace, key) =>
      namespace === 'logicir.examples.requirements' && key === 'auth-provider'
        ? typedUpstreamRequirement.supplierService
        : undefined,
  }
);

const badTypedUpstreamRequirement = withUpstreamRequirementTypes({
  supplierAllowedType: primitiveType('string'),
});
expectCode(
  'bad upstream unit compatibility',
  badTypedUpstreamRequirement.parent,
  typeSystemCapabilities,
  'EXT-135',
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth-upstream'
        ? badTypedUpstreamRequirement.child
        : undefined,
    resolveRequirementService: (namespace, key) =>
      namespace === 'logicir.examples.requirements' && key === 'auth-provider'
        ? badTypedUpstreamRequirement.supplierService
        : undefined,
  }
);

const nestedUpstreamRequirement = withNestedUpstreamRequirementTypes();
expectClean(
  'type-system nested upstream unit compatibility',
  nestedUpstreamRequirement.parent,
  typeSystemCapabilities,
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth-upstream-nested'
        ? nestedUpstreamRequirement.child
        : undefined,
    resolveRequirementService: (namespace, key) =>
      namespace === 'logicir.examples.requirements' && key === 'auth-provider'
        ? nestedUpstreamRequirement.supplierService
        : undefined,
  }
);

const badNestedUpstreamRequirement = withNestedUpstreamRequirementTypes({
  supplierIdentityType: primitiveType('int'),
});
expectCode(
  'bad nested upstream unit compatibility',
  badNestedUpstreamRequirement.parent,
  typeSystemCapabilities,
  'EXT-135',
  {
    resolveLogicUnit: (luId) =>
      luId === 'child-with-auth-upstream-nested'
        ? badNestedUpstreamRequirement.child
        : undefined,
    resolveRequirementService: (namespace, key) =>
      namespace === 'logicir.examples.requirements' && key === 'auth-provider'
        ? badNestedUpstreamRequirement.supplierService
        : undefined,
  }
);

const typedSharedServiceRequirement = withSharedServiceRequirementTypes();
expectClean(
  'type-system shared-service compatibility',
  typedSharedServiceRequirement.parent,
  typeSystemCapabilities,
  {
    resolveLogicUnit: (luId) =>
      luId === 'shared-cache-consumer'
        ? typedSharedServiceRequirement.child
        : undefined,
  }
);

const badTypedSharedServiceRequirement = withSharedServiceRequirementTypes({
  supplierValueType: primitiveType('string'),
});
expectCode(
  'bad shared-service compatibility',
  badTypedSharedServiceRequirement.parent,
  typeSystemCapabilities,
  'EXT-135',
  {
    resolveLogicUnit: (luId) =>
      luId === 'shared-cache-consumer'
        ? badTypedSharedServiceRequirement.child
        : undefined,
  }
);

expectCode(
  'bad selector',
  {
    ...statefulRetainedCounterExample,
    core: {
      ...statefulRetainedCounterExample.core,
      extensions: [
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'concurrency',
          requirement: 'required',
          payload: {
            selector: { luiId: 'missing' },
            execution: 'asyncio-task',
          },
        },
      ],
    },
  },
  pythonCapabilities,
  'EXT-522'
);

expectCode(
  'unsupported JS invocation',
  {
    ...statefulRetainedCounterExample,
    core: {
      ...statefulRetainedCounterExample.core,
      extensions: [
        {
          feature: { namespace: 'logicir.js-runtime', key: 'core' },
          key: 'async-policy',
          requirement: 'required',
          payload: {
            invocation: 'async-iterator',
          },
        },
      ],
    },
  },
  {
    ...jsCapabilities,
    jsRuntime: {
      ...jsCapabilities.jsRuntime,
      invocation: ['sync', 'promise'],
    },
  },
  'EXT-201'
);

expectCode(
  'verilog push unsupported',
  statefulRetainedCounterExample,
  {
    ...verilogCapabilities,
    core: {
      ...verilogCapabilities.core,
      portInteractions: {
        pullReadable: true,
        pushNotifiable: false,
        retainedCurrent: false,
      },
    },
  },
  'PRJ-017'
);

expectCode(
  'unsupported required union type form',
  withPortPayloadTypes(combinationalAdderExample, {
    lu: {
      a: unionType(primitiveType('int'), primitiveType('string')),
      b: primitiveType('int'),
      sum: primitiveType('int'),
    },
    luis: {
      adder: {
        a: primitiveType('int'),
        b: primitiveType('int'),
        sum: primitiveType('int'),
      },
    },
  }),
  {
    ...typeSystemCapabilities,
    typeSystem: {
      ...typeSystemCapabilities.typeSystem,
      typeForms: ['primitive', 'record', 'array', 'tuple', 'named'],
    },
  },
  'EXT-110'
);

expectCode(
  'verilog dynamic fulfillment unsupported',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      extensions: [
        {
          feature: { namespace: 'logicir.js-runtime', key: 'core' },
          key: 'dynamic-fulfillment',
          requirement: 'required',
          payload: {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'switchable',
            consistency: 'quiescent-switch',
          },
        },
      ],
    },
  },
  verilogCapabilities,
  'PRJ-027'
);

expectCode(
  'bad verilog structural slice interface width',
  withHDLStructuralSlices(structuralCompositionExample, {
    slices: {
      root: { moduleName: 'RootSlice', rx: { portName: 'rx_bus', width: 0 } },
      aside: { moduleName: 'AsideSlice' },
    },
  }),
  verilogCapabilities,
  'EXT-438'
);

expectCode(
  'bad verilog structural slice fan-in policy',
  withHDLStructuralSlices(structuralCompositionExample, {
    slices: {
      root: { moduleName: 'RootSlice' },
      aside: { moduleName: 'AsideSlice' },
    },
    fanIn: {
      root: { policy: 'custom' as 'or' },
    },
  }),
  verilogCapabilities,
  'EXT-443'
);

const jsPlan = projectJSRuntimePlan(statefulRetainedCounterExample, jsCapabilities);
assert(jsPlan.ok, 'JS runtime plan should be created for stateful counter.');
assert(
  jsPlan.ok && jsPlan.plan.core.kind === 'stateful',
  'JS runtime plan should preserve core kind.'
);
const jsArtifact = jsPlan.ok ? lowerJSRuntimeSkeleton(jsPlan.plan) : undefined;
assert(
  jsArtifact !== undefined && jsArtifact.content.includes('createRuntimeSkeleton'),
  'JS lowering should produce a runtime skeleton artifact.'
);
const jsExecutableArtifact = jsPlan.ok
  ? lowerJSExecutableRuntime(jsPlan.plan)
  : undefined;
assert(
  jsExecutableArtifact !== undefined &&
    jsExecutableArtifact.content.includes('createRuntime'),
  'JS lowering should produce an executable runtime artifact.'
);

const pythonPlan = projectPythonRuntimePlan(
  statefulRetainedCounterExample,
  pythonCapabilities
);
assert(
  pythonPlan.ok,
  'Python runtime plan should be created for stateful counter.'
);
const pythonArtifact = pythonPlan.ok
  ? lowerPythonRuntimeSkeleton(pythonPlan.plan)
  : undefined;
assert(
  pythonArtifact !== undefined &&
    pythonArtifact.content.includes('LogicIRRuntimeSkeleton'),
  'Python lowering should produce a runtime skeleton artifact.'
);
const pythonExecutableArtifact = pythonPlan.ok
  ? lowerPythonExecutableRuntime(pythonPlan.plan)
  : undefined;
assert(
  pythonExecutableArtifact !== undefined &&
    pythonExecutableArtifact.content.includes('create_runtime'),
  'Python lowering should produce an executable runtime artifact.'
);

const missingSignalPlan = projectVerilogHDLPlan(
  combinationalAdderExample,
  verilogCapabilities
);
assert(
  !missingSignalPlan.ok &&
    missingSignalPlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-001'
    ),
  'Verilog HDL plan should require signal-types on concrete ports.'
);

const hdlStatefulWithoutClock = projectVerilogHDLPlan(
  withStatefulHDLSignalTypes(statefulRetainedCounterExample),
  verilogCapabilities
);
assert(
  !hdlStatefulWithoutClock.ok &&
    hdlStatefulWithoutClock.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-002'
    ),
  'Verilog HDL plan should require clock-reset for stateful cores.'
);

const hdlExternalWithoutBinding = projectVerilogHDLPlan(
  withHDLSignalTypes(withExternalAdderTarget(combinationalAdderExample), {
    a: 8,
    b: 8,
    sum: 9,
  }),
  verilogCapabilities
);
assert(
  !hdlExternalWithoutBinding.ok &&
    hdlExternalWithoutBinding.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-003'
    ),
  'Verilog HDL plan should require module-binding for external LUI targets.'
);

const hdlRegistryBoundExternalPlan = projectVerilogHDLPlan(
  withHDLSignalTypes(withExternalAdderTarget(combinationalAdderExample), {
    a: 8,
    b: 8,
    sum: 9,
  }),
  withHDLModuleRegistry(verilogCapabilities, {
    'logicir.examples.hdl/adder8': {
      moduleName: 'adder8',
      instanceName: 'u_registry_adder',
      portMap: {
        a: 'lhs',
        b: 'rhs',
        sum: 'out',
      },
      interface: {
        lhs: { direction: 'input', width: 8 },
        rhs: { direction: 'input', width: 8 },
        out: { direction: 'output', width: 9 },
      },
    },
  })
);
assert(
  hdlRegistryBoundExternalPlan.ok,
  'Verilog HDL plan should use projector module registry bindings for external targets.'
);
const hdlRegistryBoundExternalArtifact = hdlRegistryBoundExternalPlan.ok
  ? lowerVerilogModuleSkeleton(
      hdlRegistryBoundExternalPlan.plan,
      'registry_bound_adder'
    )
  : undefined;
assert(
  hdlRegistryBoundExternalArtifact !== undefined &&
    hdlRegistryBoundExternalArtifact.content.includes('adder8 u_registry_adder') &&
    hdlRegistryBoundExternalArtifact.content.includes('.lhs(lui_adder_a)') &&
    hdlRegistryBoundExternalArtifact.content.includes('.out(lui_adder_sum)'),
  'Verilog lowering should emit module instances from projector module registry bindings.'
);

const hdlBadRegistryInterfacePlan = projectVerilogHDLPlan(
  withHDLSignalTypes(withExternalAdderTarget(combinationalAdderExample), {
    a: 8,
    b: 8,
    sum: 9,
  }),
  withHDLModuleRegistry(verilogCapabilities, {
    'logicir.examples.hdl/adder8': {
      moduleName: 'adder8',
      portMap: {
        a: 'lhs',
        b: 'rhs',
        sum: 'out',
      },
      interface: {
        lhs: { direction: 'input', width: 8 },
        rhs: { direction: 'input', width: 8 },
        out: { direction: 'output', width: 8 },
      },
    },
  })
);
assert(
  !hdlBadRegistryInterfacePlan.ok &&
    hdlBadRegistryInterfacePlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-007'
    ),
  'Verilog HDL plan should reject module registry interface mismatches.'
);

const hdlTypedAdder = withHDLSignalTypes(combinationalAdderExample, {
  a: 8,
  b: 8,
  sum: 9,
});
const hdlBoundAdder = withHDLModuleBinding(hdlTypedAdder, {
  moduleName: 'adder8',
  instanceName: 'u_adder',
  portMap: {
    a: 'lhs',
    b: 'rhs',
    sum: 'out',
  },
});
const hdlPlan = projectVerilogHDLPlan(hdlBoundAdder, verilogCapabilities);
assert(hdlPlan.ok, 'Verilog HDL plan should be created for typed adder.');
assert(
  hdlPlan.ok && hdlPlan.plan.signals.length === 6,
  'Verilog HDL plan should collect LU and LUI signal plans.'
);
const hdlArtifact = hdlPlan.ok
  ? lowerVerilogModuleSkeleton(hdlPlan.plan, 'typed_adder')
  : undefined;
assert(
  hdlArtifact !== undefined && hdlArtifact.content.includes('module typed_adder'),
  'Verilog lowering should produce a module skeleton artifact.'
);
assert(
  hdlArtifact !== undefined &&
    hdlArtifact.content.includes('wire [7:0] lui_adder_a;') &&
    hdlArtifact.content.includes('assign lui_adder_a = a;') &&
    hdlArtifact.content.includes('assign sum = lui_adder_sum;'),
  'Verilog lowering should emit internal wires and direct assign wiring.'
);
assert(
  hdlArtifact !== undefined &&
    hdlArtifact.content.includes('adder8 u_adder') &&
    hdlArtifact.content.includes('.lhs(lui_adder_a)') &&
    hdlArtifact.content.includes('.out(lui_adder_sum)'),
  'Verilog lowering should emit module instances from module-binding extensions.'
);

const hdlBehaviorAdder = withHDLCombinationalAssigns(hdlTypedAdder);
const hdlBehaviorPlan = projectVerilogHDLPlan(
  hdlBehaviorAdder,
  verilogCapabilities
);
assert(
  hdlBehaviorPlan.ok,
  'Verilog HDL plan should support combinational-assigns behavior.'
);
const hdlBehaviorArtifact = hdlBehaviorPlan.ok
  ? lowerVerilogModuleSkeleton(hdlBehaviorPlan.plan, 'behavior_adder')
  : undefined;
assert(
  hdlBehaviorArtifact !== undefined &&
    hdlBehaviorArtifact.content.includes(
      'assign lui_adder_sum = (lui_adder_a + lui_adder_b);'
    ) &&
    hdlBehaviorArtifact.content.includes(
      "assign lui_adder_a = ((|lui_adder_b) ? 8'($unsigned(1'd1)) : 8'd0);"
    ),
  'Verilog lowering should emit combinational behavior assigns.'
);

const hdlBadBehaviorWidthPlan = projectVerilogHDLPlan(
  withHDLBadWidthCombinationalAssign(hdlTypedAdder),
  verilogCapabilities
);
assert(
  !hdlBadBehaviorWidthPlan.ok &&
    hdlBadBehaviorWidthPlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-004'
    ),
  'Verilog HDL plan should reject combinational assign width mismatches.'
);

const hdlPayloadPathAdder = withHDLModuleBinding(
  withHDLPayloadPathSignalTypes(combinationalAdderExample),
  {
    moduleName: 'adder8',
    instanceName: 'u_adder',
  }
);
const hdlPayloadPathPlan = projectVerilogHDLPlan(
  hdlPayloadPathAdder,
  verilogCapabilities
);
assert(
  hdlPayloadPathPlan.ok,
  'Verilog HDL plan should support explicitly typed payloadPath signals.'
);
const hdlPayloadPathArtifact = hdlPayloadPathPlan.ok
  ? lowerVerilogModuleSkeleton(hdlPayloadPathPlan.plan, 'payload_path_adder')
  : undefined;
assert(
  hdlPayloadPathArtifact !== undefined &&
    hdlPayloadPathArtifact.content.includes('output [8:0] bus_lanes_0;') &&
    hdlPayloadPathArtifact.content.includes(
      'assign bus_lanes_0 = lui_adder_sum;'
    ) &&
    hdlPayloadPathArtifact.content.includes(
      'assign bus[8:0] = lui_adder_sum;'
    ) &&
    hdlPayloadPathArtifact.content.includes(
      'assign bus_lanes_1 = lui_adder_sum;'
    ) &&
    hdlPayloadPathArtifact.content.includes(
      'assign bus[17:9] = lui_adder_sum;'
    ),
  'Verilog lowering should flatten typed payloadPath endpoints and assemble packed root ports.'
);

const hdlSourcePackedLane = withHDLModuleBinding(
  withHDLSourcePackedLaneSignalTypes(combinationalAdderExample),
  {
    moduleName: 'adder8',
    instanceName: 'u_adder',
  }
);
const hdlSourcePackedLanePlan = projectVerilogHDLPlan(
  hdlSourcePackedLane,
  verilogCapabilities
);
assert(
  hdlSourcePackedLanePlan.ok,
  'Verilog HDL plan should support source-side packed payload lanes.'
);
const hdlSourcePackedLaneArtifact = hdlSourcePackedLanePlan.ok
  ? lowerVerilogModuleSkeleton(
      hdlSourcePackedLanePlan.plan,
      'source_packed_lane_adder'
    )
  : undefined;
assert(
  hdlSourcePackedLaneArtifact !== undefined &&
    hdlSourcePackedLaneArtifact.content.includes('input [15:0] bus;') &&
    hdlSourcePackedLaneArtifact.content.includes(
      'assign lui_adder_a = bus[7:0];'
    ) &&
    hdlSourcePackedLaneArtifact.content.includes(
      'assign lui_adder_b = bus[15:8];'
    ),
  'Verilog lowering should use packed root part-selects for source payload lanes.'
);

const hdlClockedStateful = withStatefulClockReset(
  withStatefulHDLModuleBinding(
    withStatefulHDLSignalTypes(statefulRetainedCounterExample)
  )
);
const hdlClockedStatefulPlan = projectVerilogHDLPlan(
  hdlClockedStateful,
  verilogCapabilities
);
assert(
  hdlClockedStatefulPlan.ok,
  'Verilog HDL plan should accept stateful cores with signal-types and clock-reset.'
);
const hdlClockedStatefulArtifact = hdlClockedStatefulPlan.ok
  ? lowerVerilogModuleSkeleton(hdlClockedStatefulPlan.plan, 'clocked_counter')
  : undefined;
assert(
  hdlClockedStatefulArtifact !== undefined &&
    hdlClockedStatefulArtifact.content.includes(
      '// HDL clock-reset domain main: posedge clk reset=rst sync active-high'
    ) &&
    hdlClockedStatefulArtifact.content.includes('.clk(clk)') &&
    hdlClockedStatefulArtifact.content.includes('.rst(rst)'),
  'Verilog lowering should preserve clock-reset domain data and wire bound clocked instances.'
);

const hdlStateRegister = withStatefulClockReset(
  withStatefulHDLStateRegisters(
    withStatefulHDLSignalTypes(statefulRetainedCounterExample)
  )
);
const hdlStateRegisterPlan = projectVerilogHDLPlan(
  hdlStateRegister,
  verilogCapabilities
);
assert(
  hdlStateRegisterPlan.ok,
  'Verilog HDL plan should accept state-register behavior for a stateful core.'
);
const hdlStateRegisterArtifact = hdlStateRegisterPlan.ok
  ? lowerVerilogModuleSkeleton(hdlStateRegisterPlan.plan, 'registered_counter')
  : undefined;
assert(
  hdlStateRegisterArtifact !== undefined &&
    hdlStateRegisterArtifact.content.includes('reg [31:0] lui_counterState_value;') &&
    hdlStateRegisterArtifact.content.includes('always @(posedge clk) begin') &&
    hdlStateRegisterArtifact.content.includes('if (rst) begin') &&
    hdlStateRegisterArtifact.content.includes("lui_counterState_value <= 32'd0;") &&
    hdlStateRegisterArtifact.content.includes(
      'end else if (lui_counterState_increment) begin'
    ) &&
    hdlStateRegisterArtifact.content.includes(
      "lui_counterState_value <= (lui_counterState_value + 32'($unsigned(lui_counterState_increment)));"
    ),
  'Verilog lowering should emit enabled state register behavior from state-registers.'
);

const hdlBadStateRegisterWidthPlan = projectVerilogHDLPlan(
  withStatefulClockReset(
    withBadWidthStatefulHDLStateRegisters(
      withStatefulHDLSignalTypes(statefulRetainedCounterExample)
    )
  ),
  verilogCapabilities
);
assert(
  !hdlBadStateRegisterWidthPlan.ok &&
    hdlBadStateRegisterWidthPlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-005'
    ),
  'Verilog HDL plan should reject state-register width mismatches.'
);

const hdlBadStateRegisterEnablePlan = projectVerilogHDLPlan(
  withStatefulClockReset(
    withBadEnableStatefulHDLStateRegisters(
      withStatefulHDLSignalTypes(statefulRetainedCounterExample)
    )
  ),
  verilogCapabilities
);
assert(
  !hdlBadStateRegisterEnablePlan.ok &&
    hdlBadStateRegisterEnablePlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-006'
    ),
  'Verilog HDL plan should reject non-1-bit state-register enable expressions.'
);

const hdlStructuralSlicePlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(structuralCompositionExample),
  verilogCapabilities
);
assert(
  hdlStructuralSlicePlan.ok &&
    hdlStructuralSlicePlan.plan.structuralSlicePlans.length === 2 &&
    hdlStructuralSlicePlan.plan.structuralSlicePlans.some(
      (slice) =>
        slice.anchorKey === 'root' &&
        slice.moduleName === 'RootSlice' &&
        slice.root?.kind === 'lui-outlet' &&
        slice.footprint.luis.join(',') === 'content,header' &&
        slice.footprint.luiOutlets.some(
          (ref) => ref.luiId === 'header' && ref.outletKey === 'root'
        ) &&
        slice.footprint.luiOutlets.some(
          (ref) => ref.luiId === 'content' && ref.outletKey === 'root'
        ) &&
        slice.footprint.externalOutlets.includes('title') &&
        slice.footprint.anchors.some(
          (ref) => ref.luiId === 'header' && ref.anchorKey === 'actions'
        )
    ),
  'Verilog HDL plan should derive structural slice plans and static child placement footprints from structural export anchors.'
);
const hdlStructuralSliceArtifact = hdlStructuralSlicePlan.ok
  ? lowerVerilogModuleSkeleton(
      hdlStructuralSlicePlan.plan,
      'structural_slices'
    )
  : undefined;
assert(
  hdlStructuralSliceArtifact !== undefined &&
    hdlStructuralSliceArtifact.content.includes(
      '// Planned structural slice partitions.'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '// slice root -> module RootSlice (required)'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   root=lui:header.root'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   routing=payload-path channelPath=slice'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   footprint.luis=content,header'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   footprint.luiOutlets=content.root,header.root'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   footprint.externalOutlets=title'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '//   footprint.anchors=header.actions,header.title'
    ) &&
    hdlStructuralSliceArtifact.content.includes(
      '// Structural slice stub for export anchor root.'
    ) &&
    hdlStructuralSliceArtifact.content.includes('module RootSlice') &&
    hdlStructuralSliceArtifact.content.includes('module AsideSlice'),
  'Verilog lowering should preserve planned structural slice metadata and emit slice module stubs.'
);

const hdlStructuralSliceBusPlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(structuralCompositionExample, {
    slices: {
      root: {
        moduleName: 'RootSlice',
        rx: { portName: 'rx_bus', width: 16, packed: true },
        tx: { portName: 'tx_bus', width: 8, signed: true, packed: true },
      },
      aside: {
        moduleName: 'AsideSlice',
        tx: { portName: 'tx_bus', width: 16, packed: true },
      },
    },
    bus: {
      routing: 'payload-path',
      channelPath: ['slice'],
    },
  }),
  verilogCapabilities
);
assert(
  hdlStructuralSliceBusPlan.ok,
  'Verilog HDL plan should accept structural slice RX/TX port hints.'
);
assert(
  hdlStructuralSliceBusPlan.ok &&
    hdlStructuralSliceBusPlan.plan.structuralSliceLinks.length === 1 &&
    hdlStructuralSliceBusPlan.plan.structuralSliceLinks[0].fromAnchorKey === 'aside' &&
    hdlStructuralSliceBusPlan.plan.structuralSliceLinks[0].toAnchorKey === 'root' &&
    hdlStructuralSliceBusPlan.plan.structuralSliceLinks[0].luiId === 'content',
  'Verilog HDL plan should derive conservative typed cross-slice links from slice footprints.'
);
const hdlStructuralSliceBusArtifact = hdlStructuralSliceBusPlan.ok
  ? lowerVerilogModuleSkeleton(
      hdlStructuralSliceBusPlan.plan,
      'structural_slice_bus'
    )
  : undefined;
assert(
  hdlStructuralSliceBusArtifact !== undefined &&
    hdlStructuralSliceBusArtifact.content.includes(
      'module RootSlice(\n  rx_bus,\n  tx_bus\n);'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '//   interface rx=rx_bus[16] packed bits, tx=tx_bus[8] signed packed bits'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '// Planned structural slice interface wires.'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '  wire [15:0] slice_root_RootSlice_rx_bus;'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '  wire signed [7:0] slice_root_RootSlice_tx_bus;'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '// Planned structural slice module instances.'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '  RootSlice u_slice_root ('
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '    .rx_bus(slice_root_RootSlice_rx_bus),'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '    .tx_bus(slice_root_RootSlice_tx_bus)'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '// Planned structural slice cross-links.'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes(
      '  assign slice_root_RootSlice_rx_bus = slice_aside_AsideSlice_tx_bus;'
    ) &&
    hdlStructuralSliceBusArtifact.content.includes('  input [15:0] rx_bus;') &&
    hdlStructuralSliceBusArtifact.content.includes(
      '  output signed [7:0] tx_bus;'
    ),
  'Verilog lowering should emit typed RX/TX wires, instances, ports, and conservative cross-slice links for structural slice stubs.'
);

const hdlBadStructuralSlicePlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(structuralCompositionExample, {
    slices: { aside: { moduleName: 'AsideSlice' } },
  }),
  verilogCapabilities
);
assert(
  !hdlBadStructuralSlicePlan.ok &&
    hdlBadStructuralSlicePlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-008'
    ),
  'Verilog HDL plan should reject required structural-slices that omit required export anchors.'
);

const hdlBadStructuralSliceLinkPlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(structuralCompositionExample, {
    slices: {
      root: {
        moduleName: 'RootSlice',
        rx: { portName: 'rx_bus', width: 16, packed: true },
      },
      aside: {
        moduleName: 'AsideSlice',
        tx: { portName: 'tx_bus', width: 8, packed: true },
      },
    },
  }),
  verilogCapabilities
);
assert(
  !hdlBadStructuralSliceLinkPlan.ok &&
    hdlBadStructuralSliceLinkPlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-009'
    ),
  'Verilog HDL plan should reject incompatible typed structural slice TX/RX links.'
);

const hdlBadStructuralSliceFanInPlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(withDuplicateContentStructuralSlice(), {
    slices: {
      root: {
        moduleName: 'RootSlice',
        rx: { portName: 'rx_bus', width: 16, packed: true },
      },
      aside: {
        moduleName: 'AsideSlice',
        tx: { portName: 'tx_bus', width: 16, packed: true },
      },
      mirror: {
        moduleName: 'MirrorSlice',
        tx: { portName: 'tx_bus', width: 16, packed: true },
      },
    },
  }),
  verilogCapabilities
);
assert(
  !hdlBadStructuralSliceFanInPlan.ok &&
    hdlBadStructuralSliceFanInPlan.diagnostics.some(
      (diagnostic) => diagnostic.code === 'HDL-010'
    ),
  'Verilog HDL plan should reject ambiguous structural slice fan-in before lowering.'
);

const hdlStructuralSliceFanInPlan = projectVerilogHDLPlan(
  withHDLStructuralSlices(withDuplicateContentStructuralSlice(), {
    slices: {
      root: {
        moduleName: 'RootSlice',
        rx: { portName: 'rx_bus', width: 16, packed: true },
      },
      aside: {
        moduleName: 'AsideSlice',
        tx: { portName: 'tx_bus', width: 16, packed: true },
      },
      mirror: {
        moduleName: 'MirrorSlice',
        tx: { portName: 'tx_bus', width: 16, packed: true },
      },
    },
    fanIn: {
      root: { policy: 'or' },
    },
  }),
  verilogCapabilities
);
assert(
  hdlStructuralSliceFanInPlan.ok &&
    hdlStructuralSliceFanInPlan.plan.structuralSliceLinks.length === 2,
  'Verilog HDL plan should accept declared structural slice fan-in and retain provider links.'
);
const hdlStructuralSliceFanInArtifact = hdlStructuralSliceFanInPlan.ok
  ? lowerVerilogModuleSkeleton(
      hdlStructuralSliceFanInPlan.plan,
      'structural_slice_fan_in'
    )
  : undefined;
assert(
  hdlStructuralSliceFanInArtifact !== undefined &&
    hdlStructuralSliceFanInArtifact.content.includes(
      '// fan-in or -> root'
    ) &&
    hdlStructuralSliceFanInArtifact.content.includes(
      'assign slice_root_RootSlice_rx_bus = slice_aside_AsideSlice_tx_bus | slice_mirror_MirrorSlice_tx_bus;'
    ),
  'Verilog lowering should emit declared bitwise fan-in for compatible structural slice providers.'
);

function expectClean(
  name: string,
  unit: LogicUnit,
  capabilities: ProjectorCapabilitySet,
  options?: ProjectionPreflightOptions
): void {
  const errors = preflightProjection(unit, capabilities, options).filter(
    (diagnostic) => diagnostic.severity === 'error'
  );
  assert(
    errors.length === 0,
    `${name} should be clean, got ${errors
      .map((error) => error.code)
      .join(', ')}`
  );
}

function expectCode(
  name: string,
  unit: LogicUnit,
  capabilities: ProjectorCapabilitySet,
  code: string,
  options?: ProjectionPreflightOptions
): void {
  const diagnostics = preflightProjection(unit, capabilities, options);
  assert(
    diagnostics.some((diagnostic) => diagnostic.code === code),
    `${name} should emit ${code}, got ${diagnostics
      .map((diagnostic) => diagnostic.code)
      .join(', ')}`
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function withHDLSignalTypes(
  unit: typeof combinationalAdderExample,
  widths: Record<string, number>
): typeof combinationalAdderExample {
  const withPortExtension = <T extends { extensions?: unknown[] }>(
    portKey: string,
    port: T
  ): T => ({
    ...port,
    extensions: [
      ...((port as { extensions?: ExtensionRecord[] }).extensions ?? []),
      {
        feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
        key: 'signal-types',
        requirement: 'required',
        payload: {
          width: widths[portKey] ?? 1,
          signed: false,
          packed: true,
          encoding: 'bits',
        },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        a: withPortExtension('a', unit.core.ports.a),
        b: withPortExtension('b', unit.core.ports.b),
        sum: withPortExtension('sum', unit.core.ports.sum),
      },
      luis: {
        adder: {
          ...unit.core.luis.adder,
          ports: {
            a: withPortExtension('a', unit.core.luis.adder.ports.a),
            b: withPortExtension('b', unit.core.luis.adder.ports.b),
            sum: withPortExtension('sum', unit.core.luis.adder.ports.sum),
          },
        },
      },
    },
  };
}

function withHDLCombinationalAssigns(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'combinational-assigns',
          requirement: 'required',
          payload: {
            assigns: [
              {
                to: {
                  owner: { kind: 'lui', luiId: 'adder' },
                  portKey: 'sum',
                },
                expr: {
                  kind: 'binary',
                  op: '+',
                  left: {
                    kind: 'endpoint',
                    endpoint: {
                      owner: { kind: 'lui', luiId: 'adder' },
                      portKey: 'a',
                    },
                  },
                  right: {
                    kind: 'endpoint',
                    endpoint: {
                      owner: { kind: 'lui', luiId: 'adder' },
                      portKey: 'b',
                    },
                  },
                },
              },
              {
                to: {
                  owner: { kind: 'lui', luiId: 'adder' },
                  portKey: 'a',
                },
                expr: {
                  kind: 'mux',
                  cond: {
                    kind: 'reduction',
                    op: '|',
                    expr: {
                      kind: 'endpoint',
                      endpoint: {
                        owner: { kind: 'lui', luiId: 'adder' },
                        portKey: 'b',
                      },
                    },
                  },
                  then: {
                    kind: 'cast',
                    width: 8,
                    signed: false,
                    expr: {
                      kind: 'constant',
                      value: 1,
                      width: 1,
                    },
                  },
                  else: {
                    kind: 'constant',
                    value: 0,
                    width: 8,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function withHDLBadWidthCombinationalAssign(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'combinational-assigns',
          requirement: 'required',
          payload: {
            assigns: [
              {
                to: {
                  owner: { kind: 'lui', luiId: 'adder' },
                  portKey: 'sum',
                },
                expr: {
                  kind: 'cast',
                  width: 8,
                  signed: false,
                  expr: {
                    kind: 'endpoint',
                    endpoint: {
                      owner: { kind: 'lui', luiId: 'adder' },
                      portKey: 'a',
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function withHDLPayloadPathSignalTypes(
  unit: typeof combinationalAdderExample
): LogicUnit {
  const core = unit.core;
  const signalType = (
    width: number,
    payloadPath?: (string | number)[]
  ): ExtensionRecord => ({
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    key: 'signal-types',
    requirement: 'required',
    payload: {
      width,
      signed: false,
      packed: true,
      encoding: 'bits',
      ...(payloadPath ? { selector: { payloadPath } } : {}),
    },
  });

  return {
    ...unit,
    core: {
      ...core,
      ports: {
        a: {
          ...core.ports.a,
          extensions: [signalType(8)],
        },
        b: {
          ...core.ports.b,
          extensions: [signalType(8)],
        },
        bus: {
          boundary: 'output',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [
            signalType(18),
            signalType(9, ['lanes', 0]),
            signalType(9, ['lanes', 1]),
          ],
        },
      },
      luis: {
        adder: {
          ...core.luis.adder,
          ports: {
            a: {
              ...core.luis.adder.ports.a,
              extensions: [signalType(8)],
            },
            b: {
              ...core.luis.adder.ports.b,
              extensions: [signalType(8)],
            },
            sum: {
              ...core.luis.adder.ports.sum,
              extensions: [signalType(9)],
            },
          },
        },
      },
      connections: {
        aToAdder: core.connections.aToAdder,
        bToAdder: core.connections.bToAdder,
        sumToBusLane: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 0],
          },
        },
        sumToBusLane1: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 1],
          },
        },
      },
    },
  };
}

function withHDLSourcePackedLaneSignalTypes(
  unit: typeof combinationalAdderExample
): LogicUnit {
  const core = unit.core;
  const signalType = (
    width: number,
    payloadPath?: (string | number)[]
  ): ExtensionRecord => ({
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    key: 'signal-types',
    requirement: 'required',
    payload: {
      width,
      signed: false,
      packed: true,
      encoding: 'bits',
      ...(payloadPath ? { selector: { payloadPath } } : {}),
    },
  });

  return {
    ...unit,
    core: {
      ...core,
      ports: {
        bus: {
          boundary: 'input',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [
            signalType(16),
            signalType(8, ['lanes', 0]),
            signalType(8, ['lanes', 1]),
          ],
        },
        sum: {
          ...core.ports.sum,
          extensions: [signalType(9)],
        },
      },
      luis: {
        adder: {
          ...core.luis.adder,
          ports: {
            a: {
              ...core.luis.adder.ports.a,
              extensions: [signalType(8)],
            },
            b: {
              ...core.luis.adder.ports.b,
              extensions: [signalType(8)],
            },
            sum: {
              ...core.luis.adder.ports.sum,
              extensions: [signalType(9)],
            },
          },
        },
      },
      connections: {
        lane0ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 0],
          },
          to: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'a',
          },
        },
        lane1ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['lanes', 1],
          },
          to: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'b',
          },
        },
        sumFromAdder: core.connections.sumFromAdder,
      },
    },
  };
}

function withHDLStructuralSlices(
  unit: LogicUnit,
  payload: {
    slices: Record<
      string,
      {
        moduleName?: string;
        placement?: string;
        txPort?: string;
        rxPort?: string;
        tx?: {
          portName?: string;
          width: number;
          signed?: boolean;
          packed?: boolean;
          encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
        };
        rx?: {
          portName?: string;
          width: number;
          signed?: boolean;
          packed?: boolean;
          encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
        };
      }
    >;
    bus?: {
      routing: 'payload-path' | 'pin-channel' | 'custom';
      channelPath?: (string | number)[];
    };
    fanIn?: Record<string, { policy: 'or' | 'and' | 'xor' }>;
  } = {
    slices: {
      root: { moduleName: 'RootSlice' },
      aside: { moduleName: 'AsideSlice' },
    },
    bus: {
      routing: 'payload-path',
      channelPath: ['slice'],
    },
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...((unit.core as { extensions?: ExtensionRecord[] }).extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'structural-slices',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withDuplicateContentStructuralSlice(): LogicUnit {
  const core = structuralCompositionExample.core;
  return {
    ...structuralCompositionExample,
    core: {
      ...core,
      kindOrganization: {
        ...core.kindOrganization,
        exportAnchors: {
          ...core.kindOrganization.exportAnchors,
          mirror: { required: false },
        },
        exportAnchorFills: {
          ...core.kindOrganization.exportAnchorFills,
          mirror: {
            kind: 'lui-outlet',
            luiId: 'content',
            outletKey: 'root',
          },
        },
      },
    } as LogicUnit['core'],
  };
}

function withStatefulHDLSignalTypes(
  unit: typeof statefulRetainedCounterExample
): LogicUnit {
  const signalType = (width: number): ExtensionRecord => ({
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    key: 'signal-types',
    requirement: 'required',
    payload: {
      width,
      signed: false,
      packed: true,
      encoding: 'bits',
    },
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        clk: {
          boundary: 'input',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [signalType(1)],
        },
        rst: {
          boundary: 'input',
          interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
          },
          extensions: [signalType(1)],
        },
        increment: {
          ...unit.core.ports.increment,
          extensions: [signalType(1)],
        },
        value: {
          ...unit.core.ports.value,
          extensions: [signalType(32)],
        },
      },
      luis: {
        counterState: {
          ...unit.core.luis.counterState,
          ports: {
            increment: {
              ...unit.core.luis.counterState.ports.increment,
              extensions: [signalType(1)],
            },
            value: {
              ...unit.core.luis.counterState.ports.value,
              extensions: [signalType(32)],
            },
          },
        },
      },
    },
  };
}

function withStatefulClockReset(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'clock-reset',
          requirement: 'required',
          payload: {
            domain: 'main',
            clock: { portKey: 'clk', edge: 'posedge' },
            reset: { portKey: 'rst', active: 'high', kind: 'sync' },
          },
        },
      ],
    },
  };
}

function withStatefulHDLModuleBinding(unit: LogicUnit): LogicUnit {
  const core = unit.core;
  const luis = core.luis as Record<string, LUI>;
  const counterState = luis.counterState;
  assert(
    counterState !== undefined,
    'withStatefulHDLModuleBinding expects a counterState LUI.'
  );
  return {
    ...unit,
    core: {
      ...core,
      luis: {
        ...luis,
        counterState: {
          ...counterState,
          extensions: [
            ...(counterState.extensions ?? []),
            {
              feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
              key: 'module-binding',
              requirement: 'required',
              payload: {
                moduleName: 'counter_state',
                instanceName: 'u_counter_state',
              },
            },
          ],
        },
      } as typeof core.luis,
    } as typeof core,
  };
}

function withStatefulHDLStateRegisters(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'state-registers',
          requirement: 'required',
          payload: {
            registers: [
              {
                target: {
                  owner: { kind: 'lui', luiId: 'counterState' },
                  portKey: 'value',
                },
                enable: {
                  kind: 'endpoint',
                  endpoint: {
                    owner: { kind: 'lui', luiId: 'counterState' },
                    portKey: 'increment',
                  },
                },
                next: {
                  kind: 'binary',
                  op: '+',
                  left: {
                    kind: 'endpoint',
                    endpoint: {
                      owner: { kind: 'lui', luiId: 'counterState' },
                      portKey: 'value',
                    },
                  },
                  right: {
                    kind: 'cast',
                    width: 32,
                    signed: false,
                    expr: {
                      kind: 'endpoint',
                      endpoint: {
                        owner: { kind: 'lui', luiId: 'counterState' },
                        portKey: 'increment',
                      },
                    },
                  },
                },
                resetValue: {
                  kind: 'constant',
                  value: 0,
                  width: 32,
                },
                clockResetDomain: 'main',
              },
            ],
          },
        },
      ],
    },
  };
}

function withBadEnableStatefulHDLStateRegisters(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'state-registers',
          requirement: 'required',
          payload: {
            registers: [
              {
                target: {
                  owner: { kind: 'lui', luiId: 'counterState' },
                  portKey: 'value',
                },
                enable: {
                  kind: 'endpoint',
                  endpoint: {
                    owner: { kind: 'lui', luiId: 'counterState' },
                    portKey: 'value',
                  },
                },
                next: {
                  kind: 'endpoint',
                  endpoint: {
                    owner: { kind: 'lui', luiId: 'counterState' },
                    portKey: 'value',
                  },
                },
                resetValue: {
                  kind: 'constant',
                  value: 0,
                  width: 32,
                },
                clockResetDomain: 'main',
              },
            ],
          },
        },
      ],
    },
  };
}

function withBadWidthStatefulHDLStateRegisters(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
          key: 'state-registers',
          requirement: 'required',
          payload: {
            registers: [
              {
                target: {
                  owner: { kind: 'lui', luiId: 'counterState' },
                  portKey: 'value',
                },
                next: {
                  kind: 'cast',
                  width: 8,
                  signed: false,
                  expr: {
                    kind: 'endpoint',
                    endpoint: {
                      owner: { kind: 'lui', luiId: 'counterState' },
                      portKey: 'increment',
                    },
                  },
                },
                resetValue: {
                  kind: 'constant',
                  value: 0,
                  width: 8,
                },
                clockResetDomain: 'main',
              },
            ],
          },
        },
      ],
    },
  };
}

function withStructuralCompositionTypes(
  unit: typeof structuralCompositionExample
): LogicUnit {
  const logicUnit = unit as LogicUnit;
  const core = logicUnit.core;
  const luis = core.luis as Record<string, LUI>;
  const header = luis.header;
  const content = luis.content;
  if (header?.kind !== 'structural' || content?.kind !== 'structural') {
    throw new Error(
      'withStructuralCompositionTypes expects header/content structural LUIs.'
    );
  }
  const compositionType = (
    selector: { anchorKey?: string; outletKey?: string },
    typeKey: string,
    accepts: 'exact' | 'assignable' | 'custom' = 'exact'
  ): ExtensionRecord => ({
    feature: { namespace: 'logicir.type-system', key: 'core' },
    key: 'composition-compatibility',
    requirement: 'required',
    payload: {
      selector,
      type: { namespace: 'logicir.examples.ui-types', key: typeKey },
      accepts,
    },
  });
  const typeDefinitions: ExtensionRecord = {
    feature: { namespace: 'logicir.type-system', key: 'core' },
    key: 'type-definitions',
    requirement: 'required',
    payload: {
      definitions: {
        title: {
          namespace: 'logicir.examples.ui-types',
          key: 'title',
          kind: 'record',
          fields: { text: primitiveType('string') },
        },
        view: {
          namespace: 'logicir.examples.ui-types',
          key: 'view',
          kind: 'record',
          fields: { node: primitiveType('string') },
        },
      },
    },
  };

  return {
    ...logicUnit,
    extensions: [...(logicUnit.extensions ?? []), typeDefinitions],
    core: {
      ...core,
      extensions: [
        ...((core as { extensions?: ExtensionRecord[] }).extensions ?? []),
        compositionType({ outletKey: 'title' }, 'title'),
        compositionType({ anchorKey: 'root' }, 'view'),
        compositionType({ anchorKey: 'aside' }, 'view'),
      ],
      luis: {
        header: {
          ...header,
          compositionSurface: {
            ...header.compositionSurface,
            extensions: [
              ...((header.compositionSurface as { extensions?: ExtensionRecord[] })
                .extensions ?? []),
              compositionType({ outletKey: 'root' }, 'view'),
              compositionType({ anchorKey: 'title' }, 'title'),
              compositionType({ anchorKey: 'actions' }, 'view'),
            ],
          },
        },
        content: {
          ...content,
          compositionSurface: {
            ...content.compositionSurface,
            extensions: [
              ...((content.compositionSurface as { extensions?: ExtensionRecord[] })
                .extensions ?? []),
              compositionType({ outletKey: 'root' }, 'view'),
            ],
          },
        },
      },
    } as LogicUnit['core'],
  };
}

type SmokeTypeExpression =
  | ReturnType<typeof primitiveType>
  | ReturnType<typeof namedType>
  | {
      kind: 'record';
      fields: Record<
        string,
        SmokeTypeExpression | { type: SmokeTypeExpression; optional?: boolean }
      >;
    }
  | { kind: 'array'; item: SmokeTypeExpression; length?: number }
  | { kind: 'tuple'; items: SmokeTypeExpression[] }
  | { kind: 'union'; variants: SmokeTypeExpression[] };

function primitiveType(name: 'bool' | 'int' | 'float' | 'string') {
  return { kind: 'primitive', name };
}

function namedType(namespace: string, key: string) {
  return { kind: 'named', namespace, key };
}

function unionType(
  ...variants: SmokeTypeExpression[]
): { kind: 'union'; variants: SmokeTypeExpression[] } {
  return { kind: 'union', variants };
}

function withPortPayloadTypes(
  unit: typeof combinationalAdderExample,
  types: {
    lu: Record<string, SmokeTypeExpression>;
    luis: Record<string, Record<string, SmokeTypeExpression>>;
  }
): LogicUnit {
  const withPayloadType = <T extends { extensions?: unknown[] }>(
    port: T,
    type: SmokeTypeExpression
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: Object.fromEntries(
        Object.entries(unit.core.ports).map(([portKey, port]) => [
          portKey,
          withPayloadType(port, types.lu[portKey]),
        ])
      ) as typeof unit.core.ports,
      luis: {
        adder: {
          ...unit.core.luis.adder,
          ports: Object.fromEntries(
            Object.entries(unit.core.luis.adder.ports).map(
              ([portKey, port]) => [
                portKey,
                withPayloadType(port, types.luis.adder[portKey]),
              ]
            )
          ) as typeof unit.core.luis.adder.ports,
        },
      },
    },
  };
}

function withRequirementClosureTypes(
  parent: typeof requirementClosureParentExample,
  child: typeof childWithRequirementContractExample,
  options: {
    subjectType?: SmokeTypeExpression;
    closureSubjectType?: SmokeTypeExpression;
    closureAllowedType?: SmokeTypeExpression;
    relation?:
      | 'same-contract'
      | 'structural-subtype'
      | 'nominal-implements'
      | 'adapter-required';
  } = {}
): { parent: LogicUnit; child: LogicUnit } {
  const subjectType = options.subjectType ?? primitiveType('string');
  const closureSubjectType = options.closureSubjectType ?? subjectType;
  const allowedType = primitiveType('bool');
  const closureAllowedType = options.closureAllowedType ?? allowedType;
  const withPayloadType = <T extends { extensions?: unknown[] }>(
    port: T,
    type: SmokeTypeExpression
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  const authEntry = child.requirements.auth;
  if (authEntry.kind !== 'inline') {
    throw new Error('Expected inline auth requirement service.');
  }
  const checkUnit = authEntry.service.units.check;
  const typedChild: LogicUnit = {
    ...child,
    requirements: {
      ...child.requirements,
      auth: {
        kind: 'inline',
        service: {
          ...authEntry.service,
          units: {
            ...authEntry.service.units,
            check: {
              ...checkUnit,
              ports: {
                subject: withPayloadType(checkUnit.ports.subject, subjectType),
                allowed: withPayloadType(checkUnit.ports.allowed, allowedType),
              },
            },
          },
        },
      },
    },
  };

  const closure = parent.core.closures.authClosure;
  const securedChild = parent.core.luis.securedChild;
  const authFulfillment = securedChild.fulfillments.auth;
  const authFulfillmentExtensions =
    (authFulfillment as { extensions?: ExtensionRecord[] }).extensions ?? [];
  const relationExtension: ExtensionRecord | undefined = options.relation
    ? {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'requirement-compatibility',
        requirement: 'required',
        payload:
          options.relation === 'adapter-required'
            ? {
                relation: options.relation,
                evidence: {
                  namespace: 'logicir.examples.adapters',
                  key: 'auth-adapter',
                },
              }
            : { relation: options.relation },
      }
    : undefined;
  const typedParent: LogicUnit = {
    ...parent,
    core: {
      ...parent.core,
      luis: {
        ...parent.core.luis,
        securedChild: {
          ...securedChild,
          fulfillments: {
            ...securedChild.fulfillments,
            auth: {
              ...authFulfillment,
              extensions: [
                ...authFulfillmentExtensions,
                ...(relationExtension ? [relationExtension] : []),
              ],
            },
          },
        },
      },
      closures: {
        ...parent.core.closures,
        authClosure: {
          ...closure,
          core: {
            ...closure.core,
            ports: {
              ...closure.core.ports,
              subject: withPayloadType(
                closure.core.ports.subject,
                closureSubjectType
              ),
              allowed: withPayloadType(
                closure.core.ports.allowed,
                closureAllowedType
              ),
            },
          },
        },
      },
    },
  };

  return { parent: typedParent, child: typedChild };
}

function withUpstreamRequirementTypes(
  options: { supplierAllowedType?: SmokeTypeExpression } = {}
): { parent: LogicUnit; child: LogicUnit; supplierService: RequirementService } {
  const subjectType = primitiveType('string');
  const allowedType = primitiveType('bool');
  const supplierAllowedType = options.supplierAllowedType ?? allowedType;
  const withPayloadType = <T extends { extensions?: unknown[] }>(
    port: T,
    type: SmokeTypeExpression
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  const childAuthEntry = childWithRequirementContractExample.requirements.auth;
  if (childAuthEntry.kind !== 'inline') {
    throw new Error('Expected inline auth requirement service.');
  }
  const childCheckUnit = childAuthEntry.service.units.check;
  const child: LogicUnit = {
    ...childWithRequirementContractExample,
    requirements: {
      ...childWithRequirementContractExample.requirements,
      auth: {
        kind: 'inline',
        service: {
          ...childAuthEntry.service,
          units: {
            ...childAuthEntry.service.units,
            check: {
              ...childCheckUnit,
              ports: {
                subject: withPayloadType(
                  childCheckUnit.ports.subject,
                  subjectType
                ),
                allowed: withPayloadType(
                  childCheckUnit.ports.allowed,
                  allowedType
                ),
              },
            },
          },
        },
      },
    },
  };

  const supplierService: RequirementService = {
    fulfillmentScope: 'independent-units',
    units: {
      check: {
        kind: 'combinational',
        requirements: {},
        ports: {
          subject: withPayloadType(
            childCheckUnit.ports.subject,
            subjectType
          ),
          allowed: withPayloadType(
            childCheckUnit.ports.allowed,
            supplierAllowedType
          ),
        },
      },
    },
  };

  const parent: LogicUnit = {
    ...requirementClosureParentExample,
    requirements: {
      authProvider: {
        kind: 'external',
        namespace: 'logicir.examples.requirements',
        key: 'auth-provider',
      },
    },
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          target: { kind: 'lu', luId: 'child-with-auth-upstream' },
          fulfillments: {
            auth: {
              kind: 'independent-units',
              units: {
                check: {
                  kind: 'upstream-unit',
                  reachabilityPath: [],
                  supplierServiceKey: 'authProvider',
                  supplierUnitKey: 'check',
                },
              },
            },
          },
        },
      },
      closures: {},
    },
  };

  return { parent, child, supplierService };
}

function withNestedUpstreamRequirementTypes(
  options: { supplierIdentityType?: SmokeTypeExpression } = {}
): { parent: LogicUnit; child: LogicUnit; supplierService: RequirementService } {
  const subjectType = {
    kind: 'record',
    fields: {
      identity: primitiveType('string'),
      scope: primitiveType('string'),
    },
  };
  const allowedType = primitiveType('bool');
  const supplierIdentityType =
    options.supplierIdentityType ?? primitiveType('string');
  const withPayloadType = <T extends { extensions?: unknown[] }>(
    port: T,
    type: unknown,
    selector?: { payloadPath?: (string | number)[] }
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type, ...(selector ? { selector } : {}) },
      },
    ],
  });

  const childAuthEntry = childWithRequirementContractExample.requirements.auth;
  if (childAuthEntry.kind !== 'inline') {
    throw new Error('Expected inline auth requirement service.');
  }
  const childCheckUnit = childAuthEntry.service.units.check;
  const childSubjectPort = withPayloadType(
    withPayloadType(childCheckUnit.ports.subject, subjectType),
    primitiveType('string'),
    { payloadPath: ['identity'] }
  );
  const child: LogicUnit = {
    ...childWithRequirementContractExample,
    requirements: {
      ...childWithRequirementContractExample.requirements,
      auth: {
        kind: 'inline',
        service: {
          ...childAuthEntry.service,
          units: {
            ...childAuthEntry.service.units,
            check: {
              ...childCheckUnit,
              ports: {
                subject: childSubjectPort,
                allowed: withPayloadType(
                  childCheckUnit.ports.allowed,
                  allowedType
                ),
              },
            },
          },
        },
      },
    },
  };

  const supplierService: RequirementService = {
    fulfillmentScope: 'independent-units',
    units: {
      check: {
        kind: 'combinational',
        requirements: {},
        ports: {
          subject: withPayloadType(
            childCheckUnit.ports.subject,
            supplierIdentityType,
            { payloadPath: ['identity'] }
          ),
          allowed: withPayloadType(childCheckUnit.ports.allowed, allowedType),
        },
      },
    },
  };

  const parent: LogicUnit = {
    ...requirementClosureParentExample,
    requirements: {
      authProvider: {
        kind: 'external',
        namespace: 'logicir.examples.requirements',
        key: 'auth-provider',
      },
    },
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          target: { kind: 'lu', luId: 'child-with-auth-upstream-nested' },
          fulfillments: {
            auth: {
              kind: 'independent-units',
              units: {
                check: {
                  kind: 'upstream-unit',
                  reachabilityPath: [],
                  supplierServiceKey: 'authProvider',
                  supplierUnitKey: 'check',
                },
              },
            },
          },
        },
      },
      closures: {},
    },
  };

  return { parent, child, supplierService };
}

function withSharedServiceRequirementTypes(
  options: { supplierValueType?: SmokeTypeExpression } = {}
): { parent: LogicUnit; child: LogicUnit } {
  const keyType = primitiveType('string');
  const valueType = primitiveType('int');
  const entryType = primitiveType('string');
  const supplierValueType = options.supplierValueType ?? valueType;
  const withPayloadType = <T extends { extensions?: unknown[] }>(
    port: T,
    type: SmokeTypeExpression
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  const childCacheEntry = sharedServiceConsumerContractExample.requirements.cache;
  if (childCacheEntry.kind !== 'inline') {
    throw new Error('Expected inline child cache requirement service.');
  }
  const childGetUnit = childCacheEntry.service.units.get;
  const childPutUnit = childCacheEntry.service.units.put;
  const child: LogicUnit = {
    ...sharedServiceConsumerContractExample,
    requirements: {
      ...sharedServiceConsumerContractExample.requirements,
      cache: {
        kind: 'inline',
        service: {
          ...childCacheEntry.service,
          units: {
            ...childCacheEntry.service.units,
            get: {
              ...childGetUnit,
              ports: {
                key: withPayloadType(childGetUnit.ports.key, keyType),
                value: withPayloadType(childGetUnit.ports.value, valueType),
              },
            },
            put: {
              ...childPutUnit,
              ports: {
                entry: withPayloadType(childPutUnit.ports.entry, entryType),
              },
            },
          },
        },
      },
    },
  };

  const parentCacheEntry = sharedServiceUpstreamSupplierExample.requirements.cache;
  if (parentCacheEntry.kind !== 'inline') {
    throw new Error('Expected inline parent cache requirement service.');
  }
  const parentGetUnit = parentCacheEntry.service.units.get;
  const parentPutUnit = parentCacheEntry.service.units.put;
  const parent: LogicUnit = {
    ...sharedServiceUpstreamSupplierExample,
    requirements: {
      ...sharedServiceUpstreamSupplierExample.requirements,
      cache: {
        kind: 'inline',
        service: {
          ...parentCacheEntry.service,
          units: {
            ...parentCacheEntry.service.units,
            get: {
              ...parentGetUnit,
              ports: {
                key: withPayloadType(parentGetUnit.ports.key, keyType),
                value: withPayloadType(parentGetUnit.ports.value, supplierValueType),
              },
            },
            put: {
              ...parentPutUnit,
              ports: {
                entry: withPayloadType(parentPutUnit.ports.entry, entryType),
              },
            },
          },
        },
      },
    },
  };

  return { parent, child };
}

function withConnectionPolicy(
  unit: LogicUnit,
  policy:
    | 'exact'
    | 'assignable'
    | 'widening'
    | 'projector-adapter'
    | 'custom',
  adapterTarget?: { namespace: string; key: string },
  selector?: {
    connectionId?: string;
    from?: { portKey: string; payloadPath?: (string | number)[] };
    to?: { portKey: string; payloadPath?: (string | number)[] };
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.type-system', key: 'core' },
          key: 'port-compatibility',
          requirement: 'required',
          payload: {
            policy,
            ...(adapterTarget ? { adapterTarget } : {}),
            ...(selector ? { selector } : {}),
          },
        },
      ],
    },
  };
}

function withExternalAdderTarget(
  unit: typeof combinationalAdderExample
): typeof combinationalAdderExample {
  return {
    ...unit,
    core: {
      ...unit.core,
      luis: {
        adder: {
          ...unit.core.luis.adder,
          target: {
            kind: 'external',
            namespace: 'logicir.examples.hdl',
            key: 'adder8',
          },
        },
      },
    },
  };
}

function withHDLModuleRegistry(
  capabilities: ProjectorCapabilitySet,
  moduleRegistry: NonNullable<
    NonNullable<ProjectorCapabilitySet['verilogHDL']>['moduleRegistry']
  >
): ProjectorCapabilitySet {
  return {
    ...capabilities,
    verilogHDL: {
      ...capabilities.verilogHDL,
      moduleRegistry,
    } as NonNullable<ProjectorCapabilitySet['verilogHDL']>,
  };
}

function withHDLModuleBinding(
  unit: LogicUnit,
  payload: {
    moduleName: string;
    instanceName?: string;
    portMap?: Record<string, string>;
  }
): LogicUnit {
  const core = unit.core;
  const luis = core.luis as Record<string, LUI>;
  const adder = luis.adder;
  assert(adder !== undefined, 'withHDLModuleBinding expects an adder LUI.');
  const extension: ExtensionRecord = {
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    key: 'module-binding',
    requirement: 'required',
    payload,
  };
  return {
    ...unit,
    core: {
      ...core,
      luis: {
        ...luis,
        adder: {
          ...adder,
          extensions: [
            ...(adder.extensions ?? []),
            extension,
          ],
        },
      } as typeof core.luis,
    } as typeof core,
  };
}
