/**
 * Lightweight validator smoke tests.
 *
 * This is a no-framework script so schema draft checks can run without adding
 * test dependencies.
 */

import {
  childWithRequirementContractExample,
  combinationalAdderExample,
  requirementClosureParentExample,
  sequentialPipelineExample,
  sharedServiceConsumerContractExample,
  sharedServiceUpstreamSupplierExample,
  statefulRetainedCounterExample,
  structuralCompositionExample,
} from './examples';
import { validateLogicUnit } from './validator';
import type {
  ExternalTargetContract,
  ValidationContext,
} from './validator';
import type { LogicUnit, RequirementService } from './types';

const positiveExamples: [string, LogicUnit][] = [
  ['combinationalAdderExample', combinationalAdderExample],
  ['statefulRetainedCounterExample', statefulRetainedCounterExample],
  ['sequentialPipelineExample', sequentialPipelineExample],
  ['structuralCompositionExample', structuralCompositionExample],
  ['requirementClosureParentExample', requirementClosureParentExample],
  ['sharedServiceUpstreamSupplierExample', sharedServiceUpstreamSupplierExample],
];

const resolverContext: ValidationContext = {
  resolveLogicUnit: (luId) => {
    if (luId === 'child-with-auth') {
      return childWithRequirementContractExample;
    }
    if (luId === 'shared-cache-consumer') {
      return sharedServiceConsumerContractExample;
    }
    return undefined;
  },
  resolveExternalTarget: (namespace, key) =>
    externalTargets[`${namespace}/${key}`],
  resolveRequirementService: (namespace, key) =>
    externalRequirementServices[`${namespace}/${key}`],
};

const externalTargets: Record<string, ExternalTargetContract> = {
  'logicir.examples/adder-primitive': {
    kind: 'combinational',
    ports: combinationalAdderExample.core.luis.adder.ports,
    requirements: {},
  },
  'logicir.examples/counter-state': {
    kind: 'stateful',
    ports: statefulRetainedCounterExample.core.luis.counterState.ports,
    requirements: {},
  },
  'logicir.examples/decode': {
    kind: 'combinational',
    ports: sequentialPipelineExample.core.luis.decode.ports,
    requirements: {},
  },
  'logicir.examples/normalize': {
    kind: 'combinational',
    ports: sequentialPipelineExample.core.luis.normalize.ports,
    requirements: {},
  },
  'logicir.examples/local-auth-check': {
    kind: 'combinational',
    ports:
      requirementClosureParentExample.core.closures.authClosure.core.luis
        .localAuthCheck.ports,
    requirements: {},
  },
  'logicir.examples.ui/header-view': {
    kind: 'structural',
    ports: {},
    requirements: {},
    compositionSurface:
      structuralCompositionExample.core.luis.header.compositionSurface,
  },
  'logicir.examples.ui/content-view': {
    kind: 'structural',
    ports: {},
    requirements: {},
    compositionSurface:
      structuralCompositionExample.core.luis.content.compositionSurface,
  },
};

const externalAuthRequirementService = {
  fulfillmentScope: 'independent-units',
  units: {
    check: {
      kind: 'combinational',
      ports: {
        subject:
          childWithRequirementContractExample.requirements.auth.service.units
            .check.ports.subject,
        allowed:
          childWithRequirementContractExample.requirements.auth.service.units
            .check.ports.allowed,
      },
      requirements: {},
    },
  },
} satisfies RequirementService;

const externalRequirementServices: Record<string, RequirementService> = {
  'logicir.examples.requirements/auth': externalAuthRequirementService,
};

for (const [name, unit] of positiveExamples) {
  const context =
    name === 'requirementClosureParentExample' ||
    name === 'sharedServiceUpstreamSupplierExample'
      ? resolverContext
      : undefined;
  const errors = validateLogicUnit(unit, context).filter(
    (diagnostic) => diagnostic.severity === 'error'
  );
  assert(
    errors.length === 0,
    `${name} should be valid, got ${errors
      .map((error) => error.rule)
      .join(', ')}`
  );
}

expectNoRule(
  'resolved external target',
  combinationalAdderExample,
  'VAL-019',
  resolverContext
);

expectNoRule(
  'resolved external requirement service',
  externalRequirementServiceConsumer(),
  'VAL-018',
  resolverContext
);

expectRule(
  'bad schema version',
  {
    ...combinationalAdderExample,
    schemaVersion: 'wrong-version',
  } as unknown as LogicUnit,
  'VAL-001'
);

