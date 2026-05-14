import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';

const operators: Record<string, (a: any, b?: any) => any> = {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => a / b,
  modulo: (a: number, b: number) => a % b,
  exponentiate: (a: number, b: number) => a ** b,
  increment: (value: number) => value + 1,
  decrement: (value: number) => value - 1,

  eq: (a: any, b: any) => a === b,
  ne: (a: any, b: any) => a !== b,
  gt: (a: number, b: number) => a > b,
  gte: (a: number, b: number) => a >= b,
  lt: (a: number, b: number) => a < b,
  lte: (a: number, b: number) => a <= b,

  and: (a: boolean, b: boolean) => a && b,
  or: (a: boolean, b: boolean) => a || b,
  not: (a: boolean) => !a,
  nullCoalesce: (a: any, b: any) => (a === null || a === undefined ? b : a),

  bitwiseAnd: (a: number, b: number) => a & b,
  bitwiseOr: (a: number, b: number) => a | b,
  bitwiseNot: (a: number) => ~a,
  bitwiseXor: (a: number, b: number) => a ^ b,
  bitwiseLeftShift: (a: number, b: number) => a << b,
  bitwiseRightShift: (a: number, b: number) => a >> b,
  bitwiseUnsignedRightShift: (a: number, b: number) => a >>> b,
};

export const operatorsService = simpleService2Service(
  Object.fromEntries(
    Object.entries(operators).map(([key, fn]) => [
      `operator.${key}`,
      ({ inputs }) => fn(Object.values(inputs)[0], Object.values(inputs)[1]),
    ])
  )
);
