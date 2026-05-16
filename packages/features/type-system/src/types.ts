/**
 * LogicIR algebraic type-system feature schema v0 draft.
 *
 * These are serializable data shapes for a target-neutral type feature. They do
 * not contain runtime validators, host-language functions, or projection
 * implementation details. They also must not use TypeScript generics or
 * utility types as schema abstraction.
 */

import type {
  CompositionAnchorKey,
  CompositionOutletKey,
  EndpointPortRef,
  LUIId,
  PayloadPath,
  RequirementServiceKey,
  RequirementUnitKey,
} from '@logic-universe/logic-ir-core';

export const LOGIC_IR_TYPE_SYSTEM_SCHEMA_VERSION =
  '0.0.0-draft' as const;

export type LogicIRTypeSystemSchemaVersion =
  typeof LOGIC_IR_TYPE_SYSTEM_SCHEMA_VERSION;

export type TypeName = string;
export type TypeParameterName = string;
export type TypePredicateKey = string;
export type TypePredicateNamespace = string;
export type TypePredicateVersion = string;
export type ExternalTypeNamespace = string;
export type ExternalTypeKey = string;
export type ExternalTypeVersion = string;
export type TypeFieldKey = string;
export type TypeTagKey = string;
export type TypeTagValue = string | number | boolean | null;

export type TypeJsonPrimitive = null | boolean | number | string;
export type TypeJsonArray = TypeJsonValue[];
export type TypeJsonObject = { [key: string]: TypeJsonValue };
export type TypeJsonValue =
  | TypeJsonPrimitive
  | TypeJsonArray
  | TypeJsonObject;

export type TypePrimitiveName =
  | 'null'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'string'
  | 'bytes';

export type TypeParameterVariance =
  | 'invariant'
  | 'covariant'
  | 'contravariant';

export type TypeParameter = {
  name: TypeParameterName;
  variance?: TypeParameterVariance;
  constraint?: AlgebraicTypeExpression;
  default?: AlgebraicTypeExpression;
};

export type TypeRef =
  | {
      kind: 'definition';
      name: TypeName;
      args?: AlgebraicTypeExpression[];
    }
  | {
      kind: 'parameter';
      name: TypeParameterName;
    }
  | {
      kind: 'external';
      namespace: ExternalTypeNamespace;
      key: ExternalTypeKey;
      version?: ExternalTypeVersion;
      args?: AlgebraicTypeExpression[];
    };

export type TypePredicate =
  | {
      kind: 'range';
      min?: number;
      max?: number;
      exclusiveMin?: boolean;
      exclusiveMax?: boolean;
    }
  | {
      kind: 'length';
      min?: number;
      max?: number;
    }
  | {
      kind: 'pattern';
      pattern: string;
    }
  | {
      kind: 'multiple-of';
      value: number;
    }
  | {
      kind: 'custom';
      namespace: TypePredicateNamespace;
      key: TypePredicateKey;
      version?: TypePredicateVersion;
      args?: TypeJsonValue;
    };

export type ObjectField = {
  type: AlgebraicTypeExpression;
  optional?: boolean;
  readonly?: boolean;
};

export type ObjectIndexSignature = {
  key: 'string' | 'integer';
  value: AlgebraicTypeExpression;
};

export type AlgebraicTypeExpression =
  | { kind: 'any' }
  | { kind: 'unknown' }
  | { kind: 'never' }
  | { kind: 'primitive'; name: TypePrimitiveName }
  | { kind: 'literal'; value: TypeJsonPrimitive }
  | { kind: 'enum'; values: TypeJsonPrimitive[] }
  | { kind: 'array'; element: AlgebraicTypeExpression }
  | {
      kind: 'tuple';
      items: AlgebraicTypeExpression[];
      rest?: AlgebraicTypeExpression;
    }
  | {
      kind: 'object';
      fields: { [key: TypeFieldKey]: ObjectField };
      index?: ObjectIndexSignature;
      exact?: boolean;
    }
  | {
      kind: 'record';
      key: 'string' | 'integer';
      value: AlgebraicTypeExpression;
    }
  | { kind: 'union'; variants: AlgebraicTypeExpression[] }
  | { kind: 'intersection'; variants: AlgebraicTypeExpression[] }
  | {
      kind: 'tagged-union';
      tag: TypeTagKey;
      variants: { [tag: string]: AlgebraicTypeExpression };
    }
  | { kind: 'ref'; ref: TypeRef }
  | {
      kind: 'refinement';
      base: AlgebraicTypeExpression;
      predicates: TypePredicate[];
    };

