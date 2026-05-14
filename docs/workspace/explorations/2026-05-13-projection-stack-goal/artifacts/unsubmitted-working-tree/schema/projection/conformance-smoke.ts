/**
 * Table-driven projection conformance smoke tests.
 *
 * This script keeps the cross-target matrix executable without duplicating the
 * larger target-specific smoke suites. It checks that each target has at least
 * one positive fixture, at least one expected diagnostic, that target planners
 * run core validation before lowering, and that unsupported required
 * extensions fail safely.
 */

import {
  combinationalAdderExample,
  statefulRetainedCounterExample,
  structuralCompositionExample,
} from '../core/v0-draft/examples';
import {
  LOGIC_IR_CORE_SCHEMA_VERSION,
} from '../core/v0-draft/types';
import type {
  ExtensionRecord,
  LogicUnit,
  LUI,
  PortSurface,
} from '../core/v0-draft/types';
import { validateLogicUnit } from '../core/v0-draft/validator';
import {
  coreValidationPlannerConformanceFixtures,
  diagnosticConformanceFixtures,
  expectedConformanceTargets,
  positiveConformanceFixtures,
  unsupportedRequiredConformanceFixtures,
} from './conformance-fixtures';
import { preflightProjection } from './preflight';
import {
  projectJSRuntimePlan,
  projectPythonRuntimePlan,
  projectVerilogHDLPlan,
} from './target-plans';
import type {
  ProjectionDiagnostic,
  ProjectorCapabilitySet,
  ProjectorTarget,
} from './types';

type DiagnosticLike = {
  severity: string;
  code?: string;
  rule?: string;
};

type ConformanceCase = {
  target: ProjectorTarget;
  name: string;
  run: () => DiagnosticLike[];
};

