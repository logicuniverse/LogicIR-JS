/**
 * LogicIR core v0 draft validator.
 *
 * This validator is intentionally target-neutral. It performs local checks that
 * do not require JS/Python runtime behavior, HDL lowering, or a target registry.
 */

import { LOGIC_IR_CORE_SCHEMA_VERSION } from './types';
import type {
  Closure,
  CompositionAnchor,
  CompositionLeaf,
  CompositionValue,
  Connection,
  EndpointRef,
  ExternalTargetKey,
  ExternalTargetNamespace,
  ExtensionRecord,
  LogicUnit,
  LUCore,
  LUKind,
  LUI,
  PlainRequirementService,
  PlainRequirementServiceEntry,
  PlainRequirementSurface,
  PlainRequirementUnit,
  Port,
  PortBoundary,
  PortOwner,
  PortSurface,
  RequirementServiceKey,
  RequirementService,
  RequirementServiceEntry,
  RequirementSurface,
  RequirementServiceFulfillment,
  RequirementUnitKey,
  RequirementUnit,
  StructuralLUCore,
  UnitFulfillment,
} from './types';
import type { ProjectorCapabilitySet } from '../../projection/types';

export type ValidationSeverity = 'error' | 'warning';

export type ValidationDiagnostic = {
  rule: string;
  severity: ValidationSeverity;
  path: (string | number)[];
  message: string;
};

export type ExternalTargetContract = {
  kind: LUKind;
  ports: PortSurface;
  compositionSurface?: {
    outlets: string[];
    anchors: Record<string, CompositionAnchor>;
    extensions?: ExtensionRecord[];
  };
  requirements?: RequirementSurfaceLike;
};

export type ValidationContext = {
  capabilities?: ProjectorCapabilitySet;
  resolveLogicUnit?: (luId: string) => LogicUnit | undefined;
  resolveExternalTarget?: (
    namespace: ExternalTargetNamespace,
    key: ExternalTargetKey
  ) => ExternalTargetContract | undefined;
  resolveRequirementService?: (
    namespace: string,
    key: string
  ) => RequirementService | undefined;
};

type EndpointResolution = {
  port?: Port;
  boundary?: PortBoundary;
  exists: boolean;
  ownerExists: boolean;
};

type RequirementSurfaceLike =
  | RequirementSurface
  | PlainRequirementSurface;

type SupplyLineageEntry = {
  closureId: string;
  requirements: RequirementSurfaceLike;
};

export function validateLogicUnit(
  unit: LogicUnit,
  context: ValidationContext = {}
): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];
  const add = (
    rule: string,
    path: (string | number)[],
    message: string,
    severity: ValidationSeverity = 'error'
  ) => {
    diagnostics.push({ rule, severity, path, message });
  };

  if (unit.schemaVersion !== LOGIC_IR_CORE_SCHEMA_VERSION) {
    add('VAL-001', ['schemaVersion'], 'Unsupported core schema version.');
  }

  validateExtensions(unit.extensions, ['extensions'], context, add);
  validateRequirementSurface(unit.requirements, ['requirements'], context, add);
  validateCore(unit.core, ['core'], context, add, unit.requirements);

  return diagnostics;
}

function validateCore(
  core: LUCore,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  localRequirements: RequirementSurfaceLike = {},
  supplyLineage: SupplyLineageEntry[] = []
): void {
  validateExtensions(core.extensions, [...path, 'extensions'], context, add);
  validatePortSurface(core.ports, [...path, 'ports'], add, true);
  validateLUIKindMatrix(core, path, add);

  for (const [luiId, lui] of Object.entries(core.luis)) {
    validateLUI(
      lui,
      [...path, 'luis', luiId],
      context,
      add,
      localRequirements,
      core,
      supplyLineage
    );
  }

  if (core.kindOrganization.kind === 'sequential') {
    core.kindOrganization.steps.forEach((luiId, index) => {
      if (!hasOwn(core.luis, luiId)) {
        add(
          'VAL-016',
          [...path, 'kindOrganization', 'steps', index],
          `Sequential step references missing LUI '${luiId}'.`
        );
      }
    });
  }

  if (isStructuralCore(core)) {
    validateStructuralCore(core, path, add);
  }

  validateConnections(core, path, add);

  for (const [closureId, closure] of Object.entries(core.closures)) {
    validateClosure(
      closure,
      closureId,
      [...path, 'closures', closureId],
      context,
      add,
      localRequirements,
      supplyLineage
    );
  }
}

