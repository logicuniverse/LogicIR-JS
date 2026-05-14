import { PackageDefinition } from '../../common';
import { reactAppTemplate } from './react-app';

export const reactDomPackage: PackageDefinition = {
  displayName: 'react-dom',
  children: [{ displayName: 'React App', key: 'reactDom.reactApp' }],
  nodeTemplates: {
    'reactDom.reactApp': reactAppTemplate,
  },
};
