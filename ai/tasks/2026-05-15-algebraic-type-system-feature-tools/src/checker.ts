import { TypeRegistry } from './registry';
import type {
  AlgebraicTypeExpression,
  JsonPrimitive,
  PredicateHandler,
  PrimitiveTypeName,
  TypeCheckResult,
  TypeCompatibilityMode,
  TypeCompatibilityResult,
  TypeIssue,
  TypePath,
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
  readonly registry: TypeRegistry;
  private predicateHandler?: PredicateHandler;

  constructor(options: TypeCheckerOptions = {}) {
    this.registry = options.registry ?? new TypeRegistry();
    this.predicateHandler = options.predicateHandler;
  }

  validateType(type: AlgebraicTypeExpression): TypeCheckResult {
    const issues = validateTypeExpression(type, this.registry);
    return resultFromIssues(issues);
  }

  validateValue(type: AlgebraicTypeExpression, value: unknown): TypeCheckResult {
    const issues = validateValue(type, value, [], this.registry, {
      predicateHandler: this.predicateHandler,
    });
    return resultFromIssues(issues);
  }

  compare(
    source: AlgebraicTypeExpression,
    target: AlgebraicTypeExpression,
    mode: TypeCompatibilityMode = 'assignable',
  ): TypeCompatibilityResult {
    if (mode === 'assignable') {
      return compatibilityResult(
        mode,
        isAssignable(source, target, {
          registry: this.registry,
          seen: new Set(),
        }),
        'Source type is not assignable to target type.',
      );
    }

    if (mode === 'equivalent') {
      const ok =
        this.compare(source, target, 'assignable').ok &&
        this.compare(target, source, 'assignable').ok;
      return compatibilityResult(mode, ok, 'Types are not equivalent.');
    }

    const overlaps = mayOverlap(source, target, this.registry);
    const ok = mode === 'overlap' ? overlaps : !overlaps;
    return compatibilityResult(
      mode,
      ok,
      mode === 'overlap' ? 'Types do not overlap.' : 'Types are not disjoint.',
    );
  }
}

export const validateTypeExpression = (
  type: AlgebraicTypeExpression,
  registry = new TypeRegistry(),
  path: TypePath = [],
): TypeIssue[] => {
  switch (type.kind) {
    case 'any':
    case 'unknown':
    case 'never':
      return [];
    case 'primitive':
      return isPrimitiveName(type.name)
        ? []
        : [issue('invalid-type-expression', `Unknown primitive ${type.name}.`, path)];
    case 'literal':
      return isJsonPrimitive(type.value)
        ? []
        : [issue('invalid-type-expression', 'Literal must be a JSON primitive.', path)];
    case 'enum':
      return type.values.every(isJsonPrimitive)
        ? []
        : [issue('invalid-type-expression', 'Enum values must be JSON primitives.', path)];
    case 'array':
      return validateTypeExpression(type.element, registry, [...path, 'element']);
    case 'tuple':
      return [
        ...type.items.flatMap((item, index) =>
          validateTypeExpression(item, registry, [...path, 'items', index]),
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
          ]),
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
          issue(
            'invalid-type-expression',
            `${type.kind} must contain at least one variant.`,
            path,
          ),
        ];
      }
      return type.variants.flatMap((variant, index) =>
        validateTypeExpression(variant, registry, [...path, 'variants', index]),
      );
    case 'tagged-union':
      if (Object.keys(type.variants).length === 0) {
        return [
          issue(
            'invalid-type-expression',
            'tagged-union must contain at least one variant.',
            path,
          ),
        ];
      }
      return Object.entries(type.variants).flatMap(([key, variant]) =>
        validateTypeExpression(variant, registry, [...path, 'variants', key]),
      );
    case 'ref': {
      if (type.ref.kind === 'parameter') {
        return [];
      }
      const resolved = registry.resolveRef(type.ref);
      return resolved.issues.map((item) => ({ ...item, path }));
    }
    case 'refinement':
      return [
        ...validateTypeExpression(type.base, registry, [...path, 'base']),
        ...type.predicates.flatMap((predicate, index) =>
          validatePredicateExpression(predicate, [
            ...path,
            'predicates',
            index,
          ]),
        ),
      ];
  }
};

