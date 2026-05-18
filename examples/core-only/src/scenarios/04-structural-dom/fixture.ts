import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const structuralDomFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'structural',
      anchors: {
        root: { shape: 'single', required: true },
      },
      outlets: {
        header: { required: true },
        body: { required: true },
      },
      anchorFills: {
        root: {
          kind: 'lui-outlet',
          luiId: 'layout',
          outletKey: 'root',
        },
      },
      luiFills: {
        layout: {
          header: { kind: 'outlet', outletKey: 'header' },
          body: { kind: 'outlet', outletKey: 'body' },
        },
      },
    },
    ports: {
      inputs: {
        theme: { contact: 'property' },
      },
      outputs: {},
    },
    connections: {
      themeToLayout: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'theme' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'layout' },
          port: { kind: 'input', key: 'theme' },
        },
      },
    },
    closures: {},
    luis: {
      layout: {
        kind: 'structural',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'headless-layout',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            theme: { contact: 'property' },
          },
          outputs: {},
        },
        compositionSurface: {
          outlets: {
            root: { required: true },
          },
          anchors: {
            header: { shape: 'single', required: true },
            body: { shape: 'single', required: true },
          },
        },
      },
    },
  },
};

export type HeadlessSlotNode =
  | {
      kind: 'text';
      value: string;
    }
  | {
      kind: 'list';
      items: string[];
    };

export const structuralDomProgram = {
  theme: 'dark',
  outlets: {
    header: { kind: 'text', value: 'Orders' } as HeadlessSlotNode,
    body: {
      kind: 'list',
      items: ['pending', 'packing', 'shipped'],
    } as HeadlessSlotNode,
  },
};
