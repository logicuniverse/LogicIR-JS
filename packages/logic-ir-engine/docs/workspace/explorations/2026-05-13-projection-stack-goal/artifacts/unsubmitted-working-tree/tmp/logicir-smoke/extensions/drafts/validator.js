"use strict";
/**
 * Draft feature extension payload validator.
 *
 * This layer validates draft extension payloads and target-specific capability
 * constraints. Core validation remains target-neutral in
 * `core/v0-draft/validator.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDraftExtensions = validateDraftExtensions;
const TYPE_SYSTEM_NAMESPACE = 'logicir.type-system';
const JS_RUNTIME_NAMESPACE = 'logicir.js-runtime';
const PYTHON_RUNTIME_NAMESPACE = 'logicir.python-runtime';
const VERILOG_HDL_NAMESPACE = 'logicir.verilog-hdl';
const TYPE_SYSTEM_KEYS = [
    'type-definitions',
    'payload-types',
    'port-compatibility',
    'requirement-compatibility',
    'composition-compatibility',
    'path-schema',
];
const JS_RUNTIME_KEYS = [
    'async-policy',
    'retained-current-realization',
    'dynamic-fulfillment',
    'lifecycle',
    'error-policy',
];
const PYTHON_RUNTIME_KEYS = [
    'async-policy',
    'retained-current-realization',
    'dynamic-fulfillment',
    'resource-lifecycle',
    'concurrency',
    'error-policy',
];
const VERILOG_HDL_KEYS = [
    'signal-types',
    'clock-reset',
    'module-binding',
    'combinational-assigns',
    'state-registers',
    'elaboration',
    'structural-slices',
];
const TYPE_FORMS = [
    'primitive',
    'record',
    'array',
    'tuple',
    'union',
    'named',
];
const COMPATIBILITY_POLICIES = [
    'exact',
    'assignable',
    'widening',
    'projector-adapter',
    'custom',
];
const JS_INVOCATIONS = ['sync', 'promise', 'async-iterator'];
const JS_RETAINED = [
    'source-store',
    'sink-cache',
    'projector-adapter',
    'host-observable',
];
const JS_DYNAMIC = [
    'static-at-startup',
    'switchable',
    'late-bound',
];
const JS_HOOKS = ['mount', 'start', 'stop', 'dispose'];
const JS_ERROR_POLICIES = [
    'fail-projection',
    'reject',
    'emit-error',
    'use-error-port',
];
const PY_INVOCATIONS = [
    'sync-call',
    'coroutine',
    'async-generator',
    'generator',
    'threadpool-call',
];
const PY_RETAINED = [
    'source-property',
    'sink-cache',
    'asyncio-queue-latest',
    'observable',
    'projector-adapter',
];
const PY_DYNAMIC = [
    'constructor-injected',
    'contextvar',
    'service-container',
    'late-bound',
    'switchable',
];
const PY_LIFECYCLE = [
    'none',
    'context-manager',
    'async-context-manager',
    'start-stop',
    'custom',
];
const PY_CONCURRENCY = [
    'same-thread',
    'asyncio-task',
    'thread',
    'process',
    'external-worker',
];
const PY_ERROR_POLICIES = [
    'raise',
    'return-exception',
    'emit-error',
    'cancel-task',
    'use-error-port',
];
const HDL_ELABORATION = [
    'static-only',
    'generate-loop',
    'unroll',
    'specialize',
];
function validateDraftExtensions(unit, options = {}) {
    const diagnostics = [];
    const sink = {
        add: (code, path, message, severity = 'error') => {
            diagnostics.push({ code, path, message, severity });
        },
    };
    walkLogicUnitExtensions(unit, (extension, context, extensionPath) => {
        const classified = classifyExtension(extension);
        if (!classified) {
            return;
        }
        if (options.target && classified.family !== options.target) {
            return;
        }
        validateClassifiedExtension(extension, classified, context, extensionPath, options.capabilities, sink);
    });
    if (!options.target || options.target === 'type-system') {
        const registry = collectTypeRegistry(unit, sink);
        validateTypeSystemPathSchemaUsage(unit, sink);
        validateTypeSystemTypeUsage(unit, registry, sink);
        validateTypeSystemCompositionUsage(unit, registry, sink);
        validateTypeSystemRequirementUsage(unit, registry, options, sink);
    }
    return diagnostics;
}
function validateTypeSystemTypeUsage(unit, registry, sink) {
    validateCoreTypeUsage(unit.core, ['core'], registry, sink);
}
function validateCoreTypeUsage(core, path, registry, sink) {
    const types = new Map();
    collectPayloadTypesFromExtensions(core.extensions, {
        ownerKey: 'lu',
        ports: core.ports,
        currentPortKey: undefined,
        path: [...path, 'extensions'],
    }, types, sink);
    collectPayloadTypesFromPorts(core.ports, 'lu', [...path, 'ports'], types, sink);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        const ownerKey = `lui:${luiId}`;
        collectPayloadTypesFromExtensions(lui.extensions, {
            ownerKey,
            ports: lui.ports,
            currentPortKey: undefined,
            path: [...path, 'luis', luiId, 'extensions'],
        }, types, sink);
        collectPayloadTypesFromPorts(lui.ports, ownerKey, [...path, 'luis', luiId, 'ports'], types, sink);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        const ownerKey = `closure:${closureId}`;
        collectPayloadTypesFromExtensions(closure.core.extensions, {
            ownerKey,
            ports: closure.core.ports,
            currentPortKey: undefined,
            path: [...path, 'closures', closureId, 'core', 'extensions'],
        }, types, sink);
        collectPayloadTypesFromPorts(closure.core.ports, ownerKey, [...path, 'closures', closureId, 'core', 'ports'], types, sink);
    }
    for (const [connectionId, connection] of Object.entries(core.connections)) {
        validateConnectionPayloadTypes(connectionId, connection.from, connection.to, core, types, registry, [...path, 'connections', connectionId], sink);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateCoreTypeUsage(closure.core, [...path, 'closures', closureId, 'core'], registry, sink);
    }
}
function collectTypeRegistry(unit, sink) {
    const registry = new Map();
    walkLogicUnitExtensions(unit, (extension, _context, path) => {
        const classified = classifyExtension(extension);
        if (!classified ||
            classified.family !== 'type-system' ||
            classified.key !== 'type-definitions' ||
            !isRecord(extension.payload) ||
            !isPlainObject(extension.payload.definitions)) {
            return;
        }
        for (const [definitionKey, definition] of Object.entries(extension.payload.definitions)) {
            if (!isRecord(definition)) {
                continue;
            }
            const namespace = typeof definition.namespace === 'string'
                ? definition.namespace
                : extension.feature.namespace;
            const key = typeof definition.key === 'string'
                ? definition.key
                : definitionKey;
            const registryKey = namedTypeKey(namespace, key);
            if (registry.has(registryKey)) {
                sink.add('EXT-124', [...path, 'payload', 'definitions', definitionKey], `Duplicate named type definition '${registryKey}'.`);
                continue;
            }
            registry.set(registryKey, {
                type: stripDefinitionIdentity(definition),
                path: [...path, 'payload', 'definitions', definitionKey],
            });
        }
    });
    return registry;
}
function validateTypeSystemCompositionUsage(unit, registry, sink) {
    validateCoreCompositionUsage(unit.core, ['core'], registry, sink);
}
function validateTypeSystemRequirementUsage(unit, registry, options, sink) {
    validateCoreRequirementUsage(unit.core, unit.requirements, ['core'], registry, options, sink);
}
function validateCoreRequirementUsage(core, localRequirements, path, registry, options, sink) {
    for (const [luiId, lui] of Object.entries(core.luis)) {
        const targetRequirements = resolveLUITargetRequirements(lui, localRequirements, options);
        if (!targetRequirements) {
            continue;
        }
        for (const [serviceKey, fulfillment] of Object.entries(lui.fulfillments)) {
            const serviceEntry = targetRequirements[serviceKey];
            const service = resolveRequirementEntryForDraft(serviceEntry, options);
            if (!service) {
                continue;
            }
            if (fulfillment.kind === 'independent-units') {
                for (const [unitKey, unitFulfillment] of Object.entries(fulfillment.units)) {
                    const requirementUnit = service.units[unitKey];
                    if (!requirementUnit) {
                        continue;
                    }
                    const fulfillmentPorts = unitFulfillment.kind === 'closure'
                        ? core.closures[unitFulfillment.closureId]?.core.ports
                        : resolveUpstreamUnitPorts(unitFulfillment.supplierServiceKey, unitFulfillment.supplierUnitKey, localRequirements, options);
                    if (!fulfillmentPorts) {
                        continue;
                    }
                    const relation = selectRequirementCompatibilityRelation(requirementUnit, service, fulfillment, unitFulfillment);
                    validateRequirementUnitFulfillmentCompatibility(requirementUnit, fulfillmentPorts, relation, registry, [
                        ...path,
                        'luis',
                        luiId,
                        'fulfillments',
                        serviceKey,
                        'units',
                        unitKey,
                    ], sink);
                }
                continue;
            }
            const supplierService = resolveUpstreamService(fulfillment.supplier.supplierServiceKey, localRequirements, options);
            if (!supplierService) {
                continue;
            }
            for (const [unitKey, requirementUnit] of Object.entries(service.units)) {
                const supplierUnit = supplierService.units[unitKey];
                if (!supplierUnit) {
                    continue;
                }
                const relation = selectRequirementCompatibilityRelation(requirementUnit, service, fulfillment, undefined);
                validateRequirementUnitFulfillmentCompatibility(requirementUnit, supplierUnit.ports, relation, registry, [
                    ...path,
                    'luis',
                    luiId,
                    'fulfillments',
                    serviceKey,
                    'supplier',
                    'units',
                    unitKey,
                ], sink);
            }
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateCoreRequirementUsage(closure.core, {}, [...path, 'closures', closureId, 'core'], registry, options, sink);
    }
}
function validateRequirementUnitFulfillmentCompatibility(requirementUnit, fulfillmentPorts, relation, registry, path, sink) {
    if (relation === 'adapter-required') {
        return;
    }
    const requirementTypes = collectPayloadTypesForPortSurface(requirementUnit.ports);
    const fulfillmentTypes = collectPayloadTypesForPortSurface(fulfillmentPorts);
    for (const [portKey, requirementPort] of Object.entries(requirementUnit.ports)) {
        const fulfillmentPort = fulfillmentPorts[portKey];
        if (!fulfillmentPort) {
            continue;
        }
        const policy = requirementTypePolicy(requirementPort, relation);
        for (const requirementType of requirementTypes.get(portKey) ?? []) {
            const fulfillmentResolution = resolveSurfaceTypeEntry(fulfillmentTypes.get(portKey) ?? [], requirementType.payloadPath, registry);
            if (fulfillmentResolution.kind === 'missing') {
                continue;
            }
            if (fulfillmentResolution.resolution.kind === 'invalid-path') {
                sink.add('EXT-136', [...path, 'ports', portKey], `Requirement fulfillment port '${portKey}' payload path '${formatPayloadPath(requirementType.payloadPath)}' cannot be resolved against declared payload type.`);
                continue;
            }
            const requirementResolution = resolveTypeEntryAtPayloadPath(requirementType, requirementType.payloadPath, registry);
            const source = requirementPort.boundary === 'input'
                ? fulfillmentResolution.resolution
                : requirementResolution;
            const target = requirementPort.boundary === 'input'
                ? requirementResolution
                : fulfillmentResolution.resolution;
            reportTypeResolution(source, requirementPort.boundary === 'input'
                ? fulfillmentResolution.path
                : requirementType.path, 'Requirement fulfillment port', sink);
            reportTypeResolution(target, requirementType.path, 'Requirement contract port', sink);
            if (source.kind !== 'resolved' || target.kind !== 'resolved') {
                continue;
            }
            if (!isTypeCompatible(source.type, target.type, policy, registry)) {
                sink.add('EXT-135', [...path, 'ports', portKey], `Requirement fulfillment port '${portKey}' payload path '${formatPayloadPath(requirementType.payloadPath)}' is not compatible with requirement contract under '${policy}' policy.`);
            }
        }
    }
}
function selectRequirementCompatibilityRelation(requirementUnit, service, serviceFulfillment, unitFulfillment) {
    return (findRequirementCompatibilityRelation(unitFulfillment?.extensions) ??
        findRequirementCompatibilityRelation(serviceFulfillment.extensions) ??
        findRequirementCompatibilityRelation(service.extensions) ??
        'structural-subtype');
}
function findRequirementCompatibilityRelation(extensions) {
    for (const extension of extensions ?? []) {
        const classified = classifyExtension(extension);
        if (classified?.family !== 'type-system' ||
            classified.key !== 'requirement-compatibility' ||
            !isRecord(extension.payload) ||
            !isRequirementCompatibilityRelation(extension.payload.relation)) {
            continue;
        }
        return extension.payload.relation;
    }
    return undefined;
}
function isRequirementCompatibilityRelation(value) {
    return (value === 'same-contract' ||
        value === 'structural-subtype' ||
        value === 'nominal-implements' ||
        value === 'adapter-required');
}
function requirementTypePolicy(requirementPort, relation) {
    if (relation === 'same-contract' || relation === 'nominal-implements') {
        return 'exact';
    }
    return requirementPort.boundary === 'input' ? 'assignable' : 'exact';
}
function resolveUpstreamUnitPorts(serviceKey, unitKey, localRequirements, options) {
    const service = resolveUpstreamService(serviceKey, localRequirements, options);
    return service?.units[unitKey]?.ports;
}
function resolveUpstreamService(serviceKey, localRequirements, options) {
    return resolveRequirementEntryForDraft(localRequirements[serviceKey], options);
}
function collectPayloadTypesForPortSurface(ports) {
    const types = new Map();
    for (const [portKey, port] of Object.entries(ports)) {
        port.extensions?.forEach((extension, index) => {
            const classified = classifyExtension(extension);
            if (classified?.family !== 'type-system' ||
                classified.key !== 'payload-types' ||
                !isRecord(extension.payload) ||
                !isValidTypeExpression(extension.payload.type)) {
                return;
            }
            const selector = extension.payload.selector;
            const payloadPath = selectorPayloadPath(selector);
            const entries = types.get(portKey) ?? [];
            entries.push({
                ownerKey: 'surface',
                portKey,
                payloadPath,
                type: extension.payload.type,
                path: ['ports', portKey, 'extensions', index, 'payload', 'type'],
            });
            types.set(portKey, entries);
        });
    }
    return types;
}
function resolveSurfaceTypeEntry(entries, payloadPath, registry) {
    const candidates = entries
        .filter((entry) => isPrefix(entry.payloadPath, payloadPath))
        .sort((left, right) => right.payloadPath.length - left.payloadPath.length);
    const best = candidates[0];
    if (!best) {
        return { kind: 'missing' };
    }
    return {
        kind: 'found',
        resolution: resolveTypeEntryAtPayloadPath(best, payloadPath, registry),
        path: best.path,
    };
}
function resolveTypeEntryAtPayloadPath(entry, payloadPath, registry) {
    const remainingPath = payloadPath.slice(entry.payloadPath.length);
    const resolvedRoot = normalizeType(entry.type, registry);
    if (resolvedRoot.kind !== 'resolved') {
        return resolvedRoot;
    }
    const resolved = resolveTypeAtPayloadPath(resolvedRoot.type, remainingPath, registry);
    return resolved.kind === 'resolved' ? resolved : resolved;
}
function formatPayloadPath(payloadPath) {
    return payloadPath.length === 0
        ? '<whole-port>'
        : payloadPath.map(String).join('.');
}
function resolveLUITargetRequirements(lui, localRequirements, options) {
    if (lui.target.kind === 'requirement') {
        const service = resolveRequirementEntryForDraft(localRequirements[lui.target.serviceKey], options);
        const unit = service?.units[lui.target.unitKey];
        return unit && hasNestedRequirementSurface(unit)
            ? unit.requirements
            : {};
    }
    if (lui.target.kind === 'lu') {
        return options.resolveLogicUnit?.(lui.target.luId)?.requirements;
    }
    return undefined;
}
function resolveRequirementEntryForDraft(entry, options) {
    if (!entry) {
        return undefined;
    }
    if (entry.kind === 'inline') {
        return entry.service;
    }
    return options.resolveRequirementService?.(entry.namespace, entry.key);
}
function validateCoreCompositionUsage(core, path, registry, sink) {
    if (isStructuralCore(core)) {
        const compositionTypes = collectStructuralCompositionTypes(core, path, sink);
        for (const [anchorKey, leaf] of Object.entries(core.kindOrganization.exportAnchorFills)) {
            validateCompositionLeafType(leaf, compositionTypes.exportAnchors.get(anchorKey), compositionTypes, registry, [...path, 'kindOrganization', 'exportAnchorFills', anchorKey], sink);
        }
        for (const [luiId, fills] of Object.entries(core.kindOrganization.luiFills)) {
            const childSurface = compositionTypes.childSurfaces.get(luiId);
            for (const [anchorKey, value] of Object.entries(fills)) {
                validateCompositionValueType(value, childSurface?.anchors.get(anchorKey), compositionTypes, registry, [...path, 'kindOrganization', 'luiFills', luiId, anchorKey], sink);
            }
        }
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateCoreCompositionUsage(closure.core, [...path, 'closures', closureId, 'core'], registry, sink);
    }
}
function collectStructuralCompositionTypes(core, path, sink) {
    const types = {
        exportAnchors: new Map(),
        externalOutlets: new Map(),
        childSurfaces: new Map(),
    };
    collectCompositionCompatibilityEntries(core.extensions, {
        anchors: Object.fromEntries(Object.keys(core.kindOrganization.exportAnchors).map((key) => [
            key,
            true,
        ])),
        outlets: Object.fromEntries(Object.keys(core.kindOrganization.externalOutlets).map((key) => [
            key,
            true,
        ])),
    }, {
        anchors: types.exportAnchors,
        outlets: types.externalOutlets,
    }, [...path, 'extensions'], sink);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        if (lui.kind !== 'structural') {
            continue;
        }
        const surfaceTypes = {
            anchors: new Map(),
            outlets: new Map(),
        };
        collectCompositionCompatibilityEntries(lui.compositionSurface.extensions, {
            anchors: lui.compositionSurface.anchors,
            outlets: Object.fromEntries(lui.compositionSurface.outlets.map((key) => [key, true])),
        }, surfaceTypes, [
            ...path,
            'luis',
            luiId,
            'compositionSurface',
            'extensions',
        ], sink);
        collectCompositionCompatibilityEntries(lui.extensions, {
            anchors: lui.compositionSurface.anchors,
            outlets: Object.fromEntries(lui.compositionSurface.outlets.map((key) => [key, true])),
        }, surfaceTypes, [...path, 'luis', luiId, 'extensions'], sink);
        types.childSurfaces.set(luiId, surfaceTypes);
    }
    return types;
}
function collectCompositionCompatibilityEntries(extensions, surface, target, path, sink) {
    extensions?.forEach((extension, index) => {
        const classified = classifyExtension(extension);
        if (!classified ||
            classified.family !== 'type-system' ||
            classified.key !== 'composition-compatibility' ||
            !isRecord(extension.payload) ||
            !isRecord(extension.payload.selector)) {
            return;
        }
        const selector = extension.payload.selector;
        const accepts = isOneOf(extension.payload.accepts, ['exact', 'assignable', 'custom'])
            ? extension.payload.accepts
            : 'exact';
        const type = namespaceKeyType(extension.payload.type);
        if (!type) {
            return;
        }
        if (typeof selector.anchorKey === 'string' &&
            hasOwn(surface.anchors, selector.anchorKey)) {
            if (target.anchors.has(selector.anchorKey)) {
                sink.add('EXT-132', [...path, index, 'payload', 'selector', 'anchorKey'], `Duplicate composition type for anchor '${selector.anchorKey}'.`);
            }
            else {
                target.anchors.set(selector.anchorKey, {
                    type,
                    accepts,
                    path: [...path, index, 'payload'],
                });
            }
        }
        if (typeof selector.outletKey === 'string' &&
            hasOwn(surface.outlets, selector.outletKey)) {
            if (target.outlets.has(selector.outletKey)) {
                sink.add('EXT-132', [...path, index, 'payload', 'selector', 'outletKey'], `Duplicate composition type for outlet '${selector.outletKey}'.`);
            }
            else {
                target.outlets.set(selector.outletKey, {
                    type,
                    accepts,
                    path: [...path, index, 'payload'],
                });
            }
        }
    });
}
function validateCompositionValueType(value, target, types, registry, path, sink) {
    if (isCompositionLeaf(value)) {
        validateCompositionLeafType(value, target, types, registry, path, sink);
        return;
    }
    if (value.kind === 'collection') {
        const leaves = value.items.map((leaf, index) => ({
            leaf,
            path: [...path, 'items', index],
        }));
        leaves.forEach((entry) => validateCompositionLeafType(entry.leaf, target, types, registry, entry.path, sink));
        return;
    }
    Object.entries(value.entries).forEach(([key, leaf]) => {
        validateCompositionLeafType(leaf, target, types, registry, [...path, 'entries', key], sink);
    });
}
function validateCompositionLeafType(leaf, target, types, registry, path, sink) {
    if (!target || leaf.kind === 'empty') {
        return;
    }
    const source = resolveCompositionLeafType(leaf, types);
    if (!source) {
        sink.add('EXT-131', path, 'Composition fill targets a typed anchor, but the source outlet has no declared composition type.');
        return;
    }
    const targetType = normalizeType(target.type, registry);
    const sourceType = normalizeType(source.type, registry);
    reportTypeResolution(targetType, [...target.path, 'type'], 'Composition anchor', sink);
    reportTypeResolution(sourceType, [...path], 'Composition outlet', sink);
    if (targetType.kind !== 'resolved' || sourceType.kind !== 'resolved') {
        return;
    }
    if (target.accepts !== 'custom' &&
        !isTypeCompatible(sourceType.type, targetType.type, target.accepts, registry)) {
        sink.add('EXT-134', path, `Composition outlet type is not compatible with anchor under '${target.accepts}' policy.`);
    }
}
function resolveCompositionLeafType(leaf, types) {
    if (leaf.kind === 'external-outlet') {
        return types.externalOutlets.get(leaf.outletKey);
    }
    if (leaf.kind === 'lui-outlet') {
        return types.childSurfaces.get(leaf.luiId)?.outlets.get(leaf.outletKey);
    }
    return undefined;
}
function reportTypeResolution(resolution, path, label, sink) {
    if (resolution.kind === 'unresolved-named') {
        sink.add('EXT-133', path, `${label} references unknown named type '${resolution.typeName}'.`);
    }
    if (resolution.kind === 'recursive-named') {
        sink.add('EXT-133', path, `${label} named type '${resolution.typeName}' is recursive.`);
    }
}
function collectPayloadTypesFromPorts(ports, ownerKey, path, types, sink) {
    for (const [portKey, port] of Object.entries(ports)) {
        collectPayloadTypesFromExtensions(port.extensions, {
            ownerKey,
            ports,
            currentPortKey: portKey,
            path: [...path, portKey, 'extensions'],
        }, types, sink);
    }
}
function collectPayloadTypesFromExtensions(extensions, context, types, sink) {
    extensions?.forEach((extension, index) => {
        const classified = classifyExtension(extension);
        if (!classified ||
            classified.family !== 'type-system' ||
            classified.key !== 'payload-types' ||
            !isRecord(extension.payload) ||
            !isValidTypeExpression(extension.payload.type)) {
            return;
        }
        const selector = extension.payload.selector;
        const selectedPortKey = isRecord(selector) && typeof selector.portKey === 'string'
            ? selector.portKey
            : context.currentPortKey;
        if (!selectedPortKey || !hasOwn(context.ports, selectedPortKey)) {
            return;
        }
        const selectedPath = selectorPayloadPath(selector);
        const typeKey = `${context.ownerKey}:${selectedPortKey}`;
        const entries = types.get(typeKey) ?? [];
        if (entries.some((entry) => samePath(entry.payloadPath, selectedPath))) {
            sink.add('EXT-121', [...context.path, index], `Duplicate payload type for port '${selectedPortKey}' at the same payload path.`);
            return;
        }
        entries.push({
            ownerKey: context.ownerKey,
            portKey: selectedPortKey,
            payloadPath: selectedPath,
            type: extension.payload.type,
            path: [...context.path, index, 'payload', 'type'],
        });
        types.set(typeKey, entries);
    });
}
function validateConnectionPayloadTypes(connectionId, from, to, core, types, registry, path, sink) {
    const fromType = resolveEndpointType(from, types, registry);
    const toType = resolveEndpointType(to, types, registry);
    if (fromType.kind === 'invalid-path') {
        sink.add('EXT-122', [...path, 'from', 'payloadPath'], 'Connection source payloadPath cannot be resolved against declared payload type.');
    }
    if (toType.kind === 'invalid-path') {
        sink.add('EXT-122', [...path, 'to', 'payloadPath'], 'Connection target payloadPath cannot be resolved against declared payload type.');
    }
    if (fromType.kind === 'unresolved-named') {
        sink.add('EXT-125', [...path, 'from'], `Connection source references unknown named type '${fromType.typeName}'.`);
    }
    if (toType.kind === 'unresolved-named') {
        sink.add('EXT-125', [...path, 'to'], `Connection target references unknown named type '${toType.typeName}'.`);
    }
    if (fromType.kind === 'recursive-named') {
        sink.add('EXT-126', [...path, 'from'], `Connection source named type '${fromType.typeName}' is recursive.`);
    }
    if (toType.kind === 'recursive-named') {
        sink.add('EXT-126', [...path, 'to'], `Connection target named type '${toType.typeName}' is recursive.`);
    }
    if (fromType.kind !== 'resolved' || toType.kind !== 'resolved') {
        return;
    }
    const policy = resolveConnectionCompatibilityPolicy(connectionId, core, path);
    if (policy === 'custom' || policy === 'projector-adapter') {
        return;
    }
    if (!isTypeCompatible(fromType.type, toType.type, policy, registry)) {
        sink.add('EXT-123', path, `Connection payload types are not compatible under '${policy}' policy.`);
    }
}
function resolveEndpointType(endpoint, types, registry) {
    const endpointPath = endpoint.payloadPath ?? [];
    const key = `${portOwnerSchemaKey(endpoint.owner)}:${endpoint.portKey}`;
    const entries = types.get(key);
    if (!entries || entries.length === 0) {
        return { kind: 'missing' };
    }
    const candidates = entries
        .filter((entry) => isPrefix(entry.payloadPath, endpointPath))
        .sort((left, right) => right.payloadPath.length - left.payloadPath.length);
    const best = candidates[0];
    if (!best) {
        return { kind: 'missing' };
    }
    const remainingPath = endpointPath.slice(best.payloadPath.length);
    const resolvedRoot = normalizeType(best.type, registry);
    if (resolvedRoot.kind !== 'resolved') {
        return resolvedRoot;
    }
    const resolved = resolveTypeAtPayloadPath(resolvedRoot.type, remainingPath, registry);
    if (resolved.kind !== 'resolved') {
        if (resolved.kind === 'invalid-path') {
            return { kind: 'invalid-path', typePath: best.path };
        }
        return resolved;
    }
    if (resolved.type === undefined) {
        return { kind: 'invalid-path', typePath: best.path };
    }
    return { kind: 'resolved', type: resolved.type };
}
function resolveConnectionCompatibilityPolicy(connectionId, core, path) {
    const connection = core.connections[connectionId];
    const connectionPolicy = firstCompatibilityPolicy(connection?.extensions, connectionId, connection);
    if (connectionPolicy) {
        return connectionPolicy;
    }
    const corePolicy = firstCompatibilityPolicy(core.extensions, connectionId, connection);
    if (corePolicy) {
        return corePolicy;
    }
    void path;
    return 'exact';
}
function firstCompatibilityPolicy(extensions, connectionId, connection) {
    for (const extension of extensions ?? []) {
        const classified = classifyExtension(extension);
        if (!classified ||
            classified.family !== 'type-system' ||
            classified.key !== 'port-compatibility' ||
            !isRecord(extension.payload) ||
            !isOneOf(extension.payload.policy, COMPATIBILITY_POLICIES)) {
            continue;
        }
        const selector = extension.payload.selector;
        if (selector === undefined) {
            return extension.payload.policy;
        }
        if (!isRecord(selector)) {
            continue;
        }
        if (selector.connectionId === undefined) {
            if (selectorMatchesConnection(selector, connection)) {
                return extension.payload.policy;
            }
            continue;
        }
        if (selector.connectionId === connectionId) {
            return extension.payload.policy;
        }
    }
    return undefined;
}
function selectorMatchesConnection(selector, connection) {
    if (!isRecord(selector.from) && !isRecord(selector.to)) {
        return true;
    }
    if (!connection) {
        return false;
    }
    return (endpointSelectorMatches(selector.from, connection.from) &&
        endpointSelectorMatches(selector.to, connection.to));
}
function endpointSelectorMatches(selector, endpoint) {
    if (selector === undefined) {
        return true;
    }
    if (!isRecord(selector)) {
        return false;
    }
    if (typeof selector.portKey === 'string' &&
        selector.portKey !== endpoint.portKey) {
        return false;
    }
    if (selector.payloadPath !== undefined) {
        if (!isPayloadPath(selector.payloadPath)) {
            return false;
        }
        return samePath(selector.payloadPath, endpoint.payloadPath ?? []);
    }
    return true;
}
function isTypeCompatible(source, target, policy, registry) {
    const sourceResolved = normalizeType(source, registry);
    const targetResolved = normalizeType(target, registry);
    if (sourceResolved.kind !== 'resolved' || targetResolved.kind !== 'resolved') {
        return false;
    }
    source = sourceResolved.type;
    target = targetResolved.type;
    if (policy === 'exact') {
        return typeEquals(source, target, registry);
    }
    if (policy === 'widening') {
        return isTypeWidening(source, target, registry);
    }
    if (policy === 'assignable') {
        return isTypeAssignable(source, target, registry);
    }
    return true;
}
function isTypeWidening(source, target, registry) {
    const sourceResolved = normalizeType(source, registry);
    const targetResolved = normalizeType(target, registry);
    if (sourceResolved.kind !== 'resolved' || targetResolved.kind !== 'resolved') {
        return false;
    }
    source = sourceResolved.type;
    target = targetResolved.type;
    if (typeEquals(source, target, registry) ||
        isPrimitiveWidening(source, target, registry)) {
        return true;
    }
    if (!isRecord(source) || !isRecord(target) || source.kind !== target.kind) {
        return false;
    }
    if (source.kind === 'record' && target.kind === 'record') {
        const sourceFields = source.fields;
        const targetFields = target.fields;
        if (!isPlainObject(sourceFields) || !isPlainObject(targetFields)) {
            return false;
        }
        const sourceKeys = Object.keys(sourceFields).sort();
        const targetKeys = Object.keys(targetFields).sort();
        return (sourceKeys.length === targetKeys.length &&
            sourceKeys.every((key, index) => key === targetKeys[index]) &&
            sourceKeys.every((key) => {
                const sourceField = sourceFields[key];
                const targetField = targetFields[key];
                return (isOptionalTypeField(sourceField) === isOptionalTypeField(targetField) &&
                    isTypeWidening(typeFieldType(sourceField), typeFieldType(targetField), registry));
            }));
    }
    if (source.kind === 'array' && target.kind === 'array') {
        return (source.length === target.length &&
            isTypeWidening(source.item, target.item, registry));
    }
    if (source.kind === 'tuple' && target.kind === 'tuple') {
        const sourceItems = source.items;
        const targetItems = target.items;
        if (!Array.isArray(sourceItems) || !Array.isArray(targetItems)) {
            return false;
        }
        return (sourceItems.length === targetItems.length &&
            sourceItems.every((item, index) => isTypeWidening(item, targetItems[index], registry)));
    }
    return false;
}
function isTypeAssignable(source, target, registry) {
    const sourceResolved = normalizeType(source, registry);
    const targetResolved = normalizeType(target, registry);
    if (sourceResolved.kind !== 'resolved' || targetResolved.kind !== 'resolved') {
        return false;
    }
    source = sourceResolved.type;
    target = targetResolved.type;
    if (typeEquals(source, target, registry) ||
        isPrimitiveWidening(source, target, registry)) {
        return true;
    }
    if (isRecord(source) && source.kind === 'union') {
        return (Array.isArray(source.variants) &&
            source.variants.every((variant) => isTypeAssignable(variant, target, registry)));
    }
    if (isRecord(target) && target.kind === 'union') {
        return (Array.isArray(target.variants) &&
            target.variants.some((variant) => isTypeAssignable(source, variant, registry)));
    }
    if (!isRecord(source) || !isRecord(target)) {
        return false;
    }
    if (source.kind === 'record' && target.kind === 'record') {
        const sourceFields = source.fields;
        const targetFields = target.fields;
        if (!isPlainObject(sourceFields) || !isPlainObject(targetFields)) {
            return false;
        }
        return Object.entries(targetFields).every(([fieldKey, targetField]) => {
            const sourceField = sourceFields[fieldKey];
            if (sourceField === undefined) {
                return isOptionalTypeField(targetField);
            }
            if (!isOptionalTypeField(targetField) && isOptionalTypeField(sourceField)) {
                return false;
            }
            return (isTypeAssignable(typeFieldType(sourceField), typeFieldType(targetField), registry));
        });
    }
    if (source.kind === 'tuple' && target.kind === 'array') {
        const sourceItems = source.items;
        if (!Array.isArray(sourceItems)) {
            return false;
        }
        if (target.length !== undefined && sourceItems.length !== target.length) {
            return false;
        }
        return sourceItems.every((sourceItem) => isTypeAssignable(sourceItem, target.item, registry));
    }
    if (source.kind === 'array' && target.kind === 'tuple') {
        const targetItems = target.items;
        if (!Array.isArray(targetItems) ||
            source.length === undefined ||
            source.length !== targetItems.length) {
            return false;
        }
        return targetItems.every((targetItem) => isTypeAssignable(source.item, targetItem, registry));
    }
    if (source.kind !== target.kind) {
        return false;
    }
    if (source.kind === 'array' && target.kind === 'array') {
        if (target.length !== undefined &&
            source.length !== target.length) {
            return false;
        }
        return isTypeAssignable(source.item, target.item, registry);
    }
    if (source.kind === 'tuple' && target.kind === 'tuple') {
        const sourceItems = source.items;
        const targetItems = target.items;
        if (!Array.isArray(sourceItems) || !Array.isArray(targetItems)) {
            return false;
        }
        if (sourceItems.length !== targetItems.length) {
            return false;
        }
        return targetItems.every((targetItem, index) => isTypeAssignable(sourceItems[index], targetItem, registry));
    }
    return false;
}
function typeEquals(left, right, registry) {
    const leftResolved = normalizeType(left, registry);
    const rightResolved = normalizeType(right, registry);
    if (leftResolved.kind !== 'resolved' || rightResolved.kind !== 'resolved') {
        return false;
    }
    left = leftResolved.type;
    right = rightResolved.type;
    if (!isRecord(left) || !isRecord(right) || left.kind !== right.kind) {
        return false;
    }
    if (left.kind === 'primitive' && right.kind === 'primitive') {
        return left.name === right.name;
    }
    if (left.kind === 'named' && right.kind === 'named') {
        return left.namespace === right.namespace && left.key === right.key;
    }
    if (left.kind === 'array' && right.kind === 'array') {
        return (left.length === right.length &&
            typeEquals(left.item, right.item, registry));
    }
    if (left.kind === 'tuple' && right.kind === 'tuple') {
        const leftItems = left.items;
        const rightItems = right.items;
        if (!Array.isArray(leftItems) || !Array.isArray(rightItems)) {
            return false;
        }
        return (leftItems.length === rightItems.length &&
            leftItems.every((item, index) => typeEquals(item, rightItems[index], registry)));
    }
    if (left.kind === 'union' && right.kind === 'union') {
        const leftVariants = left.variants;
        const rightVariants = right.variants;
        if (!Array.isArray(leftVariants) || !Array.isArray(rightVariants)) {
            return false;
        }
        return (leftVariants.length === rightVariants.length &&
            leftVariants.every((leftVariant, index) => typeEquals(leftVariant, rightVariants[index], registry)));
    }
    if (left.kind === 'record' && right.kind === 'record') {
        const leftFields = left.fields;
        const rightFields = right.fields;
        if (!isPlainObject(leftFields) || !isPlainObject(rightFields)) {
            return false;
        }
        const leftKeys = Object.keys(leftFields).sort();
        const rightKeys = Object.keys(rightFields).sort();
        return (leftKeys.length === rightKeys.length &&
            leftKeys.every((key, index) => key === rightKeys[index]) &&
            leftKeys.every((key) => isOptionalTypeField(leftFields[key]) === isOptionalTypeField(rightFields[key]) &&
                typeEquals(typeFieldType(leftFields[key]), typeFieldType(rightFields[key]), registry)));
    }
    return false;
}
function isPrimitiveWidening(source, target, registry) {
    const sourceResolved = normalizeType(source, registry);
    const targetResolved = normalizeType(target, registry);
    if (sourceResolved.kind !== 'resolved' || targetResolved.kind !== 'resolved') {
        return false;
    }
    source = sourceResolved.type;
    target = targetResolved.type;
    return (isRecord(source) &&
        isRecord(target) &&
        source.kind === 'primitive' &&
        target.kind === 'primitive' &&
        source.name === 'int' &&
        target.name === 'float');
}
function isTypeField(value) {
    return (isRecord(value) &&
        hasOwn(value, 'type') &&
        !hasOwn(value, 'kind'));
}
function typeFieldType(value) {
    return isTypeField(value) ? value.type : value;
}
function isOptionalTypeField(value) {
    return isTypeField(value) && value.optional === true;
}
function resolveTypeAtPayloadPath(type, payloadPath, registry) {
    let current = type;
    for (const segment of payloadPath) {
        const resolved = normalizeType(current, registry);
        if (resolved.kind !== 'resolved') {
            return resolved;
        }
        current = resolved.type;
        if (!isRecord(current)) {
            return { kind: 'invalid-path', typePath: [] };
        }
        if (current.kind === 'record') {
            if (typeof segment !== 'string' ||
                !isPlainObject(current.fields) ||
                !hasOwn(current.fields, segment)) {
                return { kind: 'invalid-path', typePath: [] };
            }
            current = typeFieldType(current.fields[segment]);
            continue;
        }
        if (current.kind === 'tuple') {
            if (typeof segment !== 'number' ||
                !Number.isInteger(segment) ||
                segment < 0 ||
                !Array.isArray(current.items) ||
                segment >= current.items.length) {
                return { kind: 'invalid-path', typePath: [] };
            }
            current = current.items[segment];
            continue;
        }
        if (current.kind === 'array') {
            if (typeof segment !== 'number' || !Number.isInteger(segment) || segment < 0) {
                return { kind: 'invalid-path', typePath: [] };
            }
            current = current.item;
            continue;
        }
        return { kind: 'invalid-path', typePath: [] };
    }
    const resolved = normalizeType(current, registry);
    return resolved.kind === 'resolved' ? { kind: 'resolved', type: resolved.type } : resolved;
}
function normalizeType(type, registry, resolving = []) {
    if (!isRecord(type)) {
        return { kind: 'resolved', type };
    }
    if (type.kind === 'named') {
        const typeName = namedTypeKey(type.namespace, type.key);
        if (resolving.includes(typeName)) {
            return { kind: 'recursive-named', typeName };
        }
        const entry = registry.get(typeName);
        if (!entry) {
            return { kind: 'unresolved-named', typeName };
        }
        return normalizeType(entry.type, registry, [...resolving, typeName]);
    }
    if (type.kind === 'record' && isPlainObject(type.fields)) {
        const fields = {};
        for (const [fieldKey, fieldType] of Object.entries(type.fields)) {
            const normalized = normalizeType(typeFieldType(fieldType), registry, resolving);
            if (normalized.kind !== 'resolved') {
                return normalized;
            }
            fields[fieldKey] = isTypeField(fieldType)
                ? {
                    type: normalized.type,
                    ...(fieldType.optional === true ? { optional: true } : {}),
                }
                : normalized.type;
        }
        return { kind: 'resolved', type: { ...type, fields } };
    }
    if (type.kind === 'array') {
        const normalized = normalizeType(type.item, registry, resolving);
        if (normalized.kind !== 'resolved') {
            return normalized;
        }
        return { kind: 'resolved', type: { ...type, item: normalized.type } };
    }
    if (type.kind === 'tuple' && Array.isArray(type.items)) {
        const items = [];
        for (const item of type.items) {
            const normalized = normalizeType(item, registry, resolving);
            if (normalized.kind !== 'resolved') {
                return normalized;
            }
            items.push(normalized.type);
        }
        return { kind: 'resolved', type: { ...type, items } };
    }
    if (type.kind === 'union' && Array.isArray(type.variants)) {
        const variants = [];
        for (const variant of type.variants) {
            const normalized = normalizeType(variant, registry, resolving);
            if (normalized.kind !== 'resolved') {
                return normalized;
            }
            variants.push(normalized.type);
        }
        return { kind: 'resolved', type: { ...type, variants } };
    }
    return { kind: 'resolved', type };
}
function stripDefinitionIdentity(type) {
    const { namespace: _namespace, key: _key, ...rest } = type;
    return rest;
}
function namedTypeKey(namespace, key) {
    return `${String(namespace)}:${String(key)}`;
}
function namespaceKeyType(value) {
    if (isRecord(value) &&
        typeof value.namespace === 'string' &&
        value.namespace.length > 0 &&
        typeof value.key === 'string' &&
        value.key.length > 0) {
        return {
            kind: 'named',
            namespace: value.namespace,
            key: value.key,
        };
    }
    return undefined;
}
function validateTypeSystemPathSchemaUsage(unit, sink) {
    validateCorePathSchemaUsage(unit.core, ['core'], sink);
}
function validateCorePathSchemaUsage(core, path, sink) {
    const schemas = new Map();
    collectPathSchemasFromExtensions(core.extensions, {
        ownerKey: 'lu',
        ports: core.ports,
        currentPortKey: undefined,
        path: [...path, 'extensions'],
    }, schemas, sink);
    collectPathSchemasFromPorts(core.ports, 'lu', [...path, 'ports'], schemas, sink);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        const ownerKey = `lui:${luiId}`;
        collectPathSchemasFromExtensions(lui.extensions, {
            ownerKey,
            ports: lui.ports,
            currentPortKey: undefined,
            path: [...path, 'luis', luiId, 'extensions'],
        }, schemas, sink);
        collectPathSchemasFromPorts(lui.ports, ownerKey, [...path, 'luis', luiId, 'ports'], schemas, sink);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        const ownerKey = `closure:${closureId}`;
        collectPathSchemasFromExtensions(closure.core.extensions, {
            ownerKey,
            ports: closure.core.ports,
            currentPortKey: undefined,
            path: [...path, 'closures', closureId, 'core', 'extensions'],
        }, schemas, sink);
        collectPathSchemasFromPorts(closure.core.ports, ownerKey, [...path, 'closures', closureId, 'core', 'ports'], schemas, sink);
    }
    for (const [connectionId, connection] of Object.entries(core.connections)) {
        validateEndpointPathSchema(connection.from, schemas, [...path, 'connections', connectionId, 'from', 'payloadPath'], sink);
        validateEndpointPathSchema(connection.to, schemas, [...path, 'connections', connectionId, 'to', 'payloadPath'], sink);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        validateCorePathSchemaUsage(closure.core, [...path, 'closures', closureId, 'core'], sink);
    }
}
function collectPathSchemasFromPorts(ports, ownerKey, path, schemas, sink) {
    for (const [portKey, port] of Object.entries(ports)) {
        collectPathSchemasFromExtensions(port.extensions, {
            ownerKey,
            ports,
            currentPortKey: portKey,
            path: [...path, portKey, 'extensions'],
        }, schemas, sink);
    }
}
function collectPathSchemasFromExtensions(extensions, context, schemas, sink) {
    extensions?.forEach((extension, index) => {
        const classified = classifyExtension(extension);
        if (!classified ||
            classified.family !== 'type-system' ||
            classified.key !== 'path-schema' ||
            !isRecord(extension.payload) ||
            !isValidPathNode(extension.payload.root)) {
            return;
        }
        const selector = extension.payload.selector;
        const selectedPortKey = isRecord(selector) && typeof selector.portKey === 'string'
            ? selector.portKey
            : context.currentPortKey;
        if (!selectedPortKey || !hasOwn(context.ports, selectedPortKey)) {
            return;
        }
        const schemaKey = `${context.ownerKey}:${selectedPortKey}`;
        if (schemas.has(schemaKey)) {
            sink.add('EXT-119', [...context.path, index], `Duplicate path schema for port '${selectedPortKey}'.`);
            return;
        }
        schemas.set(schemaKey, {
            root: extension.payload.root,
            path: [...context.path, index, 'payload', 'root'],
        });
    });
}
function validateEndpointPathSchema(endpoint, schemas, path, sink) {
    if (!endpoint.payloadPath || endpoint.payloadPath.length === 0) {
        return;
    }
    const schema = schemas.get(`${portOwnerSchemaKey(endpoint.owner)}:${endpoint.portKey}`);
    if (!schema) {
        return;
    }
    validatePayloadPathAgainstPathNode(schema.root, endpoint.payloadPath, path, sink);
}
function validatePayloadPathAgainstPathNode(root, payloadPath, path, sink) {
    let node = root;
    for (let index = 0; index < payloadPath.length; index += 1) {
        const segment = payloadPath[index];
        if (!isRecord(node)) {
            sink.add('EXT-120', [...path, index], 'Payload path traverses a non-object path node.');
            return;
        }
        if (node.kind === 'leaf') {
            sink.add('EXT-120', [...path, index], 'Payload path traverses beyond a path-schema leaf.');
            return;
        }
        if (node.kind === 'record') {
            if (typeof segment !== 'string' ||
                !isPlainObject(node.fields) ||
                !hasOwn(node.fields, segment)) {
                sink.add('EXT-120', [...path, index], `Payload path segment '${String(segment)}' is not a record field.`);
                return;
            }
            node = node.fields[segment];
            continue;
        }
        if (node.kind === 'tuple') {
            if (typeof segment !== 'number' ||
                !Number.isInteger(segment) ||
                segment < 0 ||
                !Array.isArray(node.items) ||
                segment >= node.items.length) {
                sink.add('EXT-120', [...path, index], `Payload path segment '${String(segment)}' is not a tuple index.`);
                return;
            }
            node = node.items[segment];
            continue;
        }
        if (node.kind === 'array') {
            if (typeof segment !== 'number' || !Number.isInteger(segment) || segment < 0) {
                sink.add('EXT-120', [...path, index], `Payload path segment '${String(segment)}' is not an array index.`);
                return;
            }
            node = node.item;
            continue;
        }
        sink.add('EXT-120', [...path, index], 'Payload path traverses an invalid path node.');
        return;
    }
}
function portOwnerSchemaKey(owner) {
    if (owner.kind === 'lu') {
        return 'lu';
    }
    if (owner.kind === 'lui') {
        return `lui:${owner.luiId}`;
    }
    return `closure:${owner.closureId}`;
}
function validateClassifiedExtension(extension, classified, context, path, capabilities, sink) {
    validateTargetSpecificCapability(extension, classified, path, capabilities, sink);
    if (classified.family === 'type-system') {
        validateTypeSystemPayload(extension, classified.key, context, path, capabilities?.typeSystem, sink);
        return;
    }
    if (classified.family === 'js-runtime') {
        validateJSRuntimePayload(extension, classified.key, context, path, capabilities?.jsRuntime, sink);
        return;
    }
    if (classified.family === 'python-runtime') {
        validatePythonRuntimePayload(extension, classified.key, context, path, capabilities?.pythonRuntime, sink);
        return;
    }
    validateVerilogHDLPayload(extension, classified.key, context, path, capabilities?.verilogHDL, sink);
}
function validateTargetSpecificCapability(extension, classified, path, capabilities, sink) {
    if (!capabilities) {
        return;
    }
    const targetCapability = classified.family === 'type-system'
        ? capabilities.typeSystem
        : classified.family === 'js-runtime'
            ? capabilities.jsRuntime
            : classified.family === 'python-runtime'
                ? capabilities.pythonRuntime
                : capabilities.verilogHDL;
    if (!targetCapability && extension.requirement === 'required') {
        sink.add('EXT-001', path, `Projector target '${capabilities.target}' does not declare ${classified.family} capability.`);
    }
}
function validateTypeSystemPayload(extension, key, context, path, capability, sink) {
    const payload = extension.payload;
    if (!isRecord(payload)) {
        sink.add('EXT-100', [...path, 'payload'], 'Payload must be an object.');
        return;
    }
    if (key === 'payload-types') {
        validateOptionalSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        if (!('type' in payload)) {
            sink.add('EXT-101', [...path, 'payload', 'type'], 'Missing type expression.');
            return;
        }
        validateTypeExpression(payload.type, [...path, 'payload', 'type'], capability, extension, sink);
        return;
    }
    if (key === 'type-definitions') {
        validateTypeDefinitionsPayload(payload, [...path, 'payload'], capability, extension, sink);
        return;
    }
    if (key === 'port-compatibility') {
        validatePortCompatibilityPayload(payload, context, [...path, 'payload'], capability, extension, sink);
        return;
    }
    if (key === 'requirement-compatibility') {
        validateRequirementCompatibilityPayload(payload, [...path, 'payload'], sink);
        if (capability &&
            !capability.requirementCompatibility &&
            extension.requirement === 'required') {
            sink.add('EXT-108', path, 'Projector does not support required requirement compatibility.');
        }
        return;
    }
    if (key === 'composition-compatibility') {
        validateCompositionCompatibilityPayload(payload, context, [...path, 'payload'], capability, extension, sink);
        return;
    }
    validatePathSchemaPayload(payload, context, [...path, 'payload'], capability, extension, sink);
}
function validateTypeDefinitionsPayload(payload, path, capability, extension, sink) {
    if (!isPlainObject(payload.definitions)) {
        sink.add('EXT-127', [...path, 'definitions'], 'Type definitions must be an object.');
        return;
    }
    for (const [definitionKey, definition] of Object.entries(payload.definitions)) {
        if (!isRecord(definition)) {
            sink.add('EXT-128', [...path, 'definitions', definitionKey], 'Type definition must be a type expression object.');
            continue;
        }
        if (definition.namespace !== undefined &&
            typeof definition.namespace !== 'string') {
            sink.add('EXT-129', [...path, 'definitions', definitionKey, 'namespace'], 'Type definition namespace must be a string.');
        }
        if (definition.key !== undefined && typeof definition.key !== 'string') {
            sink.add('EXT-130', [...path, 'definitions', definitionKey, 'key'], 'Type definition key must be a string.');
        }
        validateTypeExpression(stripDefinitionIdentity(definition), [...path, 'definitions', definitionKey], capability, extension, sink);
    }
}
function validatePortCompatibilityPayload(payload, context, path, capability, extension, sink) {
    validateOptionalPortCompatibilitySelector(payload.selector, context, [...path, 'selector'], sink);
    if (!isOneOf(payload.policy, COMPATIBILITY_POLICIES)) {
        sink.add('EXT-102', [...path, 'policy'], 'Unsupported compatibility policy.');
        return;
    }
    if (capability &&
        !capability.compatibilityPolicies.includes(payload.policy) &&
        extension.requirement === 'required') {
        sink.add('EXT-103', [...path, 'policy'], `Projector does not support required compatibility policy '${payload.policy}'.`);
    }
    if (payload.policy === 'projector-adapter' && payload.adapterTarget === undefined) {
        sink.add('EXT-137', [...path, 'adapterTarget'], 'projector-adapter compatibility requires adapterTarget evidence.');
    }
    else if (payload.policy === 'projector-adapter') {
        validateNamespaceKey(payload.adapterTarget, [...path, 'adapterTarget'], sink);
    }
}
function validateRequirementCompatibilityPayload(payload, path, sink) {
    if (!isOneOf(payload.relation, [
        'same-contract',
        'structural-subtype',
        'nominal-implements',
        'adapter-required',
    ])) {
        sink.add('EXT-104', [...path, 'relation'], 'Unsupported requirement compatibility relation.');
    }
    if (payload.relation === 'adapter-required' && payload.evidence === undefined) {
        sink.add('EXT-138', [...path, 'evidence'], 'adapter-required requirement compatibility requires evidence.');
    }
    if ('evidence' in payload && payload.evidence !== undefined) {
        validateNamespaceKey(payload.evidence, [...path, 'evidence'], sink, true);
    }
}
function validateCompositionCompatibilityPayload(payload, context, path, capability, extension, sink) {
    validateCompositionSelector(payload.selector, context, [...path, 'selector'], sink);
    validateNamespaceKey(payload.type, [...path, 'type'], sink);
    if ('accepts' in payload &&
        payload.accepts !== undefined &&
        !isOneOf(payload.accepts, ['exact', 'assignable', 'custom'])) {
        sink.add('EXT-105', [...path, 'accepts'], 'Unsupported composition compatibility policy.');
    }
    if (capability &&
        !capability.compositionCompatibility &&
        extension.requirement === 'required') {
        sink.add('EXT-106', path, 'Projector does not support required composition compatibility.');
    }
}
function validatePathSchemaPayload(payload, context, path, capability, extension, sink) {
    validateOptionalSelector(payload.selector, context, [...path, 'selector'], sink);
    validatePathNode(payload.root, [...path, 'root'], sink);
    if (capability && !capability.pathSchema && extension.requirement === 'required') {
        sink.add('EXT-107', path, 'Projector does not support required path schemas.');
    }
}
function validateTypeExpression(value, path, capability, extension, sink) {
    if (!isRecord(value) || !isOneOf(value.kind, TYPE_FORMS)) {
        sink.add('EXT-109', path, 'Invalid type expression.');
        return;
    }
    if (capability &&
        !capability.typeForms.includes(value.kind) &&
        extension.requirement === 'required') {
        sink.add('EXT-110', [...path, 'kind'], `Projector does not support required type form '${value.kind}'.`);
    }
    if (value.kind === 'primitive') {
        if (!isOneOf(value.name, ['bool', 'int', 'float', 'string'])) {
            sink.add('EXT-111', [...path, 'name'], 'Invalid primitive type name.');
        }
        return;
    }
    if (value.kind === 'record') {
        if (!isPlainObject(value.fields)) {
            sink.add('EXT-112', [...path, 'fields'], 'Record fields must be an object.');
            return;
        }
        for (const [fieldKey, fieldValue] of Object.entries(value.fields)) {
            validateTypeField(fieldValue, [...path, 'fields', fieldKey], capability, extension, sink);
        }
        return;
    }
    if (value.kind === 'array') {
        validateTypeExpression(value.item, [...path, 'item'], capability, extension, sink);
        const length = value.length;
        if (length !== undefined &&
            (typeof length !== 'number' || !Number.isInteger(length) || length < 0)) {
            sink.add('EXT-113', [...path, 'length'], 'Array length must be a non-negative integer.');
        }
        return;
    }
    if (value.kind === 'tuple') {
        if (!Array.isArray(value.items)) {
            sink.add('EXT-114', [...path, 'items'], 'Tuple items must be an array.');
            return;
        }
        value.items.forEach((item, index) => {
            validateTypeExpression(item, [...path, 'items', index], capability, extension, sink);
        });
        return;
    }
    if (value.kind === 'union') {
        if (!Array.isArray(value.variants) || value.variants.length === 0) {
            sink.add('EXT-115', [...path, 'variants'], 'Union variants must be a non-empty array.');
            return;
        }
        value.variants.forEach((variant, index) => {
            validateTypeExpression(variant, [...path, 'variants', index], capability, extension, sink);
        });
        return;
    }
    validateNamespaceKey(value, path, sink);
}
function validatePathNode(value, path, sink) {
    if (!isRecord(value) ||
        !isOneOf(value.kind, ['leaf', 'record', 'tuple', 'array'])) {
        sink.add('EXT-115', path, 'Invalid path schema node.');
        return;
    }
    if (value.kind === 'leaf') {
        if (typeof value.type !== 'string' || value.type.length === 0) {
            sink.add('EXT-116', [...path, 'type'], 'Path leaf type must be a non-empty string.');
        }
        return;
    }
    if (value.kind === 'record') {
        if (!isPlainObject(value.fields)) {
            sink.add('EXT-117', [...path, 'fields'], 'Path record fields must be an object.');
            return;
        }
        for (const [fieldKey, fieldValue] of Object.entries(value.fields)) {
            validatePathNode(fieldValue, [...path, 'fields', fieldKey], sink);
        }
        return;
    }
    if (value.kind === 'tuple') {
        if (!Array.isArray(value.items)) {
            sink.add('EXT-118', [...path, 'items'], 'Path tuple items must be an array.');
            return;
        }
        value.items.forEach((item, index) => {
            validatePathNode(item, [...path, 'items', index], sink);
        });
        return;
    }
    validatePathNode(value.item, [...path, 'item'], sink);
}
function validateJSRuntimePayload(extension, key, context, path, capability, sink) {
    const payload = extension.payload;
    if (!isRecord(payload)) {
        sink.add('EXT-200', [...path, 'payload'], 'Payload must be an object.');
        return;
    }
    if (key === 'async-policy') {
        validateStepLUISelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.invocation, JS_INVOCATIONS, capability?.invocation, extension, [...path, 'payload', 'invocation'], 'EXT-201', 'JS invocation', sink);
        validateOptionalBoolean(payload.awaitBeforeNext, [...path, 'payload', 'awaitBeforeNext'], sink);
        return;
    }
    if (key === 'retained-current-realization') {
        validateOptionalSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.realization, JS_RETAINED, capability?.retainedCurrentRealization, extension, [...path, 'payload', 'realization'], 'EXT-202', 'JS retained-current realization', sink);
        validateOptionalEnum(payload.notification, ['push', 'subscribe', 'microtask', 'custom'], [...path, 'payload', 'notification'], 'EXT-203', sink);
        return;
    }
    if (key === 'dynamic-fulfillment') {
        validateServiceUnitSelector(payload.selector, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.mode, JS_DYNAMIC, capability?.dynamicFulfillment, extension, [...path, 'payload', 'mode'], 'EXT-204', 'JS dynamic fulfillment mode', sink);
        validateRequiredEnum(payload.consistency, ['no-live-switch', 'quiescent-switch', 'transactional-switch'], [...path, 'payload', 'consistency'], 'EXT-205', sink);
        return;
    }
    if (key === 'lifecycle') {
        validateLUIClosureSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateHookList(payload.hooks, JS_HOOKS, capability?.lifecycleHooks, extension, [...path, 'payload', 'hooks'], 'EXT-206', sink);
        validateOptionalEnum(payload.ordering, ['parent-before-child', 'child-before-parent'], [...path, 'payload', 'ordering'], 'EXT-207', sink);
        return;
    }
    validateLUIPortSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
    validateCapabilityEnum(payload.onThrow, JS_ERROR_POLICIES, capability?.errorPolicies, extension, [...path, 'payload', 'onThrow'], 'EXT-208', 'JS error policy', sink);
    validateOptionalEnum(payload.cancellation, ['unsupported', 'abort-signal', 'custom'], [...path, 'payload', 'cancellation'], 'EXT-209', sink);
}
function validatePythonRuntimePayload(extension, key, context, path, capability, sink) {
    const payload = extension.payload;
    if (!isRecord(payload)) {
        sink.add('EXT-300', [...path, 'payload'], 'Payload must be an object.');
        return;
    }
    if (key === 'async-policy') {
        validateStepLUIPortSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.invocation, PY_INVOCATIONS, capability?.invocation, extension, [...path, 'payload', 'invocation'], 'EXT-301', 'Python invocation', sink);
        validateOptionalBoolean(payload.awaitBeforeNext, [...path, 'payload', 'awaitBeforeNext'], sink);
        return;
    }
    if (key === 'retained-current-realization') {
        validateOptionalSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.realization, PY_RETAINED, capability?.retainedCurrentRealization, extension, [...path, 'payload', 'realization'], 'EXT-302', 'Python retained-current realization', sink);
        validateOptionalEnum(payload.notification, ['callback', 'asyncio-event', 'queue', 'poll'], [...path, 'payload', 'notification'], 'EXT-303', sink);
        return;
    }
    if (key === 'dynamic-fulfillment') {
        validateServiceUnitSelector(payload.selector, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.binding, PY_DYNAMIC, capability?.dynamicFulfillment, extension, [...path, 'payload', 'binding'], 'EXT-304', 'Python dynamic fulfillment binding', sink);
        validateRequiredEnum(payload.consistency, ['startup-only', 'task-local', 'quiescent-switch', 'transactional-switch'], [...path, 'payload', 'consistency'], 'EXT-305', sink);
        return;
    }
    if (key === 'resource-lifecycle') {
        validateLUIClosureSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.protocol, PY_LIFECYCLE, capability?.resourceLifecycle, extension, [...path, 'payload', 'protocol'], 'EXT-306', 'Python resource lifecycle', sink);
        validateOptionalEnum(payload.ordering, ['parent-before-child', 'child-before-parent'], [...path, 'payload', 'ordering'], 'EXT-307', sink);
        return;
    }
    if (key === 'concurrency') {
        validateLUIConnectionSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.execution, PY_CONCURRENCY, capability?.concurrency, extension, [...path, 'payload', 'execution'], 'EXT-308', 'Python concurrency execution', sink);
        validateOptionalEnum(payload.backpressure, ['drop', 'latest', 'buffer', 'block', 'custom'], [...path, 'payload', 'backpressure'], 'EXT-309', sink);
        validateOptionalEnum(payload.ordering, ['preserve', 'best-effort', 'unordered'], [...path, 'payload', 'ordering'], 'EXT-310', sink);
        return;
    }
    validateLUIPortSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
    validateCapabilityEnum(payload.onException, PY_ERROR_POLICIES, capability?.errorPolicies, extension, [...path, 'payload', 'onException'], 'EXT-311', 'Python error policy', sink);
    validateOptionalEnum(payload.cancellation, ['unsupported', 'asyncio-cancel', 'cooperative', 'custom'], [...path, 'payload', 'cancellation'], 'EXT-312', sink);
}
function validateVerilogHDLPayload(extension, key, context, path, capability, sink) {
    const payload = extension.payload;
    if (!isRecord(payload)) {
        sink.add('EXT-400', [...path, 'payload'], 'Payload must be an object.');
        return;
    }
    if (key === 'signal-types') {
        validateOptionalSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        const width = payload.width;
        if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0) {
            sink.add('EXT-401', [...path, 'payload', 'width'], 'HDL width must be a positive integer.');
        }
        validateOptionalBoolean(payload.signed, [...path, 'payload', 'signed'], sink);
        validateOptionalBoolean(payload.packed, [...path, 'payload', 'packed'], sink);
        validateOptionalEnum(payload.encoding, ['bits', 'one-hot', 'gray', 'custom'], [...path, 'payload', 'encoding'], 'EXT-402', sink);
        requireHDLCapability(capability?.signalTypes, extension, path, 'signal-types', sink);
        return;
    }
    if (key === 'clock-reset') {
        validateClockResetPayload(payload, context, [...path, 'payload'], sink);
        requireHDLCapability(capability?.clockReset, extension, path, 'clock-reset', sink);
        return;
    }
    if (key === 'module-binding') {
        if (typeof payload.moduleName !== 'string' || payload.moduleName.length === 0) {
            sink.add('EXT-403', [...path, 'payload', 'moduleName'], 'moduleName must be a non-empty string.');
        }
        if (payload.instanceName !== undefined &&
            (typeof payload.instanceName !== 'string' || payload.instanceName.length === 0)) {
            sink.add('EXT-404', [...path, 'payload', 'instanceName'], 'instanceName must be a non-empty string.');
        }
        validateOptionalStringBooleanNumberMap(payload.parameters, [...path, 'payload', 'parameters'], sink);
        validateOptionalBoolean(payload.blackbox, [...path, 'payload', 'blackbox'], sink);
        validateOptionalStringMap(payload.portMap, [...path, 'payload', 'portMap'], sink);
        requireHDLCapability(capability?.moduleBinding, extension, path, 'module-binding', sink);
        return;
    }
    if (key === 'combinational-assigns') {
        validateHDLCombinationalAssignsPayload(payload, context, [...path, 'payload'], sink);
        requireHDLCapability(capability?.combinationalAssigns, extension, path, 'combinational-assigns', sink);
        return;
    }
    if (key === 'state-registers') {
        validateHDLStateRegistersPayload(payload, context, [...path, 'payload'], sink);
        requireHDLCapability(capability?.stateRegisters, extension, path, 'state-registers', sink);
        return;
    }
    if (key === 'elaboration') {
        validateLUIConnectionSelector(payload.selector, context, [...path, 'payload', 'selector'], sink);
        validateCapabilityEnum(payload.policy, HDL_ELABORATION, capability?.elaboration, extension, [...path, 'payload', 'policy'], 'EXT-405', 'HDL elaboration policy', sink);
        validateOptionalStringBooleanNumberMap(payload.parameters, [...path, 'payload', 'parameters'], sink);
        return;
    }
    validateStructuralSlicesPayload(payload, context, [...path, 'payload'], capability, extension, sink);
}
function validateClockResetPayload(payload, context, path, sink) {
    if (typeof payload.domain !== 'string' || payload.domain.length === 0) {
        sink.add('EXT-406', [...path, 'domain'], 'Clock/reset domain must be a non-empty string.');
    }
    if (!isRecord(payload.clock)) {
        sink.add('EXT-407', [...path, 'clock'], 'Clock must be an object.');
    }
    else {
        validatePortKey(payload.clock.portKey, context, [...path, 'clock', 'portKey'], sink);
        validateRequiredEnum(payload.clock.edge, ['posedge', 'negedge'], [...path, 'clock', 'edge'], 'EXT-408', sink);
    }
    if (payload.reset !== undefined) {
        if (!isRecord(payload.reset)) {
            sink.add('EXT-409', [...path, 'reset'], 'Reset must be an object.');
        }
        else {
            validatePortKey(payload.reset.portKey, context, [...path, 'reset', 'portKey'], sink);
            validateRequiredEnum(payload.reset.active, ['high', 'low'], [...path, 'reset', 'active'], 'EXT-410', sink);
            validateRequiredEnum(payload.reset.kind, ['sync', 'async'], [...path, 'reset', 'kind'], 'EXT-411', sink);
        }
    }
    if (payload.selectors !== undefined && !isRecord(payload.selectors)) {
        sink.add('EXT-412', [...path, 'selectors'], 'Clock/reset selectors must be an object.');
    }
}
function validateHDLCombinationalAssignsPayload(payload, context, path, sink) {
    if (!Array.isArray(payload.assigns)) {
        sink.add('EXT-420', [...path, 'assigns'], 'HDL combinational assigns must be an array.');
        return;
    }
    payload.assigns.forEach((assign, index) => {
        const assignPath = [...path, 'assigns', index];
        if (!isRecord(assign)) {
            sink.add('EXT-421', assignPath, 'HDL combinational assign must be an object.');
            return;
        }
        validateHDLEndpoint(assign.to, context, [...assignPath, 'to'], sink);
        validateHDLExpression(assign.expr, context, [...assignPath, 'expr'], sink);
    });
}
function validateHDLStateRegistersPayload(payload, context, path, sink) {
    if (!Array.isArray(payload.registers)) {
        sink.add('EXT-432', [...path, 'registers'], 'HDL state registers must be an array.');
        return;
    }
    payload.registers.forEach((register, index) => {
        const registerPath = [...path, 'registers', index];
        if (!isRecord(register)) {
            sink.add('EXT-433', registerPath, 'HDL state register must be an object.');
            return;
        }
        validateHDLEndpoint(register.target, context, [...registerPath, 'target'], sink);
        if (register.enable !== undefined) {
            validateHDLExpression(register.enable, context, [...registerPath, 'enable'], sink);
        }
        validateHDLExpression(register.next, context, [...registerPath, 'next'], sink);
        if (register.resetValue !== undefined) {
            validateHDLExpression(register.resetValue, context, [...registerPath, 'resetValue'], sink);
        }
        if (register.clockResetDomain !== undefined &&
            typeof register.clockResetDomain !== 'string') {
            sink.add('EXT-434', [...registerPath, 'clockResetDomain'], 'clockResetDomain must be a string.');
        }
    });
}
function validateHDLExpression(expr, context, path, sink) {
    if (!isRecord(expr)) {
        sink.add('EXT-422', path, 'HDL expression must be an object.');
        return;
    }
    if (expr.kind === 'endpoint') {
        validateHDLEndpoint(expr.endpoint, context, [...path, 'endpoint'], sink);
        return;
    }
    if (expr.kind === 'constant') {
        if (typeof expr.value !== 'string' &&
            typeof expr.value !== 'number' &&
            typeof expr.value !== 'boolean') {
            sink.add('EXT-423', [...path, 'value'], 'HDL constant must be a string, number, or boolean.');
        }
        if (expr.width !== undefined &&
            (typeof expr.width !== 'number' ||
                !Number.isInteger(expr.width) ||
                expr.width <= 0)) {
            sink.add('EXT-424', [...path, 'width'], 'HDL constant width must be a positive integer.');
        }
        return;
    }
    if (expr.kind === 'unary') {
        if (!isOneOf(expr.op, ['~', '!', '-'])) {
            sink.add('EXT-425', [...path, 'op'], 'Unsupported HDL unary operator.');
        }
        validateHDLExpression(expr.expr, context, [...path, 'expr'], sink);
        return;
    }
    if (expr.kind === 'reduction') {
        if (!isOneOf(expr.op, ['&', '|', '^', '~&', '~|', '~^'])) {
            sink.add('EXT-425', [...path, 'op'], 'Unsupported HDL reduction operator.');
        }
        validateHDLExpression(expr.expr, context, [...path, 'expr'], sink);
        return;
    }
    if (expr.kind === 'binary') {
        if (!isOneOf(expr.op, ['+', '-', '*', '&', '|', '^', '==', '!=', '<', '<=', '>', '>='])) {
            sink.add('EXT-426', [...path, 'op'], 'Unsupported HDL binary operator.');
        }
        validateHDLExpression(expr.left, context, [...path, 'left'], sink);
        validateHDLExpression(expr.right, context, [...path, 'right'], sink);
        return;
    }
    if (expr.kind === 'mux') {
        validateHDLExpression(expr.cond, context, [...path, 'cond'], sink);
        validateHDLExpression(expr.then, context, [...path, 'then'], sink);
        validateHDLExpression(expr.else, context, [...path, 'else'], sink);
        return;
    }
    if (expr.kind === 'concat') {
        if (!Array.isArray(expr.items) || expr.items.length === 0) {
            sink.add('EXT-427', [...path, 'items'], 'HDL concat items must be a non-empty array.');
            return;
        }
        expr.items.forEach((item, index) => validateHDLExpression(item, context, [...path, 'items', index], sink));
        return;
    }
    if (expr.kind === 'cast') {
        validateHDLExpression(expr.expr, context, [...path, 'expr'], sink);
        validateOptionalBoolean(expr.signed, [...path, 'signed'], sink);
        if (expr.width !== undefined &&
            (typeof expr.width !== 'number' ||
                !Number.isInteger(expr.width) ||
                expr.width <= 0)) {
            sink.add('EXT-424', [...path, 'width'], 'HDL cast width must be a positive integer.');
        }
        return;
    }
    sink.add('EXT-428', [...path, 'kind'], 'Unsupported HDL expression kind.');
}
function validateHDLEndpoint(endpoint, context, path, sink) {
    if (!isRecord(endpoint) || !isRecord(endpoint.owner)) {
        sink.add('EXT-429', path, 'HDL endpoint must include an owner object.');
        return;
    }
    const owner = endpoint.owner;
    if (owner.kind === 'lu') {
        validatePortKey(endpoint.portKey, context, [...path, 'portKey'], sink);
    }
    else if (owner.kind === 'lui') {
        validateLUIId(owner.luiId, context, [...path, 'owner', 'luiId'], sink);
        const luiId = typeof owner.luiId === 'string' ? owner.luiId : undefined;
        validateEndpointOwnerPortKey(luiId ? context.core?.luis[luiId]?.ports : undefined, endpoint.portKey, [...path, 'portKey'], sink);
    }
    else if (owner.kind === 'closure') {
        validateClosureId(owner.closureId, context, [...path, 'owner', 'closureId'], sink);
        const closureId = typeof owner.closureId === 'string' ? owner.closureId : undefined;
        validateEndpointOwnerPortKey(closureId ? context.core?.closures[closureId]?.core.ports : undefined, endpoint.portKey, [...path, 'portKey'], sink);
    }
    else {
        sink.add('EXT-430', [...path, 'owner', 'kind'], 'Unsupported HDL endpoint owner kind.');
    }
    if (endpoint.payloadPath !== undefined &&
        !isPayloadPath(endpoint.payloadPath)) {
        sink.add('EXT-431', [...path, 'payloadPath'], 'payloadPath must be an array of strings or numbers.');
    }
}
function validateEndpointOwnerPortKey(ports, value, path, sink) {
    if (typeof value !== 'string' || value.length === 0) {
        sink.add('EXT-519', path, 'portKey must be a non-empty string.');
        return;
    }
    if (ports && !hasOwn(ports, value)) {
        sink.add('EXT-520', path, `Unknown port '${value}'.`);
    }
}
function validateStructuralSlicesPayload(payload, context, path, capability, extension, sink) {
    if (!isPlainObject(payload.slices)) {
        sink.add('EXT-413', [...path, 'slices'], 'Structural slices must be an object.');
    }
    else {
        for (const [anchorKey, slice] of Object.entries(payload.slices)) {
            if (context.core?.kindOrganization.kind === 'structural' &&
                !hasOwn(context.core.kindOrganization.exportAnchors, anchorKey)) {
                sink.add('EXT-414', [...path, 'slices', anchorKey], `Structural slice references unknown export anchor '${anchorKey}'.`);
            }
            validateStructuralSlice(slice, context, [...path, 'slices', anchorKey], sink);
        }
    }
    if (payload.bus !== undefined) {
        if (!isRecord(payload.bus)) {
            sink.add('EXT-415', [...path, 'bus'], 'Structural slice bus must be an object.');
        }
        else {
            validateRequiredEnum(payload.bus.routing, ['payload-path', 'pin-channel', 'custom'], [...path, 'bus', 'routing'], 'EXT-416', sink);
            if (payload.bus.channelPath !== undefined &&
                !isPayloadPath(payload.bus.channelPath)) {
                sink.add('EXT-417', [...path, 'bus', 'channelPath'], 'Bus channelPath must be a payload path.');
            }
        }
    }
    if (payload.fanIn !== undefined) {
        if (!isPlainObject(payload.fanIn)) {
            sink.add('EXT-440', [...path, 'fanIn'], 'Structural slice fanIn must be an object.');
        }
        else {
            for (const [anchorKey, fanIn] of Object.entries(payload.fanIn)) {
                if (context.core?.kindOrganization.kind === 'structural' &&
                    !hasOwn(context.core.kindOrganization.exportAnchors, anchorKey)) {
                    sink.add('EXT-441', [...path, 'fanIn', anchorKey], `Structural slice fanIn references unknown export anchor '${anchorKey}'.`);
                }
                validateStructuralSliceFanIn(fanIn, [...path, 'fanIn', anchorKey], sink);
            }
        }
    }
    requireHDLCapability(capability?.structuralSlices, extension, path, 'structural-slices', sink);
}
function validateStructuralSlice(value, context, path, sink) {
    if (!isRecord(value)) {
        sink.add('EXT-418', path, 'Structural slice entry must be an object.');
        return;
    }
    validateOptionalString(value.moduleName, [...path, 'moduleName'], sink);
    validateOptionalString(value.placement, [...path, 'placement'], sink);
    validateOptionalString(value.txPort, [...path, 'txPort'], sink);
    validateOptionalString(value.rxPort, [...path, 'rxPort'], sink);
    validateOptionalHDLSliceInterface(value.tx, [...path, 'tx'], sink);
    validateOptionalHDLSliceInterface(value.rx, [...path, 'rx'], sink);
}
function validateStructuralSliceFanIn(value, path, sink) {
    if (!isRecord(value)) {
        sink.add('EXT-442', path, 'Structural slice fanIn entry must be an object.');
        return;
    }
    validateRequiredEnum(value.policy, ['or', 'and', 'xor'], [...path, 'policy'], 'EXT-443', sink);
}
function validateOptionalHDLSliceInterface(value, path, sink) {
    if (value === undefined) {
        return;
    }
    if (!isRecord(value)) {
        sink.add('EXT-437', path, 'HDL structural slice interface must be an object.');
        return;
    }
    validateOptionalString(value.portName, [...path, 'portName'], sink);
    if (typeof value.width !== 'number' ||
        !Number.isInteger(value.width) ||
        value.width <= 0) {
        sink.add('EXT-438', [...path, 'width'], 'HDL structural slice interface width must be a positive integer.');
    }
    validateOptionalBoolean(value.signed, [...path, 'signed'], sink);
    validateOptionalBoolean(value.packed, [...path, 'packed'], sink);
    validateOptionalEnum(value.encoding, ['bits', 'one-hot', 'gray', 'custom'], [...path, 'encoding'], 'EXT-439', sink);
}
function validateCapabilityEnum(value, allowed, supported, extension, path, code, label, sink) {
    if (!isOneOf(value, allowed)) {
        sink.add(code, path, `Unsupported ${label}.`);
        return;
    }
    if (supported &&
        !supported.includes(value) &&
        extension.requirement === 'required') {
        sink.add(code, path, `Projector does not support required ${label} '${value}'.`);
    }
}
function validateHookList(value, allowed, supported, extension, path, code, sink) {
    if (!Array.isArray(value)) {
        sink.add(code, path, 'hooks must be an array.');
        return;
    }
    value.forEach((hook, index) => {
        if (!isOneOf(hook, allowed)) {
            sink.add(code, [...path, index], 'Unsupported lifecycle hook.');
            return;
        }
        if (supported &&
            !supported.includes(hook) &&
            extension.requirement === 'required') {
            sink.add(code, [...path, index], `Projector does not support required lifecycle hook '${hook}'.`);
        }
    });
}
function validateOptionalSelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-500', path, 'Selector must be an object.');
        return;
    }
    if (selector.portKey !== undefined) {
        if (selector.luiId !== undefined) {
            validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
            if (typeof selector.luiId === 'string' &&
                typeof selector.portKey === 'string') {
                const lui = context.core?.luis[selector.luiId];
                if (!lui || !hasOwn(lui.ports, selector.portKey)) {
                    sink.add('EXT-520', [...path, 'portKey'], `Unknown port '${selector.portKey}'.`);
                }
            }
        }
        else {
            validatePortKey(selector.portKey, context, [...path, 'portKey'], sink);
        }
    }
    else if (selector.luiId !== undefined) {
        validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
    }
    if (selector.pinKey !== undefined && typeof selector.pinKey !== 'string') {
        sink.add('EXT-501', [...path, 'pinKey'], 'pinKey must be a string.');
    }
    if (selector.payloadPath !== undefined &&
        !isPayloadPath(selector.payloadPath)) {
        sink.add('EXT-502', [...path, 'payloadPath'], 'payloadPath must be an array of strings or numbers.');
    }
}
function validateOptionalPortCompatibilitySelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-503', path, 'Selector must be an object.');
        return;
    }
    if (selector.connectionId !== undefined) {
        validateConnectionId(selector.connectionId, context, [...path, 'connectionId'], sink);
    }
    for (const side of ['from', 'to']) {
        const endpoint = selector[side];
        if (endpoint === undefined) {
            continue;
        }
        if (!isRecord(endpoint)) {
            sink.add('EXT-504', [...path, side], `${side} selector must be an object.`);
            continue;
        }
        validatePortKey(endpoint.portKey, context, [...path, side, 'portKey'], sink);
        if (endpoint.payloadPath !== undefined &&
            !isPayloadPath(endpoint.payloadPath)) {
            sink.add('EXT-505', [...path, side, 'payloadPath'], 'payloadPath must be an array of strings or numbers.');
        }
    }
}
function validateCompositionSelector(selector, context, path, sink) {
    if (!isRecord(selector)) {
        sink.add('EXT-506', path, 'Composition selector must be an object.');
        return;
    }
    if (selector.anchorKey === undefined && selector.outletKey === undefined) {
        sink.add('EXT-507', path, 'Composition selector must name an anchorKey or outletKey.');
    }
    if (selector.anchorKey !== undefined) {
        if (typeof selector.anchorKey !== 'string') {
            sink.add('EXT-508', [...path, 'anchorKey'], 'anchorKey must be a string.');
        }
        else if (context.compositionSurface &&
            !hasOwn(context.compositionSurface.anchors, selector.anchorKey)) {
            sink.add('EXT-509', [...path, 'anchorKey'], `Unknown composition anchor '${selector.anchorKey}'.`);
        }
    }
    if (selector.outletKey !== undefined) {
        if (typeof selector.outletKey !== 'string') {
            sink.add('EXT-510', [...path, 'outletKey'], 'outletKey must be a string.');
        }
        else if (context.compositionSurface &&
            !context.compositionSurface.outlets.includes(selector.outletKey)) {
            sink.add('EXT-511', [...path, 'outletKey'], `Unknown composition outlet '${selector.outletKey}'.`);
        }
    }
}
function validateStepLUISelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-512', path, 'Selector must be an object.');
        return;
    }
    if (selector.stepIndex !== undefined) {
        validateStepIndex(selector.stepIndex, context, [...path, 'stepIndex'], sink);
    }
    if (selector.luiId !== undefined) {
        validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
    }
}
function validateStepLUIPortSelector(selector, context, path, sink) {
    validateStepLUISelector(selector, context, path, sink);
    if (selector !== undefined && isRecord(selector) && selector.portKey !== undefined) {
        validatePortKey(selector.portKey, context, [...path, 'portKey'], sink);
    }
}
function validateLUIClosureSelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-513', path, 'Selector must be an object.');
        return;
    }
    if (selector.luiId !== undefined) {
        validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
    }
    if (selector.closureId !== undefined) {
        validateClosureId(selector.closureId, context, [...path, 'closureId'], sink);
    }
}
function validateLUIPortSelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-514', path, 'Selector must be an object.');
        return;
    }
    if (selector.luiId !== undefined) {
        validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
    }
    if (selector.portKey !== undefined) {
        validatePortKey(selector.portKey, context, [...path, 'portKey'], sink);
    }
}
function validateLUIConnectionSelector(selector, context, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-515', path, 'Selector must be an object.');
        return;
    }
    if (selector.luiId !== undefined) {
        validateLUIId(selector.luiId, context, [...path, 'luiId'], sink);
    }
    if (selector.connectionId !== undefined) {
        validateConnectionId(selector.connectionId, context, [...path, 'connectionId'], sink);
    }
}
function validateServiceUnitSelector(selector, path, sink) {
    if (selector === undefined) {
        return;
    }
    if (!isRecord(selector)) {
        sink.add('EXT-516', path, 'Selector must be an object.');
        return;
    }
    if (selector.serviceKey !== undefined && typeof selector.serviceKey !== 'string') {
        sink.add('EXT-517', [...path, 'serviceKey'], 'serviceKey must be a string.');
    }
    if (selector.unitKey !== undefined && typeof selector.unitKey !== 'string') {
        sink.add('EXT-518', [...path, 'unitKey'], 'unitKey must be a string.');
    }
}
function validatePortKey(value, context, path, sink) {
    if (typeof value !== 'string' || value.length === 0) {
        sink.add('EXT-519', path, 'portKey must be a non-empty string.');
        return;
    }
    if (context.ports && !hasOwn(context.ports, value)) {
        sink.add('EXT-520', path, `Unknown port '${value}'.`);
    }
}
function validateLUIId(value, context, path, sink) {
    if (typeof value !== 'string' || value.length === 0) {
        sink.add('EXT-521', path, 'luiId must be a non-empty string.');
        return;
    }
    if (context.core && !hasOwn(context.core.luis, value)) {
        sink.add('EXT-522', path, `Unknown LUI '${value}'.`);
    }
}
function validateConnectionId(value, context, path, sink) {
    if (typeof value !== 'string' || value.length === 0) {
        sink.add('EXT-523', path, 'connectionId must be a non-empty string.');
        return;
    }
    if (context.core && !hasOwn(context.core.connections, value)) {
        sink.add('EXT-524', path, `Unknown connection '${value}'.`);
    }
}
function validateClosureId(value, context, path, sink) {
    if (typeof value !== 'string' || value.length === 0) {
        sink.add('EXT-525', path, 'closureId must be a non-empty string.');
        return;
    }
    if (context.core && !hasOwn(context.core.closures, value)) {
        sink.add('EXT-526', path, `Unknown closure '${value}'.`);
    }
}
function validateStepIndex(value, context, path, sink) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        sink.add('EXT-527', path, 'stepIndex must be a non-negative integer.');
        return;
    }
    if (context.core?.kindOrganization.kind === 'sequential' &&
        value >= context.core.kindOrganization.steps.length) {
        sink.add('EXT-528', path, `Sequential stepIndex '${value}' is out of range.`);
    }
}
function validateRequiredEnum(value, allowed, path, code, sink) {
    if (!isOneOf(value, allowed)) {
        sink.add(code, path, 'Unsupported enum value.');
    }
}
function validateOptionalEnum(value, allowed, path, code, sink) {
    if (value !== undefined && !isOneOf(value, allowed)) {
        sink.add(code, path, 'Unsupported enum value.');
    }
}
function validateOptionalBoolean(value, path, sink) {
    if (value !== undefined && typeof value !== 'boolean') {
        sink.add('EXT-529', path, 'Expected a boolean.');
    }
}
function validateOptionalString(value, path, sink) {
    if (value !== undefined && typeof value !== 'string') {
        sink.add('EXT-530', path, 'Expected a string.');
    }
}
function validateNamespaceKey(value, path, sink, allowVersion = false) {
    if (!isRecord(value)) {
        sink.add('EXT-531', path, 'Expected an object with namespace and key.');
        return;
    }
    if (typeof value.namespace !== 'string' || value.namespace.length === 0) {
        sink.add('EXT-532', [...path, 'namespace'], 'namespace must be a non-empty string.');
    }
    if (typeof value.key !== 'string' || value.key.length === 0) {
        sink.add('EXT-533', [...path, 'key'], 'key must be a non-empty string.');
    }
    if (allowVersion &&
        value.version !== undefined &&
        typeof value.version !== 'string') {
        sink.add('EXT-534', [...path, 'version'], 'version must be a string.');
    }
}
function validateOptionalStringMap(value, path, sink) {
    if (value === undefined) {
        return;
    }
    if (!isPlainObject(value)) {
        sink.add('EXT-535', path, 'Expected a string map.');
        return;
    }
    for (const [key, item] of Object.entries(value)) {
        if (typeof item !== 'string') {
            sink.add('EXT-535', [...path, key], 'Expected a string.');
        }
    }
}
function validateOptionalStringBooleanNumberMap(value, path, sink) {
    if (value === undefined) {
        return;
    }
    if (!isPlainObject(value)) {
        sink.add('EXT-536', path, 'Expected a parameter map.');
        return;
    }
    for (const [key, item] of Object.entries(value)) {
        if (typeof item !== 'string' &&
            typeof item !== 'number' &&
            typeof item !== 'boolean') {
            sink.add('EXT-536', [...path, key], 'Parameter values must be strings, numbers, or booleans.');
        }
    }
}
function requireHDLCapability(supported, extension, path, label, sink) {
    if (supported === false && extension.requirement === 'required') {
        sink.add('EXT-419', path, `Projector does not support required HDL ${label}.`);
    }
}
function walkLogicUnitExtensions(unit, visit) {
    visitExtensionList(unit.extensions, { unit, core: unit.core, path: [] }, ['extensions'], visit);
    walkRequirementSurface(unit.requirements, unit, ['requirements'], visit);
    walkCore(unit.core, unit, ['core'], visit);
}
function walkCore(core, unit, path, visit) {
    visitExtensionList(core.extensions, { unit, core, ports: core.ports, path }, [...path, 'extensions'], visit);
    walkPorts(core.ports, { unit, core, ports: core.ports, path }, [...path, 'ports'], visit);
    for (const [luiId, lui] of Object.entries(core.luis)) {
        walkLUI(lui, unit, core, [...path, 'luis', luiId], visit);
    }
    for (const [connectionId, connection] of Object.entries(core.connections)) {
        visitExtensionList(connection.extensions, { unit, core, connectionId, path: [...path, 'connections', connectionId] }, [...path, 'connections', connectionId, 'extensions'], visit);
    }
    for (const [closureId, closure] of Object.entries(core.closures)) {
        const closurePath = [...path, 'closures', closureId];
        visitExtensionList(closure.extensions, { unit, core, path: closurePath }, [...closurePath, 'extensions'], visit);
        walkCore(closure.core, unit, [...closurePath, 'core'], visit);
    }
}
function walkLUI(lui, unit, core, path, visit) {
    const compositionSurface = lui.kind === 'structural' ? lui.compositionSurface : undefined;
    visitExtensionList(lui.extensions, { unit, core, ports: lui.ports, compositionSurface, path }, [...path, 'extensions'], visit);
    walkPorts(lui.ports, { unit, core, ports: lui.ports, path }, [...path, 'ports'], visit);
    if (lui.kind === 'structural') {
        visitExtensionList(lui.compositionSurface.extensions, {
            unit,
            core,
            ports: lui.ports,
            compositionSurface: lui.compositionSurface,
            path: [...path, 'compositionSurface'],
        }, [...path, 'compositionSurface', 'extensions'], visit);
    }
    for (const [serviceKey, fulfillment] of Object.entries(lui.fulfillments)) {
        walkRequirementServiceFulfillment(fulfillment, unit, core, [...path, 'fulfillments', serviceKey], visit);
    }
}
function walkPorts(ports, context, path, visit) {
    for (const [portKey, port] of Object.entries(ports)) {
        visitExtensionList(port.extensions, { ...context, ports, portKey, path: [...path, portKey] }, [...path, portKey, 'extensions'], visit);
    }
}
function walkRequirementSurface(surface, unit, path, visit) {
    for (const [serviceKey, entry] of Object.entries(surface)) {
        if (entry.kind === 'inline') {
            walkRequirementService(entry.service, unit, [...path, serviceKey, 'service'], visit);
        }
    }
}
function walkRequirementService(service, unit, path, visit) {
    visitExtensionList(service.extensions, { unit, ports: undefined, path }, [...path, 'extensions'], visit);
    for (const [unitKey, requirementUnit] of Object.entries(service.units)) {
        const unitPath = [...path, 'units', unitKey];
        walkPorts(requirementUnit.ports, { unit, ports: requirementUnit.ports, path: unitPath }, [...unitPath, 'ports'], visit);
        if (hasNestedRequirementSurface(requirementUnit)) {
            walkRequirementSurface(requirementUnit.requirements, unit, [...unitPath, 'requirements'], visit);
        }
        if (requirementUnit.kind === 'structural') {
            visitExtensionList(requirementUnit.compositionSurface.extensions, {
                unit,
                ports: requirementUnit.ports,
                compositionSurface: requirementUnit.compositionSurface,
                path: [...unitPath, 'compositionSurface'],
            }, [...unitPath, 'compositionSurface', 'extensions'], visit);
        }
    }
}
function walkRequirementServiceFulfillment(fulfillment, unit, core, path, visit) {
    visitExtensionList(fulfillment.extensions, { unit, core, path }, [...path, 'extensions'], visit);
    if (fulfillment.kind === 'independent-units') {
        for (const [unitKey, unitFulfillment] of Object.entries(fulfillment.units)) {
            walkUnitFulfillment(unitFulfillment, unit, core, [...path, 'units', unitKey], visit);
        }
    }
}
function walkUnitFulfillment(fulfillment, unit, core, path, visit) {
    visitExtensionList(fulfillment.extensions, { unit, core, path }, [...path, 'extensions'], visit);
}
function visitExtensionList(extensions, context, path, visit) {
    extensions?.forEach((extension, index) => {
        visit(extension, context, [...path, index]);
    });
}
function classifyExtension(extension) {
    const namespace = extension.feature.namespace;
    if (namespace === TYPE_SYSTEM_NAMESPACE) {
        const key = resolveKnownKey(extension, TYPE_SYSTEM_KEYS);
        return key ? { family: 'type-system', key } : undefined;
    }
    if (namespace === JS_RUNTIME_NAMESPACE) {
        const key = resolveKnownKey(extension, JS_RUNTIME_KEYS);
        return key ? { family: 'js-runtime', key } : undefined;
    }
    if (namespace === PYTHON_RUNTIME_NAMESPACE) {
        const key = resolveKnownKey(extension, PYTHON_RUNTIME_KEYS);
        return key ? { family: 'python-runtime', key } : undefined;
    }
    if (namespace === VERILOG_HDL_NAMESPACE) {
        const key = resolveKnownKey(extension, VERILOG_HDL_KEYS);
        return key ? { family: 'verilog-hdl', key } : undefined;
    }
    return undefined;
}
function resolveKnownKey(extension, keys) {
    if (isOneOf(extension.key, keys)) {
        return extension.key;
    }
    if (isOneOf(extension.feature.key, keys)) {
        return extension.feature.key;
    }
    return undefined;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isPlainObject(value) {
    return isRecord(value);
}
function isOneOf(value, values) {
    return typeof value === 'string' && values.includes(value);
}
function isPayloadPath(value) {
    return (Array.isArray(value) &&
        value.every((segment) => typeof segment === 'string' ||
            (typeof segment === 'number' && Number.isInteger(segment))));
}
function selectorPayloadPath(selector) {
    if (isRecord(selector) &&
        selector.payloadPath !== undefined &&
        isPayloadPath(selector.payloadPath)) {
        return selector.payloadPath;
    }
    return [];
}
function samePath(left, right) {
    return (left.length === right.length &&
        left.every((segment, index) => segment === right[index]));
}
function isPrefix(left, right) {
    if (left.length > right.length) {
        return false;
    }
    return left.every((segment, index) => segment === right[index]);
}
function isValidPathNode(value) {
    if (!isRecord(value) ||
        !isOneOf(value.kind, ['leaf', 'record', 'tuple', 'array'])) {
        return false;
    }
    if (value.kind === 'leaf') {
        return typeof value.type === 'string' && value.type.length > 0;
    }
    if (value.kind === 'record') {
        return (isPlainObject(value.fields) &&
            Object.values(value.fields).every((field) => isValidPathNode(field)));
    }
    if (value.kind === 'tuple') {
        return Array.isArray(value.items) && value.items.every(isValidPathNode);
    }
    return isValidPathNode(value.item);
}
function isValidTypeExpression(value) {
    if (!isRecord(value) || !isOneOf(value.kind, TYPE_FORMS)) {
        return false;
    }
    if (value.kind === 'primitive') {
        return isOneOf(value.name, ['bool', 'int', 'float', 'string']);
    }
    if (value.kind === 'named') {
        return (typeof value.namespace === 'string' &&
            value.namespace.length > 0 &&
            typeof value.key === 'string' &&
            value.key.length > 0);
    }
    if (value.kind === 'record') {
        return (isPlainObject(value.fields) &&
            Object.values(value.fields).every((field) => isValidTypeField(field)));
    }
    if (value.kind === 'array') {
        const length = value.length;
        return (isValidTypeExpression(value.item) &&
            (length === undefined ||
                (typeof length === 'number' &&
                    Number.isInteger(length) &&
                    length >= 0)));
    }
    if (value.kind === 'union') {
        return (Array.isArray(value.variants) &&
            value.variants.length > 0 &&
            value.variants.every(isValidTypeExpression));
    }
    return Array.isArray(value.items) && value.items.every(isValidTypeExpression);
}
function isValidTypeField(value) {
    if (isTypeField(value)) {
        return (isValidTypeExpression(value.type) &&
            (value.optional === undefined || typeof value.optional === 'boolean'));
    }
    return isValidTypeExpression(value);
}
function validateTypeField(value, path, capability, extension, sink) {
    if (isTypeField(value)) {
        if (value.optional !== undefined && typeof value.optional !== 'boolean') {
            sink.add('EXT-139', [...path, 'optional'], 'Record field optional flag must be a boolean.');
        }
        validateTypeExpression(value.type, [...path, 'type'], capability, extension, sink);
        return;
    }
    validateTypeExpression(value, path, capability, extension, sink);
}
function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}
function hasNestedRequirementSurface(unit) {
    return isRecord(unit) && isPlainObject(unit.requirements);
}
function isStructuralCore(core) {
    return core.kindOrganization.kind === 'structural';
}
function isCompositionLeaf(value) {
    return (value.kind === 'lui-outlet' ||
        value.kind === 'external-outlet' ||
        value.kind === 'empty');
}
