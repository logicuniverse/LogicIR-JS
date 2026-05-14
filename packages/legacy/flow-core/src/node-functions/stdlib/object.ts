import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';
import { identityFunction } from './utils/identity';

const keysNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const obj = inputs['object'] as Record<string, any>;
  return Object.keys(obj);
};

const valuesNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const obj = inputs['object'] as Record<string, any>;
  return Object.values(obj);
};

const entriesNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const obj = inputs['object'] as Record<string, any>;
  return Object.entries(obj);
};

export const objectService = simpleService2Service({
  'object.toObject': identityFunction,
  'object.fromObject': identityFunction,
  'object.keys': keysNodeFunction,
  'object.values': valuesNodeFunction,
  'object.entries': entriesNodeFunction,
});
