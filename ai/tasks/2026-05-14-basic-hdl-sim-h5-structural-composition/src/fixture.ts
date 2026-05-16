import type {
  HdlLibraryModule,
  HdlTestVector,
  LogicUnit,
  PullPort,
  PushPort,
  StructuralPayload,
} from './types';

const bitInput = (): PullPort => ({
  contact: 'pull',
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: { width: 1, signed: false },
    },
  ],
});

const bitOutput = (): PushPort => ({
  contact: 'push',
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: { width: 1, signed: false },
    },
  ],
});

const structuralPayload: StructuralPayload = {
  wires: [{ name: 'ab', signal: { width: 1, signed: false } }],
  instances: [
    {
      module: 'logicir_h5_and2',
      instance: 'u_and_ab',
      connections: { a: 'a', b: 'b', y: 'ab' },
    },
    {
      module: 'logicir_h5_and2',
      instance: 'u_and_abc',
      connections: { a: 'ab', b: 'c', y: 'y' },
    },
  ],
};

export const h5LibraryModules: HdlLibraryModule[] = [
  {
    moduleName: 'logicir_h5_and2',
    ports: {
      a: { direction: 'input', signal: { width: 1, signed: false } },
      b: { direction: 'input', signal: { width: 1, signed: false } },
      y: { direction: 'output', signal: { width: 1, signed: false } },
    },
    body: ['assign y = a & b;'],
  },
];

export const and3TruthTable: HdlTestVector[] = [
  { name: '000', inputs: { a: 0, b: 0, c: 0 }, outputs: { y: 0 } },
  { name: '001', inputs: { a: 0, b: 0, c: 1 }, outputs: { y: 0 } },
  { name: '010', inputs: { a: 0, b: 1, c: 0 }, outputs: { y: 0 } },
  { name: '011', inputs: { a: 0, b: 1, c: 1 }, outputs: { y: 0 } },
  { name: '100', inputs: { a: 1, b: 0, c: 0 }, outputs: { y: 0 } },
  { name: '101', inputs: { a: 1, b: 0, c: 1 }, outputs: { y: 0 } },
  { name: '110', inputs: { a: 1, b: 1, c: 0 }, outputs: { y: 0 } },
  { name: '111', inputs: { a: 1, b: 1, c: 1 }, outputs: { y: 1 } },
];

export const and3StructuralLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: {
    hdlSignal: {
      namespace: 'logicir.hdl',
      key: 'signal',
      version: '0.0.0-h5',
    },
    hdlModule: {
      namespace: 'logicir.hdl',
      key: 'module',
      version: '0.0.0-h5',
    },
    hdlStructuralSlices: {
      namespace: 'logicir.hdl',
      key: 'structural-slices',
      version: '0.0.0-h5',
    },
  },
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'structural',
      anchors: {},
      outlets: {},
      anchorFills: {},
      luiFills: {},
    },
    ports: {
      inputs: {
        a: bitInput(),
        b: bitInput(),
        c: bitInput(),
      },
      outputs: {
        y: bitOutput(),
      },
    },
    connections: {},
    closures: {},
    luis: {},
    extensions: [
      {
        featureKey: 'hdlModule',
        key: 'module',
        payload: { moduleName: 'logicir_h5_and3' },
      },
      {
        featureKey: 'hdlStructuralSlices',
        key: 'module-structure',
        payload: structuralPayload,
      },
    ],
  },
};
