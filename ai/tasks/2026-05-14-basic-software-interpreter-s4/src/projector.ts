import type {
  FulfillmentPlanNode,
  InterpreterPlan,
  LogicUnit,
  ResolvedStack,
} from './types';
import { baselineInterpretation } from './types';

const requiredFeaturesPresent = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): boolean => {
  const declared = Object.values(logicUnit.features);

  return resolved.requiredFeatures.every((required) =>
    declared.some(
      (feature) =>
        feature.namespace === required.namespace &&
        feature.key === required.key &&
        feature.version === required.version,
    ),
  );
};

const collectInputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<string, string> => {
  const inputMap: Record<string, string> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (
      connection.from.owner.kind === 'lu' &&
      connection.to.owner.kind === 'lui' &&
      connection.to.owner.luiId === luiId
    ) {
      inputMap[connection.to.portKey] = connection.from.portKey;
    }
  }

  return inputMap;
};

const collectOutputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<string, string> => {
  const outputMap: Record<string, string> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (
      connection.from.owner.kind === 'lui' &&
      connection.from.owner.luiId === luiId &&
      connection.to.owner.kind === 'lu'
    ) {
      outputMap[connection.to.portKey] = connection.from.portKey;
    }
  }

  return outputMap;
};

export const createInterpreterPlan = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): InterpreterPlan => {
  if (!requiredFeaturesPresent(logicUnit, resolved)) {
    throw new Error('LogicUnit is missing required fulfillment feature.');
  }

  const nodes: FulfillmentPlanNode[] = [];

  for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
    const target = lui.target;
    const fulfillment = lui.fulfillments[target.serviceKey]?.units[target.unitKey];

    if (!fulfillment) {
      throw new Error(`Missing fulfillment for ${target.serviceKey}.${target.unitKey}`);
    }

    nodes.push({
      luiId,
      serviceKey: target.serviceKey,
      unitKey: target.unitKey,
      fulfillment,
      inputMap: collectInputMap(logicUnit, luiId),
      outputMap: collectOutputMap(logicUnit, luiId),
    });
  }

  return {
    key: 'fulfillment.interpreter-plan.s4',
    stackKey: resolved.stackKey,
    interpretation: baselineInterpretation('s4-explicit-fulfillment-dispatch', [
      'Requirement fulfillment is projected as explicit closure or upstream provider dispatch.',
      'Fulfillment is kept separate from ordinary data flow and ambient lookup.',
    ]),
    nodes,
    diagnostics: [],
  };
};