function validatePortSurface(
  ports: PortSurface,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  checkPrimaryResult: boolean
): void {
  let primaryResultCount = 0;

  for (const [portKey, port] of Object.entries(ports)) {
    const portPath = [...path, portKey];
    if (!port.interaction.pullReadable && !port.interaction.pushNotifiable) {
      add(
        'VAL-005',
        [...portPath, 'interaction'],
        'Port must be pull-readable, push-notifiable, or both.'
      );
    }

    if (port.interaction.retainedCurrent && !port.interaction.pullReadable) {
      add(
        'VAL-006',
        [...portPath, 'interaction', 'retainedCurrent'],
        'retainedCurrent requires pullReadable.'
      );
    }

    if (port.role === 'primary-result') {
      primaryResultCount += 1;
      if (checkPrimaryResult && port.boundary !== 'output') {
        add(
          'VAL-007',
          [...portPath, 'role'],
          'primary-result must be on an output boundary port.'
        );
      }
    }

    if (port.pins?.kind === 'indexed') {
      if (
        !Number.isInteger(port.pins.count) ||
        port.pins.count < 0
      ) {
        add(
          'VAL-008',
          [...portPath, 'pins', 'count'],
          'Indexed pin count must be a non-negative integer.'
        );
      }
    }

    if (port.pins?.kind === 'keyed') {
      validateNoDuplicates(
        port.pins.keys,
        [...portPath, 'pins', 'keys'],
        'VAL-008',
        'Duplicate keyed pin.',
        add
      );
    }
  }

  if (checkPrimaryResult && primaryResultCount > 1) {
    add(
      'VAL-007',
      path,
      'A LU port surface must declare at most one primary-result port.'
    );
  }
}

function validateLUI(
  lui: LUI,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  localRequirements: RequirementSurfaceLike,
  containingCore: LUCore,
  supplyLineage: SupplyLineageEntry[]
): void {
  validateExtensions(lui.extensions, [...path, 'extensions'], context, add);
  validatePortSurface(lui.ports, [...path, 'ports'], add, false);

  if (lui.kind === 'structural') {
    validateCompositionContract(
      lui.compositionSurface,
      [...path, 'compositionSurface'],
      context,
      add
    );
  }

  const targetContract = resolveLUITargetContract(
    lui,
    path,
    localRequirements,
    context,
    add
  );
  if (targetContract) {
    validateLUITargetCompatibility(lui, targetContract, path, add);
  }

  for (const [serviceKey, fulfillment] of Object.entries(lui.fulfillments)) {
    const service = targetContract?.requirements?.[serviceKey];
    if (!service) {
      add(
        'VAL-035',
        [...path, 'fulfillments', serviceKey],
        `Fulfillment references unknown derived requirement service '${serviceKey}'.`
      );
    }
    const resolvedService = resolveRequirementEntry(service, context);
    validateRequirementFulfillment(
      fulfillment,
      [...path, 'fulfillments', serviceKey],
      context,
      add,
      resolvedService,
      containingCore,
      localRequirements,
      supplyLineage
    );
  }
}

function validateCompositionContract(
  contract: {
    outlets: string[];
    anchors: Record<string, CompositionAnchor>;
    extensions?: ExtensionRecord[];
  },
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  validateExtensions(contract.extensions, [...path, 'extensions'], context, add);
  validateNoDuplicates(
    contract.outlets,
    [...path, 'outlets'],
    'VAL-022',
    'Duplicate composition outlet key.',
    add
  );
}

type TargetContract = {
  kind: LUKind;
  ports: PortSurface;
  compositionSurface?: {
    outlets: string[];
    anchors: Record<string, CompositionAnchor>;
    extensions?: ExtensionRecord[];
  };
  requirements?: RequirementSurfaceLike;
};

