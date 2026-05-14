export const h1Architecture = {
  features: [
    {
      namespace: 'logicir.hdl',
      key: 'signal',
      version: '0.0.0-h1',
      extensionPoints: [
        {
          key: 'signal',
          attachment: 'port',
          payloadSchema: {
            kind: 'inline-json-schema',
            schema: {
              type: 'object',
              properties: {
                width: { const: 1 },
                signed: { const: false },
              },
              required: ['width', 'signed'],
              additionalProperties: false,
            },
          },
        },
      ],
    },
    {
      namespace: 'logicir.hdl',
      key: 'combinational',
      version: '0.0.0-h1',
      extensionPoints: [
        {
          key: 'operation',
          attachment: 'lui',
          payloadSchema: {
            kind: 'inline-json-schema',
            schema: {
              type: 'object',
              properties: {
                op: { const: 'and' },
              },
              required: ['op'],
              additionalProperties: false,
            },
          },
        },
      ],
    },
  ],
  profiles: {
    ir: {
      namespace: 'logicir.profile',
      key: 'basic-hdl-ir',
      requiredFeatures: ['logicir.hdl/signal', 'logicir.hdl/combinational'],
      requiredStages: ['core-validate', 'feature-manifest-resolve'],
    },
    projection: {
      namespace: 'logicir.profile',
      key: 'to-verilog-hdl',
      artifactKind: 'verilog-source',
      requiredStages: ['emit-verilog-module', 'emit-testbench'],
    },
    execution: {
      namespace: 'logicir.profile',
      key: 'verilog-sim-execution',
      environment: 'iverilog',
    },
  },
  stack: {
    namespace: 'logicir.stack',
    key: 'basic-hdl-sim',
    profiles: {
      ir: 'basic-hdl-ir',
      projection: 'to-verilog-hdl',
      execution: 'verilog-sim-execution',
    },
  },
} as const;
