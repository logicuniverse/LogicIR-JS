import { NodeTemplate } from '../../../common';
import { arrayPropertyTemplate } from './array-property';
import { booleanPropertyTemplate } from './boolean-property';
import { numberPropertyTemplate } from './number-property';
import { objectPropertyTemplate } from './object-property';
import { propertyTemplate } from './property';
import { stringPropertyTemplate } from './string-property';

export const propertyNodeTemplates: Record<string, NodeTemplate> = {
  property: propertyTemplate,
  'property.array': arrayPropertyTemplate,
  'property.boolean': booleanPropertyTemplate,
  'property.number': numberPropertyTemplate,
  'property.object': objectPropertyTemplate,
  'property.string': stringPropertyTemplate,
};
