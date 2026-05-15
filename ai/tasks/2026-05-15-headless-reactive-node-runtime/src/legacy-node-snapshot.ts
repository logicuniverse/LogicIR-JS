import type { NodeTemplateSnapshot, OperatorKey, RuntimeValue } from './types';

export const legacyNodeSnapshots: Record<string, NodeTemplateSnapshot> = {
  property: {
    key: 'property',
    displayName: 'Property',
    kind: 'property',
    inputs: ['initial', 'update'],
    outputs: ['output'],
    retainedOutputs: ['output'],
    commands: ['set'],
  },
  'property.number': {
    key: 'property.number',
    displayName: 'Number Property',
    kind: 'number-property',
    inputs: ['initial', 'set', 'add', 'subtract', 'increment', 'decrement'],
    outputs: ['value'],
    retainedOutputs: ['value'],
    commands: ['set', 'add', 'subtract', 'increment', 'decrement'],
  },
  'event.merge': {
    key: 'event.merge',
    displayName: 'Merge',
    kind: 'event-merge',
    inputs: ['in'],
    outputs: ['out'],
  },
  'event.mux': {
    key: 'event.mux',
    displayName: 'Mux',
    kind: 'event-mux',
    inputs: ['in'],
    outputs: ['out'],
  },
  'operator.add': {
    key: 'operator.add',
    displayName: '+',
    kind: 'operator',
    inputs: ['a', 'b'],
    outputs: ['value'],
    operator: 'add',
  },
  'operator.gt': {
    key: 'operator.gt',
    displayName: '>',
    kind: 'operator',
    inputs: ['a', 'b'],
    outputs: ['value'],
    operator: 'gt',
  },
};

const operators: Record<OperatorKey, (a: RuntimeValue, b: RuntimeValue) => RuntimeValue> = {
  add: (a, b) => number(a) + number(b),
  subtract: (a, b) => number(a) - number(b),
  multiply: (a, b) => number(a) * number(b),
  divide: (a, b) => number(a) / number(b),
  eq: (a, b) => Object.is(a, b),
  gt: (a, b) => number(a) > number(b),
  gte: (a, b) => number(a) >= number(b),
  lt: (a, b) => number(a) < number(b),
  lte: (a, b) => number(a) <= number(b),
  and: (a, b) => Boolean(a) && Boolean(b),
  or: (a, b) => Boolean(a) || Boolean(b),
};

export const runOperator = (
  operator: OperatorKey,
  a: RuntimeValue,
  b: RuntimeValue,
): RuntimeValue => operators[operator](a, b);

export const applyNumberPropertyCommand = (
  current: number,
  eventKey: string,
  value: RuntimeValue,
): number => {
  if (eventKey === 'set') {
    return number(value);
  }
  if (eventKey === 'add') {
    return current + number(value);
  }
  if (eventKey === 'subtract') {
    return current - number(value);
  }
  if (eventKey === 'increment') {
    return current + 1;
  }
  if (eventKey === 'decrement') {
    return current - 1;
  }
  return current;
};

const number = (value: RuntimeValue): number => {
  if (typeof value !== 'number') {
    throw new Error(`Expected number, received ${JSON.stringify(value)}.`);
  }
  return value;
};
