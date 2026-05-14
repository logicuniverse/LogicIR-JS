import { NodeTemplate } from '../../../common';
import {
  SimpleNodeTemplate,
  simpleNodeTemplateToNodeTemplate,
} from '../../utils';

export const stringSimpleNodeTemplates: Record<string, SimpleNodeTemplate> = {
  at: {
    displayName: 'At',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'index', displayName: 'Index' },
    ],
  },
  charCodeAt: {
    displayName: 'Char Code At',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'index', displayName: 'Index' },
    ],
  },
  codePointAt: {
    displayName: 'Code Point At',
    params: [
      { key: 'string', displayName: 'String' },
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
  endsWith: {
    displayName: 'Ends With',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'substr', displayName: 'Substring' },
    ],
  },

  length: {
    displayName: 'Length',
    params: [{ key: 'string', displayName: 'String' }],
  },

  includes: {
    displayName: 'Includes',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'substr', displayName: 'Substring' },
    ],
  },
  indexOf: {
    displayName: 'Index Of',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'substr', displayName: 'Substring' },
    ],
  },
  lastIndexOf: {
    displayName: 'Last Index Of',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'substr', displayName: 'Substring' },
    ],
  },
  padEnd: {
    displayName: 'Pad End',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'targetLength', displayName: 'Target Length' },
      { key: 'padString', displayName: 'Pad String' },
    ],
  },
  padStart: {
    displayName: 'Pad Start',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'targetLength', displayName: 'Target Length' },
      { key: 'padString', displayName: 'Pad String' },
    ],
  },
  repeat: {
    displayName: 'Repeat',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'count', displayName: 'Count' },
    ],
  },
  replace: {
    displayName: 'Replace',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'searchValue', displayName: 'Search Value' },
      { key: 'replaceValue', displayName: 'Replace Value' },
    ],
  },
  replaceAll: {
    displayName: 'Replace All',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'searchValue', displayName: 'Search Value' },
      { key: 'replaceValue', displayName: 'Replace Value' },
    ],
  },
  slice: {
    displayName: 'Slice',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'start', displayName: 'Start' },
      { key: 'end', displayName: 'End' },
    ],
  },
  //   sliceToEnd: {
  //     displayName: 'Slice To End',
  //     params: [
  //       { key: 'string', displayName: 'String' },
  //       { key: 'start', displayName: 'Start' },
  //     ],
  //   },
  split: {
    displayName: 'Split',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'separator', displayName: 'Separator' },
    ],
  },
  //   splitAt: {
  //     displayName: 'Split At',
  //     params: [
  //       { key: 'string', displayName: 'String' },
  //       { key: 'index', displayName: 'Index' },
  //     ],
  //   },
  startsWith: {
    displayName: 'Starts With',
    params: [
      { key: 'string', displayName: 'String' },
      { key: 'substr', displayName: 'Substring' },
    ],
  },

  toLowerCase: {
    displayName: 'To Lower Case',
    params: [{ key: 'string', displayName: 'String' }],
  },
  toUpperCase: {
    displayName: 'To Upper Case',
    params: [{ key: 'string', displayName: 'String' }],
  },
  trim: {
    displayName: 'Trim',
    params: [{ key: 'string', displayName: 'String' }],
  },
  trimEnd: {
    displayName: 'Trim End',
    params: [{ key: 'string', displayName: 'String' }],
  },
  trimStart: {
    displayName: 'Trim Start',
    params: [{ key: 'string', displayName: 'String' }],
  },
};

export const stringNodeTemplates: Record<string, NodeTemplate> = {
  ...Object.fromEntries(
    Object.entries(stringSimpleNodeTemplates).map(([key, op]) => [
      `string.${key}`,
      simpleNodeTemplateToNodeTemplate(op),
    ])
  ),
};
