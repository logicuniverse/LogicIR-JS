import { NodeTemplate } from '../../../common';
import { booleanNodeTemplate } from './boolean';
import { nullNodeTemplate } from './null';
import { numberNodeTemplate } from './number';
import { stringNodeTemplate } from './string';

export const constantNodeTemplates: Record<string, NodeTemplate> = {
  'constant.null': nullNodeTemplate,
  'constant.string': stringNodeTemplate,
  'constant.number': numberNodeTemplate,
  'constant.boolean': booleanNodeTemplate,
};
