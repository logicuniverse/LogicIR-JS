import { simpleService2Service } from 'ff-runtime-core';
import { getObjectMethodNodeFunctions } from './utils/object-method';
import { numberSimpleNodeTemplates } from '../../nodes/stdlib/number';

export const numberService = simpleService2Service({
  ...getObjectMethodNodeFunctions(numberSimpleNodeTemplates, 'number', Number),
});
