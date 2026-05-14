import { TypeRegistry } from './registry';
import {
  AlgebraicTypeExpression,
  PredicateHandler,
  TypeCheckResult,
  TypeCompatibilityMode,
  TypeCompatibilityResult,
  TypeIssue,
  TypeJsonPrimitive,
  TypePath,
  TypePrimitiveName,
  TypePredicate,
} from './types';

export type TypeCheckerOptions = {
  registry?: TypeRegistry;
  predicateHandler?: PredicateHandler;
};

type AssignabilityContext = {
  registry: TypeRegistry;
  seen: Set<string>;
};

export class TypeChecker {
  private registry: TypeRegistry;
  private predicateHandler?: PredicateHandler;

  constructor(options: TypeCheckerOptions = {}) {
    this.registry = options.registry ?? new TypeRegistry();
    this.predicateHandler = options.predicateHandler;
  }

  validateValue(
    type: AlgebraicTypeExpression,
    value: unknown
  ): TypeCheckResult {
    const issues = validateValue(type, value, [], this.registry, {
      predicateHandler: this.predicateHandler,
    });
    return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
  }

  validateType(type: AlgebraicTypeExpression): TypeCheckResult {
    const issues = validateTypeExpression(type, this.registry);
    return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
  }

  isAssignable(
    source: AlgebraicTypeExpression,
    target: AlgebraicTypeExpression
  ): TypeCompatibilityResult {
    const issues = isAssignable(source, target, {
      registry: this.registry,
      seen: new Set(),
    })
      ? []
      : [
          {
            code: 'incompatible-type' as const,
            message: 'Source type is not assignable to target type.',
          },
        ];
    return { ok: issues.length === 0, mode: 'assignable', issues };
  }

  compare(
    source: AlgebraicTypeExpression,
    target: AlgebraicTypeExpression,
    mode: TypeCompatibilityMode = 'assignable'
  ): TypeCompatibilityResult {
    if (mode === 'assignable') {
      return this.isAssignable(source, target);
    }
    if (mode === 'equivalent') {
      const ok =
        this.isAssignable(source, target).ok &&
        this.isAssignable(target, source).ok;
      return {
        ok,
        mode,
        issues: ok
          ? []
          : [
              {
                code: 'incompatible-type',
                message: 'Types are not equivalent.',
              },
            ],
      };
    }
    const overlaps = mayOverlap(source, target, this.registry);
    const ok = mode === 'overlap' ? overlaps : !overlaps;
    return {
      ok,
      mode,
      issues: ok
        ? []
        : [
            {
              code: 'incompatible-type',
              message:
                mode === 'overlap'
                  ? 'Types do not overlap.'
                  : 'Types are not disjoint.',
            },
          ],
    };
  }
}

