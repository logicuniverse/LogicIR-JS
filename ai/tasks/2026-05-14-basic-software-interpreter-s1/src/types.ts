export type LogicIRCoreSchemaVersion = '0.0.0-draft';

export type LogicIRKey = string;
export type PortKey = LogicIRKey;
export type LUIId = LogicIRKey;
export type ConnectionId = LogicIRKey;
export type FeatureUseKey = LogicIRKey;
export type FeatureNamespace = string;
export type FeatureKey = LogicIRKey;
export type FeatureVersion = string;
export type ExtensionKey = LogicIRKey;
export type ExternalTargetNamespace = string;
export type ExternalTargetKey = LogicIRKey;
export type ExternalTargetVersion = string;

export type ArchitectureKey = string;
export type ArchitectureVersion = string;
export type ProfileNamespace = string;
export type ProfileKey = ArchitectureKey;
export type ProfileVersion = ArchitectureVersion;
export type CapabilityNamespace = string;
export type CapabilityKey = ArchitectureKey;
export type CapabilityVersion = ArchitectureVersion;
export type ProviderNamespace = string;
export type ProviderKey = ArchitectureKey;
export type ProviderVersion = ArchitectureVersion;
export type ProviderContractNamespace = string;
export type ProviderContractKey = ArchitectureKey;
export type ProviderContractVersion = ArchitectureVersion;
export type StageKey = ArchitectureKey;
export type BindingKey = ArchitectureKey;
export type ArtifactKindKey = ArchitectureKey;
export type ExecutionEnvironmentKey = ArchitectureKey;
export type PolicyKey = ArchitectureKey;
export type DiagnosticKey = ArchitectureKey;
export type Title = string;
export type Description = string;
export type SemverRange = string;

export type JsonPrimitive = null | boolean | number | string;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type PolicyValue = JsonValue;

export type DefinitionMeta = {
  title?: Title;
  description?: Description;
  documentationUrl?: string;
};

export type FeatureUse = {
  namespace: FeatureNamespace;
  key: FeatureKey;
  version?: FeatureVersion;
};

export type ExtensionRecord = {
  featureKey: FeatureUseKey;
  key: ExtensionKey;
  payload: unknown;
};

export type PortBoundary = 'input' | 'output';
export type PortRole = 'primary-result';
export type PortInteraction = {
  pullReadable: boolean;
  pushNotifiable: boolean;
  retainedCurrent: boolean;
};

export type Port = {
  interaction: PortInteraction;
  boundary: PortBoundary;
  role?: PortRole;
  extensions?: ExtensionRecord[];
};

export type PortSurface = Record<PortKey, Port>;

export type PortOwner =
  | { kind: 'lu' }
  | { kind: 'lui'; luiId: LUIId };

export type EndpointRef = {
  owner: PortOwner;
  portKey: PortKey;
};

export type Connection = {
  from: EndpointRef;
  to: EndpointRef;
  extensions?: ExtensionRecord[];
};

export type ExternalTargetIdentity = {
  namespace: ExternalTargetNamespace;
  key: ExternalTargetKey;
  version?: ExternalTargetVersion;
};

export type LUITarget =
  | { kind: 'external' } & ExternalTargetIdentity
  | { kind: 'lu'; luId: string }
  | { kind: 'requirement'; serviceKey: string; unitKey: string };

export type CombinationalLUI = {
  kind: 'combinational';
  target: LUITarget;
  ports: PortSurface;
  fulfillments: Record<string, unknown>;
  extensions?: ExtensionRecord[];
};

export type LUI = CombinationalLUI;

export type CombinationalLUCore = {
  kindOrganization: { kind: 'combinational' };
  ports: PortSurface;
  connections: Record<ConnectionId, Connection>;
  closures: Record<string, unknown>;
  luis: Record<LUIId, CombinationalLUI>;
  extensions?: ExtensionRecord[];
};

export type LogicUnit = {
  schemaVersion: LogicIRCoreSchemaVersion;
  features: Record<FeatureUseKey, FeatureUse>;
  core: CombinationalLUCore;
  requirements: Record<string, unknown>;
  extensions?: ExtensionRecord[];
};

