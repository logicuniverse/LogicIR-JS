import type {
  ConnectionId,
  PayloadPath,
  PortKey,
} from '@logic-universe/logic-ir-core';

export const TYPE_SYSTEM_FEATURE = {
  namespace: 'logicir.type-system',
  key: 'core',
  version: '0.0.0-adt-task',
} as const;

export const TYPE_SYSTEM_SCHEMA_VERSION = '0.0.0-adt-task' as const;

export const TYPE_SYSTEM_EXTENSION_KEYS = {
  typeDefinitions: 'type-definitions',
  payloadType: 'payload-type',
  connectionTypePolicy: 'connection-type-policy',
} as const;

export type JsonPrimitive = null | boolean | number | string;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type TypePath = (string | number)[];
export type TypeName = string;
export type TypeParameterName = string;
export type TypeFieldKey = string;
export type TypeTagKey = string;
export type TypeTagValue = JsonPrimitive;

export type PrimitiveTypeName =
  | 'null'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'string'
  | 'bytes';

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
      namespace: string;
      key: string;
      version?: string;
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
      namespace: string;
      key: string;
      version?: string;
      args?: JsonValue;
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
  | { kind: 'primitive'; name: PrimitiveTypeName }
  | { kind: 'literal'; value: JsonPrimitive }
  | { kind: 'enum'; values: JsonPrimitive[] }
  | { kind: 'array'; element: AlgebraicTypeExpression }
  | {
      kind: 'tuple';
      items: AlgebraicTypeExpression[];
      rest?: AlgebraicTypeExpression;
    }
  | {
      kind: 'object';
      fields: Record<TypeFieldKey, ObjectField>;
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
      variants: Record<string, AlgebraicTypeExpression>;
    }
  | { kind: 'ref'; ref: TypeRef }
  | {
      kind: 'refinement';
      base: AlgebraicTypeExpression;
      predicates: TypePredicate[];
    };

export type TypeParameter = {
  name: TypeParameterName;
  variance?: 'invariant' | 'covariant' | 'contravariant';
  constraint?: AlgebraicTypeExpression;
  default?: AlgebraicTypeExpression;
};

export type TypeDefinition = {
  kind: 'alias' | 'nominal' | 'opaque';
  parameters?: TypeParameter[];
  type?: AlgebraicTypeExpression;
  transparent?: boolean;
  description?: string;
};

export type TypeDefinitionsPayload = {
  schemaVersion: typeof TYPE_SYSTEM_SCHEMA_VERSION;
  definitions: Record<TypeName, TypeDefinition>;
  imports?: {
    namespace: string;
    key: string;
    version?: string;
    as?: TypeName;
  }[];
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

export type TypeIssueCode =
  | 'invalid-type-expression'
  | 'unknown-type-reference'
  | 'recursive-type-reference'
  | 'invalid-type-arguments'
  | 'invalid-extension-payload'
  | 'missing-type'
  | 'invalid-value'
  | 'unsupported-type-validation'
  | 'unsupported-predicate'
  | 'incompatible-type';

export type TypeIssue = {
  code: TypeIssueCode;
  message: string;
  path?: TypePath;
  subject?: string;
};

export type TypeCheckResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: TypeIssue[] };

export type TypeCompatibilityResult = {
  ok: boolean;
  mode: TypeCompatibilityMode;
  issues: TypeIssue[];
};

export type PredicateHandler = (
  predicate: TypePredicate,
  value: unknown,
) => boolean;

export type OwnerPortRef = {
  owner: 'boundary' | `lui:${string}` | `closure:${string}`;
  portKey: PortKey;
};

export type ConnectionTypeReport = {
  connectionId: ConnectionId;
  mode: TypeCompatibilityMode;
  source?: AlgebraicTypeExpression;
  target?: AlgebraicTypeExpression;
  result: TypeCompatibilityResult;
};

export type TypeSystemReport = {
  task: 'algebraic-type-system-feature-tools';
  status: 'passed' | 'failed';
  checkedValues: number;
  checkedConnections: number;
  issues: TypeIssue[];
};