expectRule(
  'external target kind mismatch',
  combinationalAdderExample,
  'VAL-019',
  {
    ...resolverContext,
    resolveExternalTarget: (namespace, key) => {
      if (`${namespace}/${key}` === 'logicir.examples/adder-primitive') {
        return {
          ...externalTargets['logicir.examples/adder-primitive'],
          kind: 'stateful',
        };
      }
      return resolverContext.resolveExternalTarget?.(namespace, key);
    },
  }
);

expectRule(
  'unresolved external requirement service',
  externalRequirementServiceConsumer(),
  'VAL-018'
);

expectRule(
  'bad port interaction',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        a: {
          ...combinationalAdderExample.core.ports.a,
          interaction: {
            pullReadable: false,
            pushNotifiable: false,
            retainedCurrent: false,
          },
        },
      },
    },
  },
  'VAL-005'
);

expectRule(
  'retained current without pull-readable',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        a: {
          ...combinationalAdderExample.core.ports.a,
          interaction: {
            pullReadable: false,
            pushNotifiable: true,
            retainedCurrent: true,
          },
        },
      },
    },
  },
  'VAL-006'
);

expectRule(
  'primary result input port',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        a: {
          ...combinationalAdderExample.core.ports.a,
          role: 'primary-result',
        },
      },
    },
  },
  'VAL-007'
);

expectRule(
  'bad pin set',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        a: {
          ...combinationalAdderExample.core.ports.a,
          pins: { kind: 'keyed', keys: ['lane', 'lane'] },
        },
      },
    },
  },
  'VAL-008'
);

expectRule(
  'missing endpoint owner',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      connections: {
        ...combinationalAdderExample.core.connections,
        missingOwner: {
          from: {
            owner: { kind: 'lui', luiId: 'missing' },
            portKey: 'sum',
          },
          to: { owner: { kind: 'lu' }, portKey: 'sum' },
        },
      },
    },
  },
  'VAL-009'
);

expectRule(
  'bad endpoint pin path',
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
          pins: { kind: 'keyed', keys: ['x'] },
        },
      },
      connections: {
        ...combinationalAdderExample.core.connections,
        badPin: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['missing'],
          },
        },
      },
    },
  },
  'VAL-009'
);

expectRule(
  'port interaction mismatch',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        ...combinationalAdderExample.core.ports,
        a: {
          ...combinationalAdderExample.core.ports.a,
          interaction: {
            pullReadable: false,
            pushNotifiable: true,
            retainedCurrent: false,
          },
        },
      },
    },
  },
  'VAL-011'
);

expectRule(
  'disallowed LUI kind',
  ({
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      luis: {
        ...combinationalAdderExample.core.luis,
        adder: {
          ...combinationalAdderExample.core.luis.adder,
          kind: 'stateful',
        },
      },
    },
  } as unknown as LogicUnit),
  'VAL-015'
);

expectRule(
  'missing sequential step LUI',
  {
    ...sequentialPipelineExample,
    core: {
      ...sequentialPipelineExample.core,
      kindOrganization: {
        ...sequentialPipelineExample.core.kindOrganization,
        steps: [
          ...sequentialPipelineExample.core.kindOrganization.steps,
          'missing',
        ],
      },
    },
  },
  'VAL-016'
);

expectRule(
  'target kind mismatch',
  ({
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          kind: 'stateful',
        },
      },
    },
  } as unknown as LogicUnit),
  'VAL-017',
  resolverContext
);

expectRule(
  'target port mismatch',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          ports: {
            ...requirementClosureParentExample.core.luis.securedChild.ports,
            allowed: {
              ...requirementClosureParentExample.core.luis.securedChild.ports
                .allowed,
              boundary: 'input',
            },
          },
        },
      },
    },
  } as unknown as LogicUnit,
  'VAL-020',
  resolverContext
);

expectRule(
  'structural composition surface mismatch',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      luis: {
        ...structuralCompositionExample.core.luis,
        header: {
          ...structuralCompositionExample.core.luis.header,
          compositionSurface: {
            ...structuralCompositionExample.core.luis.header
              .compositionSurface,
            outlets: ['missing'],
          },
        },
      },
    },
  },
  'VAL-021',
  resolverContext
);

expectRule(
  'duplicate structural outlet',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      luis: {
        ...structuralCompositionExample.core.luis,
        header: {
          ...structuralCompositionExample.core.luis.header,
          compositionSurface: {
            ...structuralCompositionExample.core.luis.header
              .compositionSurface,
            outlets: ['root', 'root'],
          },
        },
      },
    },
  },
  'VAL-022'
);

