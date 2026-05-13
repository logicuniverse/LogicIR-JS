"use strict";
/**
 * Draft target projection plans.
 *
 * These functions stop after target-specific planning. Runtime execution and
 * HDL text emission happen in `lowering.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectJSRuntimePlan = projectJSRuntimePlan;
exports.projectPythonRuntimePlan = projectPythonRuntimePlan;
exports.projectVerilogHDLPlan = projectVerilogHDLPlan;
const preflight_1 = require("./preflight");
function projectJSRuntimePlan(unit, capabilities) {
    const diagnostics = preflightForTarget(unit, capabilities, 'js-runtime');
    validateJSFailProjectionPolicy(collectExtensions(unit, 'logicir.js-runtime', 'error-policy'), unit.core, diagnostics);
    validateJSUnsupportedAsyncPolicy(collectExtensions(unit, 'logicir.js-runtime', 'async-policy'), diagnostics);
    validateRetainedCurrentPayloadPathSelectors(collectExtensions(unit, 'logicir.js-runtime', 'retained-current-realization'), 'JS-006', 'JS', diagnostics);
    validateJSUnsupportedDynamicFulfillmentPolicy(collectExtensions(unit, 'logicir.js-runtime', 'dynamic-fulfillment'), diagnostics);
    if (hasErrors(diagnostics)) {
        return { ok: false, diagnostics };
    }
    return {
        ok: true,
        diagnostics,
        plan: {
            target: 'js-runtime',
            schemaVersion: unit.schemaVersion,
            core: planCore(unit.core),
            policies: {
                async: collectExtensions(unit, 'logicir.js-runtime', 'async-policy'),
                retainedCurrent: collectExtensions(unit, 'logicir.js-runtime', 'retained-current-realization'),
                dynamicFulfillment: collectExtensions(unit, 'logicir.js-runtime', 'dynamic-fulfillment'),
                lifecycle: collectExtensions(unit, 'logicir.js-runtime', 'lifecycle'),
                error: collectExtensions(unit, 'logicir.js-runtime', 'error-policy'),
            },
        },
    };
}
function validateJSFailProjectionPolicy(errorPolicies, core, diagnostics) {
    for (const policy of errorPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        if (policy.payload.onThrow === 'fail-projection') {
            diagnostics.push({
                severity: 'error',
                code: 'JS-001',
                path: [...policy.path, 'payload', 'onThrow'],
                message: 'Executable JS projection does not support required fail-projection error policy; fail before lowering rather than generating runtime code that cannot preserve it.',
            });
        }
        if (policy.payload.onThrow === 'use-error-port') {
            validateErrorPortSelector(policy, core, 'JS-005', 'JS', diagnostics);
        }
    }
}
function validateJSUnsupportedAsyncPolicy(asyncPolicies, diagnostics) {
    for (const policy of asyncPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        if (policy.payload.awaitBeforeNext === false) {
            diagnostics.push({
                severity: 'error',
                code: 'JS-004',
                path: [...policy.path, 'payload', 'awaitBeforeNext'],
                message: 'Executable JS projection requires awaitBeforeNext for ordered execution; fail before lowering rather than generating runtime code that cannot preserve ordering.',
            });
        }
    }
}
function validateRetainedCurrentPayloadPathSelectors(retainedCurrentPolicies, code, targetLabel, diagnostics) {
    for (const policy of retainedCurrentPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        const selector = policy.payload.selector;
        if (!isRecord(selector) || selector.payloadPath === undefined) {
            continue;
        }
        if (!retainedPolicyPathEndpoint(policy.path) &&
            !(typeof selector.luiId === 'string' && typeof selector.portKey === 'string')) {
            diagnostics.push({
                severity: 'error',
                code,
                path: [...policy.path, 'payload', 'selector', 'payloadPath'],
                message: `Executable ${targetLabel} projection requires payloadPath retained-current policies to be attached to a concrete port so the endpoint owner is unambiguous.`,
            });
        }
    }
}
function validateJSUnsupportedDynamicFulfillmentPolicy(dynamicFulfillmentPolicies, diagnostics) {
    for (const policy of dynamicFulfillmentPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        const supported = (policy.payload.consistency === 'no-live-switch' &&
            (policy.payload.mode === 'static-at-startup' ||
                policy.payload.mode === 'late-bound')) ||
            (policy.payload.mode === 'switchable' &&
                (policy.payload.consistency === 'quiescent-switch' ||
                    policy.payload.consistency === 'transactional-switch'));
        if (!supported) {
            diagnostics.push({
                severity: 'error',
                code: 'JS-003',
                path: [...policy.path, 'payload'],
                message: 'Executable JS projection supports only required static-at-startup or late-bound dynamic fulfillment with no-live-switch consistency, plus switchable fulfillment at quiescent or transactional invocation boundaries; fail before lowering rather than generating runtime code that cannot preserve stronger live-switch binding.',
            });
        }
    }
}
function projectPythonRuntimePlan(unit, capabilities) {
    const diagnostics = preflightForTarget(unit, capabilities, 'python-runtime');
    validatePythonUnsupportedErrorPolicy(collectExtensions(unit, 'logicir.python-runtime', 'error-policy'), unit.core, diagnostics);
    validatePythonUnsupportedAsyncPolicy(collectExtensions(unit, 'logicir.python-runtime', 'async-policy'), diagnostics);
    validateRetainedCurrentPayloadPathSelectors(collectExtensions(unit, 'logicir.python-runtime', 'retained-current-realization'), 'PY-008', 'Python', diagnostics);
    validatePythonUnsupportedDynamicFulfillmentPolicy(collectExtensions(unit, 'logicir.python-runtime', 'dynamic-fulfillment'), diagnostics);
    validatePythonUnsupportedResourceLifecyclePolicy(collectExtensions(unit, 'logicir.python-runtime', 'resource-lifecycle'), diagnostics);
    validatePythonUnsupportedConcurrencyPolicy(collectExtensions(unit, 'logicir.python-runtime', 'concurrency'), diagnostics);
    if (hasErrors(diagnostics)) {
        return { ok: false, diagnostics };
    }
    return {
        ok: true,
        diagnostics,
        plan: {
            target: 'python-runtime',
            schemaVersion: unit.schemaVersion,
            core: planCore(unit.core),
            policies: {
                async: collectExtensions(unit, 'logicir.python-runtime', 'async-policy'),
                retainedCurrent: collectExtensions(unit, 'logicir.python-runtime', 'retained-current-realization'),
                dynamicFulfillment: collectExtensions(unit, 'logicir.python-runtime', 'dynamic-fulfillment'),
                resourceLifecycle: collectExtensions(unit, 'logicir.python-runtime', 'resource-lifecycle'),
                concurrency: collectExtensions(unit, 'logicir.python-runtime', 'concurrency'),
                error: collectExtensions(unit, 'logicir.python-runtime', 'error-policy'),
            },
        },
    };
}
function validatePythonUnsupportedErrorPolicy(errorPolicies, core, diagnostics) {
    for (const policy of errorPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        if (policy.payload.onException === 'return-exception' ||
            policy.payload.onException === 'cancel-task') {
            diagnostics.push({
                severity: 'error',
                code: 'PY-001',
                path: [...policy.path, 'payload', 'onException'],
                message: 'Executable Python projection does not support required return-exception or cancel-task error policy; fail before lowering rather than generating runtime code that cannot preserve it.',
            });
        }
        if (policy.payload.onException === 'use-error-port') {
            validateErrorPortSelector(policy, core, 'PY-007', 'Python', diagnostics);
        }
    }
}
function validateErrorPortSelector(policy, core, code, targetLabel, diagnostics) {
    if (!isRecord(policy.payload)) {
        return;
    }
    const selector = policy.payload.selector;
    if (!isRecord(selector) || typeof selector.portKey !== 'string') {
        diagnostics.push({
            severity: 'error',
            code,
            path: [...policy.path, 'payload', 'selector'],
            message: `Executable ${targetLabel} projection requires selector.portKey for required use-error-port policy.`,
        });
        return;
    }
    if (typeof selector.luiId !== 'string') {
        return;
    }
    const port = core.luis[selector.luiId]?.ports[selector.portKey];
    if (!port || port.boundary !== 'output') {
        diagnostics.push({
            severity: 'error',
            code,
            path: [...policy.path, 'payload', 'selector', 'portKey'],
            message: `Executable ${targetLabel} projection requires use-error-port selector.portKey to reference an output port on the selected LUI.`,
        });
    }
}
function validatePythonUnsupportedAsyncPolicy(asyncPolicies, diagnostics) {
    for (const policy of asyncPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        if (policy.payload.awaitBeforeNext === false) {
            diagnostics.push({
                severity: 'error',
                code: 'PY-004',
                path: [...policy.path, 'payload', 'awaitBeforeNext'],
                message: 'Executable Python projection requires awaitBeforeNext for ordered execution; fail before lowering rather than generating runtime code that cannot preserve ordering.',
            });
        }
    }
}
function validatePythonUnsupportedDynamicFulfillmentPolicy(dynamicFulfillmentPolicies, diagnostics) {
    for (const policy of dynamicFulfillmentPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        const supported = (policy.payload.binding === 'constructor-injected' &&
            policy.payload.consistency === 'startup-only') ||
            (policy.payload.binding === 'late-bound' &&
                policy.payload.consistency === 'task-local') ||
            (policy.payload.binding === 'switchable' &&
                (policy.payload.consistency === 'quiescent-switch' ||
                    policy.payload.consistency === 'transactional-switch'));
        if (!supported) {
            diagnostics.push({
                severity: 'error',
                code: 'PY-003',
                path: [...policy.path, 'payload'],
                message: 'Executable Python projection supports only required constructor-injected/startup-only, late-bound/task-local, or switchable fulfillment with quiescent-switch or transactional-switch consistency; fail before lowering rather than generating runtime code that cannot preserve contextvar, service-container, or stronger binding behavior.',
            });
        }
    }
}
function validatePythonUnsupportedResourceLifecyclePolicy(resourceLifecyclePolicies, diagnostics) {
    for (const policy of resourceLifecyclePolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        const protocol = policy.payload.protocol;
        if (protocol !== undefined &&
            protocol !== 'none' &&
            protocol !== 'context-manager' &&
            protocol !== 'async-context-manager' &&
            protocol !== 'start-stop') {
            diagnostics.push({
                severity: 'error',
                code: 'PY-005',
                path: [...policy.path, 'payload', 'protocol'],
                message: 'Executable Python projection supports only required none, context-manager, async-context-manager, or start-stop resource lifecycle; fail before lowering rather than generating runtime code that cannot preserve a custom protocol.',
            });
        }
    }
}
function validatePythonUnsupportedConcurrencyPolicy(concurrencyPolicies, diagnostics) {
    for (const policy of concurrencyPolicies) {
        if (policy.requirement !== 'required' || !isRecord(policy.payload)) {
            continue;
        }
        const execution = policy.payload.execution;
        const backpressure = policy.payload.backpressure;
        const ordering = policy.payload.ordering;
        if (execution !== undefined &&
            execution !== 'same-thread' &&
            execution !== 'thread') {
            diagnostics.push({
                severity: 'error',
                code: 'PY-006',
                path: [...policy.path, 'payload', 'execution'],
                message: 'Executable Python projection supports only required same-thread or thread concurrency; fail before lowering rather than generating runtime code that cannot preserve task, process, or external-worker execution.',
            });
            continue;
        }
        if (execution === 'thread' && backpressure !== undefined && backpressure !== 'block') {
            diagnostics.push({
                severity: 'error',
                code: 'PY-006',
                path: [...policy.path, 'payload', 'backpressure'],
                message: 'Executable Python projection supports only required blocking thread concurrency backpressure; fail before lowering rather than generating runtime code that cannot preserve the requested backpressure policy.',
            });
        }
        if (execution === 'thread' && ordering !== undefined && ordering !== 'preserve') {
            diagnostics.push({
                severity: 'error',
                code: 'PY-006',
                path: [...policy.path, 'payload', 'ordering'],
                message: 'Executable Python projection supports only required preserve ordering for thread concurrency; fail before lowering rather than generating runtime code that cannot preserve the requested ordering policy.',
            });
        }
    }
}
function projectVerilogHDLPlan(unit, capabilities) {
    const diagnostics = preflightForTarget(unit, capabilities, 'verilog-hdl');
    const structuralSlices = collectExtensions(unit, 'logicir.verilog-hdl', 'structural-slices');
    validateHDLSignalCoverage(unit.core, ['core'], diagnostics);
    validateHDLClockResetCoverage(unit.core, ['core'], diagnostics);
    validateHDLModuleBindingCoverage(unit.core, ['core'], collectExtensions(unit, 'logicir.verilog-hdl', 'module-binding'), collectExtensions(unit, 'logicir.verilog-hdl', 'combinational-assigns'), collectExtensions(unit, 'logicir.verilog-hdl', 'state-registers'), capabilities.verilogHDL?.moduleBinding === true
        ? capabilities.verilogHDL.moduleRegistry
        : undefined, diagnostics);
    validateHDLModuleRegistryInterfaces(unit.core, ['core'], capabilities.verilogHDL?.moduleBinding === true
        ? capabilities.verilogHDL.moduleRegistry
        : undefined, collectHDLSignals(unit.core, ['core']), diagnostics);
    validateHDLCombinationalAssignWidths(collectExtensions(unit, 'logicir.verilog-hdl', 'combinational-assigns'), collectHDLSignals(unit.core, ['core']), diagnostics);
    validateHDLStateRegisterWidths(collectExtensions(unit, 'logicir.verilog-hdl', 'state-registers'), collectHDLSignals(unit.core, ['core']), diagnostics);
    validateHDLStructuralSliceCoverage(unit.core, ['core'], structuralSlices, diagnostics);
    validateHDLStructuralSliceLinkCompatibility(unit.core, ['core'], structuralSlices, diagnostics);
    if (hasErrors(diagnostics)) {
        return { ok: false, diagnostics };
    }
    const structuralSlicePlans = collectHDLStructuralSlicePlans(unit.core, ['core'], structuralSlices);
    return {
        ok: true,
        diagnostics,
        plan: {
            target: 'verilog-hdl',
            schemaVersion: unit.schemaVersion,
            core: planCore(unit.core),
            signals: collectHDLSignals(unit.core, ['core']),
            clockReset: collectExtensions(unit, 'logicir.verilog-hdl', 'clock-reset'),
            moduleBindings: collectExtensions(unit, 'logicir.verilog-hdl', 'module-binding').concat(collectHDLModuleRegistryBindings(unit.core, capabilities)),
            combinationalAssigns: collectExtensions(unit, 'logicir.verilog-hdl', 'combinational-assigns'),
            stateRegisters: collectExtensions(unit, 'logicir.verilog-hdl', 'state-registers'),
            elaboration: collectExtensions(unit, 'logicir.verilog-hdl', 'elaboration'),
            structuralSlices: collectExtensions(unit, 'logicir.verilog-hdl', 'structural-slices'),
            structuralSlicePlans,
            structuralSliceLinks: collectHDLStructuralSliceLinks(structuralSlicePlans),
        },
    };
}
function validateHDLCombinationalAssignWidths(combinationalAssigns, signals, diagnostics) {
    const signalMap = new Map(signals.map((signal) => [
        endpointSignalKey(signalToEndpoint(signal)),
        signal,
    ]));
    for (const extension of combinationalAssigns) {
        const payload = extension.payload;
        if (!isRecord(payload) || !Array.isArray(payload.assigns)) {
            continue;
        }
        payload.assigns.forEach((assign, index) => {
            if (!isRecord(assign) || !isPlannedEndpoint(assign.to)) {
                return;
            }
            const target = signalMap.get(endpointSignalKey(assign.to));
            const exprWidth = inferHDLExpressionWidth(assign.expr, signalMap);
            if (!target || exprWidth === undefined) {
                return;
            }
            if (target.width !== exprWidth) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-004',
                    path: [...extension.path, 'payload', 'assigns', index],
                    message: `HDL combinational assign width mismatch: target is ${target.width} bits but expression is ${exprWidth} bits.`,
                });
            }
        });
    }
}
function preflightForTarget(unit, capabilities, target) {
    const diagnostics = (0, preflight_1.preflightProjection)(unit, capabilities);
    if (capabilities.target !== target) {
        diagnostics.push({
            severity: 'error',
            code: 'PLAN-001',
            path: ['capabilities', 'target'],
            message: `Expected '${target}' projector capabilities.`,
        });
    }
    return diagnostics;
}
function planCore(core) {
    const luis = {};
    for (const [luiId, lui] of Object.entries(core.luis)) {
        luis[luiId] = planLUI(luiId, lui);
    }
    const connections = {};
    for (const [connectionId, connection] of Object.entries(core.connections)) {
        connections[connectionId] = planConnection(connectionId, connection, core);
    }
    const closures = {};
    for (const [closureId, closure] of Object.entries(core.closures)) {
        closures[closureId] = planCore(closure.core);
    }
    return {
        kind: core.kindOrganization.kind,
        ports: planPorts(core.ports),
        luis,
        connections,
        closures,
        organization: planOrganization(core),
    };
}
function planOrganization(core) {
    if (core.kindOrganization.kind === 'combinational') {
        return { kind: 'combinational' };
    }
    if (core.kindOrganization.kind === 'sequential') {
        return {
            kind: 'sequential',
            steps: [...core.kindOrganization.steps],
        };
    }
    if (core.kindOrganization.kind === 'stateful') {
        return { kind: 'stateful' };
    }
    return {
        kind: 'structural',
        exportAnchors: core.kindOrganization.exportAnchors,
        externalOutlets: core.kindOrganization.externalOutlets,
        exportAnchorFills: core.kindOrganization.exportAnchorFills,
        luiFills: core.kindOrganization.luiFills,
    };
}
function planLUI(id, lui) {
    return {
        id,
        kind: lui.kind,
        target: lui.target,
        ports: planPorts(lui.ports),
        fulfillments: Object.keys(lui.fulfillments),
        compositionSurface: lui.kind === 'structural'
            ? {
                outlets: [...lui.compositionSurface.outlets],
                anchors: lui.compositionSurface.anchors,
            }
            : undefined,
    };
}
function planPorts(ports) {
    const planned = {};
    for (const [portKey, port] of Object.entries(ports)) {
        planned[portKey] = {
            key: portKey,
            boundary: port.boundary,
            interaction: port.interaction,
            role: port.role,
            pins: port.pins,
        };
    }
    return planned;
}
function planConnection(id, connection, core) {
    const targetPort = resolveEndpointPort(core, connection.to);
    return {
        id,
        from: connection.from,
        to: connection.to,
        mode: classifyConnectionMode(targetPort),
    };
}
function classifyConnectionMode(targetPort) {
    if (!targetPort) {
        return 'pull';
    }
    if (targetPort.interaction.retainedCurrent) {
        return 'retained-current';
    }
    if (targetPort.interaction.pullReadable &&
        targetPort.interaction.pushNotifiable) {
        return 'pull-push';
    }
    return targetPort.interaction.pushNotifiable ? 'push' : 'pull';
}
function resolveEndpointPort(core, endpoint) {
    if (endpoint.owner.kind === 'lu') {
        return core.ports[endpoint.portKey];
    }
    if (endpoint.owner.kind === 'lui') {
        return core.luis[endpoint.owner.luiId]?.ports[endpoint.portKey];
    }
    return core.closures[endpoint.owner.closureId]?.core.ports[endpoint.portKey];
}
function validateHDLSignalCoverage(core, path, diagnostics) {
    validateHDLPortSignalCoverage(core.ports, core.extensions, [...path, 'ports'], diagnostics);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        validateHDLPortSignalCoverage(lui.ports, lui.extensions, [...path, 'luis', luiId, 'ports'], diagnostics);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateHDLSignalCoverage(closure.core, [...path, 'closures', closureId, 'core'], diagnostics);
    }
}
function validateHDLStateRegisterWidths(stateRegisters, signals, diagnostics) {
    const signalMap = new Map(signals.map((signal) => [
        endpointSignalKey(signalToEndpoint(signal)),
        signal,
    ]));
    for (const extension of stateRegisters) {
        const payload = extension.payload;
        if (!isRecord(payload) || !Array.isArray(payload.registers)) {
            continue;
        }
        payload.registers.forEach((register, index) => {
            if (!isRecord(register) || !isPlannedEndpoint(register.target)) {
                return;
            }
            const target = signalMap.get(endpointSignalKey(register.target));
            const enableWidth = inferHDLExpressionWidth(register.enable, signalMap);
            if (enableWidth !== undefined && enableWidth !== 1) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-006',
                    path: [...extension.path, 'payload', 'registers', index, 'enable'],
                    message: `HDL state register enable expression must be 1 bit, got ${enableWidth} bits.`,
                });
            }
            const nextWidth = inferHDLExpressionWidth(register.next, signalMap);
            if (target && nextWidth !== undefined && target.width !== nextWidth) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-005',
                    path: [...extension.path, 'payload', 'registers', index, 'next'],
                    message: `HDL state register width mismatch: target is ${target.width} bits but next expression is ${nextWidth} bits.`,
                });
            }
            const resetWidth = inferHDLExpressionWidth(register.resetValue, signalMap);
            if (target && resetWidth !== undefined && target.width !== resetWidth) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-005',
                    path: [
                        ...extension.path,
                        'payload',
                        'registers',
                        index,
                        'resetValue',
                    ],
                    message: `HDL state register width mismatch: target is ${target.width} bits but reset expression is ${resetWidth} bits.`,
                });
            }
        });
    }
}
function validateHDLStructuralSliceCoverage(core, path, structuralSlices, diagnostics) {
    if (core.kindOrganization.kind === 'structural') {
        const sliceExtension = findStructuralSlicesForCore(structuralSlices, path);
        if (sliceExtension?.requirement === 'required') {
            const payload = sliceExtension.payload;
            const slices = isRecord(payload) && isRecord(payload.slices)
                ? payload.slices
                : {};
            for (const [anchorKey, anchor] of Object.entries(core.kindOrganization.exportAnchors)) {
                if (anchor.required && !hasOwn(slices, anchorKey)) {
                    diagnostics.push({
                        severity: 'error',
                        code: 'HDL-008',
                        path: [...sliceExtension.path, 'payload', 'slices'],
                        message: `Required HDL structural-slices extension does not define required export anchor '${anchorKey}'.`,
                    });
                }
            }
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateHDLStructuralSliceCoverage(closure.core, [...path, 'closures', closureId, 'core'], structuralSlices, diagnostics);
    }
}
function validateHDLStructuralSliceLinkCompatibility(core, path, structuralSlices, diagnostics) {
    if (core.kindOrganization.kind === 'structural') {
        const sliceExtension = findStructuralSlicesForCore(structuralSlices, path);
        if (sliceExtension?.requirement === 'required') {
            const plans = collectHDLStructuralSlicePlans(core, path, structuralSlices);
            const providersByOutlet = new Map();
            for (const slice of plans) {
                if (!samePlanPath(slice.corePath, path)) {
                    continue;
                }
                const root = slice.root;
                if (root?.kind === 'lui-outlet') {
                    const key = `${root.luiId}:${root.outletKey}`;
                    providersByOutlet.set(key, [
                        ...(providersByOutlet.get(key) ?? []),
                        slice,
                    ]);
                }
            }
            for (const consumer of plans) {
                if (!samePlanPath(consumer.corePath, path) || !consumer.rx) {
                    continue;
                }
                const compatibleProviders = [];
                for (const outlet of consumer.footprint.luiOutlets) {
                    const providers = providersByOutlet.get(`${outlet.luiId}:${outlet.outletKey}`) ?? [];
                    for (const provider of providers) {
                        if (provider === consumer || !provider.tx) {
                            continue;
                        }
                        if (sameSliceInterface(provider.tx, consumer.rx)) {
                            compatibleProviders.push(`${provider.anchorKey}:${outlet.luiId}.${outlet.outletKey}`);
                            continue;
                        }
                        diagnostics.push({
                            severity: 'error',
                            code: 'HDL-009',
                            path: [...sliceExtension.path, 'payload', 'slices'],
                            message: `HDL structural slice link ${provider.anchorKey} -> ${consumer.anchorKey} for ${outlet.luiId}.${outlet.outletKey} requires compatible typed TX/RX interfaces.`,
                        });
                    }
                }
                if (compatibleProviders.length > 1 && !consumer.fanIn) {
                    diagnostics.push({
                        severity: 'error',
                        code: 'HDL-010',
                        path: [...sliceExtension.path, 'payload', 'slices'],
                        message: `HDL structural slice '${consumer.anchorKey}' has multiple compatible provider TX dependencies for one RX interface (${compatibleProviders.join(', ')}); declare routing, fan-in, or arbitration before lowering.`,
                    });
                }
            }
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateHDLStructuralSliceLinkCompatibility(closure.core, [...path, 'closures', closureId, 'core'], structuralSlices, diagnostics);
    }
}
function samePlanPath(left, right) {
    return (left.length === right.length &&
        left.every((segment, index) => segment === right[index]));
}
function validateHDLClockResetCoverage(core, path, diagnostics) {
    const kind = core.kindOrganization.kind;
    const coreClockReset = hasClockResetExtension(core.extensions);
    if ((kind === 'sequential' || kind === 'stateful') &&
        !coreClockReset) {
        diagnostics.push({
            severity: 'error',
            code: 'HDL-002',
            path: [...path, 'extensions'],
            message: 'Verilog HDL projection requires a clock-reset extension for sequential or stateful cores.',
        });
    }
    for (const [luiId, lui] of Object.entries(core.luis)) {
        if ((lui.kind === 'sequential' || lui.kind === 'stateful') &&
            !coreClockReset &&
            !hasClockResetExtension(lui.extensions)) {
            diagnostics.push({
                severity: 'error',
                code: 'HDL-002',
                path: [...path, 'luis', luiId, 'extensions'],
                message: 'Verilog HDL projection requires a clock-reset extension for sequential or stateful LUI instances.',
            });
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateHDLClockResetCoverage(closure.core, [...path, 'closures', closureId, 'core'], diagnostics);
    }
}
function collectHDLStructuralSlicePlans(core, path, structuralSlices) {
    const plans = [];
    if (core.kindOrganization.kind === 'structural') {
        const extension = findStructuralSlicesForCore(structuralSlices, path);
        const payload = isRecord(extension?.payload) ? extension.payload : undefined;
        const slices = isRecord(payload?.slices) ? payload.slices : {};
        const bus = isRecord(payload?.bus)
            ? {
                routing: isHDLStructuralSliceRouting(payload.bus.routing)
                    ? payload.bus.routing
                    : 'custom',
                channelPath: isPayloadPath(payload.bus.channelPath)
                    ? payload.bus.channelPath
                    : undefined,
            }
            : undefined;
        const fanIn = isRecord(payload?.fanIn) ? payload.fanIn : {};
        for (const [anchorKey, anchor] of Object.entries(core.kindOrganization.exportAnchors)) {
            const slice = isRecord(slices[anchorKey]) ? slices[anchorKey] : {};
            plans.push({
                corePath: path,
                anchorKey,
                required: anchor.required,
                moduleName: typeof slice.moduleName === 'string'
                    ? slice.moduleName
                    : defaultSliceModuleName(path, anchorKey),
                placement: typeof slice.placement === 'string' ? slice.placement : undefined,
                txPort: typeof slice.txPort === 'string' ? slice.txPort : undefined,
                rxPort: typeof slice.rxPort === 'string' ? slice.rxPort : undefined,
                tx: collectHDLSliceInterface(slice.tx, slice.txPort, 'tx_bus'),
                rx: collectHDLSliceInterface(slice.rx, slice.rxPort, 'rx_bus'),
                bus,
                fanIn: collectHDLSliceFanIn(fanIn[anchorKey]),
                root: core.kindOrganization.exportAnchorFills[anchorKey],
                childAnchorFills: core.kindOrganization.luiFills,
                footprint: collectStructuralSliceFootprint(core.kindOrganization.exportAnchorFills[anchorKey], core.kindOrganization.luiFills),
            });
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        plans.push(...collectHDLStructuralSlicePlans(closure.core, [...path, 'closures', closureId, 'core'], structuralSlices));
    }
    return plans;
}
function collectStructuralSliceFootprint(root, childAnchorFills) {
    const luis = new Set();
    const luiOutlets = new Map();
    const externalOutlets = new Set();
    const anchors = new Map();
    const visitedFills = new Set();
    const visitLeaf = (leaf) => {
        if (!leaf || leaf.kind === 'empty') {
            return;
        }
        if (leaf.kind === 'external-outlet') {
            externalOutlets.add(leaf.outletKey);
            return;
        }
        luis.add(leaf.luiId);
        luiOutlets.set(`${leaf.luiId}:${leaf.outletKey}`, {
            luiId: leaf.luiId,
            outletKey: leaf.outletKey,
        });
        const fills = childAnchorFills[leaf.luiId];
        if (!fills || visitedFills.has(leaf.luiId)) {
            return;
        }
        visitedFills.add(leaf.luiId);
        for (const [anchorKey, value] of Object.entries(fills)) {
            anchors.set(`${leaf.luiId}:${anchorKey}`, {
                luiId: leaf.luiId,
                anchorKey,
            });
            visitValue(value);
        }
    };
    const visitValue = (value) => {
        if (value.kind === 'collection') {
            value.items.forEach(visitLeaf);
            return;
        }
        if (value.kind === 'map') {
            Object.values(value.entries).forEach(visitLeaf);
            return;
        }
        visitLeaf(value);
    };
    visitLeaf(root);
    return {
        luis: [...luis].sort(),
        luiOutlets: [...luiOutlets.values()].sort(compareLUIOutletRefs),
        externalOutlets: [...externalOutlets].sort(),
        anchors: [...anchors.values()].sort(compareLUIAnchorRefs),
    };
}
function collectHDLStructuralSliceLinks(slices) {
    const links = [];
    const providersByOutlet = new Map();
    for (const slice of slices) {
        const root = slice.root;
        if (!root || root.kind !== 'lui-outlet') {
            continue;
        }
        const key = `${root.luiId}:${root.outletKey}`;
        providersByOutlet.set(key, [
            ...(providersByOutlet.get(key) ?? []),
            slice,
        ]);
    }
    for (const consumer of slices) {
        if (!consumer.rx) {
            continue;
        }
        const candidates = [];
        for (const outlet of consumer.footprint.luiOutlets) {
            const providers = providersByOutlet.get(`${outlet.luiId}:${outlet.outletKey}`) ?? [];
            for (const provider of providers) {
                if (provider === consumer ||
                    !provider.tx ||
                    !sameSliceInterface(provider.tx, consumer.rx)) {
                    continue;
                }
                candidates.push({
                    corePath: consumer.corePath,
                    fromAnchorKey: provider.anchorKey,
                    toAnchorKey: consumer.anchorKey,
                    luiId: outlet.luiId,
                    outletKey: outlet.outletKey,
                    tx: provider.tx,
                    rx: consumer.rx,
                });
            }
        }
        if (candidates.length === 1 || (candidates.length > 1 && consumer.fanIn)) {
            links.push(...candidates);
        }
    }
    return links.sort((left, right) => left.fromAnchorKey.localeCompare(right.fromAnchorKey) ||
        left.toAnchorKey.localeCompare(right.toAnchorKey) ||
        left.luiId.localeCompare(right.luiId) ||
        left.outletKey.localeCompare(right.outletKey));
}
function sameSliceInterface(left, right) {
    return (left.width === right.width &&
        left.signed === right.signed &&
        left.packed === right.packed &&
        left.encoding === right.encoding);
}
function compareLUIOutletRefs(left, right) {
    return (left.luiId.localeCompare(right.luiId) ||
        left.outletKey.localeCompare(right.outletKey));
}
function compareLUIAnchorRefs(left, right) {
    return (left.luiId.localeCompare(right.luiId) ||
        left.anchorKey.localeCompare(right.anchorKey));
}
function findStructuralSlicesForCore(structuralSlices, corePath) {
    return structuralSlices.find((extension) => extension.path.length >= corePath.length + 2 &&
        corePath.every((segment, index) => extension.path[index] === segment) &&
        extension.path[corePath.length] === 'extensions');
}
function defaultSliceModuleName(corePath, anchorKey) {
    const prefix = corePath.map(String).join('_');
    return `${prefix}_${anchorKey}_slice`;
}
function collectHDLSliceInterface(value, fallbackPortName, defaultPortName) {
    if (!isRecord(value) || typeof value.width !== 'number') {
        return undefined;
    }
    return {
        portName: typeof value.portName === 'string'
            ? value.portName
            : typeof fallbackPortName === 'string'
                ? fallbackPortName
                : defaultPortName,
        width: value.width,
        signed: value.signed === true,
        packed: value.packed === true,
        encoding: isHDLEncoding(value.encoding) ? value.encoding : 'bits',
    };
}
function collectHDLSliceFanIn(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    return isHDLStructuralSliceFanInPolicy(value.policy)
        ? { policy: value.policy }
        : undefined;
}
function validateHDLModuleBindingCoverage(core, path, moduleBindings, combinationalAssigns, stateRegisters, moduleRegistry, diagnostics) {
    for (const [luiId, lui] of Object.entries(core.luis)) {
        if (lui.kind === 'structural' && Object.keys(lui.ports).length === 0) {
            continue;
        }
        if (lui.target.kind === 'external' &&
            !findLuiModuleBinding(moduleBindings, luiId) &&
            !findHDLModuleRegistryBinding(moduleRegistry, lui.target) &&
            !hasCombinationalRealizationForLUI(combinationalAssigns, luiId) &&
            !hasStateRegisterRealizationForLUI(stateRegisters, luiId)) {
            diagnostics.push({
                severity: 'error',
                code: 'HDL-003',
                path: [...path, 'luis', luiId, 'extensions'],
                message: 'Verilog HDL projection requires module-binding or explicit combinational behavior for external LUI targets.',
            });
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateHDLModuleBindingCoverage(closure.core, [...path, 'closures', closureId, 'core'], moduleBindings, combinationalAssigns, stateRegisters, moduleRegistry, diagnostics);
    }
}
function collectHDLModuleRegistryBindings(core, capabilities) {
    const moduleRegistry = capabilities.verilogHDL?.moduleBinding === true
        ? capabilities.verilogHDL.moduleRegistry
        : undefined;
    if (!moduleRegistry) {
        return [];
    }
    const bindings = [];
    collectCoreHDLModuleRegistryBindings(core, ['core'], moduleRegistry, bindings);
    return bindings;
}
function collectCoreHDLModuleRegistryBindings(core, path, moduleRegistry, bindings) {
    for (const [luiId, lui] of Object.entries(core.luis)) {
        if (lui.target.kind !== 'external' ||
            findHDLModuleBindingInExtensions(lui.extensions) !== undefined) {
            continue;
        }
        const binding = findHDLModuleRegistryBinding(moduleRegistry, lui.target);
        if (!binding) {
            continue;
        }
        bindings.push({
            key: 'module-binding',
            requirement: 'required',
            path: [...path, 'luis', luiId, 'target'],
            payload: binding,
        });
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        collectCoreHDLModuleRegistryBindings(closure.core, [...path, 'closures', closureId, 'core'], moduleRegistry, bindings);
    }
}
function findHDLModuleRegistryBinding(moduleRegistry, target) {
    return moduleRegistry?.[`${target.namespace}/${target.key}`];
}
function findHDLModuleBindingInExtensions(extensions) {
    return extensions?.find((extension) => matchesExtension(extension, 'logicir.verilog-hdl', 'module-binding'));
}
function validateHDLModuleRegistryInterfaces(core, path, moduleRegistry, signals, diagnostics) {
    if (!moduleRegistry) {
        return;
    }
    const signalMap = new Map(signals.map((signal) => [
        endpointSignalKey(signalToEndpoint(signal)),
        signal,
    ]));
    validateCoreHDLModuleRegistryInterfaces(core, path, moduleRegistry, signalMap, diagnostics);
}
function validateCoreHDLModuleRegistryInterfaces(core, path, moduleRegistry, signalMap, diagnostics) {
    for (const [luiId, lui] of Object.entries(core.luis)) {
        if (lui.target.kind !== 'external' ||
            findHDLModuleBindingInExtensions(lui.extensions) !== undefined) {
            continue;
        }
        const binding = findHDLModuleRegistryBinding(moduleRegistry, lui.target);
        if (!binding || !isRecord(binding.interface)) {
            continue;
        }
        const portMap = isRecord(binding.portMap) ? binding.portMap : {};
        for (const [portKey, port] of Object.entries(lui.ports)) {
            const externalName = typeof portMap[portKey] === 'string' ? portMap[portKey] : portKey;
            const contract = binding.interface[externalName];
            if (!isRecord(contract)) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-007',
                    path: [...path, 'luis', luiId, 'ports', portKey],
                    message: `HDL module registry interface for external port '${externalName}' is missing.`,
                });
                continue;
            }
            const expectedDirection = port.boundary === 'input' ? 'input' : 'output';
            if (typeof contract.direction === 'string' &&
                contract.direction !== expectedDirection) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-007',
                    path: [...path, 'luis', luiId, 'ports', portKey],
                    message: `HDL module registry interface direction mismatch for '${externalName}': expected ${expectedDirection}, got ${contract.direction}.`,
                });
            }
            const signal = signalMap.get(endpointSignalKey({ owner: { kind: 'lui', luiId }, portKey }));
            if (signal &&
                typeof contract.width === 'number' &&
                Number.isInteger(contract.width) &&
                contract.width > 0 &&
                signal.width !== contract.width) {
                diagnostics.push({
                    severity: 'error',
                    code: 'HDL-007',
                    path: [...path, 'luis', luiId, 'ports', portKey],
                    message: `HDL module registry interface width mismatch for '${externalName}': expected ${signal.width}, got ${contract.width}.`,
                });
            }
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateCoreHDLModuleRegistryInterfaces(closure.core, [...path, 'closures', closureId, 'core'], moduleRegistry, signalMap, diagnostics);
    }
}
function validateHDLPortSignalCoverage(ports, ownerExtensions, path, diagnostics) {
    for (const [portKey, port] of Object.entries(ports)) {
        if (!findWholePortHDLSignalType(portKey, port.extensions, ownerExtensions)) {
            diagnostics.push({
                severity: 'error',
                code: 'HDL-001',
                path: [...path, portKey, 'extensions'],
                message: 'Verilog HDL projection requires a signal-types extension for each concrete port.',
            });
        }
    }
}
function collectHDLSignals(core, path) {
    const signals = [];
    collectHDLPortSignals(core.ports, core.extensions, [...path, 'ports'], signals);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        collectHDLPortSignals(lui.ports, lui.extensions, [...path, 'luis', luiId, 'ports'], signals);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        signals.push(...collectHDLSignals(closure.core, [
            ...path,
            'closures',
            closureId,
            'core',
        ]));
    }
    return signals;
}
function collectHDLPortSignals(ports, ownerExtensions, path, signals) {
    for (const [portKey, port] of Object.entries(ports)) {
        for (const signal of collectPortHDLSignalTypes(portKey, port, ownerExtensions)) {
            const candidate = {
                portKey,
                payloadPath: signal.payloadPath.length > 0 ? signal.payloadPath : undefined,
                ownerPath: [...path, portKey],
                boundary: port.boundary,
                width: signal.width,
                signed: signal.signed,
                packed: signal.packed,
                encoding: signal.encoding,
            };
            if (!signals.some((existing) => sameEndpointSignal(existing, candidate))) {
                signals.push(candidate);
            }
        }
    }
}
function findWholePortHDLSignalType(portKey, portExtensions, ownerExtensions) {
    return collectPortHDLSignalTypes(portKey, { extensions: portExtensions }, ownerExtensions).find((signal) => signal.payloadPath.length === 0);
}
function collectPortHDLSignalTypes(portKey, port, ownerExtensions) {
    return [
        ...collectHDLSignalTypesFromExtensions(port.extensions, portKey, true),
        ...collectHDLSignalTypesFromExtensions(ownerExtensions, portKey, false),
    ];
}
function collectHDLSignalTypesFromExtensions(extensions, portKey, allowImplicitPort) {
    const signals = [];
    for (const extension of extensions ?? []) {
        if (!matchesExtension(extension, 'logicir.verilog-hdl', 'signal-types')) {
            continue;
        }
        const payload = extension.payload;
        if (!isRecord(payload) || typeof payload.width !== 'number') {
            continue;
        }
        const selector = payload.selector;
        if (isRecord(selector)) {
            if (selector.portKey !== undefined &&
                selector.portKey !== portKey) {
                continue;
            }
            if (selector.portKey === undefined && !allowImplicitPort) {
                continue;
            }
        }
        else if (!allowImplicitPort) {
            continue;
        }
        const payloadPath = selectedHDLPayloadPath(selector);
        signals.push({
            payloadPath,
            width: payload.width,
            signed: payload.signed === true,
            packed: payload.packed === true,
            encoding: isHDLEncoding(payload.encoding) ? payload.encoding : 'bits',
        });
    }
    return signals;
}
function selectedHDLPayloadPath(selector) {
    if (!isRecord(selector)) {
        return [];
    }
    const payloadPath = isPayloadPath(selector.payloadPath)
        ? selector.payloadPath
        : [];
    return typeof selector.pinKey === 'string'
        ? [selector.pinKey, ...payloadPath]
        : payloadPath;
}
function collectExtensions(unit, namespace, key) {
    const planned = [];
    walkExtensions(unit, (extension, path) => {
        if (matchesExtension(extension, namespace, key)) {
            planned.push({
                key,
                requirement: extension.requirement,
                path,
                payload: extension.payload,
            });
        }
    });
    return planned;
}
function retainedPolicyPathEndpoint(path) {
    const portIndex = path.indexOf('ports');
    if (portIndex < 0 || portIndex + 1 >= path.length) {
        return undefined;
    }
    if (path[0] !== 'core') {
        return undefined;
    }
    const portKey = path[portIndex + 1];
    if (typeof portKey !== 'string') {
        return undefined;
    }
    if (path.slice(0, portIndex).includes('luis')) {
        return { owner: 'lui', portKey };
    }
    if (portIndex !== 1) {
        return undefined;
    }
    return { owner: 'lu', portKey };
}
function findLuiModuleBinding(moduleBindings, luiId) {
    return moduleBindings.find((binding) => {
        const payload = binding.payload;
        if (!isRecord(payload)) {
            return false;
        }
        const selector = payload.selector;
        if (!isRecord(selector)) {
            return binding.path.includes(luiId);
        }
        return selector.luiId === luiId;
    });
}
function hasCombinationalRealizationForLUI(combinationalAssigns, luiId) {
    return combinationalAssigns.some((extension) => {
        const payload = extension.payload;
        if (!isRecord(payload) || !Array.isArray(payload.assigns)) {
            return false;
        }
        return payload.assigns.some((assign) => {
            if (!isRecord(assign) || !isRecord(assign.to) || !isRecord(assign.to.owner)) {
                return false;
            }
            return (assign.to.owner.kind === 'lui' &&
                assign.to.owner.luiId === luiId);
        });
    });
}
function hasStateRegisterRealizationForLUI(stateRegisters, luiId) {
    return stateRegisters.some((extension) => {
        const payload = extension.payload;
        if (!isRecord(payload) || !Array.isArray(payload.registers)) {
            return false;
        }
        return payload.registers.some((register) => {
            if (!isRecord(register) ||
                !isRecord(register.target) ||
                !isRecord(register.target.owner)) {
                return false;
            }
            return (register.target.owner.kind === 'lui' &&
                register.target.owner.luiId === luiId);
        });
    });
}
function walkExtensions(unit, visit) {
    visitExtensionList(unit.extensions, ['extensions'], visit);
    walkCoreExtensions(unit.core, ['core'], visit);
    walkRequirementSurfaceExtensions(unit.requirements, ['requirements'], visit);
}
function walkCoreExtensions(core, path, visit) {
    visitExtensionList(core.extensions, [...path, 'extensions'], visit);
    walkPortExtensions(core.ports, [...path, 'ports'], visit);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        const luiPath = [...path, 'luis', luiId];
        visitExtensionList(lui.extensions, [...luiPath, 'extensions'], visit);
        walkPortExtensions(lui.ports, [...luiPath, 'ports'], visit);
        if (lui.kind === 'structural') {
            visitExtensionList(lui.compositionSurface.extensions, [...luiPath, 'compositionSurface', 'extensions'], visit);
        }
        for (const [serviceKey, fulfillment] of Object.entries(lui.fulfillments)) {
            const fulfillmentPath = [...luiPath, 'fulfillments', serviceKey];
            visitExtensionList(fulfillment.extensions, [...fulfillmentPath, 'extensions'], visit);
            if (fulfillment.kind === 'independent-units') {
                for (const [unitKey, unitFulfillment] of Object.entries(fulfillment.units)) {
                    visitExtensionList(unitFulfillment.extensions, [...fulfillmentPath, 'units', unitKey, 'extensions'], visit);
                }
            }
        }
    }
    for (const [connectionId, connection] of Object.entries(core.connections)) {
        visitExtensionList(connection.extensions, [...path, 'connections', connectionId, 'extensions'], visit);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        const closurePath = [...path, 'closures', closureId];
        visitExtensionList(closure.extensions, [...closurePath, 'extensions'], visit);
        walkCoreExtensions(closure.core, [...closurePath, 'core'], visit);
    }
}
function walkRequirementSurfaceExtensions(surface, path, visit) {
    for (const [serviceKey, entry] of Object.entries(surface)) {
        if (entry.kind !== 'inline') {
            continue;
        }
        const servicePath = [...path, serviceKey, 'service'];
        visitExtensionList(entry.service.extensions, [...servicePath, 'extensions'], visit);
        for (const [unitKey, unit] of Object.entries(entry.service.units)) {
            const unitPath = [...servicePath, 'units', unitKey];
            walkPortExtensions(unit.ports, [...unitPath, 'ports'], visit);
            if (hasNestedRequirements(unit)) {
                walkRequirementSurfaceExtensions(unit.requirements, [...unitPath, 'requirements'], visit);
            }
            if (unit.kind === 'structural') {
                visitExtensionList(unit.compositionSurface.extensions, [...unitPath, 'compositionSurface', 'extensions'], visit);
            }
        }
    }
}
function walkPortExtensions(ports, path, visit) {
    for (const [portKey, port] of Object.entries(ports)) {
        visitExtensionList(port.extensions, [...path, portKey, 'extensions'], visit);
    }
}
function visitExtensionList(extensions, path, visit) {
    extensions?.forEach((extension, index) => {
        visit(extension, [...path, index]);
    });
}
function matchesExtension(extension, namespace, key) {
    return (extension.feature.namespace === namespace &&
        (extension.key === key || extension.feature.key === key));
}
function hasClockResetExtension(extensions) {
    return (extensions?.some((extension) => matchesExtension(extension, 'logicir.verilog-hdl', 'clock-reset')) ?? false);
}
function hasErrors(diagnostics) {
    return diagnostics.some((diagnostic) => diagnostic.severity === 'error');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasOwn(record, key) {
    return Object.prototype.hasOwnProperty.call(record, key);
}
function isHDLStructuralSliceRouting(value) {
    return value === 'payload-path' || value === 'pin-channel' || value === 'custom';
}
function isHDLStructuralSliceFanInPolicy(value) {
    return value === 'or' || value === 'and' || value === 'xor';
}
function isHDLEncoding(value) {
    return (value === 'bits' ||
        value === 'one-hot' ||
        value === 'gray' ||
        value === 'custom');
}
function isPayloadPath(value) {
    return (Array.isArray(value) &&
        value.every((segment) => typeof segment === 'string' ||
            (typeof segment === 'number' && Number.isInteger(segment))));
}
function inferHDLExpressionWidth(expr, signalMap) {
    if (!isRecord(expr)) {
        return undefined;
    }
    if (expr.kind === 'endpoint') {
        const endpoint = isPlannedEndpoint(expr.endpoint)
            ? expr.endpoint
            : undefined;
        return endpoint ? signalMap.get(endpointSignalKey(endpoint))?.width : undefined;
    }
    if (expr.kind === 'constant') {
        if (typeof expr.width === 'number' && Number.isInteger(expr.width) && expr.width > 0) {
            return expr.width;
        }
        if (typeof expr.value === 'boolean') {
            return 1;
        }
        return undefined;
    }
    if (expr.kind === 'unary') {
        return inferHDLExpressionWidth(expr.expr, signalMap);
    }
    if (expr.kind === 'reduction') {
        return 1;
    }
    if (expr.kind === 'binary') {
        const left = inferHDLExpressionWidth(expr.left, signalMap);
        const right = inferHDLExpressionWidth(expr.right, signalMap);
        if (left === undefined || right === undefined) {
            return undefined;
        }
        if (expr.op === '==' ||
            expr.op === '!=' ||
            expr.op === '<' ||
            expr.op === '<=' ||
            expr.op === '>' ||
            expr.op === '>=') {
            return 1;
        }
        if (expr.op === '&' || expr.op === '|' || expr.op === '^') {
            return left === right ? left : undefined;
        }
        return undefined;
    }
    if (expr.kind === 'mux') {
        const thenWidth = inferHDLExpressionWidth(expr.then, signalMap);
        const elseWidth = inferHDLExpressionWidth(expr.else, signalMap);
        return thenWidth !== undefined && thenWidth === elseWidth
            ? thenWidth
            : undefined;
    }
    if (expr.kind === 'concat' && Array.isArray(expr.items)) {
        let total = 0;
        for (const item of expr.items) {
            const width = inferHDLExpressionWidth(item, signalMap);
            if (width === undefined) {
                return undefined;
            }
            total += width;
        }
        return total;
    }
    if (expr.kind === 'cast') {
        return typeof expr.width === 'number' && Number.isInteger(expr.width) && expr.width > 0
            ? expr.width
            : inferHDLExpressionWidth(expr.expr, signalMap);
    }
    return undefined;
}
function isPlannedEndpoint(value) {
    return (isRecord(value) &&
        isRecord(value.owner) &&
        typeof value.portKey === 'string' &&
        (value.payloadPath === undefined || isPayloadPath(value.payloadPath)));
}
function signalToEndpoint(signal) {
    const ownerPath = signal.ownerPath;
    if (ownerPath[1] === 'ports') {
        return {
            owner: { kind: 'lu' },
            portKey: signal.portKey,
            payloadPath: signal.payloadPath,
        };
    }
    if (ownerPath[1] === 'luis' && typeof ownerPath[2] === 'string') {
        return {
            owner: { kind: 'lui', luiId: ownerPath[2] },
            portKey: signal.portKey,
            payloadPath: signal.payloadPath,
        };
    }
    if (ownerPath[1] === 'closures' && typeof ownerPath[2] === 'string') {
        return {
            owner: { kind: 'closure', closureId: ownerPath[2] },
            portKey: signal.portKey,
            payloadPath: signal.payloadPath,
        };
    }
    return {
        owner: { kind: 'lu' },
        portKey: signal.portKey,
        payloadPath: signal.payloadPath,
    };
}
function endpointSignalKey(endpoint) {
    const owner = endpointOwnerSignalPrefix(endpoint.owner);
    const path = endpoint.payloadPath?.map(String).join('/') ?? '';
    return `${owner}:${endpoint.portKey}:${path}`;
}
function endpointOwnerSignalPrefix(endpoint) {
    return endpoint.kind === 'lu'
        ? 'lu'
        : endpoint.kind === 'lui'
            ? `lui:${endpoint.luiId}`
            : `closure:${endpoint.closureId}`;
}
function sameEndpointSignal(left, right) {
    return (left.portKey === right.portKey &&
        left.ownerPath.length === right.ownerPath.length &&
        left.ownerPath.every((segment, index) => segment === right.ownerPath[index]) &&
        samePayloadPath(left.payloadPath ?? [], right.payloadPath ?? []));
}
function samePayloadPath(left, right) {
    return (left.length === right.length &&
        left.every((segment, index) => segment === right[index]));
}
function hasNestedRequirements(value) {
    return isRecord(value) && isRecord(value.requirements);
}
