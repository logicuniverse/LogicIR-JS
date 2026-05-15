import type { FeatureDefinition } from '@logic-universe/logic-ir-architecture';
import { TYPE_SYSTEM_FEATURE } from './types';

export const algebraicTypeSystemFeatureDefinition: FeatureDefinition = {
  title: 'LogicIR Algebraic Type System',
  description:
    'Target-neutral algebraic payload typing for LogicIR ports and connections.',
  extensionPoints: [
    {
      key: 'type-definitions',
      attachment: 'logic-unit',
      description:
        'Named alias, nominal, and opaque type definitions available inside one LogicUnit.',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'type-definitions-payload',
        version: TYPE_SYSTEM_FEATURE.version,
      },
    },
    {
      key: 'payload-type',
      attachment: 'port',
      description:
        'Algebraic type expression for a port payload plus optional payload-path refinements.',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'payload-type-payload',
        version: TYPE_SYSTEM_FEATURE.version,
      },
    },
    {
      key: 'connection-type-policy',
      attachment: 'connection',
      description:
        'Compatibility mode and optional source/target type overrides for a connection.',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'connection-type-policy-payload',
        version: TYPE_SYSTEM_FEATURE.version,
      },
    },
  ],
};
