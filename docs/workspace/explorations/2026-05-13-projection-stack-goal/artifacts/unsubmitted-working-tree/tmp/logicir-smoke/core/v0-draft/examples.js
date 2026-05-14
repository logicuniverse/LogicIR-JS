"use strict";
/**
 * Minimal LogicIR core schema examples.
 *
 * These examples are intentionally small. They demonstrate canonical core
 * shapes only; target registries, runtime code, HDL lowering, and feature
 * implementation details stay outside core.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedServiceUpstreamSupplierExample = exports.sharedServiceConsumerContractExample = exports.requirementClosureParentExample = exports.childWithRequirementContractExample = exports.structuralCompositionExample = exports.sequentialPipelineExample = exports.statefulRetainedCounterExample = exports.combinationalAdderExample = void 0;
const types_1 = require("./types");
const pullInput = {
    boundary: 'input',
    interaction: {
        pullReadable: true,
        pushNotifiable: false,
        retainedCurrent: false,
    },
};
const pullOutput = {
    boundary: 'output',
    interaction: {
        pullReadable: true,
        pushNotifiable: false,
        retainedCurrent: false,
    },
};
const pushInput = {
    boundary: 'input',
    interaction: {
        pullReadable: false,
        pushNotifiable: true,
        retainedCurrent: false,
    },
};
const retainedOutput = {
    boundary: 'output',
    interaction: {
        pullReadable: true,
        pushNotifiable: true,
        retainedCurrent: true,
    },
};
exports.combinationalAdderExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {},
    core: {
        kindOrganization: { kind: 'combinational' },
        ports: {
            a: pullInput,
            b: pullInput,
            sum: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            adder: {
                kind: 'combinational',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples',
                    key: 'adder-primitive',
                },
                ports: {
                    a: pullInput,
                    b: pullInput,
                    sum: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
        },
        connections: {
            aToAdder: {
                from: { owner: { kind: 'lu' }, portKey: 'a' },
                to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'a' },
            },
            bToAdder: {
                from: { owner: { kind: 'lu' }, portKey: 'b' },
                to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'b' },
            },
            sumFromAdder: {
                from: {
                    owner: { kind: 'lui', luiId: 'adder' },
                    portKey: 'sum',
                },
                to: { owner: { kind: 'lu' }, portKey: 'sum' },
            },
        },
        closures: {},
    },
};
exports.statefulRetainedCounterExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {},
    core: {
        kindOrganization: { kind: 'stateful' },
        ports: {
            increment: pushInput,
            value: { ...retainedOutput, role: 'primary-result' },
        },
        luis: {
            counterState: {
                kind: 'stateful',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples',
                    key: 'counter-state',
                },
                ports: {
                    increment: pushInput,
                    value: { ...retainedOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
        },
        connections: {
            incrementToState: {
                from: { owner: { kind: 'lu' }, portKey: 'increment' },
                to: {
                    owner: { kind: 'lui', luiId: 'counterState' },
                    portKey: 'increment',
                },
            },
            valueFromState: {
                from: {
                    owner: { kind: 'lui', luiId: 'counterState' },
                    portKey: 'value',
                },
                to: { owner: { kind: 'lu' }, portKey: 'value' },
            },
        },
        closures: {},
    },
};
exports.sequentialPipelineExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {},
    core: {
        kindOrganization: {
            kind: 'sequential',
            steps: ['decode', 'normalize'],
        },
        ports: {
            raw: pullInput,
            normalized: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            decode: {
                kind: 'combinational',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples',
                    key: 'decode',
                },
                ports: {
                    input: pullInput,
                    output: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
            normalize: {
                kind: 'combinational',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples',
                    key: 'normalize',
                },
                ports: {
                    input: pullInput,
                    output: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
        },
        connections: {
            rawToDecode: {
                from: { owner: { kind: 'lu' }, portKey: 'raw' },
                to: {
                    owner: { kind: 'lui', luiId: 'decode' },
                    portKey: 'input',
                },
            },
            decodeToNormalize: {
                from: {
                    owner: { kind: 'lui', luiId: 'decode' },
                    portKey: 'output',
                },
                to: {
                    owner: { kind: 'lui', luiId: 'normalize' },
                    portKey: 'input',
                },
            },
            normalizedFromNormalize: {
                from: {
                    owner: { kind: 'lui', luiId: 'normalize' },
                    portKey: 'output',
                },
                to: { owner: { kind: 'lu' }, portKey: 'normalized' },
            },
        },
        closures: {},
    },
};
exports.structuralCompositionExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {},
    core: {
        kindOrganization: {
            kind: 'structural',
            exportAnchors: {
                root: { required: true },
                aside: { required: false },
            },
            externalOutlets: {
                title: { shape: 'single', required: true },
            },
            exportAnchorFills: {
                root: {
                    kind: 'lui-outlet',
                    luiId: 'header',
                    outletKey: 'root',
                },
                aside: {
                    kind: 'lui-outlet',
                    luiId: 'content',
                    outletKey: 'root',
                },
            },
            luiFills: {
                header: {
                    title: { kind: 'external-outlet', outletKey: 'title' },
                    actions: {
                        kind: 'collection',
                        items: [
                            {
                                kind: 'lui-outlet',
                                luiId: 'content',
                                outletKey: 'root',
                            },
                        ],
                    },
                },
                content: {},
            },
        },
        ports: {},
        luis: {
            header: {
                kind: 'structural',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples.ui',
                    key: 'header-view',
                },
                ports: {},
                fulfillments: {},
                compositionSurface: {
                    outlets: ['root'],
                    anchors: {
                        title: { shape: 'single', required: true },
                        actions: { shape: 'collection', required: false },
                    },
                },
            },
            content: {
                kind: 'structural',
                target: {
                    kind: 'external',
                    namespace: 'logicir.examples.ui',
                    key: 'content-view',
                },
                ports: {},
                fulfillments: {},
                compositionSurface: {
                    outlets: ['root'],
                    anchors: {},
                },
            },
        },
        connections: {},
        closures: {},
    },
};
const authRequirementService = {
    fulfillmentScope: 'independent-units',
    units: {
        check: {
            kind: 'combinational',
            ports: {
                subject: pullInput,
                allowed: { ...pullOutput, role: 'primary-result' },
            },
            requirements: {},
        },
    },
};
exports.childWithRequirementContractExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {
        auth: { kind: 'inline', service: authRequirementService },
    },
    core: {
        kindOrganization: { kind: 'combinational' },
        ports: {
            subject: pullInput,
            allowed: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            authCheck: {
                kind: 'combinational',
                target: {
                    kind: 'requirement',
                    serviceKey: 'auth',
                    unitKey: 'check',
                },
                ports: {
                    subject: pullInput,
                    allowed: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
        },
        connections: {
            subjectToRequirement: {
                from: { owner: { kind: 'lu' }, portKey: 'subject' },
                to: {
                    owner: { kind: 'lui', luiId: 'authCheck' },
                    portKey: 'subject',
                },
            },
            allowedFromRequirement: {
                from: {
                    owner: { kind: 'lui', luiId: 'authCheck' },
                    portKey: 'allowed',
                },
                to: { owner: { kind: 'lu' }, portKey: 'allowed' },
            },
        },
        closures: {},
    },
};
exports.requirementClosureParentExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {},
    core: {
        kindOrganization: { kind: 'combinational' },
        ports: {
            subject: pullInput,
            allowed: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            securedChild: {
                kind: 'combinational',
                target: { kind: 'lu', luId: 'child-with-auth' },
                ports: {
                    subject: pullInput,
                    allowed: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {
                    auth: {
                        kind: 'independent-units',
                        units: {
                            check: { kind: 'closure', closureId: 'authClosure' },
                        },
                    },
                },
            },
        },
        connections: {
            subjectToChild: {
                from: { owner: { kind: 'lu' }, portKey: 'subject' },
                to: {
                    owner: { kind: 'lui', luiId: 'securedChild' },
                    portKey: 'subject',
                },
            },
            allowedFromChild: {
                from: {
                    owner: { kind: 'lui', luiId: 'securedChild' },
                    portKey: 'allowed',
                },
                to: { owner: { kind: 'lu' }, portKey: 'allowed' },
            },
        },
        closures: {
            authClosure: {
                forwardedPortKeys: {
                    inputs: ['subject'],
                    outputs: ['allowed'],
                },
                core: {
                    kindOrganization: { kind: 'combinational' },
                    ports: {
                        subject: pullInput,
                        allowed: { ...pullOutput, role: 'primary-result' },
                    },
                    luis: {
                        localAuthCheck: {
                            kind: 'combinational',
                            target: {
                                kind: 'external',
                                namespace: 'logicir.examples',
                                key: 'local-auth-check',
                            },
                            ports: {
                                subject: pullInput,
                                allowed: { ...pullOutput, role: 'primary-result' },
                            },
                            fulfillments: {},
                        },
                    },
                    connections: {
                        subjectToLocalAuth: {
                            from: { owner: { kind: 'lu' }, portKey: 'subject' },
                            to: {
                                owner: { kind: 'lui', luiId: 'localAuthCheck' },
                                portKey: 'subject',
                            },
                        },
                        allowedFromLocalAuth: {
                            from: {
                                owner: { kind: 'lui', luiId: 'localAuthCheck' },
                                portKey: 'allowed',
                            },
                            to: { owner: { kind: 'lu' }, portKey: 'allowed' },
                        },
                    },
                    closures: {},
                },
            },
        },
    },
};
const sharedCacheRequirementService = {
    fulfillmentScope: 'shared-service',
    units: {
        get: {
            kind: 'combinational',
            ports: {
                key: pullInput,
                value: { ...pullOutput, role: 'primary-result' },
            },
            requirements: {},
        },
        put: {
            kind: 'stateful',
            ports: {
                entry: pushInput,
            },
            requirements: {},
        },
    },
};
exports.sharedServiceConsumerContractExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {
        cache: { kind: 'inline', service: sharedCacheRequirementService },
    },
    core: {
        kindOrganization: { kind: 'combinational' },
        ports: {
            key: pullInput,
            value: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            cacheGet: {
                kind: 'combinational',
                target: {
                    kind: 'requirement',
                    serviceKey: 'cache',
                    unitKey: 'get',
                },
                ports: {
                    key: pullInput,
                    value: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {},
            },
        },
        connections: {
            keyToCacheGet: {
                from: { owner: { kind: 'lu' }, portKey: 'key' },
                to: {
                    owner: { kind: 'lui', luiId: 'cacheGet' },
                    portKey: 'key',
                },
            },
            valueFromCacheGet: {
                from: {
                    owner: { kind: 'lui', luiId: 'cacheGet' },
                    portKey: 'value',
                },
                to: { owner: { kind: 'lu' }, portKey: 'value' },
            },
        },
        closures: {},
    },
};
exports.sharedServiceUpstreamSupplierExample = {
    schemaVersion: types_1.LOGIC_IR_CORE_SCHEMA_VERSION,
    requirements: {
        cache: { kind: 'inline', service: sharedCacheRequirementService },
    },
    core: {
        kindOrganization: { kind: 'combinational' },
        ports: {
            key: pullInput,
            value: { ...pullOutput, role: 'primary-result' },
        },
        luis: {
            cacheConsumer: {
                kind: 'combinational',
                target: { kind: 'lu', luId: 'shared-cache-consumer' },
                ports: {
                    key: pullInput,
                    value: { ...pullOutput, role: 'primary-result' },
                },
                fulfillments: {
                    cache: {
                        kind: 'shared-service',
                        supplier: {
                            kind: 'upstream-service',
                            reachabilityPath: [],
                            supplierServiceKey: 'cache',
                        },
                    },
                },
            },
        },
        connections: {
            keyToConsumer: {
                from: { owner: { kind: 'lu' }, portKey: 'key' },
                to: {
                    owner: { kind: 'lui', luiId: 'cacheConsumer' },
                    portKey: 'key',
                },
            },
            valueFromConsumer: {
                from: {
                    owner: { kind: 'lui', luiId: 'cacheConsumer' },
                    portKey: 'value',
                },
                to: { owner: { kind: 'lu' }, portKey: 'value' },
            },
        },
        closures: {},
    },
};