function resolveLUITargetContract(
  lui: LUI,
  path: (string | number)[],
  localRequirements: RequirementSurfaceLike,
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): TargetContract | undefined {
  if (lui.target.kind === 'lu') {
    const target = context.resolveLogicUnit?.(lui.target.luId);
    if (!target) {
      return undefined;
    }
    const kind = target.core.kindOrganization.kind;
    return {
      kind,
      ports: target.core.ports,
      requirements: target.requirements,
      compositionSurface:
        kind === 'structural'
          ? {
              outlets: Object.keys(target.core.kindOrganization.exportAnchors),
              anchors: target.core.kindOrganization.externalOutlets,
            }
          : undefined,
    };
  }

  if (lui.target.kind === 'external') {
    const target = context.resolveExternalTarget?.(
      lui.target.namespace,
      lui.target.key
    );
    if (!target) {
      add(
        'VAL-019',
        [...path, 'target'],
        `External target '${lui.target.namespace}/${lui.target.key}' is not resolved.`,
        'warning'
      );
      return undefined;
    }
    return target;
  }

  const serviceEntry = localRequirements[lui.target.serviceKey];
  if (!serviceEntry) {
    add(
      'VAL-018',
      [...path, 'target', 'serviceKey'],
      `Requirement service '${lui.target.serviceKey}' does not exist.`
    );
    return undefined;
  }

  const service = resolveRequirementEntry(serviceEntry, context);
  if (!service) {
    add(
      'VAL-018',
      [...path, 'target'],
      `Requirement service '${lui.target.serviceKey}' cannot be resolved.`
    );
    return undefined;
  }

  const unit = service.units[lui.target.unitKey];
  if (!unit) {
    add(
      'VAL-018',
      [...path, 'target', 'unitKey'],
      `Requirement unit '${lui.target.unitKey}' does not exist.`
    );
    return undefined;
  }

  return {
    kind: unit.kind,
    ports: unit.ports,
    requirements: hasNestedRequirements(unit) ? unit.requirements : {},
    compositionSurface:
      unit.kind === 'structural' ? unit.compositionSurface : undefined,
  };
}

function validateLUITargetCompatibility(
  lui: LUI,
  target: TargetContract,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const kindRule =
    lui.target.kind === 'lu'
      ? 'VAL-017'
      : lui.target.kind === 'requirement'
        ? 'VAL-018'
        : 'VAL-019';

  if (lui.kind !== target.kind) {
    add(
      kindRule,
      [...path, 'kind'],
      `LUI kind '${lui.kind}' does not match target kind '${target.kind}'.`
    );
  }

  for (const [portKey, port] of Object.entries(lui.ports)) {
    const targetPort = target.ports[portKey];
    if (!targetPort) {
      add(
        'VAL-020',
        [...path, 'ports', portKey],
        `LUI port '${portKey}' does not exist on target contract.`
      );
      continue;
    }
    if (port.boundary !== targetPort.boundary) {
      add(
        'VAL-020',
        [...path, 'ports', portKey, 'boundary'],
        `LUI port '${portKey}' boundary does not match target contract.`
      );
    }
    if (!sameInteraction(port, targetPort)) {
      add(
        'VAL-020',
        [...path, 'ports', portKey, 'interaction'],
        `LUI port '${portKey}' interaction does not match target contract.`
      );
    }
  }

  if (lui.kind === 'structural') {
    if (!target.compositionSurface) {
      add(
        'VAL-021',
        [...path, 'compositionSurface'],
        'Structural LUI target does not provide a composition surface.'
      );
      return;
    }

    validateResolvedCompositionSurfaceCompatibility(
      lui.compositionSurface,
      target.compositionSurface,
      [...path, 'compositionSurface'],
      add
    );
  } else if (target.compositionSurface) {
    add(
      'VAL-021',
      path,
      'Non-structural LUI targets a structural composition contract.'
    );
  }
}

function validateResolvedCompositionSurfaceCompatibility(
  local: {
    outlets: string[];
    anchors: Record<string, CompositionAnchor>;
  },
  target: {
    outlets: string[];
    anchors: Record<string, CompositionAnchor>;
  },
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  for (const outletKey of local.outlets) {
    if (!target.outlets.includes(outletKey)) {
      add(
        'VAL-021',
        [...path, 'outlets'],
        `Local outlet '${outletKey}' is not present on target composition surface.`
      );
    }
  }

  for (const [anchorKey, anchor] of Object.entries(local.anchors)) {
    const targetAnchor = target.anchors[anchorKey];
    if (!targetAnchor) {
      add(
        'VAL-021',
        [...path, 'anchors', anchorKey],
        `Local anchor '${anchorKey}' is not present on target composition surface.`
      );
      continue;
    }

    if (
      anchor.shape !== targetAnchor.shape ||
      anchor.required !== targetAnchor.required
    ) {
      add(
        'VAL-021',
        [...path, 'anchors', anchorKey],
        `Local anchor '${anchorKey}' does not match target composition surface.`
      );
    }
  }
}

