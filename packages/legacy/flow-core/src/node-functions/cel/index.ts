import { simpleService2Service } from 'ff-runtime-core';
import { celNodeFunction } from './cel';

export const celService = simpleService2Service({
  'cel.cel': celNodeFunction,
});
