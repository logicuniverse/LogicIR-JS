export type StdlibNodeCategory =
  | 'constant'
  | 'operator'
  | 'number'
  | 'string'
  | 'array'
  | 'object'
  | 'async'
  | 'event'
  | 'property'
  | 'component';

export type StdlibNodeKind =
  | 'compute'
  | 'sequence'
  | 'state-machine'
  | 'component';

export type CallbackPort = {
  key: string;
  params: string[];
  returnVoid?: boolean;
};

export type StdlibNodeSpec = {
  key: string;
  category: StdlibNodeCategory;
  kind: StdlibNodeKind;
  inputPorts: string[];
  outputPorts: string[];
  callbackPorts?: CallbackPort[];
  legacyTemplate: string;
  legacyFunction: string;
  notes?: string;
};

export const legacyStdlibNodeKeys = [
  'constant.null',
  'constant.string',
  'constant.number',
  'constant.boolean',
  'operator.add',
  'operator.subtract',
  'operator.multiply',
  'operator.divide',
  'operator.exponentiate',
  'operator.modulo',
  'operator.increment',
  'operator.decrement',
  'operator.eq',
  'operator.ne',
  'operator.gt',
  'operator.lt',
  'operator.gte',
  'operator.lte',
  'operator.and',
  'operator.or',
  'operator.not',
  'operator.nullCoalesce',
  'operator.bitwiseAnd',
  'operator.bitwiseOr',
  'operator.bitwiseNot',
  'operator.bitwiseXor',
  'operator.bitwiseLeftShift',
  'operator.bitwiseRightShift',
  'operator.bitwiseUnsignedRightShift',
  'number.isFinite',
  'number.isInteger',
  'number.isNaN',
  'number.isSafeInteger',
  'number.parseFloat',
  'number.parseInt',
  'string.at',
  'string.charCodeAt',
  'string.codePointAt',
  'string.concat',
  'string.endsWith',
  'string.length',
  'string.includes',
  'string.indexOf',
  'string.lastIndexOf',
  'string.padEnd',
  'string.padStart',
  'string.repeat',
  'string.replace',
  'string.replaceAll',
  'string.slice',
  'string.split',
  'string.startsWith',
  'string.toLowerCase',
  'string.toUpperCase',
  'string.trim',
  'string.trimEnd',
  'string.trimStart',
  'array.toArray',
  'array.fromArray',
  'array.at',
  'array.concat',
  'array.entries',
  'array.every',
  'array.filter',
  'array.find',
  'array.findIndex',
  'array.findLast',
  'array.findLastIndex',
  'array.flat',
  'array.flatMap',
  'array.forEach',
  'array.includes',
  'array.indexOf',
  'array.join',
  'array.lastIndexOf',
  'array.length',
  'array.map',
  'array.reduce',
  'array.reduceRight',
  'array.slice',
  'array.some',
  'array.toReversed',
  'array.toSorted',
  'object.toObject',
  'object.fromObject',
  'object.keys',
  'object.values',
  'object.entries',
  'async.await',
  'async.delayMs',
  'event.mux',
  'event.demux',
  'event.handler',
  'event.emit',
  'event.mapTo',
  'event.merge',
  'property',
  'property.array',
  'property.boolean',
  'property.number',
  'property.object',
  'property.string',
  'component.fromObject',
  'component.fromArray',
] as const;

export type LegacyStdlibNodeKey = (typeof legacyStdlibNodeKeys)[number];

const unaryOperatorKeys = new Set([
  'operator.increment',
  'operator.decrement',
  'operator.not',
  'operator.bitwiseNot',
]);

const numberStringInputKeys = new Set(['number.parseFloat', 'number.parseInt']);

const stringBinaryKeys = new Set([
  'string.at',
  'string.charCodeAt',
  'string.codePointAt',
  'string.endsWith',
  'string.includes',
  'string.indexOf',
  'string.lastIndexOf',
  'string.repeat',
  'string.split',
  'string.startsWith',
]);

