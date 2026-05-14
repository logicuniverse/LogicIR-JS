import { PackageDefinition } from '../../common';
import { celExpressionNodeTemplate } from './cel';

export const celPackage: PackageDefinition = {
  displayName: 'cel',
  nodeTemplates: {
    'cel.cel': celExpressionNodeTemplate,
  },
  children: [{ displayName: 'CEL Expression', key: 'cel.cel' }],
};
