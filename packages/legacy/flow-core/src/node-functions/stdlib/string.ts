import { simpleService2Service } from 'ff-runtime-core';
import { getObjectMethodNodeFunctions } from './utils/object-method';
import { stringSimpleNodeTemplates } from '../../nodes/stdlib/string';

export const stringService = simpleService2Service({
  ...getObjectMethodNodeFunctions(stringSimpleNodeTemplates, 'string'),
});
