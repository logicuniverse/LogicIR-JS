import {
  AlgebraicTypeExpression,
  TypeDefinition,
  TypeIssue,
  TypeRef,
} from './types';

export type TypeRegistryOptions = {
  definitions?: Record<string, TypeDefinition>;
  externalResolver?: (ref: Extract<TypeRef, { kind: 'external' }>) =>
    | TypeDefinition
    | undefined;
};

export class TypeRegistry {
  private definitions: Record<string, TypeDefinition>;
  private externalResolver?: TypeRegistryOptions['externalResolver'];

  constructor(options: TypeRegistryOptions = {}) {
    this.definitions = { ...(options.definitions ?? {}) };
    this.externalResolver = options.externalResolver;
  }

  addDefinitions(definitions: Record<string, TypeDefinition>): void {
    Object.assign(this.definitions, definitions);
  }

  getDefinition(name: string): TypeDefinition | undefined {
    return this.definitions[name];
  }

  resolveRef(
    ref: TypeRef,
    typeArgs: Record<string, AlgebraicTypeExpression> = {},
    stack: string[] = []
  ): { type?: AlgebraicTypeExpression; issues: TypeIssue[] } {
    if (ref.kind === 'parameter') {
      const type = typeArgs[ref.name];
      return type
        ? { type, issues: [] }
        : {
            issues: [
              {
                code: 'unknown-type-reference',
                message: `Unknown type parameter: ${ref.name}`,
              },
            ],
          };
    }

    const definition =
      ref.kind === 'definition'
        ? this.definitions[ref.name]
        : this.externalResolver?.(ref);
    const refName =
      ref.kind === 'definition'
        ? ref.name
        : `${ref.namespace}/${ref.key}${ref.version ? `@${ref.version}` : ''}`;

    if (!definition) {
      return {
        issues: [
          {
            code: 'unknown-type-reference',
            message: `Unknown type reference: ${refName}`,
          },
        ],
      };
    }

    if (stack.includes(refName)) {
      return { type: { kind: 'ref', ref }, issues: [] };
    }

    if (definition.kind === 'opaque' || definition.kind === 'nominal') {
      if (!definition.transparent || !definition.type) {
        return { type: { kind: 'ref', ref }, issues: [] };
      }
    }

    if (!definition.type) {
      return {
        issues: [
          {
            code: 'invalid-type-expression',
            message: `Type definition has no transparent body: ${refName}`,
          },
        ],
      };
    }

    const parameters = definition.parameters ?? [];
    const args = ref.args ?? [];
    if (args.length > parameters.length) {
      return {
        issues: [
          {
            code: 'invalid-type-arguments',
            message: `Too many type arguments for ${refName}`,
          },
        ],
      };
    }

    const nextArgs = { ...typeArgs };
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      const arg = args[i] ?? parameter.default;
      if (!arg) {
        return {
          issues: [
            {
              code: 'invalid-type-arguments',
              message: `Missing type argument ${parameter.name} for ${refName}`,
            },
          ],
        };
      }
      nextArgs[parameter.name] = arg;
    }

    return {
      type: substituteTypeParameters(definition.type, nextArgs, [
        ...stack,
        refName,
      ]),
      issues: [],
    };
  }
}

export const substituteTypeParameters = (
  type: AlgebraicTypeExpression,
  args: Record<string, AlgebraicTypeExpression>,
  stack: string[] = []
): AlgebraicTypeExpression => {
  switch (type.kind) {
    case 'ref':
      if (type.ref.kind === 'parameter') {
        return args[type.ref.name] ?? type;
      }
      return {
        kind: 'ref',
        ref: {
          ...type.ref,
          args: type.ref.args?.map((arg) =>
            substituteTypeParameters(arg, args, stack)
          ),
        },
      };
    case 'array':
      return {
        ...type,
        element: substituteTypeParameters(type.element, args, stack),
      };
    case 'tuple':
      return {
        ...type,
        items: type.items.map((item) =>
          substituteTypeParameters(item, args, stack)
        ),
        rest: type.rest
          ? substituteTypeParameters(type.rest, args, stack)
          : undefined,
      };
    case 'object':
      return {
        ...type,
        fields: Object.fromEntries(
          Object.entries(type.fields).map(([key, field]) => [
            key,
            {
              ...field,
              type: substituteTypeParameters(field.type, args, stack),
            },
          ])
        ),
        index: type.index
          ? {
              ...type.index,
              value: substituteTypeParameters(type.index.value, args, stack),
            }
          : undefined,
      };
    case 'record':
      return {
        ...type,
        value: substituteTypeParameters(type.value, args, stack),
      };
    case 'union':
    case 'intersection':
      return {
        ...type,
        variants: type.variants.map((item) =>
          substituteTypeParameters(item, args, stack)
        ),
      };
    case 'tagged-union':
      return {
        ...type,
        variants: Object.fromEntries(
          Object.entries(type.variants).map(([key, value]) => [
            key,
            substituteTypeParameters(value, args, stack),
          ])
        ),
      };
    case 'refinement':
      return {
        ...type,
        base: substituteTypeParameters(type.base, args, stack),
      };
    default:
      return type;
  }
};
