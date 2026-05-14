/**
 * Projection preflight checks.
 *
 * This module combines core validation, draft extension validation, and
 * projector capability checks. It still does not lower LogicIR into a target.
 */

import { validateLogicUnit } from '../core/v0-draft/validator';
import type { ValidationContext } from '../core/v0-draft/validator';
import type {
  CompositionValue,
  ExtensionRecord,
  LogicUnit,
  LUCore,
  LUI,
  Port,
  RequirementServiceEntry,
} from '../core/v0-draft/types';
import { validateDraftExtensions } from '../extensions/drafts/validator';
import type {
  ProjectorCapabilitySet,
  ProjectionDiagnostic,
} from './types';

export type ProjectionPreflightOptions = {
  includeCoreValidation?: boolean;
  resolveLogicUnit?: ValidationContext['resolveLogicUnit'];
  resolveRequirementService?: ValidationContext['resolveRequirementService'];
  resolveExternalTarget?: ValidationContext['resolveExternalTarget'];
};

export function preflightProjection(
  unit: LogicUnit,
  capabilities: ProjectorCapabilitySet,
  options: ProjectionPreflightOptions = {}
): ProjectionDiagnostic[] {
  const diagnostics: ProjectionDiagnostic[] = [];
  const includeCoreValidation = options.includeCoreValidation ?? true;

  const add = (
    code: string,
    path: (string | number)[],
    message: string,
    severity: ProjectionDiagnostic['severity'] = 'error'
  ) => {
    diagnostics.push({ code, path, message, severity });
  };

  if (includeCoreValidation) {
    const coreDiagnostics = validateLogicUnit(unit, {
      capabilities,
      resolveLogicUnit: options.resolveLogicUnit,
      resolveRequirementService: options.resolveRequirementService,
      resolveExternalTarget: options.resolveExternalTarget,
    });
    coreDiagnostics.forEach((diagnostic) => {
      add(
        diagnostic.rule,
        diagnostic.path,
        diagnostic.message,
        diagnostic.severity
      );
    });
  }

  validateCoreCapabilities(unit, capabilities, add);

  diagnostics.push(
    ...validateDraftExtensions(unit, {
      capabilities,
      resolveLogicUnit: options.resolveLogicUnit,
      resolveRequirementService: options.resolveRequirementService,
    })
  );
  validateTargetProjectionConstraints(unit.core, capabilities, ['core'], add);

  return diagnostics;
}

function validateCoreCapabilities(
  unit: LogicUnit,
  capabilities: ProjectorCapabilitySet,
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  if (!capabilities.core.coreVersions.includes(unit.schemaVersion)) {
    add('PRJ-001', ['schemaVersion'], 'Projector does not support this core schema version.');
  }

  validateCore(unit.core, capabilities, ['core'], add);
  validateRequirementSurfaceCapabilities(unit.requirements, capabilities, ['requirements'], add);
}