function sameInteraction(left: Port, right: Port): boolean {
  return (
    left.interaction.pullReadable === right.interaction.pullReadable &&
    left.interaction.pushNotifiable === right.interaction.pushNotifiable &&
    left.interaction.retainedCurrent === right.interaction.retainedCurrent
  );
}

function validateLUIKindMatrix(
  core: LUCore,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const coreKind = core.kindOrganization.kind;
  for (const [luiId, lui] of Object.entries(core.luis)) {
    const allowed =
      coreKind === 'combinational'
        ? lui.kind === 'combinational'
        : coreKind === 'stateful'
          ? lui.kind === 'combinational' || lui.kind === 'stateful'
          : coreKind === 'sequential'
            ? lui.kind === 'combinational' ||
              lui.kind === 'stateful' ||
              lui.kind === 'sequential'
            : lui.kind === 'combinational' ||
              lui.kind === 'stateful' ||
              lui.kind === 'structural';

    if (!allowed) {
      add(
        'VAL-015',
        [...path, 'luis', luiId, 'kind'],
        `LUI kind '${lui.kind}' is not allowed in '${coreKind}' core.`
      );
    }
  }
}

function validateStructuralCore(
  core: StructuralLUCore,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const organization = core.kindOrganization;
  for (const anchorKey of Object.keys(organization.exportAnchorFills)) {
    if (!hasOwn(organization.exportAnchors, anchorKey)) {
      add(
        'VAL-023',
        [...path, 'kindOrganization', 'exportAnchorFills', anchorKey],
        `Export anchor fill references unknown export anchor '${anchorKey}'.`
      );
    }
  }

  for (const [anchorKey, anchor] of Object.entries(
    organization.exportAnchors
  )) {
    if (
      anchor.required &&
      !hasOwn(organization.exportAnchorFills, anchorKey)
    ) {
      add(
        'VAL-023',
        [...path, 'kindOrganization', 'exportAnchors', anchorKey],
        `Required export anchor '${anchorKey}' is not filled.`
      );
    }
  }

  for (const [anchorKey, leaf] of Object.entries(
    organization.exportAnchorFills
  )) {
    validateCompositionLeaf(
      leaf,
      [...path, 'kindOrganization', 'exportAnchorFills', anchorKey],
      core,
      add
    );
  }

  for (const [luiId, fills] of Object.entries(organization.luiFills)) {
    const lui = core.luis[luiId];
    if (!lui || lui.kind !== 'structural') {
      add(
        'VAL-025',
        [...path, 'kindOrganization', 'luiFills', luiId],
        `luiFills references missing or non-structural LUI '${luiId}'.`
      );
      continue;
    }

    const anchors = lui.compositionSurface.anchors;
    for (const fillKey of Object.keys(fills)) {
      if (!hasOwn(anchors, fillKey)) {
        add(
          'VAL-026',
          [
            ...path,
            'kindOrganization',
            'luiFills',
            luiId,
            fillKey,
          ],
          `Fill references unknown child anchor '${fillKey}'.`
        );
      }
    }

    for (const [anchorKey, anchor] of Object.entries(anchors)) {
      if (anchor.required && !hasOwn(fills, anchorKey)) {
        add(
          'VAL-026',
          [
            ...path,
            'kindOrganization',
            'luiFills',
            luiId,
            anchorKey,
          ],
          `Required child anchor '${anchorKey}' is not filled.`
        );
      }
    }

    for (const [anchorKey, value] of Object.entries(fills)) {
      const anchor = anchors[anchorKey];
      if (!anchor) {
        continue;
      }
      validateCompositionValueShape(
        value,
        anchor,
        [
          ...path,
          'kindOrganization',
          'luiFills',
          luiId,
          anchorKey,
        ],
        core,
        add
      );
    }
  }
}

function validateCompositionValueShape(
  value: CompositionValue,
  anchor: CompositionAnchor,
  path: (string | number)[],
  core: Extract<LUCore, { kindOrganization: { kind: 'structural' } }>,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  if (anchor.shape === 'single') {
    if (!isCompositionLeaf(value)) {
      add('VAL-027', path, 'single anchor requires a CompositionLeaf.');
      return;
    }
    validateCompositionLeaf(value, path, core, add);
    return;
  }

  if (anchor.shape === 'collection') {
    if (!('kind' in value) || value.kind !== 'collection') {
      add(
        'VAL-027',
        path,
        'collection anchor requires a collection CompositionValue.'
      );
      return;
    }
    value.items.forEach((leaf, index) =>
      validateCompositionLeaf(leaf, [...path, 'items', index], core, add)
    );
    return;
  }

  if (!('kind' in value) || value.kind !== 'map') {
    add('VAL-027', path, 'map anchor requires a map CompositionValue.');
    return;
  }

  for (const [fieldKey, leaf] of Object.entries(value.entries)) {
    validateCompositionLeaf(
      leaf,
      [...path, 'entries', fieldKey],
      core,
      add
    );
  }
}