export const validateValue = (
  type: AlgebraicTypeExpression,
  value: unknown,
  path: TypePath = [],
  registry = new TypeRegistry(),
  options: { predicateHandler?: PredicateHandler } = {},
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
        validateValue(type.element, item, [...path, index], registry, options),
      );
    case 'tuple':
      return validateTuple(type, value, path, registry, options);
    case 'object':
      return validateObject(type, value, path, registry, options);
    case 'record':
      return validateRecord(type, value, path, registry, options);
    case 'union':
      return type.variants.some(
        (variant) =>
          validateValue(variant, value, path, registry, options).length === 0,
      )
        ? []
        : [invalid(path, 'Value does not match any union variant.')];
    case 'intersection':
      return type.variants.flatMap((variant) =>
        validateValue(variant, value, path, registry, options),
      );
    case 'tagged-union':
      return validateTaggedUnion(type, value, path, registry, options);
    case 'ref': {
      const resolved = registry.resolveRef(type.ref);
      if (resolved.issues.length > 0) {
        return resolved.issues.map((item) => ({ ...item, path }));
      }
      if (!resolved.type) {
        return [];
      }
      if (sameType(resolved.type, type)) {
        return [
          issue(
            'unsupported-type-validation',
            'Cannot structurally validate a non-transparent or recursive type reference.',
            path,
          ),
        ];
      }
      return validateValue(resolved.type, value, path, registry, options);
    }
    case 'refinement': {
      const baseIssues = validateValue(type.base, value, path, registry, options);
      if (baseIssues.length > 0) {
        return baseIssues;
      }
      return type.predicates.flatMap((predicate) =>
        validatePredicate(predicate, value, path, options.predicateHandler),
      );
    }
  }
};

export const isAssignable = (
  source: AlgebraicTypeExpression,
  target: AlgebraicTypeExpression,
  context: AssignabilityContext,
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
    return target.kind === 'unknown';
  }
  if (target.kind === 'unknown') {
    return true;
  }
  if (source.kind === 'unknown') {
    return false;
  }
  if (source.kind === 'union') {
    return source.variants.every((variant) =>
      isAssignable(variant, target, context),
    );
  }
  if (source.kind === 'enum') {
    return source.values.every((value) =>
      literalAssignable(value, target, context),
    );
  }
  if (target.kind === 'union') {
    return target.variants.some((variant) =>
      isAssignable(source, variant, context),
    );
  }
  if (target.kind === 'intersection') {
    return target.variants.every((variant) =>
      isAssignable(source, variant, context),
    );
  }
  if (source.kind === 'intersection') {
    return source.variants.some((variant) =>
      isAssignable(variant, target, context),
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
    return [...source.items, ...(source.rest ? [source.rest] : [])].every(
      (item) => isAssignable(item, target.element, context),
    );
  }
  if (source.kind === 'tuple' && target.kind === 'tuple') {
    return tupleAssignable(source, target, context);
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
      isAssignable(variant, target, context),
    );
  }
  if (target.kind === 'tagged-union') {
    return Object.values(target.variants).some((variant) =>
      isAssignable(source, variant, context),
    );
  }
  if (source.kind === 'ref' || target.kind === 'ref') {
    return sameType(source, target);
  }
  return false;
};

export const mayOverlap = (
  source: AlgebraicTypeExpression,
  target: AlgebraicTypeExpression,
  registry: TypeRegistry,
): boolean => {
  const left = resolveTransparent(source, registry);
  const right = resolveTransparent(target, registry);

  if (left.kind === 'never' || right.kind === 'never') {
    return false;
  }
  if (
    left.kind === 'any' ||
    right.kind === 'any' ||
    left.kind === 'unknown' ||
    right.kind === 'unknown'
  ) {
    return true;
  }
  if (left.kind === 'union') {
    return left.variants.some((variant) => mayOverlap(variant, right, registry));
  }
  if (right.kind === 'union') {
    return right.variants.some((variant) => mayOverlap(left, variant, registry));
  }

  return (
    isAssignable(left, right, { registry, seen: new Set() }) ||
    isAssignable(right, left, { registry, seen: new Set() }) ||
    primitiveFamily(left) === primitiveFamily(right)
  );
};