expectRule(
  'missing required export anchor fill',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        exportAnchorFills: {
          aside:
            structuralCompositionExample.core.kindOrganization
              .exportAnchorFills.aside,
        },
      },
    },
  },
  'VAL-023'
);

expectRule(
  'bad child fill owner',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        luiFills: {
          ...structuralCompositionExample.core.kindOrganization.luiFills,
          missing: {},
        },
      },
    },
  },
  'VAL-025'
);

expectRule(
  'unknown child anchor fill',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        luiFills: {
          ...structuralCompositionExample.core.kindOrganization.luiFills,
          header: {
            ...structuralCompositionExample.core.kindOrganization
              .luiFills.header,
            missing: { kind: 'empty' },
          },
        },
      },
    },
  },
  'VAL-026'
);

expectRule(
  'child anchor shape mismatch',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        luiFills: {
          ...structuralCompositionExample.core.kindOrganization.luiFills,
          header: {
            ...structuralCompositionExample.core.kindOrganization
              .luiFills.header,
            actions: { kind: 'empty' },
          },
        },
      },
    },
  },
  'VAL-027'
);

expectRule(
  'bad external outlet',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        luiFills: {
          ...structuralCompositionExample.core.kindOrganization.luiFills,
          header: {
            ...structuralCompositionExample.core.kindOrganization
              .luiFills.header,
            title: {
              kind: 'external-outlet',
              outletKey: 'missing',
            },
          },
        },
      },
    },
  },
  'VAL-029'
);

expectRule(
  'unknown fulfillment key',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          fulfillments: {
            ...requirementClosureParentExample.core.luis.securedChild
              .fulfillments,
            missing: {
              kind: 'independent-units',
              units: {},
            },
          },
        },
      },
    },
  },
  'VAL-035',
  resolverContext
);

expectRule(
  'missing independent unit fulfillment',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          fulfillments: {
            auth: {
              kind: 'independent-units',
              units: {},
            },
          },
        },
      },
    },
  },
  'VAL-037',
  resolverContext
);

expectRule(
  'shared-service fulfillment for independent service',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          fulfillments: {
            auth: {
              kind: 'shared-service',
              supplier: {
                kind: 'upstream-service',
                reachabilityPath: [],
                supplierServiceKey: 'auth',
              },
            },
          },
        },
      },
    },
  },
  'VAL-038',
  resolverContext
);

expectRule(
  'missing closure fulfillment',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          fulfillments: {
            auth: {
              kind: 'independent-units',
              units: {
                check: { kind: 'closure', closureId: 'missing' },
              },
            },
          },
        },
      },
    },
  },
  'VAL-039',
  resolverContext
);

expectRule(
  'wrong fulfillment scope',
  {
    ...sharedServiceUpstreamSupplierExample,
    core: {
      ...sharedServiceUpstreamSupplierExample.core,
      luis: {
        ...sharedServiceUpstreamSupplierExample.core.luis,
        cacheConsumer: {
          ...sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
          fulfillments: {
            cache: {
              kind: 'independent-units',
              units: {
                get: { kind: 'closure', closureId: 'missing' },
              },
            },
          },
        },
      },
    },
  },
  'VAL-036',
  resolverContext
);

expectRule(
  'bad upstream shared-service supplier',
  {
    ...sharedServiceUpstreamSupplierExample,
    core: {
      ...sharedServiceUpstreamSupplierExample.core,
      luis: {
        ...sharedServiceUpstreamSupplierExample.core.luis,
        cacheConsumer: {
          ...sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
          fulfillments: {
            cache: {
              kind: 'shared-service',
              supplier: {
                kind: 'upstream-service',
                reachabilityPath: [],
                supplierServiceKey: 'missing',
              },
            },
          },
        },
      },
    },
  },
  'VAL-044',
  resolverContext
);

expectRule(
  'bad reachability path',
  {
    ...sharedServiceUpstreamSupplierExample,
    core: {
      ...sharedServiceUpstreamSupplierExample.core,
      luis: {
        ...sharedServiceUpstreamSupplierExample.core.luis,
        cacheConsumer: {
          ...sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
          fulfillments: {
            cache: {
              kind: 'shared-service',
              supplier: {
                kind: 'upstream-service',
                reachabilityPath: ['missingClosure'],
                supplierServiceKey: 'cache',
              },
            },
          },
        },
      },
    },
  },
  'VAL-042',
  resolverContext
);