const stringTernaryKeys = new Set([
  'string.padEnd',
  'string.padStart',
  'string.replace',
  'string.replaceAll',
  'string.slice',
]);

const arrayBinaryKeys = new Set([
  'array.at',
  'array.concat',
  'array.includes',
  'array.indexOf',
  'array.join',
  'array.lastIndexOf',
  'array.slice',
]);

const arrayCallbackKeys = new Map<string, CallbackPort>([
  ['array.every', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.filter', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.find', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.findIndex', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.findLast', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.findLastIndex', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.flatMap', { key: 'callbackFn', params: ['element', 'index'] }],
  [
    'array.forEach',
    { key: 'callbackFn', params: ['element', 'index'], returnVoid: true },
  ],
  ['array.map', { key: 'callbackFn', params: ['element', 'index'] }],
  ['array.some', { key: 'callbackFn', params: ['element', 'index'] }],
  [
    'array.reduce',
    {
      key: 'callbackFn',
      params: ['accumulator', 'currentValue', 'currentIndex'],
    },
  ],
  [
    'array.reduceRight',
    {
      key: 'callbackFn',
      params: ['accumulator', 'currentValue', 'currentIndex'],
    },
  ],
  ['array.toSorted', { key: 'compareFn', params: ['a', 'b'] }],
]);

const propertyInputPorts: Record<string, string[]> = {
  property: ['initial', 'update'],
  'property.array': [
    'initial',
    'pop',
    'push',
    'shift',
    'unshift',
    'sort',
    'reverse',
  ],
  'property.boolean': ['initial', 'set', 'toggle', 'setTrue', 'setFalse'],
  'property.number': ['initial', 'set', 'add', 'subtract', 'increment', 'decrement'],
  'property.object': ['initial', 'set', 'delete'],
  'property.string': ['initial', 'prepend', 'concat'],
};

const categoryFor = (key: string): StdlibNodeCategory => {
  const [prefix] = key.split('.');
  if (key === 'property' || prefix === 'property') {
    return 'property';
  }
  return prefix as StdlibNodeCategory;
};

const kindFor = (key: string): StdlibNodeKind => {
  if (key.startsWith('property') || ['event.mux', 'event.demux', 'event.merge'].includes(key)) {
    return 'state-machine';
  }
  if (key.startsWith('async.') || ['event.handler', 'event.emit'].includes(key)) {
    return 'sequence';
  }
  if (key.startsWith('component.')) {
    return 'component';
  }
  return 'compute';
};

