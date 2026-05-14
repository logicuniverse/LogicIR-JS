import type {
  CatalogEntry,
  FeatureDefinition,
  ProfileDefinition,
  StackDefinition,
} from './types';

export const completionFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'completion',
  version: '0.0.0-s3',
  definition: {
    title: 'Software completion',
    description:
      'Completion, failure, and thenable-compatible await semantics for software execution.',
    extensionPoints: [
      {
        key: 'completion-policy',
        attachment: 'lui',
        payloadSchema: {
          type: 'object',
          properties: {
            kind: { enum: ['await-provider'] },
            rejectMode: { enum: ['diagnostic'] },
          },
          required: ['kind', 'rejectMode'],
        },
      },
    ],
  },
};

export const basicSoftwareIRProfile: CatalogEntry<ProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'basic-software-ir',
  version: '0.0.0-s3',
  definition: {
    profileKind: 'ir-pipeline',
    title: 'Basic software IR with completion',
    featureContracts: [
      {
        feature: {
          namespace: completionFeature.namespace,
          key: completionFeature.key,
          version: completionFeature.version,
        },
        requirement: 'required',
      },
    ],
  },
};

export const toInterpreterPlanProfile: CatalogEntry<ProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'to-interpreter-plan',
  version: '0.0.0-s3',
  definition: {
    profileKind: 'projection',
    title: 'Interpreter plan with completion policy',
    featureContracts: [
      {
        feature: {
          namespace: completionFeature.namespace,
          key: completionFeature.key,
          version: completionFeature.version,
        },
        requirement: 'required',
      },
    ],
  },
};

export const softwareInterpreterExecutionProfile: CatalogEntry<ProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'software-interpreter-execution',
    version: '0.0.0-s3',
    definition: {
      profileKind: 'execution',
      title: 'Software execution with awaited provider completion',
      featureContracts: [
        {
          feature: {
            namespace: completionFeature.namespace,
            key: completionFeature.key,
            version: completionFeature.version,
          },
          requirement: 'required',
        },
      ],
      policies: {
        completion: { kind: 'await-provider', rejectMode: 'diagnostic' },
      },
    },
  };

export const basicSoftwareInterpreterStack: CatalogEntry<StackDefinition> = {
  namespace: 'logicir.stack',
  key: 'basic-software-interpreter',
  version: '0.0.0-s3',
  definition: {
    title: 'Basic software interpreter stack, S3',
    profiles: {
      irPipeline: {
        namespace: basicSoftwareIRProfile.namespace,
        key: basicSoftwareIRProfile.key,
        version: basicSoftwareIRProfile.version,
      },
      projection: {
        namespace: toInterpreterPlanProfile.namespace,
        key: toInterpreterPlanProfile.key,
        version: toInterpreterPlanProfile.version,
      },
      execution: {
        namespace: softwareInterpreterExecutionProfile.namespace,
        key: softwareInterpreterExecutionProfile.key,
        version: softwareInterpreterExecutionProfile.version,
      },
    },
  },
};

export const profiles = [
  basicSoftwareIRProfile,
  toInterpreterPlanProfile,
  softwareInterpreterExecutionProfile,
];