expectRule(
  'bad upstream supplier unit',
  {
    ...requirementClosureParentExample,
    requirements: {
      authProvider: childWithRequirementContractExample.requirements.auth,
    },
    core: {
      ...requirementClosureParentExample.core,
      luis: {
        ...requirementClosureParentExample.core.luis,
        securedChild: {
          ...requirementClosureParentExample.core.luis.securedChild,
          fulfillments: {
            auth: {
              kind: 'independent-units',
              units: {
                check: {
                  kind: 'upstream-unit',
                  reachabilityPath: [],
                  supplierServiceKey: 'authProvider',
                  supplierUnitKey: 'missing',
                },
              },
            },
          },
        },
      },
    },
  },
  'VAL-043',
  resolverContext
);

expectRule(
  'bad endpoint direction',
  {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      connections: {
        ...combinationalAdderExample.core.connections,
        badDirection: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'a',
          },
          to: { owner: { kind: 'lu' }, portKey: 'sum' },
        },
      },
    },
  },
  'VAL-010'
);

expectRule(
  'overlapping target path',
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
          pins: { kind: 'keyed', keys: ['x'] },
        },
      },
      connections: {
        ...combinationalAdderExample.core.connections,
        busWhole: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: { owner: { kind: 'lu' }, portKey: 'bus' },
        },
        busX: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'bus',
            payloadPath: ['x'],
          },
        },
      },
    },
  },
  'VAL-012'
);

expectRule(
  'bad structural outlet',
  {
    ...structuralCompositionExample,
    core: {
      ...structuralCompositionExample.core,
      kindOrganization: {
        ...structuralCompositionExample.core.kindOrganization,
        exportAnchorFills: {
          ...structuralCompositionExample.core.kindOrganization
            .exportAnchorFills,
          root: {
            kind: 'lui-outlet',
            luiId: 'header',
            outletKey: 'missing',
          },
        },
      },
    },
  },
  'VAL-028'
);

expectRule(
  'bad closure forwarding',
  {
    ...requirementClosureParentExample,
    core: {
      ...requirementClosureParentExample.core,
      closures: {
        ...requirementClosureParentExample.core.closures,
        authClosure: {
          ...requirementClosureParentExample.core.closures.authClosure,
          forwardedPortKeys: {
            inputs: ['missing'],
            outputs:
              requirementClosureParentExample.core.closures.authClosure
                .forwardedPortKeys.outputs,
          },
        },
      },
    },
  },
  'VAL-040'
);

expectRule(
  'unsupported optional extension',
  {
    ...combinationalAdderExample,
    extensions: [
      {
        feature: { namespace: 'logicir.test', key: 'optional-feature' },
        key: 'optional-extension',
        requirement: 'optional',
        payload: {},
      },
    ],
  },
  'VAL-046',
  {
    capabilities: {
      name: 'core-smoke',
      target: 'core-validator',
      core: {
        coreVersions: ['0.0.0-draft'],
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
      },
      features: [
        {
          feature: {
            namespace: 'logicir.test',
            key: 'optional-feature',
          },
          extensionKeys: ['optional-extension'],
          supportsRequired: true,
          supportsOptional: false,
        },
      ],
    },
  }
);

expectRule(
  'unsupported required extension',
  {
    ...combinationalAdderExample,
    extensions: [
      {
        feature: { namespace: 'logicir.test', key: 'required-feature' },
        key: 'required-extension',
        requirement: 'required',
        payload: {},
      },
    ],
  },
  'VAL-045'
);

function expectRule(
  name: string,
  unit: LogicUnit,
  rule: string,
  context?: ValidationContext
): void {
  const diagnostics = validateLogicUnit(unit, context);
  assert(
    diagnostics.some((diagnostic) => diagnostic.rule === rule),
    `${name} should emit ${rule}, got ${diagnostics
      .map((diagnostic) => diagnostic.rule)
      .join(', ')}`
  );
}

function expectNoRule(
  name: string,
  unit: LogicUnit,
  rule: string,
  context?: ValidationContext
): void {
  const diagnostics = validateLogicUnit(unit, context);
  assert(
    !diagnostics.some((diagnostic) => diagnostic.rule === rule),
    `${name} should not emit ${rule}, got ${diagnostics
      .map((diagnostic) => diagnostic.rule)
      .join(', ')}`
  );
}

function externalRequirementServiceConsumer(): LogicUnit {
  return {
    ...childWithRequirementContractExample,
    requirements: {
      auth: {
        kind: 'external',
        namespace: 'logicir.examples.requirements',
        key: 'auth',
      },
    },
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
