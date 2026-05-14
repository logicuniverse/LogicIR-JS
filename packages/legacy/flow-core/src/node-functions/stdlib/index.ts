import { Service } from 'ff-runtime-core';
import { numberService } from './number';
import { asyncService } from './async';
import { constantsService } from './constants';
import { arrayService } from './array';
import { objectService } from './object';
import { stateService } from './state';
import { eventService } from './event';
import { stringService } from './string';
import { operatorsService } from './operators';
import { componentService } from './component';

export const stdlibService: Service = {
  ...constantsService,
  ...operatorsService,
  ...numberService,
  ...stringService,
  ...arrayService,
  ...objectService,
  ...eventService,
  ...stateService,
  ...asyncService,
  ...componentService,
};