export const validateTypeExpression = (
  type: AlgebraicTypeExpression,
  registry = new TypeRegistry(),
  path: TypePath = []
): TypeIssue[] => {
  switch (type.kind) {
    case 'any':
    case 'unknown':
    case 'never':
      return [];
    case 'primitive':
      return [
        'null',
        'boolean',
        'integer',
        'number',
        'string',
        'bytes',
      ].includes(type.name)
        ? []
        : [
            {
              code: 'invalid-type-expression',
              message: `Unknown primitive type: ${String(type.name)}`,
              path,
            },
          ];
    case 'literal':
      return isTypeJsonPrimitive(type.value)
        ? []
        : [
            {
              code: 'invalid-type-expression',
              message: 'Literal value must be a JSON primitive.',
              path,
            },
          ];
    case 'enum':
      return type.values.every(isTypeJsonPrimitive)
        ? []
        : [
            {
              code: 'invalid-type-expression',
              message: 'Enum values must be JSON primitives.',
              path,
            },
          ];
    case 'array':
      return validateTypeExpression(type.element, registry, [
        ...path,
        'element',
      ]);
    case 'tuple':
      return [
        ...type.items.flatMap((item, index) =>
          validateTypeExpression(item, registry, [...path, 'items', index])
        ),
        ...(type.rest
          ? validateTypeExpression(type.rest, registry, [...path, 'rest'])
          : []),
      ];
    case 'object':
      return [
        ...Object.entries(type.fields).flatMap(([key, field]) =>
          validateTypeExpression(field.type, registry, [
            ...path,
            'fields',
            key,
          ])
        ),
        ...(type.index
          ? validateTypeExpression(type.index.value, registry, [
              ...path,
              'index',
              'value',
            ])
          : []),
      ];
    case 'record':
      return validateTypeExpression(type.value, registry, [...path, 'value']);
    case 'union':
    case 'intersection':
      if (type.variants.length === 0) {
        return [
          {
            code: 'invalid-type-expression',
            message: `${type.kind} must contain at least one variant.`,
            path,
          },
        ];
      }
      return type.variants.flatMap((variant, index) =>
        validateTypeExpression(variant, registry, [...path, 'variants', index])
      );
    case 'tagged-union':
      if (Object.keys(type.variants).length === 0) {
        return [
          {
            code: 'invalid-type-expression',
            message: 'tagged-union must contain at least one variant.',
            path,
          },
        ];
      }
      return Object.entries(type.variants).flatMap(([key, variant]) =>
        validateTypeExpression(variant, registry, [...path, 'variants', key])
      );
    case 'ref': {
      if (type.ref.kind === 'parameter') {
        return [];
      }
      const resolved = registry.resolveRef(type.ref);
      return resolved.issues.map((issue) => ({ ...issue, path }));
    }
    case 'refinement':
      return [
        ...validateTypeExpression(type.base, registry, [...path, 'base']),
        ...type.predicates.flatMap((predicate, index) =>
          validatePredicateExpression(predicate, [...path, 'predicates', index])
        ),
      ];
  }
};

export const validateValue = (
  type: AlgebraicTypeExpression,
  value: unknown,
  path: TypePath = [],
  registry = new TypeRegistry(),
  options: { predicateHandler?: PredicateHandler } = {}
): TypeIssue[] => {
  switch (type.kind) {
    case 'any':
    case 'unknown':
      return [];
    case 'never':
      return [invalid(path, 'Value cannot inhabit never.')];
    case 'primitive':
      return validatePrimitive(type.name, value, path);
    case 'literal':
      return Object.is(type.value, value)
        ? []
        : [invalid(path, `Expected literal ${String(type.value)}.`)];
    case 'enum':
      return type.values.some((item) => Object.is(item, value))
        ? []
        : [invalid(path, 'Expected one of the enum values.')];
    case 'array':
      if (!Array.isArray(value)) {
        return [invalid(path, 'Expected array.')];
      }
      return value.flatMap((item, index) =>
        validateValue(type.element, item, [...path, index], registry, options)
      );
    case 'tuple':
      return validateTuple(type, value, path, registry, options);
    case 'object':
      return validateObject(type, value, path, registry, options);
    case 'record':
      return validateRecord(type, value, path, registry, options);
    case 'union': {
      const anyOk = type.variants.some(
        (variant) =>
          validateValue(variant, value, path, registry, options).length === 0
      );
      return anyOk ? [] : [invalid(path, 'Value does not match any union arm.')];
    }
    case 'intersection':
      return type.variants.flatMap((variant) =>
        validateValue(variant, value, path, registry, options)
      );
    case 'tagged-union':
      return validateTaggedUnion(type, value, path, registry, options);
    case 'ref': {
      const resolved = registry.resolveRef(type.ref);
      if (resolved.issues.length > 0) {
        return resolved.issues.map((issue) => ({ ...issue, path }));
      }
      if (!resolved.type) {
        return [];
      }
      if (isSameTypeExpression(resolved.type, type)) {
        return [
          {
            code: 'unsupported-type-validation',
            message:
              'Cannot validate a non-transparent or recursive type reference structurally.',
            path,
          },
        ];
      }
      return validateValue(resolved.type, value, path, registry, options);
    }
    case 'refinement': {
      const baseIssues = validateValue(
        type.base,
        value,
        path,
        registry,
        options
      );
      if (baseIssues.length > 0) {
        return baseIssues;
      }
      return type.predicates.flatMap((predicate) =>
        validatePredicate(predicate, value, path, options.predicateHandler)
      );
    }
  }
};