function validateCore(
  core: LUCore,
  capabilities: ProjectorCapabilitySet,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  const kind = core.kindOrganization.kind;
  if (!capabilities.core.luKinds.includes(kind)) {
    add('PRJ-002', [...path, 'kindOrganization', 'kind'], `Projector does not support '${kind}' LU cores.`);
  }

  for (const [portKey, port] of entries(core.ports)) {
    validatePortCapability(port, capabilities, [...path, 'ports', portKey], add);
  }

  for (const [luiId, lui] of luiEntries(core)) {
    const luiPath = [...path, 'luis', luiId];
    if (!capabilities.core.luKinds.includes(lui.kind)) {
      add('PRJ-003', [...luiPath, 'kind'], `Projector does not support '${lui.kind}' LUI instances.`);
    }
    for (const [portKey, port] of entries(lui.ports)) {
      validatePortCapability(port, capabilities, [...luiPath, 'ports', portKey], add);
    }
    for (const [serviceKey, fulfillment] of entries(lui.fulfillments)) {
      if (!capabilities.core.fulfillmentScopes.includes(fulfillment.kind)) {
        add(
          'PRJ-004',
          [...luiPath, 'fulfillments', serviceKey, 'kind'],
          `Projector does not support '${fulfillment.kind}' requirement fulfillment.`
        );
      }
      if (
        fulfillment.kind === 'independent-units' &&
        !capabilities.core.requirements.closureFulfillment
      ) {
        for (const [unitKey, unitFulfillment] of entries(fulfillment.units)) {
          if (unitFulfillment.kind === 'closure') {
            add(
              'PRJ-005',
              [...luiPath, 'fulfillments', serviceKey, 'units', unitKey],
              'Projector does not support closure fulfillment.'
            );
          }
        }
      }
      if (
        fulfillment.kind === 'independent-units' &&
        !capabilities.core.requirements.upstreamUnitFulfillment
      ) {
        for (const [unitKey, unitFulfillment] of entries(fulfillment.units)) {
          if (unitFulfillment.kind === 'upstream-unit') {
            add(
              'PRJ-006',
              [...luiPath, 'fulfillments', serviceKey, 'units', unitKey],
              'Projector does not support upstream unit fulfillment.'
            );
          }
        }
      }
      if (
        fulfillment.kind === 'shared-service' &&
        !capabilities.core.requirements.upstreamSharedServiceFulfillment
      ) {
        add(
          'PRJ-007',
          [...luiPath, 'fulfillments', serviceKey],
          'Projector does not support upstream shared-service fulfillment.'
        );
      }
    }

    if (lui.kind === 'structural') {
      if (!capabilities.core.structuralComposition.childOutlets) {
        add(
          'PRJ-008',
          [...luiPath, 'compositionSurface', 'outlets'],
          'Projector does not support structural child outlets.'
        );
      }
      if (!capabilities.core.structuralComposition.childAnchors) {
        add(
          'PRJ-009',
          [...luiPath, 'compositionSurface', 'anchors'],
          'Projector does not support structural child anchors.'
        );
      }
      for (const [anchorKey, anchor] of entries(lui.compositionSurface.anchors)) {
        if (anchor.shape === 'collection' && !capabilities.core.structuralComposition.collections) {
          add(
            'PRJ-010',
            [...luiPath, 'compositionSurface', 'anchors', anchorKey],
            'Projector does not support collection composition anchors.'
          );
        }
        if (anchor.shape === 'map' && !capabilities.core.structuralComposition.maps) {
          add(
            'PRJ-011',
            [...luiPath, 'compositionSurface', 'anchors', anchorKey],
            'Projector does not support map composition anchors.'
          );
        }
      }
    }
  }

  for (const [connectionId, connection] of entries(core.connections)) {
    for (const side of ['from', 'to'] as const) {
      const endpoint = connection[side];
      if (
        endpoint.payloadPath &&
        endpoint.payloadPath.length > 0 &&
        !capabilities.core.endpointAddressing.payloadPath
      ) {
        add(
          'PRJ-012',
          [...path, 'connections', connectionId, side, 'payloadPath'],
          'Projector does not support endpoint payloadPath addressing.'
        );
      }
      if (
        endpoint.payloadPath &&
        capabilities.core.endpointAddressing.maxPayloadPathDepth !== undefined &&
        endpoint.payloadPath.length >
          capabilities.core.endpointAddressing.maxPayloadPathDepth
      ) {
        add(
          'PRJ-013',
          [...path, 'connections', connectionId, side, 'payloadPath'],
          'Endpoint payloadPath exceeds projector maximum depth.'
        );
      }
    }
  }

  if (core.kindOrganization.kind === 'structural') {
    if (!capabilities.core.structuralComposition.exportAnchors) {
      add(
        'PRJ-014',
        [...path, 'kindOrganization', 'exportAnchors'],
        'Projector does not support structural export anchors.'
      );
    }
    if (
      Object.keys(core.kindOrganization.externalOutlets).length > 0 &&
      !capabilities.core.structuralComposition.externalOutlets
    ) {
      add(
        'PRJ-015',
        [...path, 'kindOrganization', 'externalOutlets'],
        'Projector does not support structural external outlets.'
      );
    }
    for (const [anchorKey, value] of entries(core.kindOrganization.luiFills)) {
      validateCompositionValueCapabilities(
        value,
        capabilities,
        [...path, 'kindOrganization', 'luiFills', anchorKey],
        add
      );
    }
  }

  for (const [closureId, closure] of entries(core.closures)) {
    validateCore(closure.core, capabilities, [...path, 'closures', closureId, 'core'], add);
  }
}

function validateTargetProjectionConstraints(
  core: LUCore,
  capabilities: ProjectorCapabilitySet,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  if (capabilities.target === 'verilog-hdl') {
    const hdl = capabilities.verilogHDL;
    if (!hdl) {
      add('PRJ-024', path, 'Verilog HDL projector is missing HDL capability declaration.');
    } else {
      validateVerilogCoreConstraints(core, hdl, path, add);
      validateVerilogRuntimeExtensionConstraints(core, path, add);
    }
  }

  for (const [closureId, closure] of entries(core.closures)) {
    validateTargetProjectionConstraints(
      closure.core,
      capabilities,
      [...path, 'closures', closureId, 'core'],
      add
    );
  }
}

function validateVerilogCoreConstraints(
  core: LUCore,
  hdl: NonNullable<ProjectorCapabilitySet['verilogHDL']>,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  for (const [portKey, port] of entries(core.ports)) {
    validateVerilogPortConstraints(port, hdl, [...path, 'ports', portKey], add);
  }

  for (const [luiId, lui] of luiEntries(core)) {
    for (const [portKey, port] of entries(lui.ports)) {
      validateVerilogPortConstraints(
        port,
        hdl,
        [...path, 'luis', luiId, 'ports', portKey],
        add
      );
    }
  }
}

