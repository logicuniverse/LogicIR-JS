export type { LogicUnit, LUITarget, Port } from '@logic-universe/logic-ir-core';

import type { LogicUnit, LUITarget } from '@logic-universe/logic-ir-core';

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export type DiagnosticPhase =
  | 'resolve'
  | 'project'
  | 'execute'
  | 'report';

export type Diagnostic = {
  code:
    | 'PROVIDER_MISSING'
    | 'PLAN_INVALID'
    | 'UNSUPPORTED_SEMANTIC'
    | 'RUNTIME_FAILURE';
  severity: DiagnosticSeverity;
  phase: DiagnosticPhase;
  message: string;
  subject?: string;
  detail?: Record<string, unknown>;
};

export type DiagnosticReport = {
  status: 'ok' | 'error';
  interpretation: InterpretationMetadata;
  diagnostics: Diagnostic[];
  summary: Record<string, number>;
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
  note: 'This task-local plan is review evidence and a runnable baseline, not final schema authority or a mandatory engine algorithm.',
});

export type LogicUnitFixture = {
  key: string;
  logicUnit: LogicUnit;
  target: Extract<LUITarget, { kind: 'external' }>;
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
  unsupportedSemantics?: string[];
};

export type InterpreterPlan = {
  key: string;
  interpretation: InterpretationMetadata;
  providerKey?: string;
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
  diagnostics: Diagnostic[];
};

export type ProviderFunction = (
  inputs: Record<string, unknown>,
) => Record<string, unknown>;

export type ExecutionResult = {
  status: 'ok' | 'error';
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export type ProviderRegistry = Record<string, ProviderFunction>;

export const providerIdentity = (target: {
  namespace: string;
  key: string;
}): string => `${target.namespace}/${target.key}`;