const baseCoreCapability = {
  coreVersions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  luKinds: ['combinational', 'sequential', 'stateful', 'structural'],
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
  name: 'conformance-type-system',
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
  name: 'conformance-js-runtime',
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

const limitedJSCapabilities = {
  ...jsCapabilities,
  name: 'conformance-js-runtime-limited',
  jsRuntime: {
    ...jsCapabilities.jsRuntime,
    invocation: ['sync', 'promise'],
  },
} satisfies ProjectorCapabilitySet;

const pythonCapabilities = {
  name: 'conformance-python-runtime',
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

const limitedPythonCapabilities = {
  ...pythonCapabilities,
  name: 'conformance-python-runtime-limited',
  pythonRuntime: {
    ...pythonCapabilities.pythonRuntime,
    invocation: ['sync-call'],
  },
} satisfies ProjectorCapabilitySet;

const verilogCapabilities = {
  name: 'conformance-verilog-hdl',
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

const positiveCases: ConformanceCase[] = [
  {
    target: 'core-validator',
    name: 'core accepts base combinational fixture',
    run: () => validateLogicUnit(combinationalAdderExample),
  },
  {
    target: 'type-system',
    name: 'type-system accepts exact typed adder',
    run: () =>
      preflightProjection(
        withAdderPayloadTypes({
          lu: { a: intType(), b: intType(), sum: intType() },
          adder: { a: intType(), b: intType(), sum: intType() },
        }),
        typeSystemCapabilities
      ),
  },
  {
    target: 'js-runtime',
    name: 'JS planner accepts stateful counter fixture',
    run: () => planDiagnostics(projectJSRuntimePlan(
      statefulRetainedCounterExample,
      jsCapabilities
    )),
  },
  {
    target: 'js-runtime',
    name: 'JS planner accepts projector-adapter retained-current',
    run: () => planDiagnostics(projectJSRuntimePlan(
      withJSRetainedCurrentPolicy(statefulRetainedCounterExample, {
        realization: 'projector-adapter',
        notification: 'custom',
      }),
      jsCapabilities
    )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner accepts stateful counter fixture',
    run: () => planDiagnostics(projectPythonRuntimePlan(
      statefulRetainedCounterExample,
      pythonCapabilities
    )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner accepts projector-adapter retained-current',
    run: () => planDiagnostics(projectPythonRuntimePlan(
      withPythonRetainedCurrentPolicy(statefulRetainedCounterExample, {
        realization: 'projector-adapter',
        notification: 'poll',
      }),
      pythonCapabilities
    )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner accepts context-manager resource lifecycle',
    run: () => planDiagnostics(projectPythonRuntimePlan(
      withPythonResourceLifecyclePolicy(combinationalAdderExample, {
        selector: { luiId: 'adder' },
        protocol: 'context-manager',
      }),
      pythonCapabilities
    )),
  },
  {
    target: 'verilog-hdl',
    name: 'Verilog planner accepts typed bound adder fixture',
    run: () => planDiagnostics(projectVerilogHDLPlan(
      withHDLModuleBinding(withHDLSignalTypes(combinationalAdderExample)),
      verilogCapabilities
    )),
  },
];

const diagnosticCases: (ConformanceCase & { code: string })[] = [
  {
    target: 'core-validator',
    name: 'core rejects impossible port interaction',
    code: 'VAL-005',
    run: () => validateLogicUnit(withBadPortInteraction(combinationalAdderExample)),
  },
  {
    target: 'type-system',
    name: 'type-system rejects exact mismatch',
    code: 'EXT-123',
    run: () =>
      preflightProjection(
        withAdderPayloadTypes({
          lu: { a: stringType(), b: intType(), sum: intType() },
          adder: { a: intType(), b: intType(), sum: intType() },
        }),
        typeSystemCapabilities
      ),
  },
  {
    target: 'js-runtime',
    name: 'JS capability rejects unsupported async invocation',
    code: 'EXT-201',
    run: () =>
      preflightProjection(
        withJSAsyncPolicy(combinationalAdderExample, {
          invocation: 'async-iterator',
          awaitBeforeNext: true,
        }),
        limitedJSCapabilities
      ),
  },
  {
    target: 'js-runtime',
    name: 'JS planner rejects awaitBeforeNext=false before lowering',
    code: 'JS-004',
    run: () =>
      planDiagnostics(projectJSRuntimePlan(
        withJSAsyncPolicy(combinationalAdderExample, {
          invocation: 'promise',
          awaitBeforeNext: false,
        }),
        jsCapabilities
      )),
  },
  {
    target: 'js-runtime',
    name: 'JS planner rejects required fail-projection policy before lowering',
    code: 'JS-001',
    run: () =>
      planDiagnostics(projectJSRuntimePlan(
        withJSErrorPolicy(combinationalAdderExample, {
          onThrow: 'fail-projection',
          selector: { luiId: 'adder' },
        }),
        jsCapabilities
      )),
  },
  {
    target: 'js-runtime',
    name: 'JS planner rejects use-error-port without portKey before lowering',
    code: 'JS-005',
    run: () =>
      planDiagnostics(projectJSRuntimePlan(
        withJSErrorPolicy(combinationalAdderExample, {
          onThrow: 'use-error-port',
          selector: { luiId: 'adder' },
        }),
        jsCapabilities
      )),
  },
  {
    target: 'js-runtime',
    name: 'JS planner rejects owner-less payloadPath retained-current before lowering',
    code: 'JS-006',
    run: () =>
      planDiagnostics(projectJSRuntimePlan(
        withJSRetainedCurrentPolicy(statefulRetainedCounterExample, {
          selector: { portKey: 'value', payloadPath: ['lanes', 0] },
          realization: 'host-observable',
          notification: 'subscribe',
        }),
        jsCapabilities
      )),
  },
  {
    target: 'js-runtime',
    name: 'JS planner rejects unsupported late-bound transactional dynamic fulfillment before lowering',
    code: 'JS-003',
    run: () =>
      planDiagnostics(projectJSRuntimePlan(
        withJSDynamicFulfillmentPolicy(combinationalAdderExample, {
          mode: 'late-bound',
          consistency: 'transactional-switch',
        }),
        jsCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python capability rejects unsupported coroutine invocation',
    code: 'EXT-301',
    run: () =>
      preflightProjection(
        withPythonAsyncPolicy(combinationalAdderExample, {
          invocation: 'coroutine',
          awaitBeforeNext: true,
        }),
        limitedPythonCapabilities
      ),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects awaitBeforeNext=false before lowering',
    code: 'PY-004',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonAsyncPolicy(combinationalAdderExample, {
          invocation: 'sync-call',
          awaitBeforeNext: false,
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects required return-exception policy before lowering',
    code: 'PY-001',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonErrorPolicy(combinationalAdderExample, {
          onException: 'return-exception',
          selector: { luiId: 'adder' },
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects use-error-port without portKey before lowering',
    code: 'PY-007',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonErrorPolicy(combinationalAdderExample, {
          onException: 'use-error-port',
          selector: { luiId: 'adder' },
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects owner-less payloadPath retained-current before lowering',
    code: 'PY-008',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonRetainedCurrentPolicy(statefulRetainedCounterExample, {
          selector: { portKey: 'value', payloadPath: ['lanes', 0] },
          realization: 'observable',
          notification: 'callback',
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects unsupported late-bound transactional dynamic fulfillment before lowering',
    code: 'PY-003',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonDynamicFulfillmentPolicy(combinationalAdderExample, {
          binding: 'late-bound',
          consistency: 'transactional-switch',
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects required custom resource lifecycle before lowering',
    code: 'PY-005',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonResourceLifecyclePolicy(combinationalAdderExample, {
          selector: { luiId: 'adder' },
          protocol: 'custom',
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner rejects required asyncio-task concurrency before lowering',
    code: 'PY-006',
    run: () =>
      planDiagnostics(projectPythonRuntimePlan(
        withPythonConcurrencyPolicy(combinationalAdderExample, {
          selector: { luiId: 'adder' },
          execution: 'asyncio-task',
          backpressure: 'latest',
        }),
        pythonCapabilities
      )),
  },
  {
    target: 'python-runtime',
    name: 'Python capability rejects unsupported resource lifecycle',
    code: 'EXT-306',
    run: () =>
      preflightProjection(
        withPythonResourceLifecyclePolicy(combinationalAdderExample, {
          selector: { luiId: 'adder' },
          protocol: 'context-manager',
        }),
        {
          ...pythonCapabilities,
          name: 'conformance-python-runtime-no-resource',
          pythonRuntime: {
            ...pythonCapabilities.pythonRuntime,
            resourceLifecycle: ['none'],
          },
        } satisfies ProjectorCapabilitySet
      ),
  },
  {
    target: 'verilog-hdl',
    name: 'Verilog planner requires signal types',
    code: 'HDL-001',
    run: () => planDiagnostics(projectVerilogHDLPlan(
      combinationalAdderExample,
      verilogCapabilities
    )),
  },
  {
    target: 'verilog-hdl',
    name: 'Verilog planner rejects ambiguous structural slice fan-in',
    code: 'HDL-010',
    run: () => planDiagnostics(projectVerilogHDLPlan(
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
    )),
  },
];

const unsupportedRequiredCases: (ConformanceCase & { code: string })[] = [
  {
    target: 'core-validator',
    name: 'core fails unsupported required extension',
    code: 'VAL-045',
    run: () =>
      validateLogicUnit(withUnsupportedRequiredExtension(combinationalAdderExample)),
  },
  {
    target: 'type-system',
    name: 'type-system fails unsupported required extension',
    code: 'VAL-045',
    run: () =>
      preflightProjection(
        withUnsupportedRequiredExtension(combinationalAdderExample),
        typeSystemCapabilities
      ),
  },
  {
    target: 'js-runtime',
    name: 'JS fails unsupported required extension',
    code: 'VAL-045',
    run: () =>
      preflightProjection(
        withUnsupportedRequiredExtension(combinationalAdderExample),
        jsCapabilities
      ),
  },
  {
    target: 'python-runtime',
    name: 'Python fails unsupported required extension',
    code: 'VAL-045',
    run: () =>
      preflightProjection(
        withUnsupportedRequiredExtension(combinationalAdderExample),
        pythonCapabilities
      ),
  },
  {
    target: 'verilog-hdl',
    name: 'Verilog fails unsupported required extension',
    code: 'VAL-045',
    run: () =>
      preflightProjection(
        withUnsupportedRequiredExtension(combinationalAdderExample),
        verilogCapabilities
      ),
  },
];

const coreValidationPlannerCases: (ConformanceCase & { code: string })[] = [
  {
    target: 'js-runtime',
    name: 'JS planner runs core validation before lowering',
    code: 'VAL-005',
    run: () => planDiagnostics(projectJSRuntimePlan(
      withBadPortInteraction(combinationalAdderExample),
      jsCapabilities
    )),
  },
  {
    target: 'python-runtime',
    name: 'Python planner runs core validation before lowering',
    code: 'VAL-005',
    run: () => planDiagnostics(projectPythonRuntimePlan(
      withBadPortInteraction(combinationalAdderExample),
      pythonCapabilities
    )),
  },
  {
    target: 'verilog-hdl',
    name: 'Verilog planner runs core validation before lowering',
    code: 'VAL-005',
    run: () => planDiagnostics(projectVerilogHDLPlan(
      withBadPortInteraction(combinationalAdderExample),
      verilogCapabilities
    )),
  },
];

assertTargetsCovered('positive conformance cases', positiveCases);
assertTargetsCovered('diagnostic conformance cases', diagnosticCases);
assertTargetsCovered('unsupported required extension cases', unsupportedRequiredCases);
assertCasesMatchFixtures(
  'positive conformance cases',
  positiveCases,
  positiveConformanceFixtures
);
assertCasesMatchFixtures(
  'diagnostic conformance cases',
  diagnosticCases,
  diagnosticConformanceFixtures
);
assertCasesMatchFixtures(
  'unsupported required extension cases',
  unsupportedRequiredCases,
  unsupportedRequiredConformanceFixtures
);
assertCasesMatchFixtures(
  'core validation planner cases',
  coreValidationPlannerCases,
  coreValidationPlannerConformanceFixtures
);

for (const testCase of positiveCases) {
  expectNoErrors(testCase);
}

for (const testCase of diagnosticCases) {
  expectDiagnostic(testCase, testCase.code);
}

for (const testCase of unsupportedRequiredCases) {
  expectDiagnostic(testCase, testCase.code);
}

for (const testCase of coreValidationPlannerCases) {
  expectDiagnostic(testCase, testCase.code);
}

function withAdderPayloadTypes(types: {
  lu: Record<'a' | 'b' | 'sum', unknown>;
  adder: Record<'a' | 'b' | 'sum', unknown>;
}): LogicUnit {
  const core = combinationalAdderExample.core;
  return {
    ...combinationalAdderExample,
    core: {
      ...core,
      ports: withPayloadTypes(core.ports, types.lu),
      luis: {
        adder: {
          ...core.luis.adder,
          ports: withPayloadTypes(core.luis.adder.ports, types.adder),
        },
      },
    },
  };
}

function withPayloadTypes(
  ports: PortSurface,
  types: Record<string, unknown>
): PortSurface {
  return Object.fromEntries(
    Object.entries(ports).map(([portKey, port]) => [
      portKey,
      {
        ...port,
        extensions: [
          ...(port.extensions ?? []),
          {
            feature: { namespace: 'logicir.type-system', key: 'core' },
            key: 'payload-types',
            requirement: 'required',
            payload: {
              type: types[portKey],
            },
          },
        ],
      },
    ])
  );
}

function withJSAsyncPolicy(
  unit: LogicUnit,
  payload: {
    invocation: 'sync' | 'promise' | 'async-iterator';
    awaitBeforeNext?: boolean;
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.js-runtime', key: 'core' },
    key: 'async-policy',
    requirement: 'required',
    payload,
  });
}

function withJSErrorPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; portKey?: string };
    onThrow: 'fail-projection' | 'reject' | 'emit-error' | 'use-error-port';
    cancellation?: 'unsupported' | 'abort-signal' | 'custom';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.js-runtime', key: 'core' },
    key: 'error-policy',
    requirement: 'required',
    payload,
  });
}

function withJSRetainedCurrentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { portKey?: string; payloadPath?: (string | number)[] };
    realization:
      | 'source-store'
      | 'sink-cache'
      | 'projector-adapter'
      | 'host-observable';
    notification?: 'push' | 'subscribe' | 'microtask' | 'custom';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.js-runtime', key: 'core' },
    key: 'retained-current-realization',
    requirement: 'required',
    payload,
  });
}

function withJSDynamicFulfillmentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { serviceKey?: string; unitKey?: string };
    mode: 'static-at-startup' | 'switchable' | 'late-bound';
    consistency:
      | 'no-live-switch'
      | 'quiescent-switch'
      | 'transactional-switch';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.js-runtime', key: 'core' },
    key: 'dynamic-fulfillment',
    requirement: 'required',
    payload,
  });
}

function withPythonAsyncPolicy(
  unit: LogicUnit,
  payload: {
    invocation:
      | 'sync-call'
      | 'coroutine'
      | 'async-generator'
      | 'generator'
      | 'threadpool-call';
    awaitBeforeNext?: boolean;
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'async-policy',
    requirement: 'required',
    payload,
  });
}

function withPythonDynamicFulfillmentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { serviceKey?: string; unitKey?: string };
    binding:
      | 'constructor-injected'
      | 'contextvar'
      | 'service-container'
      | 'late-bound'
      | 'switchable';
    consistency:
      | 'startup-only'
      | 'task-local'
      | 'quiescent-switch'
      | 'transactional-switch';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'dynamic-fulfillment',
    requirement: 'required',
    payload,
  });
}

function withPythonRetainedCurrentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { portKey?: string; payloadPath?: (string | number)[] };
    realization:
      | 'source-property'
      | 'sink-cache'
      | 'asyncio-queue-latest'
      | 'observable'
      | 'projector-adapter';
    notification?: 'callback' | 'asyncio-event' | 'queue' | 'poll';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'retained-current-realization',
    requirement: 'required',
    payload,
  });
}

function withPythonResourceLifecyclePolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; closureId?: string };
    protocol:
      | 'none'
      | 'context-manager'
      | 'async-context-manager'
      | 'start-stop'
      | 'custom';
    ordering?: 'parent-before-child' | 'child-before-parent';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'resource-lifecycle',
    requirement: 'required',
    payload,
  });
}

function withPythonConcurrencyPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; connectionId?: string };
    execution:
      | 'same-thread'
      | 'asyncio-task'
      | 'thread'
      | 'process'
      | 'external-worker';
    backpressure?: 'drop' | 'latest' | 'buffer' | 'block' | 'custom';
    ordering?: 'preserve' | 'best-effort' | 'unordered';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'concurrency',
    requirement: 'required',
    payload,
  });
}

function withPythonErrorPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; portKey?: string };
    onException:
      | 'raise'
      | 'return-exception'
      | 'emit-error'
      | 'cancel-task'
      | 'use-error-port';
    cancellation?: 'unsupported' | 'asyncio-cancel' | 'cooperative' | 'custom';
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    key: 'error-policy',
    requirement: 'required',
    payload,
  });
}

function withUnsupportedRequiredExtension(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    extensions: [
      ...(unit.extensions ?? []),
      {
        feature: { namespace: 'logicir.conformance.unknown', key: 'core' },
        key: 'must-not-be-ignored',
        requirement: 'required',
        payload: {},
      },
    ],
  };
}

function withCoreExtension(
  unit: LogicUnit,
  extension: ExtensionRecord
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [...(unit.core.extensions ?? []), extension],
    },
  };
}

function withBadPortInteraction(unit: LogicUnit): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        ...unit.core.ports,
        a: {
          ...unit.core.ports.a,
          interaction: {
            pullReadable: false,
            pushNotifiable: false,
            retainedCurrent: false,
          },
        },
      },
    },
  };
}

