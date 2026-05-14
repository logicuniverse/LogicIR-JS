export const h5Architecture = {
  stack: {
    namespace: 'logicir.stack',
    key: 'basic-hdl-sim',
    round: 'H5 structural module composition',
  },
  features: [
    { namespace: 'logicir.hdl', key: 'signal', requirement: 'required' },
    { namespace: 'logicir.hdl', key: 'module', requirement: 'required' },
    {
      namespace: 'logicir.hdl',
      key: 'structural-slices',
      requirement: 'conditional-required',
    },
  ],
} as const;