export type CoreSchemaVersionSelector =
  | { kind: 'range'; range: SemverRange }
  | { kind: 'one-of'; versions: LogicIRCoreSchemaVersion[] };

export type FeatureRef = {
  namespace: FeatureNamespace;
  key: FeatureKey;
  version?: FeatureVersion;
};

export type ProfileRef = {
  namespace: ProfileNamespace;
  key: ProfileKey;
  version?: ProfileVersion;
};

export type CapabilityRef = {
  namespace: CapabilityNamespace;
  key: CapabilityKey;
  version?: CapabilityVersion;
};

export type ProviderRef = {
  namespace: ProviderNamespace;
  key: ProviderKey;
  version?: ProviderVersion;
};

export type ProviderContractRef = {
  namespace: ProviderContractNamespace;
  key: ProviderContractKey;
  version?: ProviderContractVersion;
};

export type CapabilityKind =
  | 'ir-stage'
  | 'projection-stage'
  | 'execution'
  | 'provider'
  | 'diagnostic'
  | 'custom';

export type CapabilityDefinition = DefinitionMeta & {
  capabilityKind: CapabilityKind;
  contracts?: ProviderContractRef[];
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

export type ExtensionAttachmentKind =
  | 'logic-unit'
  | 'lu-core'
  | 'lui'
  | 'port'
  | 'connection'
  | 'closure'
  | 'requirement-service'
  | 'service-fulfillment'
  | 'unit-fulfillment';

export type PayloadSchemaRef =
  | {
      kind: 'external';
      namespace: string;
      key: ArchitectureKey;
      version?: ArchitectureVersion;
    }
  | {
      kind: 'inline-json-schema';
      schema: JsonObject;
    };

export type FeatureExtensionPointRef = {
  key: ExtensionKey;
  attachment: ExtensionAttachmentKind;
};

export type FeatureExtensionPoint = DefinitionMeta &
  FeatureExtensionPointRef & {
    payloadSchema?: PayloadSchemaRef;
  };

export type FeatureRelation = {
  feature: FeatureRef;
  reason?: Description;
};

export type FeatureDefinition = DefinitionMeta & {
  extensionPoints: FeatureExtensionPoint[];
  requires?: FeatureRelation[];
  conflictsWith?: FeatureRelation[];
};

export type ProfileKind = 'ir-pipeline' | 'projection' | 'execution';

export type ProfileExtensionPointContract = FeatureExtensionPointRef & {
  requirement: RequirementLevel;
  condition?: Description;
  notes?: Description;
};

export type ProfileFeatureContract = {
  feature: FeatureRef;
  requirement: RequirementLevel;
  extensionPoints?: ProfileExtensionPointContract[];
  condition?: Description;
  notes?: Description;
};

export type StageRequirement = DefinitionMeta & {
  key: StageKey;
  capability: CapabilityRef;
  requirement: RequirementLevel;
  consumesFeatures?: FeatureRef[];
  produces?: Description;
  condition?: Description;
};

export type DiagnosticPolicy = {
  unsupportedRequiredContract: 'fail';
  unsupportedFeature: 'fail' | 'warn';
  unsafeFallback: 'fail' | 'warn';
};

export type PolicyMap = { [key: PolicyKey]: PolicyValue };

export type ProfileDefinitionBase = DefinitionMeta & {
  profileKind: ProfileKind;
  featureContracts: ProfileFeatureContract[];
  diagnostics: DiagnosticPolicy;
};

export type IRPipelineProfileDefinition = ProfileDefinitionBase & {
  profileKind: 'ir-pipeline';
  input: 'logicir';
  output: 'logicir';
  acceptedCoreVersions: CoreSchemaVersionSelector;
  stages: StageRequirement[];
  stripPolicy?: PolicyMap;
};

export type ProjectionOutputKind = 'artifact' | 'executable-plan';

export type UnsupportedSemanticsPolicy =
  | 'fail'
  | 'warn'
  | 'lower'
  | 'requires-feature';

export type UnsupportedSemanticsPolicyMap = {
  [key: DiagnosticKey]: UnsupportedSemanticsPolicy;
};

export type ProjectionTargetRef = {
  namespace: string;
  key: ArchitectureKey;
  version?: ArchitectureVersion;
};

export type ProjectionProfileDefinition = ProfileDefinitionBase & {
  profileKind: 'projection';
  input: 'logicir';
  output: ProjectionOutputKind;
  acceptedCoreVersions: CoreSchemaVersionSelector;
  projectionTarget: ProjectionTargetRef;
  artifactKinds: ArtifactKindKey[];
  stages: StageRequirement[];
  unsupportedSemantics?: UnsupportedSemanticsPolicyMap;
};

export type ExecutionInputKind = 'logicir' | 'executable-plan' | 'artifact';

export type ExecutionTargetKind =
  | 'interpreter'
  | 'generated-software'
  | 'native-host'
  | 'verilog-simulator'
  | 'verilog-synthesis'
  | 'distributed-runtime'
  | 'external-system';

export type ProviderContractRequirement = {
  contract: ProviderContractRef;
  requirement: RequirementLevel;
  condition?: Description;
  notes?: Description;
};

export type ExecutionBindingSubject =
  | {
      kind: 'external-target';
      namespace: string;
      key: ArchitectureKey;
      version?: ArchitectureVersion;
    }
  | { kind: 'custom'; key: ArchitectureKey; selector?: JsonValue };

export type ExecutionBinding = {
  key: BindingKey;
  subject: ExecutionBindingSubject;
  provider: ProviderRef;
  contract?: ProviderContractRef;
  requirement: BindingRequirementLevel;
  config?: JsonValue;
  condition?: Description;
  notes?: Description;
};

export type ExecutionProfileDefinition = ProfileDefinitionBase & {
  profileKind: 'execution';
  input: ExecutionInputKind;
  output: 'execution';
  executionTarget: ExecutionTargetKind;
  environments: ExecutionEnvironmentKey[];
  providerContracts: ProviderContractRequirement[];
  bindings: ExecutionBinding[];
  policies?: PolicyMap;
  acceptedCoreVersions?: CoreSchemaVersionSelector;
};

export type ProfileDefinition =
  | IRPipelineProfileDefinition
  | ProjectionProfileDefinition
  | ExecutionProfileDefinition;

export type StackDefinition = DefinitionMeta & {
  profiles: {
    irPipeline: ProfileRef;
    projection: ProfileRef;
    execution?: ProfileRef;
  };
};

export type ProviderContractDefinition = DefinitionMeta & {
  capabilities: CapabilityRef[];
  bindingSubjects?: ExecutionBindingSubject['kind'][];
  interfaceSchema?: PayloadSchemaRef;
  semanticObligations?: Description[];
};

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type ProfileCatalogEntry =
  | CatalogEntry<IRPipelineProfileDefinition>
  | CatalogEntry<ProjectionProfileDefinition>
  | CatalogEntry<ExecutionProfileDefinition>;

export type StackCatalogEntry = CatalogEntry<StackDefinition>;

export type ResolvedStack = {
  stackKey: string;
  irProfile: CatalogEntry<IRPipelineProfileDefinition>;
  projectionProfile: CatalogEntry<ProjectionProfileDefinition>;
  executionProfile: CatalogEntry<ExecutionProfileDefinition>;
  requiredFeatures: ProfileFeatureContract[];
  requiredStages: StageRequirement[];
  executionBindings: ExecutionBinding[];
};

export type Diagnostic = {
  code: string;
  message: string;
  subject?: string;
};

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  inputPorts: PortKey[];
  outputPorts: PortKey[];
  nodes: InterpreterPlanNode[];
  diagnostics: Diagnostic[];
};

export type InterpreterPlanNode = {
  luiId: LUIId;
  target: ExternalTargetIdentity;
  providerKey: string;
  inputMap: Record<PortKey, PortKey>;
  outputMap: Record<PortKey, PortKey>;
};

export type ProviderFunction = (
  inputs: Record<string, unknown>,
) => Record<string, unknown>;

export type ProviderRegistry = Record<string, ProviderFunction>;

export type ExecutionResult = {
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const formatFeatureRef = (feature: FeatureRef): string =>
  `${feature.namespace}/${feature.key}${feature.version ? `@${feature.version}` : ''}`;

export const formatExternalTarget = (target: ExternalTargetIdentity): string =>
  `${target.namespace}/${target.key}${target.version ? `@${target.version}` : ''}`;
