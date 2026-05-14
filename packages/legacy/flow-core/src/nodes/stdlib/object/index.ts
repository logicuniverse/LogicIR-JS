import { NodeTemplate } from '../../../common';
import {
  SimpleNodeTemplate,
  simpleNodeTemplateToNodeTemplate,
} from '../../utils';
import { fromObjectNodeTemplate } from './from-object';
import { toObjectNodeTemplate } from './to-object';

export const objectSimpleNodeTemplates: Record<string, SimpleNodeTemplate> = {
  keys: {
    displayName: 'Keys',
    params: [{ key: 'object', displayName: 'Object' }],
  },
  values: {
    displayName: 'Values',
    params: [{ key: 'object', displayName: 'Object' }],
  },
  entries: {
    displayName: 'Entries',
    params: [{ key: 'object', displayName: 'Object' }],
  },
};

export const objectNodeTemplates: Record<string, NodeTemplate> = {
  'object.toObject': toObjectNodeTemplate,
  'object.fromObject': fromObjectNodeTemplate,
  ...Object.fromEntries(
    Object.entries(objectSimpleNodeTemplates).map(([key, op]) => [
      `object.${key}`,
      simpleNodeTemplateToNodeTemplate(op),
    ])
  ),
};
