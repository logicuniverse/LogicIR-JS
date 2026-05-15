import type { RuntimeGraph } from './types';

export const counterGraph: RuntimeGraph = {
  nodes: [
    {
      id: 'counter',
      kind: 'number-property',
      initial: 0,
    },
    {
      id: 'bonus',
      kind: 'number-property',
      initial: 10,
    },
    {
      id: 'mergedUpdates',
      kind: 'event-merge',
    },
    {
      id: 'total',
      kind: 'operator',
      operator: 'add',
      inputs: {
        a: { nodeId: 'counter', portKey: 'value' },
        b: { nodeId: 'bonus', portKey: 'value' },
      },
    },
    {
      id: 'isLarge',
      kind: 'operator',
      operator: 'gt',
      inputs: {
        a: { nodeId: 'total', portKey: 'value' },
        b: { nodeId: 'threshold', portKey: 'value' },
      },
    },
    {
      id: 'threshold',
      kind: 'number-property',
      initial: 12,
    },
  ],
  streamConnections: [
    {
      from: { nodeId: 'mergedUpdates', portKey: 'out' },
      to: { nodeId: 'counter', portKey: 'add' },
    },
  ],
};

export const muxGraph: RuntimeGraph = {
  nodes: [
    {
      id: 'mux',
      kind: 'event-mux',
    },
    {
      id: 'sink',
      kind: 'property',
      initial: 'idle',
    },
  ],
  streamConnections: [
    {
      from: { nodeId: 'mux', portKey: 'out' },
      to: { nodeId: 'sink', portKey: 'set' },
    },
  ],
};
