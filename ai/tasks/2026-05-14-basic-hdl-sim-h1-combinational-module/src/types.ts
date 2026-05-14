export type LogicIRCoreSchemaVersion = '0.0.0-draft';
export type LogicIRKey = string;
export type PortKey = LogicIRKey;
export type LUIId = LogicIRKey;
export type ConnectionId = LogicIRKey;
export type FeatureUseKey = LogicIRKey;
export type ExtensionKey = LogicIRKey;

export type FeatureUse = {
  namespace: string;
  key: string;
  version?: string;
};

export type ExtensionRecord = {
  featureKey: FeatureUseKey;
  key: ExtensionKey;
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

export type EndpointRef = {
  owner: { kind: 'lu' } | { kind: 'lui'; luiId: LUIId };
  portKey: PortKey;
};

export type Connection = {
  from: EndpointRef;
  to: EndpointRef;
};

export type CombinationalLUI = {
  kind: 'combinational';
  target: {
    kind: 'external';
    namespace: string;
    key: string;
    version?: string;
  };
  ports: Record<PortKey, Port>;
  fulfillments: Record<string, unknown>;
  extensions?: ExtensionRecord[];
};

export type LogicUnit = {
  schemaVersion: LogicIRCoreSchemaVersion;
  features: Record<FeatureUseKey, FeatureUse>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'combinational' };
    ports: Record<PortKey, Port>;
    connections: Record<ConnectionId, Connection>;
    closures: Record<string, unknown>;
    luis: Record<LUIId, CombinationalLUI>;
    extensions?: ExtensionRecord[];
  };
};

export type HdlSignalPayload = {
  width: 1;
  signed: false;
};

export type HdlOperationPayload = {
  op: 'and';
};

export type HdlArtifacts = {
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