const validatePrimitive = (
  name: TypePrimitiveName,
  value: unknown,
  path: TypePath
): TypeIssue[] => {
  switch (name) {
    case 'null':
      return value === null ? [] : [invalid(path, 'Expected null.')];
    case 'boolean':
      return typeof value === 'boolean'
        ? []
        : [invalid(path, 'Expected boolean.')];
    case 'integer':
      return Number.isInteger(value)
        ? []
        : [invalid(path, 'Expected integer.')];
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? []
        : [invalid(path, 'Expected finite number.')];
    case 'string':
      return typeof value === 'string'
        ? []
        : [invalid(path, 'Expected string.')];
    case 'bytes':
      return value instanceof Uint8Array
        ? []
        : [invalid(path, 'Expected Uint8Array bytes.')];
    default:
      return unreachable(name);
  }
};

const validateTuple = (
  type: Extract<AlgebraicTypeExpression, { kind: 'tuple' }>,
  value: unknown,
  path: TypePath,
  registry: TypeRegistry,
  options: { predicateHandler?: PredicateHandler }
): TypeIssue[] => {
  if (!Array.isArray(value)) {
    return [invalid(path, 'Expected tuple array.')];
  }
  if (!type.rest && value.length !== type.items.length) {
    return [invalid(path, `Expected tuple length ${type.items.length}.`)];
  }
  if (type.rest && value.length < type.items.length) {
    return [invalid(path, `Expected at least ${type.items.length} items.`)];
  }
  const issues: TypeIssue[] = [];
  for (let i = 0; i < type.items.length; i++) {
    issues.push(
      ...validateValue(type.items[i], value[i], [...path, i], registry, options)
    );
  }
  if (type.rest) {
    for (let i = type.items.length; i < value.length; i++) {
      issues.push(
        ...validateValue(type.rest, value[i], [...path, i], registry, options)
      );
    }
  }
  return issues;
};

const validateObject = (
  type: Extract<AlgebraicTypeExpression, { kind: 'object' }>,
  value: unknown,
  path: TypePath,
  registry: TypeRegistry,
  options: { predicateHandler?: PredicateHandler }
): TypeIssue[] => {
  if (!isPlainObject(value)) {
    return [invalid(path, 'Expected object.')];
  }
  const record = value as Record<string, unknown>;
  const issues: TypeIssue[] = [];
  for (const [key, field] of Object.entries(type.fields)) {
    if (!(key in record)) {
      if (!field.optional) {
        issues.push(invalid([...path, key], 'Missing required field.'));
      }
      continue;
    }
    issues.push(
      ...validateValue(field.type, record[key], [...path, key], registry, options)
    );
  }
  for (const [key, item] of Object.entries(record)) {
    if (type.fields[key]) {
      continue;
    }
    if (type.index) {
      issues.push(
        ...validateValue(
          type.index.value,
          item,
          [...path, key],
          registry,
          options
        )
      );
    } else if (type.exact) {
      issues.push(invalid([...path, key], 'Unexpected field.'));
    }
  }
  return issues;
};

const validateRecord = (
  type: Extract<AlgebraicTypeExpression, { kind: 'record' }>,
  value: unknown,
  path: TypePath,
  registry: TypeRegistry,
  options: { predicateHandler?: PredicateHandler }
): TypeIssue[] => {
  if (!isPlainObject(value)) {
    return [invalid(path, 'Expected record object.')];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
    if (type.key === 'integer' && !/^-?\d+$/.test(key)) {
      return [invalid([...path, key], 'Expected integer-like record key.')];
    }
    return validateValue(type.value, item, [...path, key], registry, options);
  });
};

