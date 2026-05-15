import type { LegacyStdlibNodeKey } from './catalog';

export type SmokeCase = {
  key: LegacyStdlibNodeKey;
  inputs: Record<string, unknown>;
  expected: Record<string, unknown>;
  expectedEmitted?: Record<string, unknown[]>;
  expectedState?: Record<string, unknown>;
};

const greaterThanTwo = (element: unknown): boolean => Number(element) > 2;
const even = (element: unknown): boolean => Number(element) % 2 === 0;
const double = (element: unknown): number => Number(element) * 2;
const duplicate = (element: unknown): number[] => [
  Number(element),
  Number(element) * 10,
];
const sum = (accumulator: unknown, current: unknown): number =>
  Number(accumulator) + Number(current);
const descending = (a: unknown, b: unknown): number => Number(b) - Number(a);

export const smokeCases: SmokeCase[] = [
  { key: 'constant.null', inputs: {}, expected: { result: null } },
  { key: 'constant.string', inputs: { input: 'abc' }, expected: { result: 'abc' } },
  { key: 'constant.number', inputs: { value: '42' }, expected: { result: 42 } },
  { key: 'constant.boolean', inputs: { value: 1 }, expected: { result: true } },

  { key: 'operator.add', inputs: { a: 4, b: 3 }, expected: { result: 7 } },
  { key: 'operator.subtract', inputs: { a: 4, b: 3 }, expected: { result: 1 } },
  { key: 'operator.multiply', inputs: { a: 4, b: 3 }, expected: { result: 12 } },
  { key: 'operator.divide', inputs: { a: 12, b: 3 }, expected: { result: 4 } },
  { key: 'operator.exponentiate', inputs: { a: 2, b: 3 }, expected: { result: 8 } },
  { key: 'operator.modulo', inputs: { a: 10, b: 4 }, expected: { result: 2 } },
  { key: 'operator.increment', inputs: { value: 4 }, expected: { result: 5 } },
  { key: 'operator.decrement', inputs: { value: 4 }, expected: { result: 3 } },
  { key: 'operator.eq', inputs: { a: 4, b: 4 }, expected: { result: true } },
  { key: 'operator.ne', inputs: { a: 4, b: '4' }, expected: { result: true } },
  { key: 'operator.gt', inputs: { a: 4, b: 3 }, expected: { result: true } },
  { key: 'operator.lt', inputs: { a: 4, b: 3 }, expected: { result: false } },
  { key: 'operator.gte', inputs: { a: 4, b: 4 }, expected: { result: true } },
  { key: 'operator.lte', inputs: { a: 3, b: 4 }, expected: { result: true } },
  { key: 'operator.and', inputs: { a: true, b: false }, expected: { result: false } },
  { key: 'operator.or', inputs: { a: false, b: true }, expected: { result: true } },
  { key: 'operator.not', inputs: { value: false }, expected: { result: true } },
  { key: 'operator.nullCoalesce', inputs: { a: null, b: 9 }, expected: { result: 9 } },
  { key: 'operator.bitwiseAnd', inputs: { a: 6, b: 3 }, expected: { result: 2 } },
  { key: 'operator.bitwiseOr', inputs: { a: 4, b: 1 }, expected: { result: 5 } },
  { key: 'operator.bitwiseNot', inputs: { value: 1 }, expected: { result: -2 } },
  { key: 'operator.bitwiseXor', inputs: { a: 5, b: 3 }, expected: { result: 6 } },
  { key: 'operator.bitwiseLeftShift', inputs: { a: 3, b: 2 }, expected: { result: 12 } },
  { key: 'operator.bitwiseRightShift', inputs: { a: 8, b: 1 }, expected: { result: 4 } },
  {
    key: 'operator.bitwiseUnsignedRightShift',
    inputs: { a: -1, b: 1 },
    expected: { result: 2147483647 },
  },

  { key: 'number.isFinite', inputs: { number: 3 }, expected: { result: true } },
  { key: 'number.isInteger', inputs: { number: 3.2 }, expected: { result: false } },
  { key: 'number.isNaN', inputs: { number: NaN }, expected: { result: true } },
  { key: 'number.isSafeInteger', inputs: { number: 42 }, expected: { result: true } },
  { key: 'number.parseFloat', inputs: { string: '4.5x' }, expected: { result: 4.5 } },
  { key: 'number.parseInt', inputs: { string: '42px' }, expected: { result: 42 } },

  { key: 'string.at', inputs: { string: 'abc', index: 1 }, expected: { result: 'b' } },
  {
    key: 'string.charCodeAt',
    inputs: { string: 'ABC', index: 1 },
    expected: { result: 66 },
  },
  {
    key: 'string.codePointAt',
    inputs: { string: 'ABC', index: 1 },
    expected: { result: 66 },
  },
  { key: 'string.concat', inputs: { a: 'ab', b: 'cd' }, expected: { result: 'abcd' } },
  {
    key: 'string.endsWith',
    inputs: { string: 'logicir', substr: 'ir' },
    expected: { result: true },
  },
  { key: 'string.length', inputs: { string: 'logic' }, expected: { result: 5 } },
  {
    key: 'string.includes',
    inputs: { string: 'logicir', substr: 'gic' },
    expected: { result: true },
  },
  {
    key: 'string.indexOf',
    inputs: { string: 'logicir', substr: 'i' },
    expected: { result: 3 },
  },
  {
    key: 'string.lastIndexOf',
    inputs: { string: 'logicir', substr: 'i' },
    expected: { result: 5 },
  },
  {
    key: 'string.padEnd',
    inputs: { string: 'x', targetLength: 3, padString: '0' },
    expected: { result: 'x00' },
  },
  {
    key: 'string.padStart',
    inputs: { string: 'x', targetLength: 3, padString: '0' },
    expected: { result: '00x' },
  },
  { key: 'string.repeat', inputs: { string: 'ab', count: 2 }, expected: { result: 'abab' } },
  {
    key: 'string.replace',
    inputs: { string: 'a-a', searchValue: 'a', replaceValue: 'b' },
    expected: { result: 'b-a' },
  },
  {
    key: 'string.replaceAll',
    inputs: { string: 'a-a', searchValue: 'a', replaceValue: 'b' },
    expected: { result: 'b-b' },
  },
  {
    key: 'string.slice',
    inputs: { string: 'logicir', start: 1, end: 4 },
    expected: { result: 'ogi' },
  },
  {
    key: 'string.split',
    inputs: { string: 'a,b', separator: ',' },
    expected: { result: ['a', 'b'] },
  },
  {
    key: 'string.startsWith',
    inputs: { string: 'logicir', substr: 'lo' },
    expected: { result: true },
  },
  {
    key: 'string.toLowerCase',
    inputs: { string: 'ABC' },
    expected: { result: 'abc' },
  },
  {
    key: 'string.toUpperCase',
    inputs: { string: 'abc' },
    expected: { result: 'ABC' },
  },
  { key: 'string.trim', inputs: { string: ' x ' }, expected: { result: 'x' } },
  { key: 'string.trimEnd', inputs: { string: ' x ' }, expected: { result: ' x' } },
  { key: 'string.trimStart', inputs: { string: ' x ' }, expected: { result: 'x ' } },

  { key: 'array.toArray', inputs: { input: [1, 2] }, expected: { result: [1, 2] } },
  { key: 'array.fromArray', inputs: { input: [1, 2] }, expected: { result: [1, 2] } },
  { key: 'array.at', inputs: { array: [1, 2, 3], index: 1 }, expected: { result: 2 } },
  { key: 'array.concat', inputs: { a: [1], b: [2] }, expected: { result: [1, 2] } },
  {
    key: 'array.entries',
    inputs: { array: ['a', 'b'] },
    expected: { result: [[0, 'a'], [1, 'b']] },
  },
  {
    key: 'array.every',
    inputs: { array: [2, 4], callbackFn: even },
    expected: { result: true },
  },
  {
    key: 'array.filter',
    inputs: { array: [1, 2, 3], callbackFn: greaterThanTwo },
    expected: { result: [3] },
  },
  {
    key: 'array.find',
    inputs: { array: [1, 2, 3], callbackFn: greaterThanTwo },
    expected: { result: 3 },
  },
  {
    key: 'array.findIndex',
    inputs: { array: [1, 3, 4], callbackFn: greaterThanTwo },
    expected: { result: 1 },
  },
  {
    key: 'array.findLast',
    inputs: { array: [1, 3, 4], callbackFn: greaterThanTwo },
    expected: { result: 4 },
  },
  {
    key: 'array.findLastIndex',
    inputs: { array: [1, 3, 4], callbackFn: greaterThanTwo },
    expected: { result: 2 },
  },
  { key: 'array.flat', inputs: { array: [1, [2]] }, expected: { result: [1, 2] } },
  {
    key: 'array.flatMap',
    inputs: { array: [1, 2], callbackFn: duplicate },
    expected: { result: [1, 10, 2, 20] },
  },
  {
    key: 'array.forEach',
    inputs: { array: [1, 2], callbackFn: double },
    expected: {},
  },
  {
    key: 'array.includes',
    inputs: { array: [1, 2], value: 2 },
    expected: { result: true },
  },
  {
    key: 'array.indexOf',
    inputs: { array: [1, 2], value: 2 },
    expected: { result: 1 },
  },
  {
    key: 'array.join',
    inputs: { array: ['a', 'b'], separator: '-' },
    expected: { result: 'a-b' },
  },
  {
    key: 'array.lastIndexOf',
    inputs: { array: [1, 2, 1], value: 1 },
    expected: { result: 2 },
  },
  { key: 'array.length', inputs: { array: [1, 2] }, expected: { result: 2 } },
  {
    key: 'array.map',
    inputs: { array: [1, 2], callbackFn: double },
    expected: { result: [2, 4] },
  },
  {
    key: 'array.reduce',
    inputs: { array: [1, 2, 3], initialValue: 0, callbackFn: sum },
    expected: { result: 6 },
  },
  {
    key: 'array.reduceRight',
    inputs: { array: ['a', 'b'], initialValue: '', callbackFn: (a: unknown, b: unknown) => `${a}${b}` },
    expected: { result: 'ba' },
  },
  {
    key: 'array.slice',
    inputs: { array: [1, 2, 3], start: 1, end: 3 },
    expected: { result: [2, 3] },
  },
  {
    key: 'array.some',
    inputs: { array: [1, 2, 3], callbackFn: greaterThanTwo },
    expected: { result: true },
  },
  {
    key: 'array.toReversed',
    inputs: { array: [1, 2, 3] },
    expected: { result: [3, 2, 1] },
  },
  {
    key: 'array.toSorted',
    inputs: { array: [1, 3, 2], compareFn: descending },
    expected: { result: [3, 2, 1] },
  },

  {
    key: 'object.toObject',
    inputs: { input: { a: 1 } },
    expected: { result: { a: 1 } },
  },
  {
    key: 'object.fromObject',
    inputs: { input: { a: 1 } },
    expected: { result: { a: 1 } },
  },
  {
    key: 'object.keys',
    inputs: { object: { a: 1, b: 2 } },
    expected: { result: ['a', 'b'] },
  },
  {
    key: 'object.values',
    inputs: { object: { a: 1, b: 2 } },
    expected: { result: [1, 2] },
  },
  {
    key: 'object.entries',
    inputs: { object: { a: 1, b: 2 } },
    expected: { result: [['a', 1], ['b', 2]] },
  },

  { key: 'async.await', inputs: { in: Promise.resolve('ready') }, expected: { result: 'ready' } },
  { key: 'async.delayMs', inputs: { ms: 0 }, expected: {} },

  {
    key: 'event.mux',
    inputs: { in: 'pulse' },
    expected: {},
    expectedEmitted: { out: ['pulse'] },
  },
  {
    key: 'event.demux',
    inputs: { in: { a: 1 } },
    expected: {},
    expectedEmitted: { out: [{ a: 1 }] },
  },
  {
    key: 'event.handler',
    inputs: { input: 'click', eventHandler: (payload: unknown) => payload },
    expected: {},
  },
  {
    key: 'event.emit',
    inputs: { input: 'msg' },
    expected: {},
    expectedEmitted: { output: ['msg'] },
  },
  {
    key: 'event.mapTo',
    inputs: { event: 'tick', value: 7 },
    expected: { result: 7 },
  },
  {
    key: 'event.merge',
    inputs: { in: 'pulse' },
    expected: {},
    expectedEmitted: { out: ['pulse'] },
  },

  {
    key: 'property',
    inputs: { initial: 'old', update: 'new' },
    expected: { output: 'new' },
    expectedState: { 'stdlib:property': 'new' },
  },
  {
    key: 'property.array',
    inputs: { initial: [1], push: 2 },
    expected: { value: [1, 2] },
    expectedState: { 'stdlib:property.array': [1, 2] },
  },
  {
    key: 'property.boolean',
    inputs: { initial: false, toggle: true },
    expected: { value: true },
    expectedState: { 'stdlib:property.boolean': true },
  },
  {
    key: 'property.number',
    inputs: { initial: 1, add: 4 },
    expected: { value: 5 },
    expectedState: { 'stdlib:property.number': 5 },
  },
  {
    key: 'property.object',
    inputs: { initial: { a: 1, b: 2 }, delete: 'a' },
    expected: { value: { b: 2 } },
    expectedState: { 'stdlib:property.object': { b: 2 } },
  },
  {
    key: 'property.string',
    inputs: { initial: 'core', prepend: 'logic-' },
    expected: { value: 'logic-core' },
    expectedState: { 'stdlib:property.string': 'logic-core' },
  },

  {
    key: 'component.fromObject',
    inputs: { children: { left: { tag: 'text' } } },
    expected: { root: { item: null, children: { left: { tag: 'text' } } } },
  },
  {
    key: 'component.fromArray',
    inputs: { children: [{ tag: 'a' }, { tag: 'b' }] },
    expected: { root: { item: null, children: [{ tag: 'a' }, { tag: 'b' }] } },
  },
];

export const coveredNodeKeys = smokeCases.map((entry) => entry.key);