function validateCompositionLeaf(
  leaf: CompositionLeaf,
  path: (string | number)[],
  core: Extract<LUCore, { kindOrganization: { kind: 'structural' } }>,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  if (leaf.kind === 'empty') {
    return;
  }

  if (leaf.kind === 'external-outlet') {
    if (!hasOwn(core.kindOrganization.externalOutlets, leaf.outletKey)) {
      add(
        'VAL-029',
        [...path, 'outletKey'],
        `Unknown external outlet '${leaf.outletKey}'.`
      );
    }
    return;
  }

  const lui = core.luis[leaf.luiId];
  if (!lui || lui.kind !== 'structural') {
    add(
      'VAL-028',
      [...path, 'luiId'],
      `Composition leaf references missing or non-structural LUI '${leaf.luiId}'.`
    );
    return;
  }

  if (!lui.compositionSurface.outlets.includes(leaf.outletKey)) {
    add(
      'VAL-028',
      [...path, 'outletKey'],
      `Unknown child outlet '${leaf.outletKey}'.`
    );
  }
}

function validateConnections(
  core: LUCore,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const targets: { id: string; endpoint: EndpointRef }[] = [];

  for (const [connectionId, connection] of Object.entries(core.connections)) {
    validateConnection(
      connection,
      [...path, 'connections', connectionId],
      core,
      add
    );
    targets.push({ id: connectionId, endpoint: connection.to });
  }

  for (let i = 0; i < targets.length; i += 1) {
    for (let j = i + 1; j < targets.length; j += 1) {
      const left = targets[i];
      const right = targets[j];
      if (left && right && endpointTargetsOverlap(left.endpoint, right.endpoint)) {
        add(
          'VAL-012',
          [...path, 'connections', right.id, 'to'],
          `Target endpoint overlaps with connection '${left.id}'.`
        );
      }
    }
  }
}

function validateConnection(
  connection: Connection,
  path: (string | number)[],
  core: LUCore,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const from = resolveEndpoint(core, connection.from);
  const to = resolveEndpoint(core, connection.to);

  if (!from.ownerExists) {
    add('VAL-009', [...path, 'from', 'owner'], 'Connection source owner is missing.');
  }
  if (!from.exists) {
    add('VAL-009', [...path, 'from', 'portKey'], 'Connection source port is missing.');
  }
  if (!to.ownerExists) {
    add('VAL-009', [...path, 'to', 'owner'], 'Connection target owner is missing.');
  }
  if (!to.exists) {
    add('VAL-009', [...path, 'to', 'portKey'], 'Connection target port is missing.');
  }

  if (from.port) {
    validatePayloadPathPins(
      from.port,
      connection.from,
      [...path, 'from', 'payloadPath'],
      add
    );
  }
  if (to.port) {
    validatePayloadPathPins(
      to.port,
      connection.to,
      [...path, 'to', 'payloadPath'],
      add
    );
  }

  if (from.exists && endpointGraphRole(connection.from, from.boundary) !== 'source') {
    add('VAL-010', [...path, 'from'], 'Connection from endpoint is not a graph source.');
  }
  if (to.exists && endpointGraphRole(connection.to, to.boundary) !== 'sink') {
    add('VAL-010', [...path, 'to'], 'Connection to endpoint is not a graph sink.');
  }

  if (from.port && to.port) {
    if (to.port.interaction.pullReadable && !from.port.interaction.pullReadable) {
      add(
        'VAL-011',
        path,
        'Target requires pullReadable but source does not provide it.'
      );
    }
    if (to.port.interaction.pushNotifiable && !from.port.interaction.pushNotifiable) {
      add(
        'VAL-011',
        path,
        'Target requires pushNotifiable but source does not provide it.'
      );
    }
    if (to.port.interaction.retainedCurrent && !from.port.interaction.retainedCurrent) {
      add(
        'VAL-011',
        path,
        'Target requires retainedCurrent but source does not provide it.'
      );
    }
  }
}