const validateTaggedUnion = (
  type: Extract<AlgebraicTypeExpression, { kind: 'tagged-union' }>,
  value: unknown,
  path: TypePath,
  registry: TypeRegistry,
  options: { predicateHandler?: PredicateHandler }
): TypeIssue[] => {
  if (!isPlainObject(value)) {
    return [invalid(path, 'Expected tagged object.')];
  }
  const tagValue = (value as Record<string, unknown>)[type.tag];
  if (!isTypeJsonPrimitive(tagValue)) {
    return [invalid([...path, type.tag], 'Expected primitive tag value.')];
  }
  const variant = type.variants[String(tagValue)];
  if (!variant) {
    return [invalid([...path, type.tag], 'Unknown tagged-union variant.')];
  }
  return validateValue(variant, value, path, registry, options);
};

const validatePredicate = (
  predicate: TypePredicate,
  value: unknown,
  path: TypePath,
  customHandler?: PredicateHandler
): TypeIssue[] => {
  switch (predicate.kind) {
    case 'range': {
      if (typeof value !== 'number') {
        return [invalid(path, 'Range predicate requires number.')];
      }
      if (
        predicate.min !== undefined &&
        (predicate.exclusiveMin ? value <= predicate.min : value < predicate.min)
      ) {
        return [invalid(path, 'Value is below range minimum.')];
      }
      if (
        predicate.max !== undefined &&
        (predicate.exclusiveMax ? value >= predicate.max : value > predicate.max)
      ) {
        return [invalid(path, 'Value is above range maximum.')];
      }
      return [];
    }
    case 'length': {
      const length =
        typeof value === 'string' || Array.isArray(value)
          ? value.length
          : undefined;
      if (length === undefined) {
        return [invalid(path, 'Length predicate requires string or array.')];
      }
      if (predicate.min !== undefined && length < predicate.min) {
        return [invalid(path, 'Length is below minimum.')];
      }
      if (predicate.max !== undefined && length > predicate.max) {
        return [invalid(path, 'Length is above maximum.')];
      }
      return [];
    }
    case 'pattern':
      return typeof value === 'string' && new RegExp(predicate.pattern).test(value)
        ? []
        : [invalid(path, 'String does not match pattern.')];
    case 'multiple-of':
      return typeof value === 'number' && value % predicate.value === 0
        ? []
        : [invalid(path, `Value is not a multiple of ${predicate.value}.`)];
    case 'custom':
      if (!customHandler) {
        return [
          {
            code: 'unsupported-predicate',
            message: `Unsupported custom predicate: ${predicate.namespace}/${predicate.key}`,
            path,
          },
        ];
      }
      return customHandler(predicate, value)
        ? []
        : [invalid(path, 'Custom predicate failed.')];
  }
};

const validatePredicateExpression = (
  predicate: TypePredicate,
  path: TypePath
): TypeIssue[] => {
  switch (predicate.kind) {
    case 'range':
      return predicate.min !== undefined &&
        predicate.max !== undefined &&
        predicate.min > predicate.max
        ? [
            {
              code: 'invalid-type-expression',
              message: 'Range minimum cannot exceed maximum.',
              path,
            },
          ]
        : [];
    case 'length':
      return predicate.min !== undefined &&
        predicate.max !== undefined &&
        predicate.min > predicate.max
        ? [
            {
              code: 'invalid-type-expression',
              message: 'Length minimum cannot exceed maximum.',
              path,
            },
          ]
        : [];
    case 'pattern':
      try {
        new RegExp(predicate.pattern);
        return [];
      } catch {
        return [
          {
            code: 'invalid-type-expression',
            message: 'Invalid regular expression pattern.',
            path,
          },
        ];
      }
    case 'multiple-of':
      return predicate.value > 0
        ? []
        : [
            {
              code: 'invalid-type-expression',
              message: 'multiple-of value must be positive.',
              path,
            },
          ];
    case 'custom':
      return predicate.namespace && predicate.key
        ? []
        : [
            {
              code: 'invalid-type-expression',
              message: 'Custom predicate must include namespace and key.',
              path,
            },
          ];
  }
};

