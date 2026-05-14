/**
 * LogicIR architecture definition schema v0 draft.
 *
 * This file defines serializable content shapes for feature definitions,
 * profile definitions, stack definitions, capabilities, provider contracts, and
 * execution bindings. It intentionally does not define a document/container
 * format. Identity, namespace, version, indexing, registry storage, and
 * database keys belong to the catalog or application layer.
 *
 * It must not contain helper functions, factories, classes, runtime callbacks,
 * tool implementations, or TypeScript-only schema abstractions such as
 * generics.
 */

import type {
  ExtensionKey,
  FeatureKey,
  FeatureNamespace,
  FeatureVersion,
  LogicIRCoreSchemaVersion,
  RequirementServiceKey,
  RequirementUnitKey,
} from '@logic-universe/logic-ir-core';

// --- Protocol / Identity References ---

export const LOGIC_IR_ARCHITECTURE_SCHEMA_VERSION = '0.0.0-draft' as const;

export type LogicIRArchitectureSchemaVersion =
  typeof LOGIC_IR_ARCHITECTURE_SCHEMA_VERSION;

export type ArchitectureKey = string;
export type ArchitectureVersion = string;

export type ProfileNamespace = string;
export type ProfileKey = ArchitectureKey;
export type ProfileVersion = ArchitectureVersion;
export type StackVariantKey = ArchitectureKey;
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
export type DocumentationUrl = string;
export type SemverRange = string;

export type JsonPrimitive = null | boolean | number | string;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type PolicyValue = JsonValue;

export type DefinitionMeta = {
  title?: Title;
  description?: Description;
  documentationUrl?: DocumentationUrl;
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

// --- Capabilities ---

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

// --- Feature Definitions ---

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

// --- Profile Definitions ---

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

export type RequirementServiceSelector =
  | { kind: 'any' }
  | { kind: 'key'; serviceKey: RequirementServiceKey };

export type RequirementUnitSelector =
  | { kind: 'any' }
  | {
      kind: 'key';
      serviceKey: RequirementServiceKey;
      unitKey: RequirementUnitKey;
    };

export type ExecutionBindingSubject =
  | {
      kind: 'external-target';
      namespace: string;
      key: ArchitectureKey;
      version?: ArchitectureVersion;
    }
  | {
      kind: 'requirement-service';
      selector: RequirementServiceSelector;
    }
  | {
      kind: 'requirement-unit';
      selector: RequirementUnitSelector;
    }
  | {
      kind: 'named';
      namespace: string;
      key: ArchitectureKey;
      version?: ArchitectureVersion;
      selector?: JsonValue;
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

export type ExecutionProfileDefinitionBase = ProfileDefinitionBase & {
  profileKind: 'execution';
  output: 'execution';
  executionTarget: ExecutionTargetKind;
  environments: ExecutionEnvironmentKey[];
  providerContracts: ProviderContractRequirement[];
  bindings: ExecutionBinding[];
  policies?: PolicyMap;
};

export type LogicIRExecutionProfileDefinition =
  ExecutionProfileDefinitionBase & {
    input: 'logicir';
    acceptedCoreVersions: CoreSchemaVersionSelector;
  };

export type RealizedExecutionProfileDefinition =
  ExecutionProfileDefinitionBase & {
    input: Exclude<ExecutionInputKind, 'logicir'>;
    acceptedCoreVersions?: CoreSchemaVersionSelector;
  };

export type ExecutionProfileDefinition =
  | LogicIRExecutionProfileDefinition
  | RealizedExecutionProfileDefinition;

export type ProfileDefinition =
  | IRPipelineProfileDefinition
  | ProjectionProfileDefinition
  | ExecutionProfileDefinition;

// --- Stack Definitions ---

export type StackVariant = DefinitionMeta & {
  key: StackVariantKey;
  profileOverrides?: {
    irPipeline?: ProfileRef;
    projection?: ProfileRef;
    execution?: ProfileRef;
  };
};

export type StackDefinition = DefinitionMeta & {
  profiles: {
    irPipeline: ProfileRef;
    projection: ProfileRef;
    execution?: ProfileRef;
  };
  variants?: StackVariant[];
};

// --- Provider / Tool Definitions ---

export type ToolKind =
  | 'ir-authoring-tool'
  | 'ir-pipeline-tool'
  | 'ir-pass'
  | 'projection-compiler'
  | 'execution-engine'
  | 'profile-resolver'
  | 'capability-checker'
  | 'custom';

export type ToolCapabilityDefinition = DefinitionMeta & {
  toolKind: ToolKind;
  implementsProfiles?: ProfileRef[];
  acceptedCoreVersions?: CoreSchemaVersionSelector;
  supportedFeatures?: FeatureRef[];
  capabilities: CapabilityRef[];
  environments?: ExecutionEnvironmentKey[];
};

export type ProviderCapabilityDefinition = DefinitionMeta & {
  capabilities: CapabilityRef[];
  contracts?: ProviderContractRef[];
  environments?: ExecutionEnvironmentKey[];
};

export type ProviderContractDefinition = DefinitionMeta & {
  capabilities: CapabilityRef[];
  bindingSubjects?: ExecutionBindingSubject['kind'][];
  interfaceSchema?: PayloadSchemaRef;
  semanticObligations?: Description[];
};
