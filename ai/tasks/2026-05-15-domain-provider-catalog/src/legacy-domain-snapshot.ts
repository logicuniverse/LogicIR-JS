import type { DomainNodeSnapshot } from './types';

export const legacyDomainNodeSnapshots: Record<string, DomainNodeSnapshot> = {
  'cel.cel': {
    key: 'cel.cel',
    displayName: 'CEL Expression',
    kind: 'compute',
    inputs: [
      { key: 'context', discipline: 'data', destructuring: 'object' },
      { key: 'expression', discipline: 'data', hidden: true },
    ],
    outputs: [],
    defaults: {
      expression: '1 + 2',
    },
  },
  'pi-ai.provider': {
    key: 'pi-ai.provider',
    displayName: 'Provider',
    kind: 'stateful',
    inputs: [
      { key: 'provider', discipline: 'data' },
      { key: 'modelId', discipline: 'data' },
      { key: 'apiKey', discipline: 'data' },
    ],
    outputs: [],
    dependencies: {
      default: {
        packageKey: 'pi-ai',
        serviceKey: 'provider',
        composite: true,
        stateful: false,
      },
    },
  },
  'pi-ai.complete': {
    key: 'pi-ai.complete',
    displayName: 'Complete',
    kind: 'sequence',
    inputs: [
      { key: 'messages', discipline: 'data' },
      { key: 'systemPrompt', discipline: 'data' },
    ],
    outputs: [
      { key: 'toolCall', discipline: 'stream', destructuring: 'object' },
    ],
    dependencies: {
      provider: {
        packageKey: 'pi-ai',
        serviceKey: 'provider',
        methodKey: 'complete',
      },
    },
  },
  'pi-ai.stream': {
    key: 'pi-ai.stream',
    displayName: 'Stream',
    kind: 'sequence',
    inputs: [
      { key: 'messages', discipline: 'data' },
      { key: 'systemPrompt', discipline: 'data' },
    ],
    outputs: [
      { key: 'event', discipline: 'stream' },
      { key: 'toolCall', discipline: 'stream', destructuring: 'object' },
    ],
    dependencies: {
      provider: {
        packageKey: 'pi-ai',
        serviceKey: 'provider',
        methodKey: 'stream',
      },
    },
  },
  'hono.app': {
    key: 'hono.app',
    displayName: 'Hono App',
    kind: 'sequence',
    inputs: [],
    outputs: [],
    dependencies: {
      default: {
        packageKey: 'hono',
        serviceKey: 'app',
        composite: true,
        stateful: true,
      },
    },
  },
  'hono.route': {
    key: 'hono.route',
    displayName: 'Hono Route',
    kind: 'structural',
    inputs: [
      { key: 'children', discipline: 'component', destructuring: 'object' },
    ],
    outputs: [],
    returns: [{ key: 'root', discipline: 'component' }],
  },
  'hono.get': {
    key: 'hono.get',
    displayName: 'Hono GET',
    kind: 'structural',
    inputs: [],
    outputs: [],
    returns: [{ key: 'root', discipline: 'component' }],
    dependencies: {
      default: {
        packageKey: 'hono',
        serviceKey: 'handler',
        composite: true,
      },
    },
  },
};
