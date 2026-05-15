import { supportedRequiredFeatures } from './architecture';
import type { Diagnostic, FeatureUse, LogicUnit, ProjectionResult } from './types';

const featureIdentity = (feature: FeatureUse): string =>
  `${feature.namespace}/${feature.key}`;

const unsupportedFeatureDiagnostic = (feature: FeatureUse): Diagnostic => ({
  code: 'HDL_UNSUPPORTED_REQUIRED_FEATURE',
  severity: 'error',
  feature: featureIdentity(feature),
  message: `basic-hdl-sim cannot project required feature ${featureIdentity(feature)} without an explicit lowering or rejection policy.`,
});

export const projectToVerilogOrReject = (
  logicUnit: LogicUnit,
): ProjectionResult => {
  const diagnostics = Object.values(logicUnit.features)
    .filter(
      (feature) =>
        !supportedRequiredFeatures.includes(
          featureIdentity(feature) as (typeof supportedRequiredFeatures)[number],
        ),
    )
    .map(unsupportedFeatureDiagnostic);

  if (diagnostics.length > 0) {
    return {
      kind: 'rejected',
      diagnostics,
    };
  }

  return {
    kind: 'projected',
    artifactPath: 'generated/unreachable.v',
    diagnostics: [],
  };
};
