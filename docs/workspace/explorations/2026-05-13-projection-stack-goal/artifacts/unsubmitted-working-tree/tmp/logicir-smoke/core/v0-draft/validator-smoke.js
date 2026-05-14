"use strict";
/**
 * Lightweight validator smoke tests.
 *
 * This is a no-framework script so schema draft checks can run without adding
 * test dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const examples_1 = require("./examples");
const validator_1 = require("./validator");
const positiveExamples = [
    ['combinationalAdderExample', examples_1.combinationalAdderExample],
    ['statefulRetainedCounterExample', examples_1.statefulRetainedCounterExample],
    ['sequentialPipelineExample', examples_1.sequentialPipelineExample],
    ['structuralCompositionExample', examples_1.structuralCompositionExample],
    ['requirementClosureParentExample', examples_1.requirementClosureParentExample],
    ['sharedServiceUpstreamSupplierExample', examples_1.sharedServiceUpstreamSupplierExample],
];
const resolverContext = {
    resolveLogicUnit: (luId) => {
        if (luId === 'child-with-auth') {
            return examples_1.childWithRequirementContractExample;
        }
        if (luId === 'shared-cache-consumer') {
            return examples_1.sharedServiceConsumerContractExample;
        }
        return undefined;
    },
    resolveExternalTarget: (namespace, key) => externalTargets[`${namespace}/${key}`],
    resolveRequirementService: (namespace, key) => externalRequirementServices[`${namespace}/${key}`],
};
const externalTargets = {
    'logicir.examples/adder-primitive': {
        kind: 'combinational',
        ports: examples_1.combinationalAdderExample.core.luis.adder.ports,
        requirements: {},
    },
    'logicir.examples/counter-state': {
        kind: 'stateful',
        ports: examples_1.statefulRetainedCounterExample.core.luis.counterState.ports,
        requirements: {},
    },
    'logicir.examples/decode': {
        kind: 'combinational',
        ports: examples_1.sequentialPipelineExample.core.luis.decode.ports,
        requirements: {},
    },
    'logicir.examples/normalize': {
        kind: 'combinational',
        ports: examples_1.sequentialPipelineExample.core.luis.normalize.ports,
        requirements: {},
    },
    'logicir.examples/local-auth-check': {
        kind: 'combinational',
        ports: examples_1.requirementClosureParentExample.core.closures.authClosure.core.luis
            .localAuthCheck.ports,
        requirements: {},
    },
    'logicir.examples.ui/header-view': {
        kind: 'structural',
        ports: {},
        requirements: {},
        compositionSurface: examples_1.structuralCompositionExample.core.luis.header.compositionSurface,
    },
    'logicir.examples.ui/content-view': {
        kind: 'structural',
        ports: {},
        requirements: {},
        compositionSurface: examples_1.structuralCompositionExample.core.luis.content.compositionSurface,
    },
};
const externalAuthRequirementService = {
    fulfillmentScope: 'independent-units',
    units: {
        check: {
            kind: 'combinational',
            ports: {
                subject: examples_1.childWithRequirementContractExample.requirements.auth.service.units
                    .check.ports.subject,
                allowed: examples_1.childWithRequirementContractExample.requirements.auth.service.units
                    .check.ports.allowed,
            },
            requirements: {},
        },
    },
};
const externalRequirementServices = {
    'logicir.examples.requirements/auth': externalAuthRequirementService,
};
for (const [name, unit] of positiveExamples) {
    const context = name === 'requirementClosureParentExample' ||
        name === 'sharedServiceUpstreamSupplierExample'
        ? resolverContext
        : undefined;
    const errors = (0, validator_1.validateLogicUnit)(unit, context).filter((diagnostic) => diagnostic.severity === 'error');
    assert(errors.length === 0, `${name} should be valid, got ${errors
        .map((error) => error.rule)
        .join(', ')}`);
}
expectNoRule('resolved external target', examples_1.combinationalAdderExample, 'VAL-019', resolverContext);
expectNoRule('resolved external requirement service', externalRequirementServiceConsumer(), 'VAL-018', resolverContext);
expectRule('bad schema version', {
    ...examples_1.combinationalAdderExample,
    schemaVersion: 'wrong-version',
}, 'VAL-001');
expectRule('external target kind mismatch', examples_1.combinationalAdderExample, 'VAL-019', {
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
});
expectRule('unresolved external requirement service', externalRequirementServiceConsumer(), 'VAL-018');
expectRule('bad port interaction', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
            a: {
                ...examples_1.combinationalAdderExample.core.ports.a,
                interaction: {
                    pullReadable: false,
                    pushNotifiable: false,
                    retainedCurrent: false,
                },
            },
        },
    },
}, 'VAL-005');
expectRule('retained current without pull-readable', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
            a: {
                ...examples_1.combinationalAdderExample.core.ports.a,
                interaction: {
                    pullReadable: false,
                    pushNotifiable: true,
                    retainedCurrent: true,
                },
            },
        },
    },
}, 'VAL-006');
expectRule('primary result input port', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
            a: {
                ...examples_1.combinationalAdderExample.core.ports.a,
                role: 'primary-result',
            },
        },
    },
}, 'VAL-007');
expectRule('bad pin set', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
            a: {
                ...examples_1.combinationalAdderExample.core.ports.a,
                pins: { kind: 'keyed', keys: ['lane', 'lane'] },
            },
        },
    },
}, 'VAL-008');
expectRule('missing endpoint owner', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        connections: {
            ...examples_1.combinationalAdderExample.core.connections,
            missingOwner: {
                from: {
                    owner: { kind: 'lui', luiId: 'missing' },
                    portKey: 'sum',
                },
                to: { owner: { kind: 'lu' }, portKey: 'sum' },
            },
        },
    },
}, 'VAL-009');
expectRule('bad endpoint pin path', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
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
            ...examples_1.combinationalAdderExample.core.connections,
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
}, 'VAL-009');
expectRule('port interaction mismatch', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
            a: {
                ...examples_1.combinationalAdderExample.core.ports.a,
                interaction: {
                    pullReadable: false,
                    pushNotifiable: true,
                    retainedCurrent: false,
                },
            },
        },
    },
}, 'VAL-011');
expectRule('disallowed LUI kind', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        luis: {
            ...examples_1.combinationalAdderExample.core.luis,
            adder: {
                ...examples_1.combinationalAdderExample.core.luis.adder,
                kind: 'stateful',
            },
        },
    },
}, 'VAL-015');
expectRule('missing sequential step LUI', {
    ...examples_1.sequentialPipelineExample,
    core: {
        ...examples_1.sequentialPipelineExample.core,
        kindOrganization: {
            ...examples_1.sequentialPipelineExample.core.kindOrganization,
            steps: [
                ...examples_1.sequentialPipelineExample.core.kindOrganization.steps,
                'missing',
            ],
        },
    },
}, 'VAL-016');
expectRule('target kind mismatch', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
                kind: 'stateful',
            },
        },
    },
}, 'VAL-017', resolverContext);
expectRule('target port mismatch', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
                ports: {
                    ...examples_1.requirementClosureParentExample.core.luis.securedChild.ports,
                    allowed: {
                        ...examples_1.requirementClosureParentExample.core.luis.securedChild.ports
                            .allowed,
                        boundary: 'input',
                    },
                },
            },
        },
    },
}, 'VAL-020', resolverContext);
expectRule('structural composition surface mismatch', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        luis: {
            ...examples_1.structuralCompositionExample.core.luis,
            header: {
                ...examples_1.structuralCompositionExample.core.luis.header,
                compositionSurface: {
                    ...examples_1.structuralCompositionExample.core.luis.header
                        .compositionSurface,
                    outlets: ['missing'],
                },
            },
        },
    },
}, 'VAL-021', resolverContext);
expectRule('duplicate structural outlet', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        luis: {
            ...examples_1.structuralCompositionExample.core.luis,
            header: {
                ...examples_1.structuralCompositionExample.core.luis.header,
                compositionSurface: {
                    ...examples_1.structuralCompositionExample.core.luis.header
                        .compositionSurface,
                    outlets: ['root', 'root'],
                },
            },
        },
    },
}, 'VAL-022');
expectRule('missing required export anchor fill', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            exportAnchorFills: {
                aside: examples_1.structuralCompositionExample.core.kindOrganization
                    .exportAnchorFills.aside,
            },
        },
    },
}, 'VAL-023');
expectRule('bad child fill owner', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            luiFills: {
                ...examples_1.structuralCompositionExample.core.kindOrganization.luiFills,
                missing: {},
            },
        },
    },
}, 'VAL-025');
expectRule('unknown child anchor fill', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            luiFills: {
                ...examples_1.structuralCompositionExample.core.kindOrganization.luiFills,
                header: {
                    ...examples_1.structuralCompositionExample.core.kindOrganization
                        .luiFills.header,
                    missing: { kind: 'empty' },
                },
            },
        },
    },
}, 'VAL-026');
expectRule('child anchor shape mismatch', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            luiFills: {
                ...examples_1.structuralCompositionExample.core.kindOrganization.luiFills,
                header: {
                    ...examples_1.structuralCompositionExample.core.kindOrganization
                        .luiFills.header,
                    actions: { kind: 'empty' },
                },
            },
        },
    },
}, 'VAL-027');
expectRule('bad external outlet', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            luiFills: {
                ...examples_1.structuralCompositionExample.core.kindOrganization.luiFills,
                header: {
                    ...examples_1.structuralCompositionExample.core.kindOrganization
                        .luiFills.header,
                    title: {
                        kind: 'external-outlet',
                        outletKey: 'missing',
                    },
                },
            },
        },
    },
}, 'VAL-029');
expectRule('unknown fulfillment key', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
                fulfillments: {
                    ...examples_1.requirementClosureParentExample.core.luis.securedChild
                        .fulfillments,
                    missing: {
                        kind: 'independent-units',
                        units: {},
                    },
                },
            },
        },
    },
}, 'VAL-035', resolverContext);
expectRule('missing independent unit fulfillment', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
                fulfillments: {
                    auth: {
                        kind: 'independent-units',
                        units: {},
                    },
                },
            },
        },
    },
}, 'VAL-037', resolverContext);
expectRule('shared-service fulfillment for independent service', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
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
}, 'VAL-038', resolverContext);
expectRule('missing closure fulfillment', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
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
}, 'VAL-039', resolverContext);
expectRule('wrong fulfillment scope', {
    ...examples_1.sharedServiceUpstreamSupplierExample,
    core: {
        ...examples_1.sharedServiceUpstreamSupplierExample.core,
        luis: {
            ...examples_1.sharedServiceUpstreamSupplierExample.core.luis,
            cacheConsumer: {
                ...examples_1.sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
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
}, 'VAL-036', resolverContext);
expectRule('bad upstream shared-service supplier', {
    ...examples_1.sharedServiceUpstreamSupplierExample,
    core: {
        ...examples_1.sharedServiceUpstreamSupplierExample.core,
        luis: {
            ...examples_1.sharedServiceUpstreamSupplierExample.core.luis,
            cacheConsumer: {
                ...examples_1.sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
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
}, 'VAL-044', resolverContext);
expectRule('bad reachability path', {
    ...examples_1.sharedServiceUpstreamSupplierExample,
    core: {
        ...examples_1.sharedServiceUpstreamSupplierExample.core,
        luis: {
            ...examples_1.sharedServiceUpstreamSupplierExample.core.luis,
            cacheConsumer: {
                ...examples_1.sharedServiceUpstreamSupplierExample.core.luis.cacheConsumer,
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
}, 'VAL-042', resolverContext);
expectRule('bad upstream supplier unit', {
    ...examples_1.requirementClosureParentExample,
    requirements: {
        authProvider: examples_1.childWithRequirementContractExample.requirements.auth,
    },
    core: {
        ...examples_1.requirementClosureParentExample.core,
        luis: {
            ...examples_1.requirementClosureParentExample.core.luis,
            securedChild: {
                ...examples_1.requirementClosureParentExample.core.luis.securedChild,
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
}, 'VAL-043', resolverContext);
expectRule('bad endpoint direction', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        connections: {
            ...examples_1.combinationalAdderExample.core.connections,
            badDirection: {
                from: {
                    owner: { kind: 'lui', luiId: 'adder' },
                    portKey: 'a',
                },
                to: { owner: { kind: 'lu' }, portKey: 'sum' },
            },
        },
    },
}, 'VAL-010');
expectRule('overlapping target path', {
    ...examples_1.combinationalAdderExample,
    core: {
        ...examples_1.combinationalAdderExample.core,
        ports: {
            ...examples_1.combinationalAdderExample.core.ports,
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
            ...examples_1.combinationalAdderExample.core.connections,
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
}, 'VAL-012');
expectRule('bad structural outlet', {
    ...examples_1.structuralCompositionExample,
    core: {
        ...examples_1.structuralCompositionExample.core,
        kindOrganization: {
            ...examples_1.structuralCompositionExample.core.kindOrganization,
            exportAnchorFills: {
                ...examples_1.structuralCompositionExample.core.kindOrganization
                    .exportAnchorFills,
                root: {
                    kind: 'lui-outlet',
                    luiId: 'header',
                    outletKey: 'missing',
                },
            },
        },
    },
}, 'VAL-028');
expectRule('bad closure forwarding', {
    ...examples_1.requirementClosureParentExample,
    core: {
        ...examples_1.requirementClosureParentExample.core,
        closures: {
            ...examples_1.requirementClosureParentExample.core.closures,
            authClosure: {
                ...examples_1.requirementClosureParentExample.core.closures.authClosure,
                forwardedPortKeys: {
                    inputs: ['missing'],
                    outputs: examples_1.requirementClosureParentExample.core.closures.authClosure
                        .forwardedPortKeys.outputs,
                },
            },
        },
    },
}, 'VAL-040');
expectRule('unsupported optional extension', {
    ...examples_1.combinationalAdderExample,
    extensions: [
        {
            feature: { namespace: 'logicir.test', key: 'optional-feature' },
            key: 'optional-extension',
            requirement: 'optional',
            payload: {},
        },
    ],
}, 'VAL-046', {
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
});
expectRule('unsupported required extension', {
    ...examples_1.combinationalAdderExample,
    extensions: [
        {
            feature: { namespace: 'logicir.test', key: 'required-feature' },
            key: 'required-extension',
            requirement: 'required',
            payload: {},
        },
    ],
}, 'VAL-045');
function expectRule(name, unit, rule, context) {
    const diagnostics = (0, validator_1.validateLogicUnit)(unit, context);
    assert(diagnostics.some((diagnostic) => diagnostic.rule === rule), `${name} should emit ${rule}, got ${diagnostics
        .map((diagnostic) => diagnostic.rule)
        .join(', ')}`);
}
function expectNoRule(name, unit, rule, context) {
    const diagnostics = (0, validator_1.validateLogicUnit)(unit, context);
    assert(!diagnostics.some((diagnostic) => diagnostic.rule === rule), `${name} should not emit ${rule}, got ${diagnostics
        .map((diagnostic) => diagnostic.rule)
        .join(', ')}`);
}
function externalRequirementServiceConsumer() {
    return {
        ...examples_1.childWithRequirementContractExample,
        requirements: {
            auth: {
                kind: 'external',
                namespace: 'logicir.examples.requirements',
                key: 'auth',
            },
        },
    };
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
