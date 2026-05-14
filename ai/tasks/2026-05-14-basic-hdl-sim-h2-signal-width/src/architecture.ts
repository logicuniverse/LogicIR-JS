export const h2Architecture = {
  stack: {
    namespace: 'logicir.stack',
    key: 'basic-hdl-sim',
    round: 'H2 signal width / simple type',
  },
  features: [
    {
      namespace: 'logicir.hdl',
      key: 'signal',
      requirement: 'required',
      extensionPoints: ['port:signal'],
    },
    {
      namespace: 'logicir.hdl',
      key: 'combinational',
      requirement: 'conditional-required',
      extensionPoints: ['lui:operation'],
    },
  ],
} as const;
