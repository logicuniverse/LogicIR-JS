export const h4Profile = {
  stack: {
    namespace: 'logicir.stack',
    key: 'basic-hdl-sim',
  },
  supportedRequiredFeatures: [
    'logicir.hdl/signal',
    'logicir.hdl/module',
    'logicir.hdl/combinational',
    'logicir.hdl/clocking',
    'logicir.hdl/state',
    'logicir.hdl/elaboration',
    'logicir.diagnostics/unsupported-semantics',
  ],
  unsupportedSemanticsPolicy: {
    softwareInvocation: 'fail',
  },
} as const;
