import { SimpleNodeFunction } from 'ff-runtime-core';

export const identityFunction: SimpleNodeFunction = ({ inputs }) => {
  return Object.values(inputs)[0];
};