function validateVerilogRuntimeExtensionConstraints(
  core: LUCore,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  validateVerilogRuntimeExtensionList(core.extensions, [...path, 'extensions'], add);
  for (const [portKey, port] of entries(core.ports)) {
    validateVerilogRuntimeExtensionList(
      port.extensions,
      [...path, 'ports', portKey, 'extensions'],
      add
    );
  }

  for (const [luiId, lui] of luiEntries(core)) {
    const luiPath = [...path, 'luis', luiId];
    validateVerilogRuntimeExtensionList(lui.extensions, [...luiPath, 'extensions'], add);
    for (const [portKey, port] of entries(lui.ports)) {
      validateVerilogRuntimeExtensionList(
        port.extensions,
        [...luiPath, 'ports', portKey, 'extensions'],
        add
      );
    }
  }
}

function validateVerilogRuntimeExtensionList(
  extensions: ExtensionRecord[] | undefined,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  extensions?.forEach((extension, index) => {
    const isRuntimeDynamicFulfillment =
      (extension.feature.namespace === 'logicir.js-runtime' ||
        extension.feature.namespace === 'logicir.python-runtime') &&
      extension.key === 'dynamic-fulfillment';
    if (!isRuntimeDynamicFulfillment) {
      return;
    }

    add(
      'PRJ-027',
      [...path, index],
      'Verilog HDL projection cannot realize software runtime dynamic fulfillment policy.',
      extension.requirement === 'required' ? 'error' : 'warning'
    );
  });
}

function validateVerilogPortConstraints(
  port: Port,
  hdl: NonNullable<ProjectorCapabilitySet['verilogHDL']>,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  if (port.interaction.pushNotifiable && !hdl.supportsPushNotifiable) {
    add(
      'PRJ-025',
      [...path, 'interaction', 'pushNotifiable'],
      'Verilog HDL capability does not support push-notifiable contacts.'
    );
  }
  if (port.interaction.retainedCurrent && !hdl.supportsRetainedCurrent) {
    add(
      'PRJ-026',
      [...path, 'interaction', 'retainedCurrent'],
      'Verilog HDL capability does not support retained-current contacts.'
    );
  }
}

function validatePortCapability(
  port: Port,
  capabilities: ProjectorCapabilitySet,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  const interaction = capabilities.core.portInteractions;
  if (port.interaction.pullReadable && !interaction.pullReadable) {
    add('PRJ-016', [...path, 'interaction'], 'Projector does not support pullReadable ports.');
  }
  if (port.interaction.pushNotifiable && !interaction.pushNotifiable) {
    add('PRJ-017', [...path, 'interaction'], 'Projector does not support pushNotifiable ports.');
  }
  if (port.interaction.retainedCurrent && !interaction.retainedCurrent) {
    add('PRJ-018', [...path, 'interaction'], 'Projector does not support retainedCurrent ports.');
  }
  if (interaction.combinations) {
    const matched = interaction.combinations.some(
      (combination) =>
        combination.pullReadable === port.interaction.pullReadable &&
        combination.pushNotifiable === port.interaction.pushNotifiable &&
        combination.retainedCurrent === port.interaction.retainedCurrent
    );
    if (!matched) {
      add('PRJ-019', [...path, 'interaction'], 'Projector does not support this port interaction combination.');
    }
  }
  if (port.pins && !capabilities.core.endpointAddressing.pins) {
    add('PRJ-020', [...path, 'pins'], 'Projector does not support port pins.');
  }
}

function validateCompositionValueCapabilities(
  value: Record<string, CompositionValue>,
  capabilities: ProjectorCapabilitySet,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  for (const [key, item] of entries(value)) {
    if (item.kind === 'collection') {
      if (!capabilities.core.structuralComposition.collections) {
        add(
          'PRJ-010',
          [...path, key],
          'Projector does not support collection composition values.'
        );
      }
      continue;
    }
    if (item.kind === 'map' && !capabilities.core.structuralComposition.maps) {
      add(
        'PRJ-011',
        [...path, key],
        'Projector does not support map composition values.'
      );
    }
  }
}

function validateRequirementSurfaceCapabilities(
  surface: Record<string, RequirementServiceEntry>,
  capabilities: ProjectorCapabilitySet,
  path: (string | number)[],
  add: (
    code: string,
    path: (string | number)[],
    message: string,
    severity?: ProjectionDiagnostic['severity']
  ) => void
): void {
  for (const [serviceKey, entry] of entries(surface)) {
    if (entry.kind === 'external') {
      if (!capabilities.core.requirements.externalServices) {
        add(
          'PRJ-021',
          [...path, serviceKey],
          'Projector does not support external requirement services.'
        );
      }
      continue;
    }

    if (!capabilities.core.requirements.inlineServices) {
      add(
        'PRJ-022',
        [...path, serviceKey],
        'Projector does not support inline requirement services.'
      );
    }

    if (!capabilities.core.fulfillmentScopes.includes(entry.service.fulfillmentScope)) {
      add(
        'PRJ-023',
        [...path, serviceKey, 'service', 'fulfillmentScope'],
        `Projector does not support '${entry.service.fulfillmentScope}' fulfillment scope.`
      );
    }
  }
}


function entries<T>(record: Record<string, T>): [string, T][] {
  return Object.entries(record);
}

function luiEntries(core: LUCore): [string, LUI][] {
  return Object.entries(core.luis) as [string, LUI][];
}