export const isAssignable = (
  source: AlgebraicTypeExpression,
  target: AlgebraicTypeExpression,
  context: AssignabilityContext
): boolean => {
  const key = `${JSON.stringify(source)}=>${JSON.stringify(target)}`;
  if (context.seen.has(key)) {
    return true;
  }
  context.seen.add(key);

  source = resolveTransparent(source, context.registry);
  target = resolveTransparent(target, context.registry);

  if (target.kind === 'any' || source.kind === 'never') {
    return true;
  }
  if (source.kind === 'any') {
    return isKind(target, 'any') || isKind(target, 'unknown');
  }
  if (target.kind === 'unknown') {
    return true;
  }
  if (source.kind === 'unknown') {
    return isKind(target, 'unknown');
  }
  if (target.kind === 'union') {
    return target.variants.some((variant) =>
      isAssignable(source, variant, context)
    );
  }
  if (source.kind === 'union') {
    return source.variants.every((variant) =>
      isAssignable(variant, target, context)
    );
  }
  if (target.kind === 'intersection') {
    return target.variants.every((variant) =>
      isAssignable(source, variant, context)
    );
  }
  if (source.kind === 'intersection') {
    return source.variants.some((variant) =>
      isAssignable(variant, target, context)
    );
  }
  if (target.kind === 'refinement') {
    return isAssignable(source, target.base, context);
  }
  if (source.kind === 'refinement') {
    return isAssignable(source.base, target, context);
  }
  if (source.kind === 'literal') {
    return literalAssignable(source.value, target, context);
  }
  if (source.kind === 'enum') {
    return source.values.every((value) =>
      literalAssignable(value, target, context)
    );
  }
  if (target.kind === 'enum') {
    return false;
  }
  if (source.kind === 'primitive' && target.kind === 'primitive') {
    return (
      source.name === target.name ||
      (source.name === 'integer' && target.name === 'number')
    );
  }
  if (source.kind === 'array' && target.kind === 'array') {
    return isAssignable(source.element, target.element, context);
  }
  if (source.kind === 'tuple' && target.kind === 'array') {
    return [...source.items, ...(source.rest ? [source.rest] : [])].every((item) =>
      isAssignable(item, target.element, context)
    );
  }
  if (source.kind === 'tuple' && target.kind === 'tuple') {
    if (!target.rest && source.items.length !== target.items.length) {
      return false;
    }
    if (source.items.length < target.items.length) {
      return false;
    }
    for (let i = 0; i < target.items.length; i++) {
      if (!isAssignable(source.items[i], target.items[i], context)) {
        return false;
      }
    }
    if (target.rest) {
      const restItems = source.items.slice(target.items.length);
      return restItems.every((item) =>
        isAssignable(item, target.rest!, context)
      );
    }
    return true;
  }
  if (source.kind === 'object' && target.kind === 'object') {
    return objectAssignable(source, target, context);
  }
  if (source.kind === 'record' && target.kind === 'record') {
    return (
      source.key === target.key &&
      isAssignable(source.value, target.value, context)
    );
  }
  if (source.kind === 'tagged-union') {
    return Object.values(source.variants).every((variant) =>
      isAssignable(variant, target, context)
    );
  }
  if (target.kind === 'tagged-union') {
    return Object.values(target.variants).some((variant) =>
      isAssignable(source, variant, context)
    );
  }
  if (source.kind === 'ref' || target.kind === 'ref') {
    return JSON.stringify(source) === JSON.stringify(target);
  }
  return false;
};

export const mayOverlap = (
  source: AlgebraicTypeExpression,
  target: AlgebraicTypeExpression,
  registry: TypeRegistry
): boolean => {
  const sourceResolved = resolveTransparent(source, registry);
  const targetResolved = resolveTransparent(target, registry);
  if (
    sourceResolved.kind === 'never' ||
    targetResolved.kind === 'never'
  ) {
    return false;
  }
  if (
    sourceResolved.kind === 'any' ||
    targetResolved.kind === 'any' ||
    sourceResolved.kind === 'unknown' ||
    targetResolved.kind === 'unknown'
  ) {
    return true;
  }
  if (sourceResolved.kind === 'union') {
    return sourceResolved.variants.some((variant) =>
      mayOverlap(variant, targetResolved, registry)
    );
  }
  if (targetResolved.kind === 'union') {
    return targetResolved.variants.some((variant) =>
      mayOverlap(sourceResolved, variant, registry)
    );
  }
  return (
    isAssignable(sourceResolved, targetResolved, {
      registry,
      seen: new Set(),
    }) ||
    isAssignable(targetResolved, sourceResolved, {
      registry,
      seen: new Set(),
    }) ||
    primitiveFamily(sourceResolved) === primitiveFamily(targetResolved)
  );
};