const validateTuple = (
  type: Extract<AlgebraicTypeExpression, { kind: 'tuple' }>,
  value: unknown,
  path: TypePath,
  registry: TypeRegistry,
  options: { predicateHandler?: PredicateHandler },
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
  for (let index = 0; index < type.items.length; index++) {
    issues.push(
      ...validateValue(
        type.items[index],
        value[index],
        [...path, index],
        registry,
        options,
      ),
    );
  }
  if (type.rest) {
    for (let index = type.items.length; index < value.length; index++) {
      issues.push(
        ...validateValue(
          type.rest,
          value[index],
          [...path, index],
          registry,
          options,
        ),
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
  options: { predicateHandler?: PredicateHandler },
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
      ...validateValue(field.type, record[key], [...path, key], registry, options),
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
          options,
        ),
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
  options: { predicateHandler?: PredicateHandler },
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
  options: { predicateHandler?: PredicateHandler },
): TypeIssue[] => {
  if (!isPlainObject(value)) {
    return [invalid(path, 'Expected tagged object.')];
  }
  const tagValue = (value as Record<string, unknown>)[type.tag];
  if (!isJsonPrimitive(tagValue)) {
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
  customHandler?: PredicateHandler,
): TypeIssue[] => {
  switch (predicate.kind) {
    case 'range':
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
          issue(
            'unsupported-predicate',
            `Unsupported custom predicate: ${predicate.namespace}/${predicate.key}`,
            path,
          ),
        ];
      }
      return customHandler(predicate, value)
        ? []
        : [invalid(path, 'Custom predicate failed.')];
  }
};

const validatePredicateExpression = (
  predicate: TypePredicate,
  path: TypePath,
): TypeIssue[] => {
  switch (predicate.kind) {
    case 'range':
      return predicate.min !== undefined &&
        predicate.max !== undefined &&
        predicate.min > predicate.max
        ? [issue('invalid-type-expression', 'Range minimum exceeds maximum.', path)]
        : [];
    case 'length':
      return predicate.min !== undefined &&
        predicate.max !== undefined &&
        predicate.min > predicate.max
        ? [issue('invalid-type-expression', 'Length minimum exceeds maximum.', path)]
        : [];
    case 'pattern':
      try {
        new RegExp(predicate.pattern);
        return [];
      } catch {
        return [issue('invalid-type-expression', 'Invalid regex pattern.', path)];
      }
    case 'multiple-of':
      return predicate.value > 0
        ? []
        : [issue('invalid-type-expression', 'multiple-of must be positive.', path)];
    case 'custom':
      return predicate.namespace && predicate.key
        ? []
        : [
            issue(
              'invalid-type-expression',
              'Custom predicate must include namespace and key.',
              path,
            ),
          ];
  }
};

const tupleAssignable = (
  source: Extract<AlgebraicTypeExpression, { kind: 'tuple' }>,
  target: Extract<AlgebraicTypeExpression, { kind: 'tuple' }>,
  context: AssignabilityContext,
): boolean => {
  if (!target.rest && source.items.length !== target.items.length) {
    return false;
  }
  if (source.items.length < target.items.length) {
    return false;
  }
  for (let index = 0; index < target.items.length; index++) {
    if (!isAssignable(source.items[index], target.items[index], context)) {
      return false;
    }
  }
  if (!target.rest) {
    return true;
  }
  return source.items
    .slice(target.items.length)
    .every((item) => isAssignable(item, target.rest!, context));
};

const objectAssignable = (
  source: Extract<AlgebraicTypeExpression, { kind: 'object' }>,
  target: Extract<AlgebraicTypeExpression, { kind: 'object' }>,
  context: AssignabilityContext,
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
  value: JsonPrimitive,
  target: AlgebraicTypeExpression,
  context: AssignabilityContext,
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
  if (target.kind === 'union') {
    return target.variants.some((variant) =>
      literalAssignable(value, variant, context),
    );
  }
  return isAssignable(literalPrimitive(value), target, context);
};

const resolveTransparent = (
  type: AlgebraicTypeExpression,
  registry: TypeRegistry,
): AlgebraicTypeExpression => {
  if (type.kind !== 'ref') {
    return type;
  }
  const resolved = registry.resolveRef(type.ref);
  return resolved.type ?? type;
};

const validatePrimitive = (
  name: PrimitiveTypeName,
  value: unknown,
  path: TypePath,
): TypeIssue[] =>
  validatePrimitiveKind(name, value)
    ? []
    : [invalid(path, `Expected ${name}.`)];

const validatePrimitiveKind = (
  name: PrimitiveTypeName,
  value: unknown,
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
  }
};

const literalPrimitive = (value: JsonPrimitive): AlgebraicTypeExpression => {
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
    return primitiveFamily(literalPrimitive(type.value));
  }
  return type.kind;
};

const compatibilityResult = (
  mode: TypeCompatibilityMode,
  ok: boolean,
  message: string,
): TypeCompatibilityResult => ({
  ok,
  mode,
  issues: ok ? [] : [issue('incompatible-type', message)],
});

const resultFromIssues = (issues: TypeIssue[]): TypeCheckResult =>
  issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };

const invalid = (path: TypePath, message: string): TypeIssue =>
  issue('invalid-value', message, path);

const issue = (
  code: TypeIssue['code'],
  message: string,
  path?: TypePath,
): TypeIssue => ({ code, message, path });

const isPrimitiveName = (name: string): name is PrimitiveTypeName =>
  ['null', 'boolean', 'integer', 'number', 'string', 'bytes'].includes(name);

const isJsonPrimitive = (value: unknown): value is JsonPrimitive =>
  value === null ||
  typeof value === 'boolean' ||
  typeof value === 'number' ||
  typeof value === 'string';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sameType = (
  left: AlgebraicTypeExpression,
  right: AlgebraicTypeExpression,
): boolean => JSON.stringify(left) === JSON.stringify(right);
