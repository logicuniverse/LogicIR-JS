import { NodeTemplate } from '../../../common';
import {
  SimpleNodeTemplate,
  simpleNodeTemplateToNodeTemplate,
} from '../../utils';

const arithmeticOperations: Record<string, SimpleNodeTemplate> = {
  add: {
    displayName: '+',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  subtract: {
    displayName: '-',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  multiply: {
    displayName: '*',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  divide: {
    displayName: '÷',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  exponentiate: {
    displayName: '**',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  modulo: {
    displayName: '%',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  increment: {
    displayName: '+1',
    params: [{ key: 'value', displayName: 'value' }],
  },
  decrement: {
    displayName: '-1',
    params: [{ key: 'value', displayName: 'value' }],
  },
};

const comparisonOperations: Record<string, SimpleNodeTemplate> = {
  eq: {
    displayName: '===',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  ne: {
    displayName: '!==',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  gt: {
    displayName: '>',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  lt: {
    displayName: '<',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  gte: {
    displayName: '>=',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  lte: {
    displayName: '<=',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
};

const logicalOperations: Record<string, SimpleNodeTemplate> = {
  and: {
    displayName: 'Logical And',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  or: {
    displayName: 'Logical Or',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  not: {
    displayName: 'Logical Not',
    params: [{ key: 'value', displayName: 'value' }],
  },
  nullCoalesce: {
    displayName: 'Null Coalesce',
    params: [
      { key: 'value', displayName: 'value' },
      { key: 'default', displayName: 'default' },
    ],
  },
};

const bitwiseOperations: Record<string, SimpleNodeTemplate> = {
  bitwiseAnd: {
    displayName: 'Bitwise And',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  bitwiseOr: {
    displayName: 'Bitwise Or',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  bitwiseNot: {
    displayName: 'Bitwise Not',
    params: [{ key: 'value', displayName: 'value' }],
  },
  bitwiseXor: {
    displayName: 'Bitwise Xor',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  bitwiseLeftShift: {
    displayName: 'Left Shift',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  bitwiseRightShift: {
    displayName: 'Right Shift',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  bitwiseUnsignedRightShift: {
    displayName: 'Unsigned Right Shift',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
};

export const operatorNodeTemplates: Record<string, NodeTemplate> = {
  ...Object.fromEntries(
    Object.entries({
      ...arithmeticOperations,
      ...comparisonOperations,
      ...logicalOperations,
      ...bitwiseOperations,
    }).map(([key, op]) => [
      `operator.${key}`,
      simpleNodeTemplateToNodeTemplate(op),
    ])
  ),
};