export type TypeDefinitionKind = 'alias' | 'nominal' | 'opaque';

export type TypeDefinition = {
  kind: TypeDefinitionKind;
  parameters?: TypeParameter[];
  type?: AlgebraicTypeExpression;
  transparent?: boolean;
  description?: string;
};

export type TypeImport = {
  namespace: ExternalTypeNamespace;
  key: ExternalTypeKey;
  version?: ExternalTypeVersion;
  as?: TypeName;
};

export type TypeDefinitionsPayload = {
  schemaVersion: LogicIRTypeSystemSchemaVersion;
  imports?: TypeImport[];
  definitions: { [name: TypeName]: TypeDefinition };
};

export type PayloadPathTypeBinding = {
  payloadPath: PayloadPath;
  type: AlgebraicTypeExpression;
};

export type PayloadTypePayload = {
  type: AlgebraicTypeExpression;
  pathTypes?: PayloadPathTypeBinding[];
};

export type TypeCompatibilityMode =
  | 'assignable'
  | 'equivalent'
  | 'overlap'
  | 'disjoint';

export type ConnectionTypePolicyPayload = {
  mode?: TypeCompatibilityMode;
  sourceType?: AlgebraicTypeExpression;
  targetType?: AlgebraicTypeExpression;
};

export type RequirementTypeBindingTarget =
  | {
      kind: 'service';
      serviceKey?: RequirementServiceKey;
    }
  | {
      kind: 'unit';
      serviceKey?: RequirementServiceKey;
      unitKey: RequirementUnitKey;
    }
  | {
      kind: 'port';
      serviceKey?: RequirementServiceKey;
      unitKey: RequirementUnitKey;
      port: EndpointPortRef;
      payloadPath?: PayloadPath;
    };

export type RequirementTypeBinding = {
  target: RequirementTypeBindingTarget;
  type: AlgebraicTypeExpression;
};

export type RequirementTypeBindingsPayload = {
  bindings: RequirementTypeBinding[];
};

export type CompositionTypeBindingTarget =
  | {
      kind: 'export-anchor';
      anchorKey: CompositionAnchorKey;
    }
  | {
      kind: 'external-outlet';
      outletKey: CompositionOutletKey;
    }
  | {
      kind: 'lui-anchor';
      luiId: LUIId;
      anchorKey: CompositionAnchorKey;
    }
  | {
      kind: 'lui-outlet';
      luiId: LUIId;
      outletKey: CompositionOutletKey;
    }
  | {
      kind: 'surface-anchor';
      anchorKey: CompositionAnchorKey;
    }
  | {
      kind: 'surface-outlet';
      outletKey: CompositionOutletKey;
    };

export type CompositionTypeBinding = {
  target: CompositionTypeBindingTarget;
  type: AlgebraicTypeExpression;
};

export type CompositionTypeBindingsPayload = {
  bindings: CompositionTypeBinding[];
};

export type TypeSystemExtensionKey =
  | 'type-definitions'
  | 'payload-type'
  | 'connection-type-policy'
  | 'requirement-type-bindings'
  | 'composition-type-bindings';

export type TypeSystemExtensionRecordPayload =
  | {
      key: 'type-definitions';
      payload: TypeDefinitionsPayload;
    }
  | {
      key: 'payload-type';
      payload: PayloadTypePayload;
    }
  | {
      key: 'connection-type-policy';
      payload: ConnectionTypePolicyPayload;
    }
  | {
      key: 'requirement-type-bindings';
      payload: RequirementTypeBindingsPayload;
    }
  | {
      key: 'composition-type-bindings';
      payload: CompositionTypeBindingsPayload;
    };

export type TypeSystemExtensionPayloadByKey = {
  'type-definitions': TypeDefinitionsPayload;
  'payload-type': PayloadTypePayload;
  'connection-type-policy': ConnectionTypePolicyPayload;
  'requirement-type-bindings': RequirementTypeBindingsPayload;
  'composition-type-bindings': CompositionTypeBindingsPayload;
};