const objectAssignable = (
  source: Extract<AlgebraicTypeExpression, { kind: 'object' }>,
  target: Extract<AlgebraicTypeExpression, { kind: 'object' }>,
  context: AssignabilityContext
): boolean => {
  for (const [key, targetField] of Object.entries(target.fields)) {
    const sourceField = source.fields[key];
    if (!sourceField) {
      if (!targetField.optional) {
        return false;
      }
      continue;
    }
    if (
      !isAssignable(sourceField.type, targetField.type, context) ||
      (!targetField.optional && sourceField.optional)
    ) {
      return false;
    }
  }
  if (target.exact) {
    for (const key of Object.keys(source.fields)) {
      if (!target.fields[key]) {
        return false;
      }
    }
  }
  return true;
};

const literalAssignable = (
  value: TypeJsonPrimitive,
  target: AlgebraicTypeExpression,
  context: AssignabilityContext
): boolean => {
  if (target.kind === 'literal') {
    return Object.is(value, target.value);
  }
  if (target.kind === 'primitive') {
    return validatePrimitiveKind(target.name, value);
  }
  if (target.kind === 'enum') {
    return target.values.some((item) => Object.is(item, value));
  }
  return isAssignable(literalPrimitive(value), target, context);
};

const resolveTransparent = (
  type: AlgebraicTypeExpression,
  registry: TypeRegistry
): AlgebraicTypeExpression => {
  if (type.kind !== 'ref') {
    return type;
  }
  const resolved = registry.resolveRef(type.ref);
  return resolved.type ?? type;
};

const validatePrimitiveKind = (
  name: TypePrimitiveName,
  value: unknown
): boolean => {
  switch (name) {
    case 'null':
      return value === null;
    case 'boolean':
      return typeof value === 'boolean';
    case 'integer':
      return Number.isInteger(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'string':
      return typeof value === 'string';
    case 'bytes':
      return value instanceof Uint8Array;
    default:
      return unreachable(name);
  }
};

const literalPrimitive = (
  value: TypeJsonPrimitive
): AlgebraicTypeExpression => {
  if (value === null) {
    return { kind: 'primitive', name: 'null' };
  }
  if (typeof value === 'boolean') {
    return { kind: 'primitive', name: 'boolean' };
  }
  if (typeof value === 'number') {
    return {
      kind: 'primitive',
      name: Number.isInteger(value) ? 'integer' : 'number',
    };
  }
  return { kind: 'primitive', name: 'string' };
};

const primitiveFamily = (type: AlgebraicTypeExpression): string => {
  if (type.kind === 'primitive') {
    return type.name === 'integer' ? 'number' : type.name;
  }
  if (type.kind === 'literal') {
    return literalPrimitive(type.value).kind === 'primitive'
      ? primitiveFamily(literalPrimitive(type.value))
      : 'unknown';
  }
  return type.kind;
};

const isKind = <K extends AlgebraicTypeExpression['kind']>(
  type: AlgebraicTypeExpression,
  kind: K
): type is Extract<AlgebraicTypeExpression, { kind: K }> =>
  type.kind === kind;

const isSameTypeExpression = (
  left: AlgebraicTypeExpression,
  right: AlgebraicTypeExpression
): boolean => JSON.stringify(left) === JSON.stringify(right);

const invalid = (path: TypePath, message: string): TypeIssue => ({
  code: 'invalid-value',
  message,
  path,
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTypeJsonPrimitive = (value: unknown): value is TypeJsonPrimitive =>
  value === null ||
  typeof value === 'boolean' ||
  typeof value === 'number' ||
  typeof value === 'string';

const unreachable = (value: never): never => {
  throw new Error(`Unreachable type-system branch: ${String(value)}`);
};
