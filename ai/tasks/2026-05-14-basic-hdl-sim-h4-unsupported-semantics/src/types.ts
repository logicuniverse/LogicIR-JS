export type { FeatureUse, LogicUnit } from '@logic-universe/logic-ir-core';

export type Diagnostic = {
  code: 'HDL_UNSUPPORTED_REQUIRED_FEATURE';
  severity: 'error';
  feature: string;
  message: string;
};

export type InterpretationMetadata = {
  authority: 'sandbox-evidence';
  baselineOnly: true;
  realizationStrategy: string;
  semanticPreservation: string[];
  note: string;
};

export const baselineInterpretation = (
  realizationStrategy: string,
  semanticPreservation: string[],
): InterpretationMetadata => ({
  authority: 'sandbox-evidence',
  baselineOnly: true,
  realizationStrategy,
  semanticPreservation,
  note: 'This task-local HDL projection result is review evidence and a runnable baseline, not final schema authority or a mandatory projector algorithm.',
});

export type ProjectionResult =
  | {
      kind: 'projected';
      interpretation: InterpretationMetadata;
      artifactPath: string;
      diagnostics: Diagnostic[];
    }
  | {
      kind: 'rejected';
      interpretation: InterpretationMetadata;
      diagnostics: Diagnostic[];
    };
