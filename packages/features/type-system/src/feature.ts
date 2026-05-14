/**
 * Architecture feature definition for the LogicIR algebraic type-system feature.
 */

import type { FeatureDefinition } from '@logic-universe/logic-ir-architecture';

export const typeSystemCoreFeatureDefinition: FeatureDefinition = {
  title: 'LogicIR Core Algebraic Type System',
  description:
    'Target-neutral algebraic payload, requirement, and composition typing.',
  documentationUrl: 'schema/features/type-system/v0-draft/README.md',
  extensionPoints: [
    {
      key: 'type-definitions',
      attachment: 'logic-unit',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'type-definitions-payload',
        version: '0.0.0-draft',
      },
    },
    {
      key: 'payload-type',
      attachment: 'port',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'payload-type-payload',
        version: '0.0.0-draft',
      },
    },
    {
      key: 'connection-type-policy',
      attachment: 'connection',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'connection-type-policy-payload',
        version: '0.0.0-draft',
      },
    },
    {
      key: 'requirement-type-bindings',
      attachment: 'requirement-service',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'requirement-type-bindings-payload',
        version: '0.0.0-draft',
      },
    },
    {
      key: 'composition-type-bindings',
      attachment: 'lu-core',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'composition-type-bindings-payload',
        version: '0.0.0-draft',
      },
    },
    {
      key: 'composition-type-bindings',
      attachment: 'lui',
      payloadSchema: {
        kind: 'external',
        namespace: 'logicir.type-system.schema',
        key: 'composition-type-bindings-payload',
        version: '0.0.0-draft',
      },
    },
  ],
};
