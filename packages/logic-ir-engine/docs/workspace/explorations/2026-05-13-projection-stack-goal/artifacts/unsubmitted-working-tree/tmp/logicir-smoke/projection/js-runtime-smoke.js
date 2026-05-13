"use strict";
/**
 * Executable JS runtime lowering smoke test.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const examples_1 = require("../core/v0-draft/examples");
const types_1 = require("../core/v0-draft/types");
const target_plans_1 = require("./target-plans");
const lowering_1 = require("./lowering");
const { mkdtempSync, rmSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join, resolve } = require('path');
const { pathToFileURL } = require('url');
const capabilities = {
    name: 'js-runtime-executable-smoke',
    target: 'js-runtime',
    core: {
        coreVersions: [types_1.LOGIC_IR_CORE_SCHEMA_VERSION],
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
    },
    features: [
        {
            feature: { namespace: 'logicir.type-system', key: 'core' },
            extensionKeys: [
                'type-definitions',
                'payload-types',
                'port-compatibility',
                'path-schema',
            ],
            supportsRequired: true,
            supportsOptional: true,
        },
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
    typeSystem: {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        typeForms: ['primitive', 'record', 'array', 'tuple', 'named'],
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
};
void main();
async function main() {
    const unit = withPortPayloadTypes(examples_1.combinationalAdderExample);
    const result = (0, target_plans_1.projectJSRuntimePlan)(unit, capabilities);
    assert(result.ok, 'JS runtime plan should be valid for typed adder.');
    if (!result.ok) {
        throw new Error('unreachable');
    }
    const artifact = (0, lowering_1.lowerJSExecutableRuntime)(result.plan);
    const dir = mkdtempSync(join(tmpdir(), 'logicir-js-runtime-'));
    try {
        const filePath = join(dir, artifact.filename);
        writeFileSync(filePath, artifact.content, 'utf8');
        const dynamicImport = Function('specifier', 'return import(specifier);');
        const module = (await dynamicImport(pathToFileURL(resolve(filePath)).href));
        const runtime = module.createRuntime({
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        const outputs = await runtime.invoke({ a: 2, b: 5 });
        assert(outputs.sum === 7, `Expected sum=7, got ${String(outputs.sum)}.`);
        const pathUnit = withPayloadPathBusTypes(payloadPathAdderUnit());
        const pathPlan = (0, target_plans_1.projectJSRuntimePlan)(pathUnit, capabilities);
        assert(pathPlan.ok, 'JS runtime plan should support typed payloadPath unit.');
        if (!pathPlan.ok) {
            throw new Error('unreachable');
        }
        const pathArtifact = (0, lowering_1.lowerJSExecutableRuntime)(pathPlan.plan);
        const pathFile = join(dir, `path-${pathArtifact.filename}`);
        writeFileSync(pathFile, pathArtifact.content, 'utf8');
        const pathModule = (await dynamicImport(pathToFileURL(resolve(pathFile)).href));
        const pathRuntime = pathModule.createRuntime({
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        const pathOutputs = await pathRuntime.invoke({
            busIn: { lanes: [2, 5] },
        });
        assert(pathOutputs.busOut.lanes[0] === 7, `Expected busOut.lanes[0]=7, got ${JSON.stringify(pathOutputs)}.`);
        const pinUnit = withPinBusTypes(pinAwareAdderUnit());
        const pinPlan = (0, target_plans_1.projectJSRuntimePlan)(pinUnit, capabilities);
        assert(pinPlan.ok, 'JS runtime plan should support pin-aware unit.');
        if (!pinPlan.ok) {
            throw new Error('unreachable');
        }
        const pinArtifact = (0, lowering_1.lowerJSExecutableRuntime)(pinPlan.plan);
        const pinFile = join(dir, `pin-${pinArtifact.filename}`);
        writeFileSync(pinFile, pinArtifact.content, 'utf8');
        const pinModule = (await dynamicImport(pathToFileURL(resolve(pinFile)).href));
        const pinRuntime = pinModule.createRuntime({
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        const pinOutputs = await pinRuntime.invoke({
            pairIn: [3, 4],
        });
        assert(pinOutputs.resultBus.sum === 7, `Expected resultBus.sum=7, got ${JSON.stringify(pinOutputs)}.`);
        const sequentialUnit = withSequentialPayloadTypes(examples_1.sequentialPipelineExample);
        const sequentialWithAsyncPolicy = withJSAsyncPolicy(sequentialUnit, {
            invocation: 'promise',
            awaitBeforeNext: true,
            selector: { stepIndex: 1 },
        });
        const sequentialPlan = (0, target_plans_1.projectJSRuntimePlan)(sequentialWithAsyncPolicy, capabilities);
        assert(sequentialPlan.ok, 'JS runtime plan should support typed sequential pipeline.');
        if (!sequentialPlan.ok) {
            throw new Error('unreachable');
        }
        const sequentialArtifact = (0, lowering_1.lowerJSExecutableRuntime)(sequentialPlan.plan);
        const sequentialFile = join(dir, `sequential-${sequentialArtifact.filename}`);
        writeFileSync(sequentialFile, sequentialArtifact.content, 'utf8');
        const sequentialModule = (await dynamicImport(pathToFileURL(resolve(sequentialFile)).href));
        const sequentialRuntime = sequentialModule.createRuntime({
            implementations: {
                decode: ({ input }) => ({
                    output: input.trim(),
                }),
                normalize: async ({ input }) => ({
                    output: input.toUpperCase(),
                }),
            },
        });
        const sequentialOutputs = await sequentialRuntime.invoke({
            raw: '  logicir  ',
        });
        assert(sequentialOutputs.normalized === 'LOGICIR', `Expected normalized=LOGICIR, got ${String(sequentialOutputs.normalized)}.`);
        const asyncIteratorUnit = withJSAsyncPolicy(sequentialUnit, {
            invocation: 'async-iterator',
            awaitBeforeNext: true,
        });
        const asyncIteratorPlan = (0, target_plans_1.projectJSRuntimePlan)(asyncIteratorUnit, capabilities);
        assert(asyncIteratorPlan.ok, 'JS runtime plan should support async-iterator when capability declares it.');
        if (!asyncIteratorPlan.ok) {
            throw new Error('unreachable');
        }
        const asyncIteratorArtifact = (0, lowering_1.lowerJSExecutableRuntime)(asyncIteratorPlan.plan);
        const asyncIteratorFile = join(dir, `async-iterator-${asyncIteratorArtifact.filename}`);
        writeFileSync(asyncIteratorFile, asyncIteratorArtifact.content, 'utf8');
        const asyncIteratorModule = (await dynamicImport(pathToFileURL(resolve(asyncIteratorFile)).href));
        const asyncIteratorRuntime = asyncIteratorModule.createRuntime({
            implementations: {
                decode: async function* ({ input }) {
                    yield { output: input.trim() };
                },
                normalize: async function* ({ input }) {
                    yield { output: input.toUpperCase() };
                },
            },
        });
        const asyncIteratorOutputs = await asyncIteratorRuntime.invoke({
            raw: '  logicir  ',
        });
        assert(asyncIteratorOutputs.normalized === 'LOGICIR', `Expected async iterator normalized=LOGICIR, got ${String(asyncIteratorOutputs.normalized)}.`);
        const unsupportedOrderingPlan = (0, target_plans_1.projectJSRuntimePlan)(withJSAsyncPolicy(sequentialUnit, {
            invocation: 'promise',
            awaitBeforeNext: false,
        }), capabilities);
        assert(!unsupportedOrderingPlan.ok &&
            unsupportedOrderingPlan.diagnostics.some((diagnostic) => diagnostic.code === 'JS-004'), 'JS runtime planner should reject awaitBeforeNext=false before lowering.');
        const staticDynamicUnit = withJSDynamicFulfillmentPolicy(unit, {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'static-at-startup',
            consistency: 'no-live-switch',
        });
        const staticDynamicPlan = (0, target_plans_1.projectJSRuntimePlan)(staticDynamicUnit, capabilities);
        assert(staticDynamicPlan.ok, 'JS runtime plan should support static-at-startup dynamic fulfillment.');
        if (!staticDynamicPlan.ok) {
            throw new Error('unreachable');
        }
        const staticDynamicArtifact = (0, lowering_1.lowerJSExecutableRuntime)(staticDynamicPlan.plan);
        const staticDynamicFile = join(dir, `static-dynamic-${staticDynamicArtifact.filename}`);
        writeFileSync(staticDynamicFile, staticDynamicArtifact.content, 'utf8');
        const staticDynamicModule = (await dynamicImport(pathToFileURL(resolve(staticDynamicFile)).href));
        const staticDynamicMissingRuntime = staticDynamicModule.createRuntime({
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        let staticDynamicMissingFailed = false;
        try {
            await staticDynamicMissingRuntime.invoke({ a: 2, b: 5 });
        }
        catch {
            staticDynamicMissingFailed = true;
        }
        assert(staticDynamicMissingFailed, 'JS executable runtime should require host fulfillment evidence for static dynamic fulfillment.');
        const staticDynamicRuntime = staticDynamicModule.createRuntime({
            fulfillments: { auth: { check: true } },
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        const staticDynamicOutputs = await staticDynamicRuntime.invoke({ a: 2, b: 5 });
        assert(staticDynamicOutputs.sum === 7, `Expected static dynamic output sum=7, got ${JSON.stringify(staticDynamicOutputs)}.`);
        const requirementUnit = withAuthRequirementPayloadTypes(examples_1.childWithRequirementContractExample);
        const requirementDynamicUnit = withJSDynamicFulfillmentPolicy(requirementUnit, {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'static-at-startup',
            consistency: 'no-live-switch',
        });
        const requirementDynamicPlan = (0, target_plans_1.projectJSRuntimePlan)(requirementDynamicUnit, capabilities);
        assert(requirementDynamicPlan.ok, 'JS runtime plan should support requirement-target LUI dynamic fulfillment.');
        if (!requirementDynamicPlan.ok) {
            throw new Error('unreachable');
        }
        const requirementDynamicArtifact = (0, lowering_1.lowerJSExecutableRuntime)(requirementDynamicPlan.plan);
        const requirementDynamicFile = join(dir, `requirement-dynamic-${requirementDynamicArtifact.filename}`);
        writeFileSync(requirementDynamicFile, requirementDynamicArtifact.content, 'utf8');
        const requirementDynamicModule = (await dynamicImport(pathToFileURL(resolve(requirementDynamicFile)).href));
        const requirementDynamicRuntime = requirementDynamicModule.createRuntime({
            fulfillments: {
                auth: {
                    check: ({ subject }) => ({
                        allowed: subject === 'admin',
                    }),
                },
            },
        });
        const allowedOutputs = await requirementDynamicRuntime.invoke({
            subject: 'admin',
        });
        const deniedOutputs = await requirementDynamicRuntime.invoke({
            subject: 'guest',
        });
        assert(allowedOutputs.allowed === true && deniedOutputs.allowed === false, `Expected requirement fulfillment outputs true,false, got ${JSON.stringify({
            allowedOutputs,
            deniedOutputs,
        })}.`);
        const lateBoundRequirementUnit = withJSDynamicFulfillmentPolicy(requirementUnit, {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'late-bound',
            consistency: 'no-live-switch',
        });
        const lateBoundRequirementPlan = (0, target_plans_1.projectJSRuntimePlan)(lateBoundRequirementUnit, capabilities);
        assert(lateBoundRequirementPlan.ok, 'JS runtime plan should support late-bound requirement-target fulfillment.');
        if (!lateBoundRequirementPlan.ok) {
            throw new Error('unreachable');
        }
        const lateBoundRequirementArtifact = (0, lowering_1.lowerJSExecutableRuntime)(lateBoundRequirementPlan.plan);
        const lateBoundRequirementFile = join(dir, `late-bound-requirement-${lateBoundRequirementArtifact.filename}`);
        writeFileSync(lateBoundRequirementFile, lateBoundRequirementArtifact.content, 'utf8');
        const lateBoundRequirementModule = (await dynamicImport(pathToFileURL(resolve(lateBoundRequirementFile)).href));
        let allowAll = false;
        const lateBoundRuntime = lateBoundRequirementModule.createRuntime({
            fulfillments: ({ serviceKey, unitKey }) => {
                assert(serviceKey === 'auth' && unitKey === 'check', `Unexpected late-bound selector ${serviceKey}:${unitKey}.`);
                return ({ subject }) => ({
                    allowed: allowAll || subject === 'admin',
                });
            },
        });
        const lateBoundFirst = await lateBoundRuntime.invoke({ subject: 'guest' });
        allowAll = true;
        const lateBoundSecond = await lateBoundRuntime.invoke({ subject: 'guest' });
        assert(lateBoundFirst.allowed === false && lateBoundSecond.allowed === true, `Expected late-bound outputs false,true, got ${JSON.stringify({
            lateBoundFirst,
            lateBoundSecond,
        })}.`);
        const switchableRequirementUnit = withJSDynamicFulfillmentPolicy(requirementUnit, {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'switchable',
            consistency: 'quiescent-switch',
        });
        const switchableRequirementPlan = (0, target_plans_1.projectJSRuntimePlan)(switchableRequirementUnit, capabilities);
        assert(switchableRequirementPlan.ok, 'JS runtime plan should support switchable fulfillment at quiescent invocation boundaries.');
        if (!switchableRequirementPlan.ok) {
            throw new Error('unreachable');
        }
        const switchableRequirementArtifact = (0, lowering_1.lowerJSExecutableRuntime)(switchableRequirementPlan.plan);
        const switchableRequirementFile = join(dir, `switchable-requirement-${switchableRequirementArtifact.filename}`);
        writeFileSync(switchableRequirementFile, switchableRequirementArtifact.content, 'utf8');
        const switchableRequirementModule = (await dynamicImport(pathToFileURL(resolve(switchableRequirementFile)).href));
        let activeRule = 'admin-only';
        const switchableRuntime = switchableRequirementModule.createRuntime({
            fulfillments: {
                resolve: ({ serviceKey, unitKey }) => {
                    assert(serviceKey === 'auth' && unitKey === 'check', `Unexpected switchable selector ${serviceKey}:${unitKey}.`);
                    return ({ subject }) => ({
                        allowed: activeRule === 'allow-all' || subject === 'admin',
                    });
                },
            },
        });
        const switchableFirst = await switchableRuntime.invoke({ subject: 'guest' });
        activeRule = 'allow-all';
        const switchableSecond = await switchableRuntime.invoke({ subject: 'guest' });
        assert(switchableFirst.allowed === false && switchableSecond.allowed === true, `Expected switchable outputs false,true, got ${JSON.stringify({
            switchableFirst,
            switchableSecond,
        })}.`);
        const transactionalRequirementUnit = withJSDynamicFulfillmentPolicy(withDuplicatedAuthCheckLUI(requirementUnit), {
            selector: { serviceKey: 'auth', unitKey: 'check' },
            mode: 'switchable',
            consistency: 'transactional-switch',
        });
        const transactionalRequirementPlan = (0, target_plans_1.projectJSRuntimePlan)(transactionalRequirementUnit, capabilities);
        assert(transactionalRequirementPlan.ok, 'JS runtime plan should support transactional switchable fulfillment with per-invocation supplier snapshots.');
        if (!transactionalRequirementPlan.ok) {
            throw new Error('unreachable');
        }
        const transactionalRequirementArtifact = (0, lowering_1.lowerJSExecutableRuntime)(transactionalRequirementPlan.plan);
        const transactionalRequirementFile = join(dir, `transactional-requirement-${transactionalRequirementArtifact.filename}`);
        writeFileSync(transactionalRequirementFile, transactionalRequirementArtifact.content, 'utf8');
        const transactionalRequirementModule = (await dynamicImport(pathToFileURL(resolve(transactionalRequirementFile)).href));
        let transactionalResolveCount = 0;
        const transactionalRuntime = transactionalRequirementModule.createRuntime({
            fulfillments: {
                resolve: ({ serviceKey, unitKey }) => {
                    assert(serviceKey === 'auth' && unitKey === 'check', `Unexpected transactional selector ${serviceKey}:${unitKey}.`);
                    transactionalResolveCount += 1;
                    const allowed = transactionalResolveCount === 1;
                    return () => ({ allowed });
                },
            },
        });
        const transactionalOutputs = await transactionalRuntime.invoke({
            subject: 'guest',
        });
        assert(transactionalOutputs.allowed === true &&
            transactionalResolveCount === 1, `Expected transactional fulfillment to snapshot one supplier per invoke, got ${JSON.stringify({
            transactionalOutputs,
            transactionalResolveCount,
        })}.`);
        const retainedStoreUnit = withJSRetainedCurrentPolicy(examples_1.statefulRetainedCounterExample, {
            realization: 'source-store',
            notification: 'subscribe',
        });
        const retainedStorePlan = (0, target_plans_1.projectJSRuntimePlan)(withStatefulCounterPayloadTypes(retainedStoreUnit), capabilities);
        assert(retainedStorePlan.ok, 'JS runtime plan should support source-store retained-current.');
        if (!retainedStorePlan.ok) {
            throw new Error('unreachable');
        }
        const retainedStoreArtifact = (0, lowering_1.lowerJSExecutableRuntime)(retainedStorePlan.plan);
        const retainedStoreFile = join(dir, `retained-store-${retainedStoreArtifact.filename}`);
        writeFileSync(retainedStoreFile, retainedStoreArtifact.content, 'utf8');
        const retainedStoreModule = (await dynamicImport(pathToFileURL(resolve(retainedStoreFile)).href));
        let retainedCount = 0;
        const retainedStoreRuntime = retainedStoreModule.createRuntime({
            implementations: {
                counterState: ({ increment }) => {
                    retainedCount += increment ?? 0;
                    return { value: retainedCount };
                },
            },
        });
        const retainedFirst = await retainedStoreRuntime.invoke({ increment: 4 });
        const retainedSecond = await retainedStoreRuntime.invoke({});
        assert(retainedFirst.value === 4 && retainedSecond.value === 4, `Expected retained store outputs 4,4, got ${JSON.stringify({
            retainedFirst,
            retainedSecond,
        })}.`);
        const hostObservableUnit = withJSRetainedCurrentPolicy(examples_1.statefulRetainedCounterExample, {
            realization: 'host-observable',
            notification: 'subscribe',
        });
        const hostObservablePlan = (0, target_plans_1.projectJSRuntimePlan)(withStatefulCounterPayloadTypes(hostObservableUnit), capabilities);
        assert(hostObservablePlan.ok, 'JS runtime plan should support host-observable retained-current.');
        if (!hostObservablePlan.ok) {
            throw new Error('unreachable');
        }
        const hostObservableArtifact = (0, lowering_1.lowerJSExecutableRuntime)(hostObservablePlan.plan);
        const hostObservableFile = join(dir, `host-observable-${hostObservableArtifact.filename}`);
        writeFileSync(hostObservableFile, hostObservableArtifact.content, 'utf8');
        const hostObservableModule = (await dynamicImport(pathToFileURL(resolve(hostObservableFile)).href));
        const hostObservableRuntime = hostObservableModule.createRuntime({
            retainedCurrent: new Map([['lui:counterState:value:', 41]]),
            implementations: {
                counterState: ({ increment }, context) => ({
                    value: (context.retainedCurrent?.value ?? 0) + (increment ?? 0),
                }),
            },
        });
        const hostObservableRead = await hostObservableRuntime.invoke({});
        const hostObservableIncrement = await hostObservableRuntime.invoke({
            increment: 1,
        });
        assert(hostObservableRead.value === 41 && hostObservableIncrement.value === 42, `Expected host-observable retained outputs 41,42, got ${JSON.stringify({
            hostObservableRead,
            hostObservableIncrement,
        })}.`);
        const observable = createRetainedObservable(5);
        let subscribed = 0;
        let unsubscribed = 0;
        let delivered = 0;
        const hostObservableSubscriptionRuntime = hostObservableModule.createRuntime({
            retainedCurrent: {
                'lui:counterState:value:': {
                    getSnapshot: () => observable.getSnapshot(),
                    subscribe: (listener) => {
                        subscribed += 1;
                        const unsubscribe = observable.subscribe((value) => {
                            delivered += 1;
                            listener(value);
                        });
                        return () => {
                            unsubscribed += 1;
                            unsubscribe();
                        };
                    },
                },
            },
            implementations: {
                counterState: ({ increment }, context) => ({
                    value: (context.retainedCurrent?.value ?? 0) + (increment ?? 0),
                }),
            },
        });
        const observableFirst = await hostObservableSubscriptionRuntime.invoke({});
        observable.publish(9);
        const observableSecond = await hostObservableSubscriptionRuntime.invoke({});
        await hostObservableSubscriptionRuntime.dispose();
        observable.publish(13);
        assert(observableFirst.value === 5 &&
            observableSecond.value === 9 &&
            subscribed === 1 &&
            unsubscribed === 1 &&
            delivered === 1, `Expected host-observable subscribe retained outputs 5,9 with one delivery and one unsubscribe, got ${JSON.stringify({
            observableFirst,
            observableSecond,
            subscribed,
            unsubscribed,
            delivered,
        })}.`);
        const selectorAwareUnit = withJSLUIRetainedCurrentPolicy(withStatefulCounterPayloadTypes(examples_1.statefulRetainedCounterExample), 'counterState', 'value', {
            selector: { portKey: 'value' },
            realization: 'host-observable',
            notification: 'subscribe',
        });
        const selectorAwarePlan = (0, target_plans_1.projectJSRuntimePlan)(selectorAwareUnit, capabilities);
        assert(selectorAwarePlan.ok, 'JS runtime plan should support LUI-port scoped host-observable retained-current policy.');
        if (!selectorAwarePlan.ok) {
            throw new Error('unreachable');
        }
        const selectorAwareArtifact = (0, lowering_1.lowerJSExecutableRuntime)(selectorAwarePlan.plan);
        const selectorAwareFile = join(dir, `selector-aware-host-observable-${selectorAwareArtifact.filename}`);
        writeFileSync(selectorAwareFile, selectorAwareArtifact.content, 'utf8');
        const selectorAwareModule = (await dynamicImport(pathToFileURL(resolve(selectorAwareFile)).href));
        const selectedObservable = createRetainedObservable(2);
        let selectedSubscriptions = 0;
        let rootSubscriptions = 0;
        const selectorAwareRuntime = selectorAwareModule.createRuntime({
            retainedCurrent: {
                'lui:counterState:value:': {
                    getSnapshot: () => selectedObservable.getSnapshot(),
                    subscribe: (listener) => {
                        selectedSubscriptions += 1;
                        return selectedObservable.subscribe(listener);
                    },
                },
                'lu:value:': {
                    getSnapshot: () => 100,
                    subscribe: () => {
                        rootSubscriptions += 1;
                        throw new Error('root output should not be subscribed by LUI-port scoped policy');
                    },
                },
            },
            implementations: {
                counterState: ({ increment }, context) => ({
                    value: (context.retainedCurrent?.value ?? 0) + (increment ?? 0),
                }),
            },
        });
        const selectorAwareFirst = await selectorAwareRuntime.invoke({});
        selectedObservable.publish(8);
        const selectorAwareSecond = await selectorAwareRuntime.invoke({});
        await selectorAwareRuntime.dispose();
        assert(selectorAwareFirst.value === 2 &&
            selectorAwareSecond.value === 8 &&
            selectedSubscriptions === 1 &&
            rootSubscriptions === 0, `Expected selector-aware JS retained-current subscription to subscribe only selected LUI endpoint, got ${JSON.stringify({
            selectorAwareFirst,
            selectorAwareSecond,
            selectedSubscriptions,
            rootSubscriptions,
        })}.`);
        const pathSelectedUnit = withJSLUIRetainedCurrentPolicy(withStatefulCounterVectorPayloadTypes(examples_1.statefulRetainedCounterExample), 'counterState', 'value', {
            selector: { portKey: 'value', payloadPath: ['lanes', 0] },
            realization: 'host-observable',
            notification: 'subscribe',
        });
        const pathSelectedPlan = (0, target_plans_1.projectJSRuntimePlan)(pathSelectedUnit, capabilities);
        assert(pathSelectedPlan.ok, 'JS runtime plan should support payloadPath-scoped retained-current policy.');
        if (!pathSelectedPlan.ok) {
            throw new Error('unreachable');
        }
        const pathSelectedArtifact = (0, lowering_1.lowerJSExecutableRuntime)(pathSelectedPlan.plan);
        const pathSelectedFile = join(dir, `path-selected-host-observable-${pathSelectedArtifact.filename}`);
        writeFileSync(pathSelectedFile, pathSelectedArtifact.content, 'utf8');
        const pathSelectedModule = (await dynamicImport(pathToFileURL(resolve(pathSelectedFile)).href));
        const pathSelectedObservable = createRetainedObservable(4);
        let pathSelectedSubscriptions = 0;
        let pathSelectedDeliveries = 0;
        let pathRootSubscriptions = 0;
        const pathSelectedRuntime = pathSelectedModule.createRuntime({
            retainedCurrent: {
                'lui:counterState:value:': {
                    subscribe: () => {
                        pathRootSubscriptions += 1;
                        throw new Error('whole retained port should not be subscribed by payloadPath policy');
                    },
                },
                'lui:counterState:value:lanes/0': {
                    subscribe: (listener) => {
                        pathSelectedSubscriptions += 1;
                        return pathSelectedObservable.subscribe((value) => {
                            pathSelectedDeliveries += 1;
                            listener(value);
                        });
                    },
                },
            },
            implementations: {
                counterState: ({ increment }, context) => {
                    const current = context.retainedCurrent?.value?.lanes?.[0] ?? 0;
                    return { value: { lanes: [current + (increment ?? 0)] } };
                },
            },
        });
        const pathSelectedFirst = await pathSelectedRuntime.invoke({});
        pathSelectedObservable.publish(9);
        const pathSelectedSecond = await pathSelectedRuntime.invoke({
            increment: 1,
        });
        const pathSelectedThird = await pathSelectedRuntime.invoke({});
        await pathSelectedRuntime.dispose();
        assert(isLaneValue(pathSelectedFirst.value, 0) &&
            isLaneValue(pathSelectedSecond.value, 10) &&
            isLaneValue(pathSelectedThird.value, 10) &&
            pathSelectedSubscriptions === 1 &&
            pathSelectedDeliveries === 1 &&
            pathRootSubscriptions === 0, `Expected payloadPath retained-current outputs lanes[0]=0,10,10 with only path subscription, got ${JSON.stringify({
            pathSelectedFirst,
            pathSelectedSecond,
            pathSelectedThird,
            pathSelectedSubscriptions,
            pathSelectedDeliveries,
            pathRootSubscriptions,
        })}.`);
        const explicitOwnerPathUnit = withJSRetainedCurrentPolicy(withStatefulCounterVectorPayloadTypes(examples_1.statefulRetainedCounterExample), {
            selector: {
                luiId: 'counterState',
                portKey: 'value',
                payloadPath: ['lanes', 0],
            },
            realization: 'host-observable',
            notification: 'subscribe',
        });
        const explicitOwnerPathPlan = (0, target_plans_1.projectJSRuntimePlan)(explicitOwnerPathUnit, capabilities);
        assert(explicitOwnerPathPlan.ok, 'JS runtime plan should support core-level explicit LUI retained-current payloadPath selector.');
        if (!explicitOwnerPathPlan.ok) {
            throw new Error('unreachable');
        }
        const explicitOwnerPathArtifact = (0, lowering_1.lowerJSExecutableRuntime)(explicitOwnerPathPlan.plan);
        const explicitOwnerPathFile = join(dir, `explicit-owner-path-host-observable-${explicitOwnerPathArtifact.filename}`);
        writeFileSync(explicitOwnerPathFile, explicitOwnerPathArtifact.content, 'utf8');
        const explicitOwnerPathModule = (await dynamicImport(pathToFileURL(resolve(explicitOwnerPathFile)).href));
        const explicitOwnerObservable = createRetainedObservable(3);
        let explicitOwnerSubscriptions = 0;
        const explicitOwnerRuntime = explicitOwnerPathModule.createRuntime({
            retainedCurrent: {
                'lui:counterState:value:lanes/0': {
                    subscribe: (listener) => {
                        explicitOwnerSubscriptions += 1;
                        return explicitOwnerObservable.subscribe(listener);
                    },
                },
            },
            implementations: {
                counterState: ({ increment }, context) => {
                    const current = context.retainedCurrent?.value?.lanes?.[0] ?? 0;
                    return { value: { lanes: [current + (increment ?? 0)] } };
                },
            },
        });
        const explicitOwnerFirst = await explicitOwnerRuntime.invoke({});
        explicitOwnerObservable.publish(6);
        const explicitOwnerSecond = await explicitOwnerRuntime.invoke({ increment: 2 });
        await explicitOwnerRuntime.dispose();
        assert(isLaneValue(explicitOwnerFirst.value, 0) &&
            isLaneValue(explicitOwnerSecond.value, 8) &&
            explicitOwnerSubscriptions === 1, `Expected explicit-owner JS retained-current payloadPath selector to produce lanes[0]=0,8, got ${JSON.stringify({
            explicitOwnerFirst,
            explicitOwnerSecond,
            explicitOwnerSubscriptions,
        })}.`);
        const microtaskUnit = withJSLUIRetainedCurrentPolicy(withStatefulCounterPayloadTypes(examples_1.statefulRetainedCounterExample), 'counterState', 'value', {
            selector: { portKey: 'value' },
            realization: 'host-observable',
            notification: 'microtask',
        });
        const microtaskPlan = (0, target_plans_1.projectJSRuntimePlan)(microtaskUnit, capabilities);
        assert(microtaskPlan.ok, 'JS runtime plan should support host-observable microtask retained-current notification.');
        if (!microtaskPlan.ok) {
            throw new Error('unreachable');
        }
        const microtaskArtifact = (0, lowering_1.lowerJSExecutableRuntime)(microtaskPlan.plan);
        const microtaskFile = join(dir, `microtask-host-observable-${microtaskArtifact.filename}`);
        writeFileSync(microtaskFile, microtaskArtifact.content, 'utf8');
        const microtaskModule = (await dynamicImport(pathToFileURL(resolve(microtaskFile)).href));
        const microtaskObservable = createRetainedObservable(1);
        const microtaskRuntime = microtaskModule.createRuntime({
            retainedCurrent: {
                'lui:counterState:value:': {
                    subscribe: (listener) => microtaskObservable.subscribe(listener),
                },
            },
            implementations: {
                counterState: ({ increment }, context) => ({
                    value: (context.retainedCurrent?.value ?? 0) + (increment ?? 0),
                }),
            },
        });
        const microtaskBefore = await microtaskRuntime.invoke({});
        microtaskObservable.publish(6);
        await Promise.resolve();
        const microtaskAfter = await microtaskRuntime.invoke({});
        await microtaskRuntime.dispose();
        assert(microtaskBefore.value === 0 &&
            microtaskAfter.value === 6, `Expected microtask retained-current delivery to update after the microtask turn, got ${JSON.stringify({
            microtaskBefore,
            microtaskAfter,
        })}.`);
        const adapterRetainedUnit = withJSRetainedCurrentPolicy(withStatefulCounterPayloadTypes(examples_1.statefulRetainedCounterExample), {
            realization: 'projector-adapter',
            notification: 'custom',
        });
        const adapterRetainedPlan = (0, target_plans_1.projectJSRuntimePlan)(adapterRetainedUnit, capabilities);
        assert(adapterRetainedPlan.ok, 'JS runtime plan should support projector-adapter retained-current.');
        if (!adapterRetainedPlan.ok) {
            throw new Error('unreachable');
        }
        const adapterRetainedArtifact = (0, lowering_1.lowerJSExecutableRuntime)(adapterRetainedPlan.plan);
        const adapterRetainedFile = join(dir, `adapter-retained-${adapterRetainedArtifact.filename}`);
        writeFileSync(adapterRetainedFile, adapterRetainedArtifact.content, 'utf8');
        const adapterRetainedModule = (await dynamicImport(pathToFileURL(resolve(adapterRetainedFile)).href));
        const adapterRetainedRuntime = adapterRetainedModule.createRuntime({
            implementations: {
                counterState: ({ increment }, context) => ({
                    value: (context.retainedCurrent?.value ?? 0) + (increment ?? 0),
                }),
            },
        });
        const adapterRetainedFirst = await adapterRetainedRuntime.invoke({
            increment: 7,
        });
        const adapterRetainedSecond = await adapterRetainedRuntime.invoke({});
        assert(adapterRetainedFirst.value === 7 &&
            adapterRetainedSecond.value === 7, `Expected projector-adapter retained outputs 7,7, got ${JSON.stringify({
            adapterRetainedFirst,
            adapterRetainedSecond,
        })}.`);
        const ownerlessPathRetainedPlan = (0, target_plans_1.projectJSRuntimePlan)(withJSRetainedCurrentPolicy(withStatefulCounterVectorPayloadTypes(examples_1.statefulRetainedCounterExample), {
            selector: { portKey: 'value', payloadPath: ['lanes', 0] },
            realization: 'host-observable',
            notification: 'subscribe',
        }), capabilities);
        assert(!ownerlessPathRetainedPlan.ok &&
            ownerlessPathRetainedPlan.diagnostics.some((diagnostic) => diagnostic.code === 'JS-006'), 'JS runtime planner should reject payloadPath retained-current policies without a concrete port attachment.');
        const retainedSinkUnit = withJSRetainedCurrentPolicy(unit, {
            realization: 'source-store',
            notification: 'subscribe',
        });
        const retainedSinkPlan = (0, target_plans_1.projectJSRuntimePlan)(retainedSinkUnit, capabilities);
        assert(retainedSinkPlan.ok, 'JS runtime plan should support retained-current source-store on combinational fixtures.');
        if (!retainedSinkPlan.ok) {
            throw new Error('unreachable');
        }
        const rejectErrorUnit = withJSErrorPolicy(unit, {
            onThrow: 'reject',
            selector: { luiId: 'adder' },
        });
        const rejectErrorPlan = (0, target_plans_1.projectJSRuntimePlan)(rejectErrorUnit, capabilities);
        assert(rejectErrorPlan.ok, 'JS runtime plan should support required reject error policy.');
        if (!rejectErrorPlan.ok) {
            throw new Error('unreachable');
        }
        const rejectErrorArtifact = (0, lowering_1.lowerJSExecutableRuntime)(rejectErrorPlan.plan);
        const rejectErrorFile = join(dir, `reject-error-${rejectErrorArtifact.filename}`);
        writeFileSync(rejectErrorFile, rejectErrorArtifact.content, 'utf8');
        const rejectErrorModule = (await dynamicImport(pathToFileURL(resolve(rejectErrorFile)).href));
        const rejectErrorRuntime = rejectErrorModule.createRuntime({
            implementations: {
                adder: () => {
                    throw new Error('boom');
                },
            },
        });
        let rejectErrorFailed = false;
        try {
            await rejectErrorRuntime.invoke({ a: 2, b: 5 });
        }
        catch {
            rejectErrorFailed = true;
        }
        assert(rejectErrorFailed, 'JS executable runtime should reject when required reject error policy observes a thrown implementation.');
        const useErrorPortUnit = withJSErrorPolicy(withJSErrorPort(unit), {
            onThrow: 'use-error-port',
            selector: { luiId: 'adder', portKey: 'error' },
        });
        const useErrorPortPlan = (0, target_plans_1.projectJSRuntimePlan)(useErrorPortUnit, capabilities);
        assert(useErrorPortPlan.ok, 'JS runtime plan should still be created when capability supports use-error-port.');
        if (!useErrorPortPlan.ok) {
            throw new Error('unreachable');
        }
        const useErrorPortArtifact = (0, lowering_1.lowerJSExecutableRuntime)(useErrorPortPlan.plan);
        const useErrorPortFile = join(dir, `use-error-port-${useErrorPortArtifact.filename}`);
        writeFileSync(useErrorPortFile, useErrorPortArtifact.content, 'utf8');
        const useErrorPortModule = (await dynamicImport(pathToFileURL(resolve(useErrorPortFile)).href));
        const useErrorPortRuntime = useErrorPortModule.createRuntime({
            implementations: {
                adder: () => {
                    throw new TypeError('boom');
                },
            },
        });
        const useErrorPortOutputs = await useErrorPortRuntime.invoke({ a: 2, b: 5 });
        const routedError = useErrorPortOutputs.error;
        assert(routedError.name === 'TypeError' && routedError.message === 'boom', `JS executable runtime should route thrown errors to an error port, got ${JSON.stringify(routedError)}.`);
        const invalidUseErrorPortPlan = (0, target_plans_1.projectJSRuntimePlan)(withJSErrorPolicy(withJSErrorPort(unit), {
            onThrow: 'use-error-port',
            selector: { luiId: 'adder' },
        }), capabilities);
        assert(!invalidUseErrorPortPlan.ok &&
            invalidUseErrorPortPlan.diagnostics.some((diagnostic) => diagnostic.code === 'JS-005'), 'JS runtime planner should reject use-error-port without selector.portKey before lowering.');
        const emitErrorUnit = withJSErrorPolicy(unit, {
            onThrow: 'emit-error',
            selector: { luiId: 'adder' },
        });
        const emitErrorPlan = (0, target_plans_1.projectJSRuntimePlan)(emitErrorUnit, capabilities);
        assert(emitErrorPlan.ok, 'JS runtime plan should still be created when capability supports emit-error.');
        if (!emitErrorPlan.ok) {
            throw new Error('unreachable');
        }
        const emitErrorArtifact = (0, lowering_1.lowerJSExecutableRuntime)(emitErrorPlan.plan);
        const emitErrorFile = join(dir, `emit-error-policy-${emitErrorArtifact.filename}`);
        writeFileSync(emitErrorFile, emitErrorArtifact.content, 'utf8');
        const emitErrorModule = (await dynamicImport(pathToFileURL(resolve(emitErrorFile)).href));
        const emittedErrors = [];
        const emitErrorRuntime = emitErrorModule.createRuntime({
            implementations: {
                adder: () => {
                    throw new RangeError('emit me');
                },
            },
            emitError: (event) => {
                emittedErrors.push(event);
            },
        });
        const emitErrorOutputs = await emitErrorRuntime.invoke({ a: 2, b: 5 });
        assert(Object.keys(emitErrorOutputs).length === 0 &&
            emittedErrors.length === 1 &&
            emittedErrors[0]
                .error.name === 'RangeError' &&
            emittedErrors[0]
                .error.message === 'emit me', 'JS executable runtime should emit required emit-error policy events.');
        const unsupportedErrorPolicyUnit = withJSErrorPolicy(unit, {
            onThrow: 'fail-projection',
            selector: { luiId: 'adder' },
        });
        const unsupportedErrorPolicyPlan = (0, target_plans_1.projectJSRuntimePlan)(unsupportedErrorPolicyUnit, capabilities);
        assert(!unsupportedErrorPolicyPlan.ok &&
            unsupportedErrorPolicyPlan.diagnostics.some((diagnostic) => diagnostic.code === 'JS-001'), 'JS runtime planner should reject required fail-projection error policy before lowering.');
        const lifecycleUnit = withJSLifecyclePolicy(unit, {
            selector: { luiId: 'adder' },
            hooks: ['mount', 'start', 'stop', 'dispose'],
        });
        const lifecyclePlan = (0, target_plans_1.projectJSRuntimePlan)(lifecycleUnit, capabilities);
        assert(lifecyclePlan.ok, 'JS runtime plan should still be created when capability supports lifecycle.');
        if (!lifecyclePlan.ok) {
            throw new Error('unreachable');
        }
        const lifecycleArtifact = (0, lowering_1.lowerJSExecutableRuntime)(lifecyclePlan.plan);
        const lifecycleFile = join(dir, `lifecycle-${lifecycleArtifact.filename}`);
        writeFileSync(lifecycleFile, lifecycleArtifact.content, 'utf8');
        const lifecycleModule = (await dynamicImport(pathToFileURL(resolve(lifecycleFile)).href));
        const lifecycleEvents = [];
        const lifecycleRuntime = lifecycleModule.createRuntime({
            lifecycle: {
                mount: () => lifecycleEvents.push('mount'),
                start: () => lifecycleEvents.push('start'),
                stop: () => lifecycleEvents.push('stop'),
                dispose: () => lifecycleEvents.push('dispose'),
            },
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        const lifecycleOutputs = await lifecycleRuntime.invoke({ a: 2, b: 5 });
        await lifecycleRuntime.dispose();
        assert(lifecycleOutputs.sum === 7 &&
            lifecycleEvents.join(',') === 'mount,start,stop,dispose', `Expected lifecycle hooks and output, got ${JSON.stringify({
            lifecycleOutputs,
            lifecycleEvents,
        })}.`);
        const missingLifecycleRuntime = lifecycleModule.createRuntime({
            lifecycle: {
                start: () => undefined,
            },
            implementations: {
                adder: ({ a, b }) => ({ sum: a + b }),
            },
        });
        let missingLifecycleFailed = false;
        try {
            await missingLifecycleRuntime.invoke({ a: 2, b: 5 });
        }
        catch {
            missingLifecycleFailed = true;
        }
        assert(missingLifecycleFailed, 'JS executable runtime should reject required lifecycle hooks missing from host.');
        const statefulUnit = withStatefulCounterPayloadTypes(examples_1.statefulRetainedCounterExample);
        const statefulPlan = (0, target_plans_1.projectJSRuntimePlan)(statefulUnit, capabilities);
        assert(statefulPlan.ok, 'JS runtime plan should support typed stateful retained-current counter.');
        if (!statefulPlan.ok) {
            throw new Error('unreachable');
        }
        const statefulArtifact = (0, lowering_1.lowerJSExecutableRuntime)(statefulPlan.plan);
        const statefulFile = join(dir, `stateful-${statefulArtifact.filename}`);
        writeFileSync(statefulFile, statefulArtifact.content, 'utf8');
        const statefulModule = (await dynamicImport(pathToFileURL(resolve(statefulFile)).href));
        let count = 0;
        const statefulRuntime = statefulModule.createRuntime({
            implementations: {
                counterState: ({ increment }) => {
                    count += increment ?? 0;
                    return { value: count };
                },
            },
        });
        const firstCounterOutput = await statefulRuntime.invoke({ increment: 2 });
        const secondCounterOutput = await statefulRuntime.invoke({ increment: 3 });
        const readCounterOutput = await statefulRuntime.invoke({});
        assert(firstCounterOutput.value === 2 &&
            secondCounterOutput.value === 5 &&
            readCounterOutput.value === 5, `Expected retained counter outputs 2,5,5, got ${JSON.stringify({
            firstCounterOutput,
            secondCounterOutput,
            readCounterOutput,
        })}.`);
    }
    finally {
        rmSync(dir, { recursive: true, force: true });
    }
}
function withPortPayloadTypes(unit) {
    const withPayloadType = (port) => ({
        ...port,
        extensions: [
            ...(port.extensions ?? []),
            {
                feature: { namespace: 'logicir.type-system', key: 'core' },
                key: 'payload-types',
                requirement: 'required',
                payload: { type: { kind: 'primitive', name: 'int' } },
            },
        ],
    });
    return {
        ...unit,
        core: {
            ...unit.core,
            ports: {
                a: withPayloadType(unit.core.ports.a),
                b: withPayloadType(unit.core.ports.b),
                sum: withPayloadType(unit.core.ports.sum),
            },
            luis: {
                adder: {
                    ...unit.core.luis.adder,
                    ports: {
                        a: withPayloadType(unit.core.luis.adder.ports.a),
                        b: withPayloadType(unit.core.luis.adder.ports.b),
                        sum: withPayloadType(unit.core.luis.adder.ports.sum),
                    },
                },
            },
        },
    };
}
function withAuthRequirementPayloadTypes(unit) {
    const stringType = { kind: 'primitive', name: 'string' };
    const boolType = { kind: 'primitive', name: 'bool' };
    const withPayloadType = (port, type) => ({
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
    const authEntry = unit.requirements.auth;
    assert(authEntry.kind === 'inline', 'withAuthRequirementPayloadTypes expects inline auth requirement.');
    const authCheck = unit.core.luis.authCheck;
    return {
        ...unit,
        requirements: {
            auth: {
                kind: 'inline',
                service: {
                    ...authEntry.service,
                    units: {
                        check: {
                            ...authEntry.service.units.check,
                            ports: {
                                subject: withPayloadType(authEntry.service.units.check.ports.subject, stringType),
                                allowed: withPayloadType(authEntry.service.units.check.ports.allowed, boolType),
                            },
                        },
                    },
                },
            },
        },
        core: {
            ...unit.core,
            ports: {
                subject: withPayloadType(unit.core.ports.subject, stringType),
                allowed: withPayloadType(unit.core.ports.allowed, boolType),
            },
            luis: {
                authCheck: {
                    ...authCheck,
                    ports: {
                        subject: withPayloadType(authCheck.ports.subject, stringType),
                        allowed: withPayloadType(authCheck.ports.allowed, boolType),
                    },
                },
            },
        },
    };
}
function withDuplicatedAuthCheckLUI(unit) {
    const core = unit.core;
    const authCheck = core.luis.authCheck;
    assert(authCheck !== undefined, 'withDuplicatedAuthCheckLUI expects an authCheck LUI.');
    return {
        ...unit,
        core: {
            ...core,
            ports: {
                ...core.ports,
                allowedAgain: {
                    boundary: core.ports.allowed.boundary,
                    interaction: core.ports.allowed.interaction,
                },
            },
            luis: {
                ...core.luis,
                authCheckAgain: {
                    ...authCheck,
                    ports: { ...authCheck.ports },
                },
            },
            connections: {
                ...core.connections,
                subjectToRequirementAgain: {
                    from: { owner: { kind: 'lu' }, portKey: 'subject' },
                    to: {
                        owner: { kind: 'lui', luiId: 'authCheckAgain' },
                        portKey: 'subject',
                    },
                },
                allowedAgainFromRequirement: {
                    from: {
                        owner: { kind: 'lui', luiId: 'authCheckAgain' },
                        portKey: 'allowed',
                    },
                    to: { owner: { kind: 'lu' }, portKey: 'allowedAgain' },
                },
            },
        },
    };
}
function payloadPathAdderUnit() {
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
    return {
        ...examples_1.combinationalAdderExample,
        core: {
            ...examples_1.combinationalAdderExample.core,
            ports: {
                busIn: pullInput,
                busOut: { ...pullOutput, role: 'primary-result' },
            },
            connections: {
                lane0ToAdder: {
                    from: {
                        owner: { kind: 'lu' },
                        portKey: 'busIn',
                        payloadPath: ['lanes', 0],
                    },
                    to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'a' },
                },
                lane1ToAdder: {
                    from: {
                        owner: { kind: 'lu' },
                        portKey: 'busIn',
                        payloadPath: ['lanes', 1],
                    },
                    to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'b' },
                },
                sumToLane0: {
                    from: {
                        owner: { kind: 'lui', luiId: 'adder' },
                        portKey: 'sum',
                    },
                    to: {
                        owner: { kind: 'lu' },
                        portKey: 'busOut',
                        payloadPath: ['lanes', 0],
                    },
                },
            },
        },
    };
}
function withPayloadPathBusTypes(unit) {
    const luis = unit.core.luis;
    const adder = luis.adder;
    assert(adder !== undefined, 'payloadPath smoke expects an adder LUI.');
    const primitiveInt = { kind: 'primitive', name: 'int' };
    const busType = {
        kind: 'record',
        fields: {
            lanes: { kind: 'array', item: primitiveInt },
        },
    };
    const withPayloadType = (port, type) => ({
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
            ports: {
                busIn: withPayloadType(unit.core.ports.busIn, busType),
                busOut: withPayloadType(unit.core.ports.busOut, busType),
            },
            luis: {
                adder: {
                    ...adder,
                    ports: {
                        a: withPayloadType(adder.ports.a, primitiveInt),
                        b: withPayloadType(adder.ports.b, primitiveInt),
                        sum: withPayloadType(adder.ports.sum, primitiveInt),
                    },
                },
            },
        },
    };
}
function pinAwareAdderUnit() {
    const pullInput = {
        boundary: 'input',
        interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
        },
        pins: { kind: 'indexed', count: 2 },
    };
    const pullOutput = {
        boundary: 'output',
        interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
        },
        pins: { kind: 'keyed', keys: ['sum'] },
    };
    return {
        ...examples_1.combinationalAdderExample,
        core: {
            ...examples_1.combinationalAdderExample.core,
            ports: {
                pairIn: pullInput,
                resultBus: { ...pullOutput, role: 'primary-result' },
            },
            connections: {
                pin0ToAdder: {
                    from: {
                        owner: { kind: 'lu' },
                        portKey: 'pairIn',
                        payloadPath: [0],
                    },
                    to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'a' },
                },
                pin1ToAdder: {
                    from: {
                        owner: { kind: 'lu' },
                        portKey: 'pairIn',
                        payloadPath: [1],
                    },
                    to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'b' },
                },
                sumToResultPin: {
                    from: {
                        owner: { kind: 'lui', luiId: 'adder' },
                        portKey: 'sum',
                    },
                    to: {
                        owner: { kind: 'lu' },
                        portKey: 'resultBus',
                        payloadPath: ['sum'],
                    },
                },
            },
        },
    };
}
function withPinBusTypes(unit) {
    const luis = unit.core.luis;
    const adder = luis.adder;
    assert(adder !== undefined, 'pin-aware smoke expects an adder LUI.');
    const primitiveInt = { kind: 'primitive', name: 'int' };
    const pairType = { kind: 'array', item: primitiveInt, length: 2 };
    const resultType = {
        kind: 'record',
        fields: {
            sum: primitiveInt,
        },
    };
    const withPayloadType = (port, type) => ({
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
            ports: {
                pairIn: withPayloadType(unit.core.ports.pairIn, pairType),
                resultBus: withPayloadType(unit.core.ports.resultBus, resultType),
            },
            luis: {
                adder: {
                    ...adder,
                    ports: {
                        a: withPayloadType(adder.ports.a, primitiveInt),
                        b: withPayloadType(adder.ports.b, primitiveInt),
                        sum: withPayloadType(adder.ports.sum, primitiveInt),
                    },
                },
            },
        },
    };
}
function withSequentialPayloadTypes(unit) {
    const stringType = { kind: 'primitive', name: 'string' };
    const withPayloadType = (port) => ({
        ...port,
        extensions: [
            ...(port.extensions ?? []),
            {
                feature: { namespace: 'logicir.type-system', key: 'core' },
                key: 'payload-types',
                requirement: 'required',
                payload: { type: stringType },
            },
        ],
    });
    return {
        ...unit,
        core: {
            ...unit.core,
            ports: {
                raw: withPayloadType(unit.core.ports.raw),
                normalized: withPayloadType(unit.core.ports.normalized),
            },
            luis: {
                decode: {
                    ...unit.core.luis.decode,
                    ports: {
                        input: withPayloadType(unit.core.luis.decode.ports.input),
                        output: withPayloadType(unit.core.luis.decode.ports.output),
                    },
                },
                normalize: {
                    ...unit.core.luis.normalize,
                    ports: {
                        input: withPayloadType(unit.core.luis.normalize.ports.input),
                        output: withPayloadType(unit.core.luis.normalize.ports.output),
                    },
                },
            },
        },
    };
}
function withJSAsyncPolicy(unit, payload) {
    return {
        ...unit,
        core: {
            ...unit.core,
            extensions: [
                ...(unit.core.extensions ?? []),
                {
                    feature: { namespace: 'logicir.js-runtime', key: 'core' },
                    key: 'async-policy',
                    requirement: 'required',
                    payload,
                },
            ],
        },
    };
}
function withJSDynamicFulfillmentPolicy(unit, payload) {
    return {
        ...unit,
        core: {
            ...unit.core,
            extensions: [
                ...(unit.core.extensions ?? []),
                {
                    feature: { namespace: 'logicir.js-runtime', key: 'core' },
                    key: 'dynamic-fulfillment',
                    requirement: 'required',
                    payload,
                },
            ],
        },
    };
}
function withJSRetainedCurrentPolicy(unit, payload) {
    return {
        ...unit,
        core: {
            ...unit.core,
            extensions: [
                ...(unit.core.extensions ?? []),
                {
                    feature: { namespace: 'logicir.js-runtime', key: 'core' },
                    key: 'retained-current-realization',
                    requirement: 'required',
                    payload,
                },
            ],
        },
    };
}
function withJSLUIRetainedCurrentPolicy(unit, luiId, portKey, payload) {
    const lui = unit.core.luis[luiId];
    assert(lui !== undefined, `Missing LUI ${luiId}.`);
    const port = lui.ports[portKey];
    assert(port !== undefined, `Missing LUI port ${luiId}.${portKey}.`);
    const updatedLui = {
        ...lui,
        ports: {
            ...lui.ports,
            [portKey]: {
                ...port,
                extensions: [
                    ...(port.extensions ?? []),
                    {
                        feature: { namespace: 'logicir.js-runtime', key: 'core' },
                        key: 'retained-current-realization',
                        requirement: 'required',
                        payload,
                    },
                ],
            },
        },
    };
    const updatedCore = {
        ...unit.core,
        luis: {
            ...unit.core.luis,
            [luiId]: updatedLui,
        },
    };
    return {
        ...unit,
        core: updatedCore,
    };
}
function createRetainedObservable(initial) {
    let current = initial;
    const listeners = new Set();
    return {
        getSnapshot: () => current,
        publish: (value) => {
            current = value;
            for (const listener of listeners) {
                listener(value);
            }
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
function withJSErrorPolicy(unit, payload) {
    return {
        ...unit,
        core: {
            ...unit.core,
            extensions: [
                ...(unit.core.extensions ?? []),
                {
                    feature: { namespace: 'logicir.js-runtime', key: 'core' },
                    key: 'error-policy',
                    requirement: 'required',
                    payload,
                },
            ],
        },
    };
}
function withJSErrorPort(unit) {
    const luis = unit.core.luis;
    const adder = luis.adder;
    assert(adder !== undefined, 'withJSErrorPort expects an adder LUI.');
    const errorType = {
        kind: 'record',
        fields: {
            name: { kind: 'primitive', name: 'string' },
            message: { kind: 'primitive', name: 'string' },
        },
    };
    const errorPort = {
        boundary: 'output',
        interaction: {
            pullReadable: true,
            pushNotifiable: false,
            retainedCurrent: false,
        },
        extensions: [
            {
                feature: { namespace: 'logicir.type-system', key: 'core' },
                key: 'payload-types',
                requirement: 'required',
                payload: { type: errorType },
            },
        ],
    };
    return {
        ...unit,
        core: {
            ...unit.core,
            ports: {
                ...unit.core.ports,
                error: errorPort,
            },
            luis: {
                ...luis,
                adder: {
                    ...adder,
                    ports: {
                        ...adder.ports,
                        error: errorPort,
                    },
                },
            },
            connections: {
                ...unit.core.connections,
                errorFromAdder: {
                    from: {
                        owner: { kind: 'lui', luiId: 'adder' },
                        portKey: 'error',
                    },
                    to: { owner: { kind: 'lu' }, portKey: 'error' },
                },
            },
        },
    };
}
function withJSLifecyclePolicy(unit, payload) {
    return {
        ...unit,
        core: {
            ...unit.core,
            extensions: [
                ...(unit.core.extensions ?? []),
                {
                    feature: { namespace: 'logicir.js-runtime', key: 'core' },
                    key: 'lifecycle',
                    requirement: 'required',
                    payload,
                },
            ],
        },
    };
}
function withStatefulCounterPayloadTypes(unit) {
    const luis = unit.core.luis;
    const counterState = luis.counterState;
    assert(unit.core.ports.increment !== undefined &&
        unit.core.ports.value !== undefined &&
        counterState !== undefined, 'withStatefulCounterPayloadTypes expects the retained counter fixture shape.');
    const intType = { kind: 'primitive', name: 'int' };
    const withPayloadType = (port) => ({
        ...port,
        extensions: [
            ...(port.extensions ?? []),
            {
                feature: { namespace: 'logicir.type-system', key: 'core' },
                key: 'payload-types',
                requirement: 'required',
                payload: { type: intType },
            },
        ],
    });
    return {
        ...unit,
        core: {
            ...unit.core,
            ports: {
                increment: withPayloadType(unit.core.ports.increment),
                value: withPayloadType(unit.core.ports.value),
            },
            luis: {
                counterState: {
                    ...counterState,
                    ports: {
                        increment: withPayloadType(counterState.ports.increment),
                        value: withPayloadType(counterState.ports.value),
                    },
                },
            },
        },
    };
}
function withStatefulCounterVectorPayloadTypes(unit) {
    const luis = unit.core.luis;
    const counterState = luis.counterState;
    assert(unit.core.ports.increment !== undefined &&
        unit.core.ports.value !== undefined &&
        counterState !== undefined, 'withStatefulCounterVectorPayloadTypes expects the retained counter fixture shape.');
    const intType = { kind: 'primitive', name: 'int' };
    const vectorType = {
        kind: 'record',
        fields: {
            lanes: { kind: 'array', item: intType },
        },
    };
    const withPayloadType = (port, type) => ({
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
            ports: {
                increment: withPayloadType(unit.core.ports.increment, intType),
                value: withPayloadType(unit.core.ports.value, vectorType),
            },
            luis: {
                counterState: {
                    ...counterState,
                    ports: {
                        increment: withPayloadType(counterState.ports.increment, intType),
                        value: withPayloadType(counterState.ports.value, vectorType),
                    },
                },
            },
        },
    };
}
function isLaneValue(value, expected) {
    return (typeof value === 'object' &&
        value !== null &&
        Array.isArray(value.lanes) &&
        value.lanes[0] === expected);
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