function withHDLSignalTypes(
  unit: typeof combinationalAdderExample
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
        a: { ...unit.core.ports.a, extensions: [signalType(8)] },
        b: { ...unit.core.ports.b, extensions: [signalType(8)] },
        sum: { ...unit.core.ports.sum, extensions: [signalType(9)] },
      },
      luis: {
        adder: {
          ...unit.core.luis.adder,
          ports: {
            a: {
              ...unit.core.luis.adder.ports.a,
              extensions: [signalType(8)],
            },
            b: {
              ...unit.core.luis.adder.ports.b,
              extensions: [signalType(8)],
            },
            sum: {
              ...unit.core.luis.adder.ports.sum,
              extensions: [signalType(9)],
            },
          },
        },
      },
    },
  };
}

function withHDLModuleBinding(unit: LogicUnit): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const adder = luis.adder;
  assert(adder !== undefined, 'Expected an adder LUI.');
  return {
    ...unit,
    core: {
      ...unit.core,
      luis: {
        ...luis,
        adder: {
          ...adder,
          extensions: [
            ...(adder.extensions ?? []),
            {
              feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
              key: 'module-binding',
              requirement: 'required',
              payload: {
                moduleName: 'adder8',
                instanceName: 'u_adder',
              },
            },
          ],
        },
      } as typeof unit.core.luis,
    } as typeof unit.core,
  };
}