function validatePayloadPathPins(
  port: Port,
  endpoint: EndpointRef,
  path: (string | number)[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const payloadPath = endpoint.payloadPath;
  if (!payloadPath || !port.pins || payloadPath.length === 0) {
    return;
  }

  const [firstSegment] = payloadPath;
  if (port.pins.kind === 'indexed') {
    if (
      typeof firstSegment !== 'number' ||
      firstSegment < 0 ||
      firstSegment >= port.pins.count ||
      !Number.isInteger(firstSegment)
    ) {
      add('VAL-009', path, 'Payload path first segment does not match indexed pins.');
    }
    return;
  }

  if (
    typeof firstSegment !== 'string' ||
    !port.pins.keys.includes(firstSegment)
  ) {
    add('VAL-009', path, 'Payload path first segment does not match keyed pins.');
  }
}

function resolveEndpoint(
  core: LUCore,
  endpoint: EndpointRef
): EndpointResolution {
  const ports = resolveOwnerPorts(core, endpoint.owner);
  if (!ports) {
    return { exists: false, ownerExists: false };
  }

  const port = ports[endpoint.portKey];
  return {
    port,
    boundary: port?.boundary,
    exists: Boolean(port),
    ownerExists: true,
  };
}

function resolveOwnerPorts(
  core: LUCore,
  owner: PortOwner
): PortSurface | undefined {
  if (owner.kind === 'lu') {
    return core.ports;
  }
  if (owner.kind === 'lui') {
    return core.luis[owner.luiId]?.ports;
  }
  return core.closures[owner.closureId]?.core.ports;
}

function endpointGraphRole(
  endpoint: EndpointRef,
  boundary: PortBoundary | undefined
): 'source' | 'sink' | 'unknown' {
  if (!boundary) {
    return 'unknown';
  }
  if (endpoint.owner.kind === 'lui') {
    return boundary === 'output' ? 'source' : 'sink';
  }
  return boundary === 'input' ? 'source' : 'sink';
}

function endpointTargetsOverlap(
  left: EndpointRef,
  right: EndpointRef
): boolean {
  if (
    ownerKey(left.owner) !== ownerKey(right.owner) ||
    left.portKey !== right.portKey
  ) {
    return false;
  }

  const leftPath = left.payloadPath;
  const rightPath = right.payloadPath;
  if (!leftPath || !rightPath) {
    return true;
  }

  return isPrefix(leftPath, rightPath) || isPrefix(rightPath, leftPath);
}

function ownerKey(owner: PortOwner): string {
  if (owner.kind === 'lu') {
    return 'lu';
  }
  if (owner.kind === 'lui') {
    return `lui:${owner.luiId}`;
  }
  return `closure:${owner.closureId}`;
}

function isPrefix(left: readonly unknown[], right: readonly unknown[]): boolean {
  if (left.length > right.length) {
    return false;
  }
  return left.every((segment, index) => segment === right[index]);
}

function validateClosure(
  closure: Closure,
  closureId: string,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  localRequirements: RequirementSurfaceLike,
  supplyLineage: SupplyLineageEntry[]
): void {
  validateExtensions(closure.extensions, [...path, 'extensions'], context, add);
  validateCore(
    closure.core,
    [...path, 'core'],
    context,
    add,
    {},
    [...supplyLineage, { closureId, requirements: localRequirements }]
  );

  for (const [index, portKey] of closure.forwardedPortKeys.inputs.entries()) {
    const port = closure.core.ports[portKey];
    if (!port) {
      add(
        'VAL-040',
        [...path, 'forwardedPortKeys', 'inputs', index],
        `Forwarded input '${portKey}' does not exist on closure core.`
      );
      continue;
    }
    if (port.boundary !== 'input') {
      add(
        'VAL-040',
        [...path, 'forwardedPortKeys', 'inputs', index],
        `Forwarded input '${portKey}' is not an input port.`
      );
    }
  }

  for (const [index, portKey] of closure.forwardedPortKeys.outputs.entries()) {
    const port = closure.core.ports[portKey];
    if (!port) {
      add(
        'VAL-040',
        [...path, 'forwardedPortKeys', 'outputs', index],
        `Forwarded output '${portKey}' does not exist on closure core.`
      );
      continue;
    }
    if (port.boundary !== 'output') {
      add(
        'VAL-040',
        [...path, 'forwardedPortKeys', 'outputs', index],
        `Forwarded output '${portKey}' is not an output port.`
      );
    }
  }
}

function validateRequirementSurface(
  surface: RequirementSurfaceLike,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  for (const [serviceKey, entry] of Object.entries(surface)) {
    if (entry.kind === 'inline' && entry.service) {
      validateRequirementService(
        entry.service,
        [...path, serviceKey, 'service'],
        context,
        add
      );
    }
  }
}

function validateRequirementService(
  service: RequirementService | PlainRequirementService,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  for (const [unitKey, unit] of Object.entries(service.units)) {
    const unitPath = [...path, 'units', unitKey];
    validatePortSurface(unit.ports, [...unitPath, 'ports'], add, false);
    if (hasNestedRequirements(unit)) {
      validateRequirementSurface(
        unit.requirements,
        [...unitPath, 'requirements'],
        context,
        add
      );
    }
    if (unit.kind === 'structural') {
      validateCompositionContract(
        unit.compositionSurface,
        [...unitPath, 'compositionSurface'],
        context,
        add
      );
    }
  }
}

function resolveRequirementEntry(
  entry: RequirementServiceEntry | PlainRequirementServiceEntry | undefined,
  context: ValidationContext
): RequirementService | PlainRequirementService | undefined {
  if (!entry) {
    return undefined;
  }
  if (entry.kind === 'inline') {
    return entry.service;
  }
  return context.resolveRequirementService?.(entry.namespace, entry.key);
}

function validateRequirementFulfillment(
  fulfillment: RequirementServiceFulfillment,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  service: RequirementService | PlainRequirementService | undefined,
  containingCore: LUCore,
  localRequirements: RequirementSurfaceLike,
  supplyLineage: SupplyLineageEntry[]
): void {
  validateExtensions(fulfillment.extensions, [...path, 'extensions'], context, add);
  if (service && fulfillment.kind !== service.fulfillmentScope) {
    add(
      'VAL-036',
      [...path, 'kind'],
      `Fulfillment kind '${fulfillment.kind}' does not match service scope '${service.fulfillmentScope}'.`
    );
  }

  if (fulfillment.kind === 'independent-units') {
    if (service) {
      for (const unitKey of Object.keys(service.units)) {
        if (!hasOwn(fulfillment.units, unitKey)) {
          add(
            'VAL-037',
            [...path, 'units'],
            `Missing fulfillment for requirement unit '${unitKey}'.`
          );
        }
      }

      for (const unitKey of Object.keys(fulfillment.units)) {
        if (!hasOwn(service.units, unitKey)) {
          add(
            'VAL-037',
            [...path, 'units', unitKey],
            `Fulfillment provides unknown requirement unit '${unitKey}'.`
          );
        }
      }
    }

    for (const [unitKey, unitFulfillment] of Object.entries(fulfillment.units)) {
      validateUnitFulfillment(
        unitFulfillment,
        [...path, 'units', unitKey],
        context,
        add,
        containingCore,
        localRequirements,
        supplyLineage
      );
    }
    return;
  }

  validateUpstreamServiceSupplier(
    fulfillment.supplier,
    [...path, 'supplier'],
    context,
    add,
    localRequirements,
    supplyLineage
  );

  if (service?.fulfillmentScope === 'independent-units') {
    add(
      'VAL-038',
      path,
      'independent-units service must not be fulfilled as shared-service.'
    );
  }
}

function validateUnitFulfillment(
  fulfillment: UnitFulfillment,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  containingCore: LUCore,
  localRequirements: RequirementSurfaceLike,
  supplyLineage: SupplyLineageEntry[]
): void {
  validateExtensions(fulfillment.extensions, [...path, 'extensions'], context, add);
  if (
    fulfillment.kind === 'closure' &&
    !hasOwn(containingCore.closures, fulfillment.closureId)
  ) {
    add(
      'VAL-039',
      [...path, 'closureId'],
      `Closure fulfillment references missing closure '${fulfillment.closureId}'.`
    );
  }
  if (fulfillment.kind === 'upstream-unit') {
    const supplierSurface = resolveReachabilityEnvironment(
      fulfillment.reachabilityPath,
      [...path, 'reachabilityPath'],
      localRequirements,
      supplyLineage,
      add
    );
    if (!supplierSurface) {
      return;
    }
    const supplierService = resolveRequirementEntry(
      supplierSurface[fulfillment.supplierServiceKey],
      context
    );
    if (!supplierService) {
      add(
        'VAL-043',
        [...path, 'supplierServiceKey'],
        `Upstream supplier service '${fulfillment.supplierServiceKey}' cannot be resolved.`
      );
      return;
    }
    if (!hasOwn(supplierService.units, fulfillment.supplierUnitKey)) {
      add(
        'VAL-043',
        [...path, 'supplierUnitKey'],
        `Upstream supplier unit '${fulfillment.supplierUnitKey}' cannot be resolved.`
      );
    }
  }
}

function validateUpstreamServiceSupplier(
  fulfillment: { reachabilityPath: string[]; supplierServiceKey: string },
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void,
  localRequirements: RequirementSurfaceLike,
  supplyLineage: SupplyLineageEntry[]
): void {
  const supplierSurface = resolveReachabilityEnvironment(
    fulfillment.reachabilityPath,
    [...path, 'reachabilityPath'],
    localRequirements,
    supplyLineage,
    add
  );
  if (!supplierSurface) {
    return;
  }
  const supplierService = resolveRequirementEntry(
    supplierSurface[fulfillment.supplierServiceKey],
    context
  );
  if (!supplierService) {
    add(
      'VAL-044',
      [...path, 'supplierServiceKey'],
      `Upstream supplier service '${fulfillment.supplierServiceKey}' cannot be resolved.`
    );
  }
}

function resolveReachabilityEnvironment(
  reachabilityPath: string[],
  path: (string | number)[],
  localRequirements: RequirementSurfaceLike,
  supplyLineage: SupplyLineageEntry[],
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): RequirementSurfaceLike | undefined {
  if (reachabilityPath.length === 0) {
    return localRequirements;
  }

  const innerToOuter = [...supplyLineage].reverse();
  let valid = true;
  reachabilityPath.forEach((closureId, index) => {
    const expected = innerToOuter[index]?.closureId;
    if (closureId !== expected) {
      add(
        'VAL-042',
        [...path, index],
        `Reachability path segment '${closureId}' is not valid at this fulfillment site.`
      );
      valid = false;
    }
  });

  if (!valid) {
    return undefined;
  }
  return innerToOuter[reachabilityPath.length - 1]?.requirements;
}

function validateExtensions(
  extensions: ExtensionRecord[] | undefined,
  path: (string | number)[],
  context: ValidationContext,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  if (!extensions) {
    return;
  }

  extensions.forEach((extension, index) => {
    if (!context.capabilities) {
      if (extension.requirement === 'required') {
        add(
          'VAL-045',
          [...path, index],
          'Required extension cannot be accepted without declared capabilities.'
        );
      }
      return;
    }

    const feature = context.capabilities.features.find(
      (capability) =>
        capability.feature.namespace === extension.feature.namespace &&
        capability.feature.key === extension.feature.key
    );

    if (!feature || !feature.extensionKeys.includes(extension.key)) {
      if (extension.requirement === 'required') {
        add(
          'VAL-045',
          [...path, index],
          `Unsupported required extension '${extension.feature.namespace}/${extension.feature.key}:${extension.key}'.`
        );
      }
      return;
    }

    if (
      extension.requirement === 'required' &&
      !feature.supportsRequired
    ) {
      add(
        'VAL-045',
        [...path, index],
        'Projector capability does not support required use of this extension.'
      );
    }

    if (
      extension.requirement === 'optional' &&
      !feature.supportsOptional
    ) {
      add(
        'VAL-046',
        [...path, index],
        'Projector capability does not support optional use of this extension.',
        'warning'
      );
    }
  });
}

function validateNoDuplicates(
  values: string[],
  path: (string | number)[],
  rule: string,
  message: string,
  add: (
    rule: string,
    path: (string | number)[],
    message: string,
    severity?: ValidationSeverity
  ) => void
): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      add(rule, [...path, index], `${message} '${value}'.`);
      return;
    }
    seen.add(value);
  });
}

function isCompositionLeaf(
  value: CompositionValue
): value is CompositionLeaf {
  return (
    value.kind === 'lui-outlet' ||
    value.kind === 'external-outlet' ||
    value.kind === 'empty'
  );
}

function isStructuralCore(core: LUCore): core is StructuralLUCore {
  return core.kindOrganization.kind === 'structural';
}

function hasNestedRequirements(
  unit: RequirementUnit | PlainRequirementUnit
): unit is RequirementUnit {
  return 'requirements' in unit;
}

function hasOwn<T extends object>(
  object: T,
  key: PropertyKey
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key);
}
