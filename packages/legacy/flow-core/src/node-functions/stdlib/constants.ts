import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';

const nullNodeFunction: SimpleNodeFunction = () => {
  return null;
};

const stringNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  return inputs['input'] as string;
};

const booleanNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  return !!inputs['value'] as boolean;
};

const numberNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const value = inputs['value'];
  return typeof value === 'number' ? value : Number(value);
};

export const constantsService = simpleService2Service({
  'constant.null': nullNodeFunction,
  'constant.string': stringNodeFunction,
  'constant.boolean': booleanNodeFunction,
  'constant.number': numberNodeFunction,
});
