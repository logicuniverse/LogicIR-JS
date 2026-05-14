export type JsonPrimitive = null | boolean | number | string;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type FeatureRef = {
  namespace: string;
  key: string;
  version?: string;
};

export type RequirementLevel =
  | 'required'
  | 'conditional-required'
  | 'recommended'
  | 'optional';

export type BindingRequirementLevel =
  | 'required'
  | 'conditional-required'
  | 'optional';

export type FeatureDefinition = {
  title?: string;
  description?: string;
  extensionPoints: {
    key: string;
    attachment: 'logic-unit' | 'lu-core' | 'lui' | 'port' | 'connection';
    payloadSchema?: JsonObject;
  }[];
};

export type ProfileFeatureContract = {
  feature: FeatureRef;
  requirement: RequirementLevel;
};

export type ProfileDefinition = {
  profileKind: 'ir-pipeline' | 'projection' | 'execution';
  title?: string;
  featureContracts: ProfileFeatureContract[];
  stages?: {
    key: string;
    requirement: RequirementLevel;
    capability: { namespace: string; key: string; version?: string };
  }[];
  providerContracts?: {
    contract: { namespace: string; key: string; version?: string };
    requirement: RequirementLevel;
  }[];
  bindings?: ExecutionBinding[];
};

export type StackDefinition = {
  title?: string;
  profiles: {
    irPipeline: { namespace: string; key: string; version?: string };
    projection: { namespace: string; key: string; version?: string };
    execution: { namespace: string; key: string; version?: string };
  };
};

export type ExecutionBinding = {
  key: string;
  subject:
    | {
        kind: 'external-target';
        namespace: string;
        key: string;
        version?: string;
      }
    | {
        kind: 'named';
        namespace: string;
        key: string;
        version?: string;
      };
  provider: { namespace: string; key: string; version?: string };
  requirement: BindingRequirementLevel;
  config?: JsonValue;
};

export type PortInteraction = {
  pullReadable: boolean;
  pushNotifiable: boolean;
  retainedCurrent: boolean;
};

export type Port = {
  boundary: 'input' | 'output';
  role?: 'primary-result';
  interaction: PortInteraction;
  extensions?: ExtensionRecord[];
};

export type ExtensionRecord = {
  featureKey: string;
  key: string;
  payload: unknown;
};

export type EndpointRef = {
  owner: { kind: 'lu' } | { kind: 'lui'; luiId: string };
  portKey: string;
};

export type Connection = {
  from: EndpointRef;
  to: EndpointRef;
};

export type LUITarget =
  | { kind: 'external'; namespace: string; key: string; version?: string }
  | { kind: 'state-store'; storeKey: string };

export type LUI = {
  kind: 'stateful' | 'combinational';
  target: LUITarget;
  ports: Record<string, Port>;
  fulfillments: Record<string, unknown>;
  extensions?: ExtensionRecord[];
};

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: Record<string, FeatureRef>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'stateful' };
    ports: Record<string, Port>;
    connections: Record<string, Connection>;
    closures: Record<string, unknown>;
    luis: Record<string, LUI>;
  };
};

export type ResolvedStack = {
  stackKey: string;
  profiles: ProfileDefinition[];
  requiredFeatures: ProfileFeatureContract[];
  executionBindings: ExecutionBinding[];
};

export type Diagnostic = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  subject?: string;
};

export type RetainedCurrentOperation =
  | {
      kind: 'read-current';
      storeKey: string;
      outputPort: string;
    }
  | {
      kind: 'write-current';
      storeKey: string;
      inputPort: string;
      outputPort: string;
    };

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  operations: RetainedCurrentOperation[];
  diagnostics: Diagnostic[];
};

export type StateStoreProvider = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  snapshot: () => Record<string, unknown>;
};

export type ExecutionResult = {
  outputs: Record<string, unknown>;
  state: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const identityKey = (value: {
  namespace: string;
  key: string;
  version?: string;
}): string => `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;
