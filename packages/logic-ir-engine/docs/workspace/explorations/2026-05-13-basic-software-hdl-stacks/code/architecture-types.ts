import type {
  ExtensionKey,
  FeatureKey,
  FeatureNamespace,
  LogicIRCoreSchemaVersion,
} from '../../../../../schema/core/v0-draft/types';

export type ProfileKind = 'ir-pipeline' | 'projection' | 'execution';

export type StackId = string;
export type ProfileId = string;
export type StageId = string;
export type CapabilityId = string;
export type ProviderNamespace = string;
export type ProviderKey = string;

export type FeatureIdentity = {
  namespace: FeatureNamespace;
  key: FeatureKey;
};

export type FeatureUse = {
  feature: FeatureIdentity;
  requirement: 'required' | 'recommended' | 'optional';
  extensionKeys: ExtensionKey[];
  notes?: string;
};

export type StageRequirement = {
  id: StageId;
  capability: CapabilityId;
  requirement: 'required' | 'recommended' | 'optional';
  consumesFeatures?: FeatureIdentity[];
  produces?: string;
  notes?: string;
};

export type DiagnosticPolicy = {
  unsupportedRequiredExtension: 'fail';
  unsupportedFeature: 'fail' | 'warn';
  unsafeFallback: 'fail' | 'warn';
};

export type BaseProfile = {
  id: ProfileId;
  kind: ProfileKind;
  title: string;
  status: 'exploration';
  description: string;
  features: FeatureUse[];
  diagnostics: DiagnosticPolicy;
};

export type IRPipelineProfile = BaseProfile & {
  kind: 'ir-pipeline';
  input: 'logicir';
  output: 'logicir';
  acceptedCoreVersions: LogicIRCoreSchemaVersion[];
  stages: StageRequirement[];
  stripPolicy: {
    authoringData: 'strip' | 'retain' | 'profile-defined';
    consumedTypeData: 'strip' | 'retain' | 'profile-defined';
  };
};

export type ProjectionProfile = BaseProfile & {
  kind: 'projection';
  input: 'logicir';
  output: 'artifact' | 'executable-plan';
  projectionTarget: string;
  artifactKinds: string[];
  stages: StageRequirement[];
  unsupportedSemantics: Record<string, 'fail' | 'lower' | 'requires-feature'>;
};

export type ProviderContract = {
  id: string;
  title: string;
  requirement: 'required' | 'recommended' | 'optional';
  capabilities: CapabilityId[];
  notes?: string;
};

export type ExecutionTarget =
  | 'interpreter'
  | 'generated-software'
  | 'native-host'
  | 'verilog-simulator'
  | 'distributed-runtime';

export type ExecutionBindingKind =
  | 'external-target'
  | 'requirement-service'
  | 'requirement-unit'
  | 'state-store'
  | 'completion-scheduler'
  | 'error-channel'
  | 'lifecycle-resource'
  | 'transport'
  | 'module'
  | 'clock-reset'
  | 'stimulus'
  | 'probe';

export type ProviderRef = {
  namespace: ProviderNamespace;
  key: ProviderKey;
};

export type ExecutionBinding = {
  kind: ExecutionBindingKind;
  abstractRef: string;
  provider: ProviderRef;
  requirement: 'required' | 'optional';
  config?: Record<string, unknown>;
  notes?: string;
};

export type ExecutionProfile = BaseProfile & {
  kind: 'execution';
  input: 'logicir' | 'executable-plan' | 'artifact';
  output: 'execution';
  target: ExecutionTarget;
  environments: string[];
  providerContracts: ProviderContract[];
  bindings: ExecutionBinding[];
  policies: Record<string, string>;
};

export type Profile =
  | IRPipelineProfile
  | ProjectionProfile
  | ExecutionProfile;

export type StackDefinition = {
  id: StackId;
  title: string;
  status: 'exploration';
  description: string;
  irPipeline: IRPipelineProfile;
  projection: ProjectionProfile;
  execution?: ExecutionProfile;
  variants?: {
    id: StackId;
    title: string;
    execution?: ExecutionProfile;
    notes?: string;
  }[];
};

export type FeatureCatalogEntry = {
  feature: FeatureIdentity;
  title: string;
  owner: 'shared' | 'basic-software' | 'basic-hdl';
  extensionKeys: ExtensionKey[];
  usedBy: StackId[];
  notes: string;
};

export const requiredDiagnosticPolicy: DiagnosticPolicy = {
  unsupportedRequiredExtension: 'fail',
  unsupportedFeature: 'fail',
  unsafeFallback: 'fail',
};

export const feature = (
  namespace: FeatureNamespace,
  key: FeatureKey
): FeatureIdentity => ({ namespace, key });

export const provider = (
  namespace: ProviderNamespace,
  key: ProviderKey
): ProviderRef => ({ namespace, key });

export const sameFeature = (a: FeatureIdentity, b: FeatureIdentity): boolean =>
  a.namespace === b.namespace && a.key === b.key;

export const validateStackDefinition = (stack: StackDefinition): string[] => {
  const errors: string[] = [];
  if (stack.irPipeline.kind !== 'ir-pipeline') {
    errors.push(`${stack.id}: irPipeline must be an IR pipeline profile.`);
  }
  if (stack.projection.kind !== 'projection') {
    errors.push(`${stack.id}: projection must be a projection profile.`);
  }
  if (stack.execution && stack.execution.kind !== 'execution') {
    errors.push(`${stack.id}: execution must be an execution profile.`);
  }
  if (stack.projection.input !== stack.irPipeline.output) {
    errors.push(
      `${stack.id}: projection input ${stack.projection.input} must match IR output ${stack.irPipeline.output}.`
    );
  }
  if (stack.execution) {
    const projectionCompatible =
      stack.projection.output === stack.execution.input ||
      stack.execution.input === 'logicir';
    if (!projectionCompatible) {
      errors.push(
        `${stack.id}: execution input ${stack.execution.input} is not compatible with projection output ${stack.projection.output}.`
      );
    }
  }
  for (const variant of stack.variants ?? []) {
    if (variant.execution) {
      const compatible =
        stack.projection.output === variant.execution.input ||
        variant.execution.input === 'logicir';
      if (!compatible) {
        errors.push(
          `${variant.id}: execution input ${variant.execution.input} is not compatible with projection output ${stack.projection.output}.`
        );
      }
    }
  }
  return errors;
};

export const collectProfileFeatures = (
  profile: Profile
): FeatureIdentity[] => profile.features.map((item) => item.feature);

export const collectStackFeatures = (
  stack: StackDefinition
): FeatureIdentity[] => {
  const all = [
    ...collectProfileFeatures(stack.irPipeline),
    ...collectProfileFeatures(stack.projection),
    ...(stack.execution ? collectProfileFeatures(stack.execution) : []),
  ];
  const unique: FeatureIdentity[] = [];
  for (const item of all) {
    if (!unique.some((seen) => sameFeature(seen, item))) {
      unique.push(item);
    }
  }
  return unique;
};

