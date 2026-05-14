import { constantNodeTemplates } from './constants';
import { arrayNodeTemplates } from './array';
import { objectNodeTemplates } from './object';
import { asyncNodeTemplates } from './async';
import { eventNodeTemplates } from './event';
import { propertyNodeTemplates } from './state';
import { componentNodeTemplates } from './components';
import { NodeTemplate } from '../../common';
import { numberNodeTemplates } from './number';
import { stringNodeTemplates } from './string';
import { operatorNodeTemplates } from './operators';

import { PackageDefinition } from '../../common/types/package';

const allNodeTemplates: Record<string, Record<string, NodeTemplate>> = {
  constant: constantNodeTemplates,
  operator: operatorNodeTemplates,
  number: numberNodeTemplates,
  string: stringNodeTemplates,
  array: arrayNodeTemplates,
  object: objectNodeTemplates,
  async: asyncNodeTemplates,
  event: eventNodeTemplates,
  property: propertyNodeTemplates,
  component: componentNodeTemplates,
};

export const stdPackage: PackageDefinition = {
  displayName: 'Standard Library',
  children: [],
  nodeTemplates: {},
  services: {},
};

Object.entries(allNodeTemplates).map(([packageKey, nodeTemplates]) => {
  stdPackage.children.push({
    displayName: packageKey.charAt(0).toUpperCase() + packageKey.slice(1),
    children: Object.keys(nodeTemplates).map((nodeTemplateKey) => ({
      key: nodeTemplateKey,
      displayName:
        nodeTemplates[nodeTemplateKey].displayName ?? nodeTemplateKey,
    })),
  });
  Object.assign(stdPackage.nodeTemplates, nodeTemplates);
});
