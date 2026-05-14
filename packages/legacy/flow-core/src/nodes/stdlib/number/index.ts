import { NodeTemplate } from '../../../common';
import {
  SimpleNodeTemplate,
  simpleNodeTemplateToNodeTemplate,
} from '../../utils';

export const numberSimpleNodeTemplates: Record<string, SimpleNodeTemplate> = {
  isFinite: {
    displayName: 'isFinite',
    params: [{ key: 'number', displayName: 'Number' }],
  },
  isInteger: {
    displayName: 'isInteger',
    params: [{ key: 'number', displayName: 'Number' }],
  },
  isNaN: {
    displayName: 'isNaN',
    params: [{ key: 'number', displayName: 'Number' }],
  },
  isSafeInteger: {
    displayName: 'isSafeInteger',
    params: [{ key: 'number', displayName: 'Number' }],
  },
  parseFloat: {
    displayName: 'parseFloat',
    params: [{ key: 'string', displayName: 'String' }],
  },
  parseInt: {
    displayName: 'parseInt',
    params: [{ key: 'string', displayName: 'String' }],
  },
};

export const numberNodeTemplates: Record<string, NodeTemplate> =
  Object.fromEntries(
    Object.entries(numberSimpleNodeTemplates).map(([key, op]) => [
      `number.${key}`,
      simpleNodeTemplateToNodeTemplate(op),
    ])
  );
