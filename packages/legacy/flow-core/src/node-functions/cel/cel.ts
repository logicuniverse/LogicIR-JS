import { SimpleNodeFunction } from 'ff-runtime-core';
import { evaluate } from '@marcbachmann/cel-js';
export const celNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const expression = inputs['expression'] as string;
  const context = inputs['context'] || {};
  return evaluate(expression, context);
};
