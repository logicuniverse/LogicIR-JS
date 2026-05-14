import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';
import { identityFunction } from './utils/identity';
import { arraySimpleNodeTemplates } from '../../nodes/stdlib/array';
import { getObjectMethodNodeFunctions } from './utils/object-method';

export const arrayService = simpleService2Service({
  'array.toArray': identityFunction,
  'array.fromArray': identityFunction,
  ...getObjectMethodNodeFunctions(arraySimpleNodeTemplates, 'array'),
});
