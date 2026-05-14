export const TYPE_SYSTEM_FEATURE = {
  namespace: 'logicir.type-system',
  key: 'core',
  version: '0.0.0-draft',
} as const;

export const TYPE_SYSTEM_EXTENSION_KEYS = {
  typeDefinitions: 'type-definitions',
  payloadType: 'payload-type',
  connectionTypePolicy: 'connection-type-policy',
  requirementTypeBindings: 'requirement-type-bindings',
  compositionTypeBindings: 'composition-type-bindings',
} as const;

export type TypeJsonPrimitive = null | boolean | number | string;
export type TypeJsonValue =
  | TypeJsonPrimitive
  | TypeJsonValue[]
  | { [key: string]: TypeJsonValue };

export type TypePrimitiveName =
  | 'null'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'string'
  | 'bytes';

export type TypePath = (string | number)[];

export type TypeParameter = {
  name: string;
  variance?: 'invariant' | 'covariant' | 'contravariant';
  constraint?: AlgebraicTypeExpression;
  default?: AlgebraicTypeExpression;
};

export type TypeRef =
  | {
      kind: 'definition';
      name: string;
      args?: AlgebraicTypeExpression[];
    }
  | {
      kind: 'parameter';
      name: string;
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
      fields: Record<string, ObjectField>;
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
      tag: string;
      variants: Record<string, AlgebraicTypeExpression>;
    }
  | { kind: 'ref'; ref: TypeRef }
  | {
      kind: 'refinement';
      base: AlgebraicTypeExpression;
      predicates: TypePredicate[];
    };

export type TypeDefinition = {
  kind: 'alias' | 'nominal' | 'opaque';
  parameters?: TypeParameter[];
  type?: AlgebraicTypeExpression;
  transparent?: boolean;
  description?: string;
};

export type TypeDefinitionsPayload = {
  schemaVersion: string;
  imports?: {
    namespace: string;
    key: string;
    version?: string;
    as?: string;
  }[];
  definitions: Record<string, TypeDefinition>;
};

export type PayloadPathTypeBinding = {
  payloadPath: TypePath;
  type: AlgebraicTypeExpression;
};

export type PayloadTypePayload = {
  type: AlgebraicTypeExpression;
  pathTypes?: PayloadPathTypeBinding[];
};

export type TypeIssueCode =
  | 'invalid-type-expression'
  | 'unknown-type-reference'
  | 'recursive-type-reference'
  | 'invalid-type-arguments'
  | 'invalid-value'
  | 'unsupported-type-validation'
  | 'unsupported-predicate'
  | 'incompatible-type';

export type TypeIssue = {
  code: TypeIssueCode;
  message: string;
  path?: TypePath;
};

export type TypeCheckResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: TypeIssue[] };

export type TypeCompatibilityMode =
  | 'assignable'
  | 'equivalent'
  | 'overlap'
  | 'disjoint';

export type TypeCompatibilityResult = {
  ok: boolean;
  mode: TypeCompatibilityMode;
  issues: TypeIssue[];
};

export type PredicateHandler = (
  predicate: TypePredicate,
  value: unknown
) => boolean;
