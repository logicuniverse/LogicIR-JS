import type { Diagnostic, FeatureUse, LogicUnit, ProjectionResult } from './types';
import { baselineInterpretation } from './types';

const supportedRequiredFeatures = [
  'logicir.hdl/signal',
  'logicir.hdl/combinational',
] as const;

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
      interpretation: baselineInterpretation('h4-required-feature-rejection', [
        'Required unsupported features are rejected with diagnostics instead of silently projected.',
        'The rejection policy is a task-local baseline for review, not the only valid projector design.',
      ]),
      diagnostics,
    };
  }

  return {
    kind: 'projected',
    interpretation: baselineInterpretation('h4-supported-feature-placeholder', [
      'Supported feature sets may proceed to HDL projection after explicit capability checks.',
      'This path is a placeholder baseline for rejection testing.',
    ]),
    artifactPath: 'generated/unreachable.v',
    diagnostics: [],
  };
};
