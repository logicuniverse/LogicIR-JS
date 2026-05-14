import { simpleService2Service } from 'ff-runtime-core';
import { tag2compute } from '../utils/tag2compute';
import { rawContentNodeFunction } from './raw-content';

export const htmlService = simpleService2Service({
  'html.div': tag2compute('div'),
  'html.raw': rawContentNodeFunction,
});
