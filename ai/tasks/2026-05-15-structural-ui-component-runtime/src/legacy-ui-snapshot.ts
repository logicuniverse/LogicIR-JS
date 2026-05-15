import type { LegacyUINodeSnapshot } from './types';

export const legacyUINodeSnapshots: Record<string, LegacyUINodeSnapshot> = {
  'reactDom.reactApp': {
    key: 'reactDom.reactApp',
    displayName: 'React App',
    kind: 'react-app',
    inputs: ['domNode'],
    outputs: [],
  },
  'html.div': {
    key: 'html.div',
    displayName: 'Div',
    kind: 'html-element',
    inputs: ['props', 'children'],
    outputs: ['events'],
    returns: ['root'],
    destructuring: {
      props: 'object',
      children: 'array',
      events: 'object',
    },
  },
  'html.raw': {
    key: 'html.raw',
    displayName: 'Raw Content',
    kind: 'raw-content',
    inputs: ['content'],
    outputs: [],
    returns: ['root'],
  },
  'component.fromArray': {
    key: 'component.fromArray',
    displayName: 'From Array',
    kind: 'component-composer',
    inputs: ['children'],
    outputs: [],
    returns: ['root'],
    destructuring: { children: 'array' },
  },
  'component.fromObject': {
    key: 'component.fromObject',
    displayName: 'From Object',
    kind: 'component-composer',
    inputs: ['children'],
    outputs: [],
    returns: ['root'],
    destructuring: { children: 'object' },
  },
};
