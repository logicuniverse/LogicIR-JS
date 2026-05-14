export type Diagnostic = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  subject?: string;
  detail?: Record<string, unknown>;
};

export type FeatureRef = {
  namespace: string;
  key: string;
  version?: string;
};

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type FeatureDefinition = {
  title?: string;
  description?: string;
  extensionPoints: {
    key: string;
    attachment: 'logic-unit' | 'lui';
    payloadSchema?: Record<string, unknown>;
  }[];
};

export type RequirementLevel =
  | 'required'
  | 'conditional-required'
  | 'recommended'
  | 'optional';

export type ProfileDefinition = {
  profileKind: 'ir-pipeline' | 'projection' | 'execution';
  title?: string;
  featureContracts: {
    feature: FeatureRef;
    requirement: RequirementLevel;
  }[];
  policies?: Record<string, unknown>;
};

export type StackDefinition = {
  title?: string;
  profiles: {
    irPipeline: { namespace: string; key: string; version?: string };
    projection: { namespace: string; key: string; version?: string };
    execution: { namespace: string; key: string; version?: string };
  };
};

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
};

export type EndpointRef = {
  owner: { kind: 'lu' } | { kind: 'lui'; luiId: string };
  portKey: string;
};

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: Record<string, FeatureRef>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'combinational' };
    ports: Record<string, Port>;
    connections: Record<string, { from: EndpointRef; to: EndpointRef }>;
    closures: Record<string, unknown>;
    luis: Record<
      string,
      {
        kind: 'combinational';
        target: {
          kind: 'external';
          namespace: string;
          key: string;
          version?: string;
        };
        ports: Record<string, Port>;
        fulfillments: Record<string, unknown>;
        extensions?: ExtensionRecord[];
      }
    >;
  };
};

export type ResolvedStack = {
  stackKey: string;
  requiredFeatures: FeatureRef[];
  completionPolicy: 'await-provider';
};

export type CompletionPolicy = {
  kind: 'await-provider';
  rejectMode: 'diagnostic';
};

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  completion: CompletionPolicy;
  node: {
    luiId: string;
    providerKey: string;
    inputMap: Record<string, string>;
    outputMap: Record<string, string>;
  };
  diagnostics: Diagnostic[];
};

export type ProviderOutput = Record<string, unknown>;
export type AsyncProviderFunction = (
  inputs: Record<string, unknown>,
) => ProviderOutput | Promise<ProviderOutput>;

export type AsyncProviderRegistry = Record<string, AsyncProviderFunction>;

export type ExecutionResult = {
  status: 'ok' | 'error';
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const identityKey = (value: {
  namespace: string;
  key: string;
  version?: string;
}): string => `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;
