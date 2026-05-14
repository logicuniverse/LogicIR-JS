export type ExtensionRecord = {
  featureKey: string;
  key: string;
  payload: unknown;
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
  features: Record<string, { namespace: string; key: string; version?: string }>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'sequential'; steps: string[] };
    ports: Record<string, Port>;
    connections: Record<string, unknown>;
    closures: Record<string, unknown>;
    luis: Record<
      string,
      {
        kind: 'stateful';
        target: { kind: 'external'; namespace: string; key: string };
        ports: Record<string, Port>;
        fulfillments: Record<string, unknown>;
        extensions?: ExtensionRecord[];
      }
    >;
    extensions?: ExtensionRecord[];
  };
};

export type SignalPayload = {
  width: number;
  signed: boolean;
};

export type StatePayload = {
  register: string;
  width: number;
  resetValue: number;
};

export type ClockingPayload = {
  clock: string;
  reset: string;
  resetActive: 'high';
};

export type HdlArtifacts = {
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
