import {
  legacyStdlibNodeKeys,
  type LegacyStdlibNodeKey,
} from './catalog';

export type ProviderContext = {
  getState: (key: string) => unknown;
  setState: (key: string, value: unknown) => void;
  emit: (key: string, value: unknown, path?: (string | number)[]) => void;
  invoke: (key: string, inputs: Record<string, unknown>) => unknown;
};

export type StdlibProvider = (
  inputs: Record<string, unknown>,
  context: ProviderContext,
) => Record<string, unknown> | Promise<Record<string, unknown>>;

const result = (value: unknown): Record<string, unknown> => ({ result: value });
const empty = (): Record<string, unknown> => ({});

const asArray = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array, got ${typeof value}`);
  }
  return value;
};

const asObject = (value: unknown): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected object, got ${typeof value}`);
  }
  return value as Record<string, unknown>;
};

const asFunction = (value: unknown): ((...args: unknown[]) => unknown) => {
  if (typeof value !== 'function') {
    throw new Error(`Expected function, got ${typeof value}`);
  }
  return value as (...args: unknown[]) => unknown;
};

const cloneArray = (value: unknown): unknown[] => [...asArray(value)];

const reverseFindIndex = (
  values: unknown[],
  predicate: (value: unknown, index: number) => boolean,
): number => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (predicate(values[index], index)) {
      return index;
    }
  }
  return -1;
};

const firstDefinedEvent = (inputs: Record<string, unknown>): {
  key: string;
  value: unknown;
} | undefined => {
  for (const [key, value] of Object.entries(inputs)) {
    if (key !== 'initial' && value !== undefined) {
      return { key, value };
    }
  }
  return undefined;
};

const stateKey = (nodeKey: LegacyStdlibNodeKey): string => `stdlib:${nodeKey}`;

const propertyProvider = (
  nodeKey: LegacyStdlibNodeKey,
  inputs: Record<string, unknown>,
  context: ProviderContext,
): Record<string, unknown> => {
  const key = stateKey(nodeKey);
  const existing = context.getState(key);
  const current = existing === undefined ? inputs.initial : existing;
  const event = firstDefinedEvent(inputs);

  let next = current;
  if (nodeKey === 'property') {
    next = inputs.update === undefined ? current : inputs.update;
    context.setState(key, next);
    return { output: next };
  }

  if (event) {
    if (nodeKey === 'property.array') {
      const currentArray = Array.isArray(current) ? current : [];
      if (event.key === 'push') next = [...currentArray, event.value];
      if (event.key === 'pop') next = currentArray.slice(0, -1);
      if (event.key === 'shift') next = currentArray.slice(1);
      if (event.key === 'unshift') next = [event.value, ...currentArray];
      if (event.key === 'sort') next = [...currentArray].sort();
      if (event.key === 'reverse') next = [...currentArray].reverse();
    }
    if (nodeKey === 'property.boolean') {
      if (event.key === 'set') next = Boolean(event.value);
      if (event.key === 'toggle') next = !current;
      if (event.key === 'setTrue') next = true;
      if (event.key === 'setFalse') next = false;
    }
    if (nodeKey === 'property.number') {
      const n = Number(current);
      if (event.key === 'set') next = Number(event.value);
      if (event.key === 'add') next = n + Number(event.value);
      if (event.key === 'subtract') next = n - Number(event.value);
      if (event.key === 'increment') next = n + 1;
      if (event.key === 'decrement') next = n - 1;
    }
    if (nodeKey === 'property.object') {
      const object = asObject(current ?? {});
      if (event.key === 'set') next = asObject(event.value);
      if (event.key === 'delete') {
        const copy = { ...object };
        delete copy[String(event.value)];
        next = copy;
      }
    }
    if (nodeKey === 'property.string') {
      const text = String(current ?? '');
      if (event.key === 'prepend') next = String(event.value) + text;
      if (event.key === 'concat') next = text + String(event.value);
    }
  }

  context.setState(key, next);
  return { value: next };
};

