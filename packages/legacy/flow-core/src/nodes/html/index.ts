import { PackageDefinition } from '../../common';
import { htmlDivNodeTemplate } from './div';
import { rawContentTemplate } from './raw-content';

export const htmlPackage: PackageDefinition = {
  displayName: 'html',
  nodeTemplates: {
    'html.div': htmlDivNodeTemplate,
    'html.raw': rawContentTemplate,
  },
  children: [
    { displayName: 'Div', key: 'html.div' },
    { displayName: 'Raw Content', key: 'html.raw' },
  ],
};