const inputPortsFor = (key: LegacyStdlibNodeKey): string[] => {
  if (key === 'constant.null') {
    return [];
  }
  if (key === 'constant.string') {
    return ['input'];
  }
  if (key === 'constant.number' || key === 'constant.boolean') {
    return ['value'];
  }
  if (key.startsWith('operator.')) {
    return unaryOperatorKeys.has(key) ? ['value'] : ['a', 'b'];
  }
  if (key.startsWith('number.')) {
    return numberStringInputKeys.has(key) ? ['string'] : ['number'];
  }
  if (key === 'string.concat') {
    return ['a', 'b'];
  }
  if (key.startsWith('string.')) {
    if (stringTernaryKeys.has(key)) {
      if (key === 'string.slice') {
        return ['string', 'start', 'end'];
      }
      if (key === 'string.replace' || key === 'string.replaceAll') {
        return ['string', 'searchValue', 'replaceValue'];
      }
      return ['string', 'targetLength', 'padString'];
    }
    if (stringBinaryKeys.has(key)) {
      if (
        key === 'string.endsWith' ||
        key === 'string.includes' ||
        key === 'string.indexOf' ||
        key === 'string.lastIndexOf' ||
        key === 'string.startsWith'
      ) {
        return ['string', 'substr'];
      }
      if (key === 'string.repeat') {
        return ['string', 'count'];
      }
      if (key === 'string.split') {
        return ['string', 'separator'];
      }
      return ['string', 'index'];
    }
    return ['string'];
  }
  if (key === 'array.toArray' || key === 'array.fromArray') {
    return ['input'];
  }
  if (key.startsWith('array.')) {
    const callback = arrayCallbackKeys.get(key);
    if (callback) {
      if (key === 'array.reduce' || key === 'array.reduceRight') {
        return ['array', 'initialValue', callback.key];
      }
      return ['array', callback.key];
    }
    if (arrayBinaryKeys.has(key)) {
      if (key === 'array.at') {
        return ['array', 'index'];
      }
      if (key === 'array.concat') {
        return ['a', 'b'];
      }
      if (key === 'array.join') {
        return ['array', 'separator'];
      }
      if (key === 'array.slice') {
        return ['array', 'start', 'end'];
      }
      return ['array', 'value'];
    }
    return ['array'];
  }
  if (key === 'object.toObject' || key === 'object.fromObject') {
    return ['input'];
  }
  if (key.startsWith('object.')) {
    return ['object'];
  }
  if (key === 'async.delayMs') {
    return ['ms'];
  }
  if (key === 'async.await') {
    return ['in'];
  }
  if (key === 'event.emit') {
    return ['input'];
  }
  if (key === 'event.mapTo') {
    return ['event', 'value'];
  }
  if (key === 'event.handler') {
    return ['input', 'eventHandler'];
  }
  if (key.startsWith('event.')) {
    return ['in'];
  }
  if (key in propertyInputPorts) {
    return propertyInputPorts[key];
  }
  if (key.startsWith('component.')) {
    return ['children'];
  }
  return [];
};

const outputPortsFor = (key: LegacyStdlibNodeKey): string[] => {
  if (
    key === 'async.delayMs' ||
    key === 'event.handler' ||
    key === 'event.emit' ||
    key === 'event.mux' ||
    key === 'event.demux' ||
    key === 'event.merge' ||
    key === 'array.forEach'
  ) {
    return [];
  }
  if (key === 'property') {
    return ['output'];
  }
  if (key.startsWith('property.')) {
    return ['value'];
  }
  if (key.startsWith('component.')) {
    return ['root'];
  }
  return ['result'];
};

const legacyTemplateFor = (key: LegacyStdlibNodeKey): string => {
  const category = categoryFor(key);
  const templateCategory = category === 'property' ? 'state' : category;
  return `packages/legacy/flow-core/src/nodes/stdlib/${templateCategory}`;
};

const legacyFunctionFor = (key: LegacyStdlibNodeKey): string => {
  const category = categoryFor(key);
  const functionFile =
    category === 'constant'
      ? 'constants'
      : category === 'operator'
        ? 'operators'
        : category === 'property'
          ? 'state'
          : category;
  return `packages/legacy/flow-core/src/node-functions/stdlib/${functionFile}.ts`;
};

export const stdlibNodeSpecs: StdlibNodeSpec[] = legacyStdlibNodeKeys.map(
  (key) => ({
    key,
    category: categoryFor(key),
    kind: kindFor(key),
    inputPorts: inputPortsFor(key),
    outputPorts: outputPortsFor(key),
    callbackPorts: arrayCallbackKeys.has(key)
      ? [arrayCallbackKeys.get(key)!]
      : key === 'event.handler'
        ? [{ key: 'eventHandler', params: ['input'], returnVoid: true }]
        : undefined,
    legacyTemplate: legacyTemplateFor(key),
    legacyFunction: legacyFunctionFor(key),
    notes:
      key === 'array.entries'
        ? 'Runtime normalizes the JS iterator to an array for serializable smoke evidence.'
        : key === 'string.length' || key === 'array.length'
          ? 'Legacy object-method helper treated this as a method; the replica implements the intended property read.'
          : undefined,
  }),
);

export const stdlibNodeSpecByKey = new Map(
  stdlibNodeSpecs.map((entry) => [entry.key, entry]),
);