const providers: Record<LegacyStdlibNodeKey, StdlibProvider> = {
  'constant.null': () => result(null),
  'constant.string': (inputs) => result(inputs.input),
  'constant.number': (inputs) =>
    result(typeof inputs.value === 'number' ? inputs.value : Number(inputs.value)),
  'constant.boolean': (inputs) => result(Boolean(inputs.value)),

  'operator.add': (inputs) => result(Number(inputs.a) + Number(inputs.b)),
  'operator.subtract': (inputs) => result(Number(inputs.a) - Number(inputs.b)),
  'operator.multiply': (inputs) => result(Number(inputs.a) * Number(inputs.b)),
  'operator.divide': (inputs) => result(Number(inputs.a) / Number(inputs.b)),
  'operator.exponentiate': (inputs) => result(Number(inputs.a) ** Number(inputs.b)),
  'operator.modulo': (inputs) => result(Number(inputs.a) % Number(inputs.b)),
  'operator.increment': (inputs) => result(Number(inputs.value) + 1),
  'operator.decrement': (inputs) => result(Number(inputs.value) - 1),
  'operator.eq': (inputs) => result(inputs.a === inputs.b),
  'operator.ne': (inputs) => result(inputs.a !== inputs.b),
  'operator.gt': (inputs) => result(Number(inputs.a) > Number(inputs.b)),
  'operator.lt': (inputs) => result(Number(inputs.a) < Number(inputs.b)),
  'operator.gte': (inputs) => result(Number(inputs.a) >= Number(inputs.b)),
  'operator.lte': (inputs) => result(Number(inputs.a) <= Number(inputs.b)),
  'operator.and': (inputs) => result(Boolean(inputs.a) && Boolean(inputs.b)),
  'operator.or': (inputs) => result(Boolean(inputs.a) || Boolean(inputs.b)),
  'operator.not': (inputs) => result(!Boolean(inputs.value)),
  'operator.nullCoalesce': (inputs) =>
    result(inputs.a === null || inputs.a === undefined ? inputs.b : inputs.a),
  'operator.bitwiseAnd': (inputs) => result(Number(inputs.a) & Number(inputs.b)),
  'operator.bitwiseOr': (inputs) => result(Number(inputs.a) | Number(inputs.b)),
  'operator.bitwiseNot': (inputs) => result(~Number(inputs.value)),
  'operator.bitwiseXor': (inputs) => result(Number(inputs.a) ^ Number(inputs.b)),
  'operator.bitwiseLeftShift': (inputs) =>
    result(Number(inputs.a) << Number(inputs.b)),
  'operator.bitwiseRightShift': (inputs) =>
    result(Number(inputs.a) >> Number(inputs.b)),
  'operator.bitwiseUnsignedRightShift': (inputs) =>
    result(Number(inputs.a) >>> Number(inputs.b)),

  'number.isFinite': (inputs) => result(Number.isFinite(inputs.number)),
  'number.isInteger': (inputs) => result(Number.isInteger(inputs.number)),
  'number.isNaN': (inputs) => result(Number.isNaN(inputs.number)),
  'number.isSafeInteger': (inputs) => result(Number.isSafeInteger(inputs.number)),
  'number.parseFloat': (inputs) => result(Number.parseFloat(String(inputs.string))),
  'number.parseInt': (inputs) => result(Number.parseInt(String(inputs.string))),

  'string.at': (inputs) => result(String(inputs.string).at(Number(inputs.index))),
  'string.charCodeAt': (inputs) =>
    result(String(inputs.string).charCodeAt(Number(inputs.index))),
  'string.codePointAt': (inputs) =>
    result(String(inputs.string).codePointAt(Number(inputs.index))),
  'string.concat': (inputs) => result(String(inputs.a).concat(String(inputs.b))),
  'string.endsWith': (inputs) =>
    result(String(inputs.string).endsWith(String(inputs.substr))),
  'string.length': (inputs) => result(String(inputs.string).length),
  'string.includes': (inputs) =>
    result(String(inputs.string).includes(String(inputs.substr))),
  'string.indexOf': (inputs) =>
    result(String(inputs.string).indexOf(String(inputs.substr))),
  'string.lastIndexOf': (inputs) =>
    result(String(inputs.string).lastIndexOf(String(inputs.substr))),
  'string.padEnd': (inputs) =>
    result(
      String(inputs.string).padEnd(
        Number(inputs.targetLength),
        String(inputs.padString),
      ),
    ),
  'string.padStart': (inputs) =>
    result(
      String(inputs.string).padStart(
        Number(inputs.targetLength),
        String(inputs.padString),
      ),
    ),
  'string.repeat': (inputs) =>
    result(String(inputs.string).repeat(Number(inputs.count))),
  'string.replace': (inputs) =>
    result(
      String(inputs.string).replace(
        String(inputs.searchValue),
        String(inputs.replaceValue),
      ),
    ),
  'string.replaceAll': (inputs) =>
    result(
      String(inputs.string).split(String(inputs.searchValue)).join(String(inputs.replaceValue)),
    ),
  'string.slice': (inputs) =>
    result(String(inputs.string).slice(Number(inputs.start), Number(inputs.end))),
  'string.split': (inputs) =>
    result(String(inputs.string).split(String(inputs.separator))),
  'string.startsWith': (inputs) =>
    result(String(inputs.string).startsWith(String(inputs.substr))),
  'string.toLowerCase': (inputs) => result(String(inputs.string).toLowerCase()),
  'string.toUpperCase': (inputs) => result(String(inputs.string).toUpperCase()),
  'string.trim': (inputs) => result(String(inputs.string).trim()),
  'string.trimEnd': (inputs) => result(String(inputs.string).trimEnd()),
  'string.trimStart': (inputs) => result(String(inputs.string).trimStart()),

  'array.toArray': (inputs) => result(inputs.input),
  'array.fromArray': (inputs) => result(inputs.input),
  'array.at': (inputs) => result(asArray(inputs.array).at(Number(inputs.index))),
  'array.concat': (inputs) => result(asArray(inputs.a).concat(asArray(inputs.b))),
  'array.entries': (inputs) => result(Array.from(asArray(inputs.array).entries())),
  'array.every': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).every((value, index) => Boolean(callback(value, index))));
  },
  'array.filter': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).filter((value, index) => Boolean(callback(value, index))));
  },
  'array.find': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).find((value, index) => Boolean(callback(value, index))));
  },
  'array.findIndex': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).findIndex((value, index) => Boolean(callback(value, index))));
  },
  'array.findLast': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    const values = asArray(inputs.array);
    const index = reverseFindIndex(values, (value, i) => Boolean(callback(value, i)));
    return result(index === -1 ? undefined : values[index]);
  },
  'array.findLastIndex': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(reverseFindIndex(asArray(inputs.array), (value, index) => Boolean(callback(value, index))));
  },
  'array.flat': (inputs) => result(asArray(inputs.array).flat()),
  'array.flatMap': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).flatMap((value, index) => callback(value, index) as readonly unknown[]));
  },
  'array.forEach': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    asArray(inputs.array).forEach((value, index) => {
      callback(value, index);
    });
    return empty();
  },
  'array.includes': (inputs) => result(asArray(inputs.array).includes(inputs.value)),
  'array.indexOf': (inputs) => result(asArray(inputs.array).indexOf(inputs.value)),
  'array.join': (inputs) => result(asArray(inputs.array).join(String(inputs.separator))),
  'array.lastIndexOf': (inputs) =>
    result(asArray(inputs.array).lastIndexOf(inputs.value)),
  'array.length': (inputs) => result(asArray(inputs.array).length),
  'array.map': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).map((value, index) => callback(value, index)));
  },
  'array.reduce': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(
      asArray(inputs.array).reduce(
        (accumulator, currentValue, currentIndex) =>
          callback(accumulator, currentValue, currentIndex),
        inputs.initialValue,
      ),
    );
  },
  'array.reduceRight': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(
      asArray(inputs.array).reduceRight(
        (accumulator, currentValue, currentIndex) =>
          callback(accumulator, currentValue, currentIndex),
        inputs.initialValue,
      ),
    );
  },
  'array.slice': (inputs) =>
    result(asArray(inputs.array).slice(Number(inputs.start), Number(inputs.end))),
  'array.some': (inputs) => {
    const callback = asFunction(inputs.callbackFn);
    return result(asArray(inputs.array).some((value, index) => Boolean(callback(value, index))));
  },
  'array.toReversed': (inputs) => result(cloneArray(inputs.array).reverse()),
  'array.toSorted': (inputs) => {
    const callback = asFunction(inputs.compareFn);
    return result(cloneArray(inputs.array).sort((a, b) => Number(callback(a, b))));
  },

  'object.toObject': (inputs) => result(inputs.input),
  'object.fromObject': (inputs) => result(inputs.input),
  'object.keys': (inputs) => result(Object.keys(asObject(inputs.object))),
  'object.values': (inputs) => result(Object.values(asObject(inputs.object))),
  'object.entries': (inputs) => result(Object.entries(asObject(inputs.object))),

  'async.await': async (inputs) => result(await inputs.in),
  'async.delayMs': async (inputs) => {
    const ms = Math.max(0, Number(inputs.ms));
    await new Promise((resolve) => setTimeout(resolve, ms));
    return empty();
  },

  'event.mux': (inputs, context) => {
    context.emit('out', inputs.in);
    return empty();
  },
  'event.demux': (inputs, context) => {
    context.emit('out', inputs.in);
    return empty();
  },
  'event.handler': (inputs, context) => {
    const handler =
      typeof inputs.eventHandler === 'function'
        ? asFunction(inputs.eventHandler)
        : (handlerInputs: Record<string, unknown>) =>
            context.invoke('eventHandler', handlerInputs);
    handler({ input: inputs.input });
    return empty();
  },
  'event.emit': (inputs, context) => {
    context.emit('output', inputs.input);
    return empty();
  },
  'event.mapTo': (inputs) => result(inputs.value),
  'event.merge': (inputs, context) => {
    context.emit('out', inputs.in);
    return empty();
  },

  property: (inputs, context) => propertyProvider('property', inputs, context),
  'property.array': (inputs, context) =>
    propertyProvider('property.array', inputs, context),
  'property.boolean': (inputs, context) =>
    propertyProvider('property.boolean', inputs, context),
  'property.number': (inputs, context) =>
    propertyProvider('property.number', inputs, context),
  'property.object': (inputs, context) =>
    propertyProvider('property.object', inputs, context),
  'property.string': (inputs, context) =>
    propertyProvider('property.string', inputs, context),

  'component.fromObject': (inputs) => ({
    root: { item: null, children: asObject(inputs.children) },
  }),
  'component.fromArray': (inputs) => ({
    root: { item: null, children: asArray(inputs.children) },
  }),
};

for (const key of legacyStdlibNodeKeys) {
  if (!providers[key]) {
    throw new Error(`Provider table is missing ${key}`);
  }
}

export const stdlibProviders: Record<LegacyStdlibNodeKey, StdlibProvider> =
  providers;
