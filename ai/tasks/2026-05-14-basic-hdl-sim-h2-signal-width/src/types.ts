export type PortKey = string;
export type FeatureUseKey = string;
export type ExtensionRecord = {
  featureKey: FeatureUseKey;
  key: string;
  payload: unknown;
};

export type HdlSignalPayload = {
  width: number;
  signed: boolean;
};

export type HdlOperationPayload = {
  op: 'add';
};

export type Port = {
  boundary: 'input' | 'output';
  role?: 'primary-result';
  interaction: {
    pullReadable: boolean;
    pushNotifiable: boolean;
    retainedCurrent: boolean;
  };
  extensions?: ExtensionRecord[];
};

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: Record<FeatureUseKey, { namespace: string; key: string; version?: string }>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'combinational' };
    ports: Record<PortKey, Port>;
    connections: Record<string, unknown>;
    closures: Record<string, unknown>;
    luis: Record<
      string,
      {
        kind: 'combinational';
        target: { kind: 'external'; namespace: string; key: string };
        ports: Record<PortKey, Port>;
        fulfillments: Record<string, unknown>;
        extensions?: ExtensionRecord[];
      }
    >;
  };
};

export type HdlArtifacts = {
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
