import type {
  CatalogEntry,
  FeatureDefinition,
  ProfileDefinition,
  StackDefinition,
} from './types';

export const fulfillmentFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'fulfillment',
  version: '0.0.0-s4',
  definition: {
    title: 'Software fulfillment',
    description:
      'Provider and closure fulfillment shape for requirement-backed LUI execution.',
    extensionPoints: [
      {
        key: 'closure-fulfillment',
        attachment: 'unit-fulfillment',
      },
      {
        key: 'upstream-provider-fulfillment',
        attachment: 'unit-fulfillment',
      },
    ],
  },
};

export const basicSoftwareIRProfile: CatalogEntry<ProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'basic-software-ir',
  version: '0.0.0-s4',
  definition: {
    profileKind: 'ir-pipeline',
    title: 'Basic software IR with fulfillment',
    featureContracts: [
      {
        feature: {
          namespace: fulfillmentFeature.namespace,
          key: fulfillmentFeature.key,
          version: fulfillmentFeature.version,
        },
        requirement: 'required',
      },
    ],
  },
};

export const toInterpreterPlanProfile: CatalogEntry<ProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'to-interpreter-plan',
  version: '0.0.0-s4',
  definition: {
    profileKind: 'projection',
    title: 'Interpreter plan with fulfillment',
    featureContracts: [
      {
        feature: {
          namespace: fulfillmentFeature.namespace,
          key: fulfillmentFeature.key,
          version: fulfillmentFeature.version,
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
    version: '0.0.0-s4',
    definition: {
      profileKind: 'execution',
      title: 'Software execution with closure/upstream fulfillment',
      featureContracts: [
        {
          feature: {
            namespace: fulfillmentFeature.namespace,
            key: fulfillmentFeature.key,
            version: fulfillmentFeature.version,
          },
          requirement: 'required',
        },
      ],
    },
  };

export const basicSoftwareInterpreterStack: CatalogEntry<StackDefinition> = {
  namespace: 'logicir.stack',
  key: 'basic-software-interpreter',
  version: '0.0.0-s4',
  definition: {
    title: 'Basic software interpreter stack, S4',
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
