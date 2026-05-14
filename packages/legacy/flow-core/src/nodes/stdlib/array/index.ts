import { NodeTemplate, RunModeKind } from '../../../common';
import {
  SimpleNodeTemplate as SimpleNodeTemplate,
  simpleNodeTemplateToNodeTemplate,
} from '../../utils';

import { fromArrayNodeTemplate } from './from-array';

import { toArrayNodeTemplate } from './to-array';

export const arraySimpleNodeTemplates: Record<string, SimpleNodeTemplate> = {
  at: {
    displayName: 'At',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'index', displayName: 'Index' },
    ],
  },
  concat: {
    displayName: 'Concat',
    params: [
      { key: 'a', displayName: 'a' },
      { key: 'b', displayName: 'b' },
    ],
  },
  entries: {
    displayName: 'Entries',
    params: [{ key: 'array', displayName: 'Array' }],
  },
  every: {
    displayName: 'Every',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Predicate Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  filter: {
    displayName: 'Filter',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Filter Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  find: {
    displayName: 'Find',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Find Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  findIndex: {
    displayName: 'Find Index',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Find Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  findLast: {
    displayName: 'Find Last',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Find Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  findLastIndex: {
    displayName: 'Find Last Index',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Find Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  flat: {
    displayName: 'Flat',
    params: [{ key: 'array', displayName: 'Array' }],
  },
  flatMap: {
    displayName: 'Flat Map',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Mapping Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  forEach: {
    kind: RunModeKind.Sequence,
    displayName: 'For Each',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Callback Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
          returnVoid: true,
        },
      },
    ],
    returnVoid: true,
  },
  includes: {
    displayName: 'Includes',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'value', displayName: 'Value' },
    ],
  },
  indexOf: {
    displayName: 'Index Of',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'value', displayName: 'Value' },
    ],
  },
  join: {
    displayName: 'Join',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'separator', displayName: 'Separator' },
    ],
  },
  lastIndexOf: {
    displayName: 'Last Index Of',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'value', displayName: 'Value' },
    ],
  },
  length: {
    displayName: 'Length',
    params: [{ key: 'array', displayName: 'Array' }],
  },
  map: {
    displayName: 'Map',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Mapping Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  reduce: {
    displayName: 'Reduce',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'initialValue',
        displayName: 'Initial Value',
      },
      {
        key: 'callbackFn',
        displayName: 'Reducer Function',
        fn: {
          params: [
            { key: 'accumulator', displayName: 'Accumulator' },
            { key: 'currentValue', displayName: 'Current Value' },
            { key: 'currentIndex', displayName: 'Current Index' },
          ],
        },
      },
    ],
  },
  reduceRight: {
    displayName: 'Reduce Right',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'initialValue',
        displayName: 'Initial Value',
      },
      {
        key: 'callbackFn',
        displayName: 'Reducer Function',
        fn: {
          params: [
            { key: 'accumulator', displayName: 'Accumulator' },
            { key: 'currentValue', displayName: 'Current Value' },
            { key: 'currentIndex', displayName: 'Current Index' },
          ],
        },
      },
    ],
  },
  slice: {
    displayName: 'Slice',
    params: [
      { key: 'array', displayName: 'Array' },
      { key: 'start', displayName: 'Start' },
      { key: 'end', displayName: 'End' },
    ],
  },
  some: {
    displayName: 'Some',
    params: [
      {
        key: 'array',
        displayName: 'Array',
      },
      {
        key: 'callbackFn',
        displayName: 'Predicate Function',
        fn: {
          params: [
            { key: 'element', displayName: 'Element' },
            { key: 'index', displayName: 'Index' },
          ],
        },
      },
    ],
  },
  toReversed: {
    displayName: 'To Reversed',
    params: [{ key: 'array', displayName: 'Array' }],
  },
  toSorted: {
    displayName: 'To Sorted',
    params: [
      { key: 'array', displayName: 'Array' },
      {
        key: 'compareFn',
        displayName: 'Compare Function',
        fn: {
          params: [
            { key: 'a', displayName: 'A' },
            { key: 'b', displayName: 'B' },
          ],
        },
      },
    ],
  },
};

export const arrayNodeTemplates: Record<string, NodeTemplate> = {
  'array.toArray': toArrayNodeTemplate,
  'array.fromArray': fromArrayNodeTemplate,
  ...Object.fromEntries(
    Object.entries(arraySimpleNodeTemplates).map(([key, op]) => [
      `array.${key}`,
      simpleNodeTemplateToNodeTemplate(op),
    ])
  ),
};
