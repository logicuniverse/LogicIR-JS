export const h3Architecture = {
  stack: {
    namespace: 'logicir.stack',
    key: 'basic-hdl-sim',
    round: 'H3 sequential state',
  },
  features: [
    { namespace: 'logicir.hdl', key: 'signal', requirement: 'required' },
    {
      namespace: 'logicir.hdl',
      key: 'clocking',
      requirement: 'conditional-required',
    },
    {
      namespace: 'logicir.hdl',
      key: 'state',
      requirement: 'conditional-required',
    },
  ],
} as const;