function withHDLStructuralSlices(
  unit: LogicUnit,
  payload: {
    slices: Record<
      string,
      {
        moduleName?: string;
        tx?: { portName?: string; width: number; packed?: boolean };
        rx?: { portName?: string; width: number; packed?: boolean };
      }
    >;
    fanIn?: Record<string, { policy: 'or' | 'and' | 'xor' }>;
  }
): LogicUnit {
  return withCoreExtension(unit, {
    feature: { namespace: 'logicir.verilog-hdl', key: 'core' },
    key: 'structural-slices',
    requirement: 'required',
    payload,
  });
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

function intType(): { kind: 'primitive'; name: 'int' } {
  return { kind: 'primitive', name: 'int' };
}

function stringType(): { kind: 'primitive'; name: 'string' } {
  return { kind: 'primitive', name: 'string' };
}

function planDiagnostics<T>(
  result:
    | { ok: true; diagnostics: ProjectionDiagnostic[]; plan: T }
    | { ok: false; diagnostics: ProjectionDiagnostic[] }
): ProjectionDiagnostic[] {
  return result.diagnostics;
}

function expectNoErrors(testCase: ConformanceCase): void {
  const diagnostics = testCase.run();
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  assert(
    errors.length === 0,
    `${testCase.target} ${testCase.name} should be clean, got ${errors
      .map(diagnosticCode)
      .join(', ')}`
  );
}

function expectDiagnostic(
  testCase: ConformanceCase,
  expectedCode: string
): void {
  const diagnostics = testCase.run();
  assert(
    diagnostics.some((diagnostic) => diagnosticCode(diagnostic) === expectedCode),
    `${testCase.target} ${testCase.name} should emit ${expectedCode}, got ${diagnostics
      .map(diagnosticCode)
      .join(', ')}`
  );
}

function assertTargetsCovered(
  label: string,
  cases: { target: ProjectorTarget }[]
): void {
  const coveredTargets = new Set(cases.map((testCase) => testCase.target));
  for (const target of expectedConformanceTargets) {
    assert(coveredTargets.has(target), `${label} must cover ${target}.`);
  }
}

function assertCasesMatchFixtures(
  label: string,
  cases: { target: ProjectorTarget; name: string; code?: string }[],
  fixtures: { target: ProjectorTarget; name: string; code?: string }[]
): void {
  const actual = new Set(cases.map(caseKey));
  const expected = new Set(fixtures.map(caseKey));
  for (const key of expected) {
    assert(actual.has(key), `${label} missing fixture ${key}.`);
  }
  for (const key of actual) {
    assert(expected.has(key), `${label} has unregistered executable case ${key}.`);
  }
}

function caseKey(testCase: {
  target: ProjectorTarget;
  name: string;
  code?: string;
}): string {
  return `${testCase.target}::${testCase.name}::${testCase.code ?? ''}`;
}

function diagnosticCode(diagnostic: DiagnosticLike): string {
  return diagnostic.code ?? diagnostic.rule ?? '<unknown>';
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
