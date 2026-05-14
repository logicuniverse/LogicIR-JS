export type Diagnostic = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  subject?: string;
  detail?: Record<string, unknown>;
};

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

export type FeatureDefinition = {
  title?: string;
  description?: string;
  extensionPoints: {
    key: string;
    attachment: 'logic-unit' | 'lui' | 'service-fulfillment' | 'unit-fulfillment';
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
  featureContracts: { feature: FeatureRef; requirement: RequirementLevel }[];
};

export type StackDefinition = {
  title?: string;
  profiles: {
    irPipeline: { namespace: string; key: string; version?: string };
    projection: { namespace: string; key: string; version?: string };
    execution: { namespace: string; key: string; version?: string };
  };
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

export type RequirementUnit = {
  kind: 'combinational';
  ports: Record<string, Port>;
  requirements: Record<string, unknown>;
};

export type RequirementService = {
  fulfillmentScope: 'independent-units' | 'shared-service';
  units: Record<string, RequirementUnit>;
};

export type UnitFulfillment =
  | { kind: 'closure'; closureId: string }
  | {
      kind: 'upstream-unit';
      supplierServiceKey: string;
      supplierUnitKey: string;
    };

export type RequirementServiceFulfillment = {
  kind: 'independent-units';
  units: Record<string, UnitFulfillment>;
};

export type Closure = {
  run: (inputs: Record<string, unknown>) => Record<string, unknown>;
  forwardedPortKeys: { inputs: string[]; outputs: string[] };
};

export type LUI = {
  kind: 'combinational';
  target: { kind: 'requirement'; serviceKey: string; unitKey: string };
  ports: Record<string, Port>;
  fulfillments: Record<string, RequirementServiceFulfillment>;
};

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: Record<string, FeatureRef>;
  requirements: Record<
    string,
    { kind: 'inline'; service: RequirementService }
  >;
  core: {
    kindOrganization: { kind: 'combinational' };
    ports: Record<string, Port>;
    connections: Record<string, { from: EndpointRef; to: EndpointRef }>;
    closures: Record<string, Closure>;
    luis: Record<string, LUI>;
  };
};

export type ResolvedStack = {
  stackKey: string;
  requiredFeatures: FeatureRef[];
};

export type FulfillmentPlanNode = {
  luiId: string;
  serviceKey: string;
  unitKey: string;
  fulfillment: UnitFulfillment;
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
};

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  nodes: FulfillmentPlanNode[];
  diagnostics: Diagnostic[];
};

export type RequirementProvider = (
  serviceKey: string,
  unitKey: string,
  inputs: Record<string, unknown>,
) => Record<string, unknown> | undefined;

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
