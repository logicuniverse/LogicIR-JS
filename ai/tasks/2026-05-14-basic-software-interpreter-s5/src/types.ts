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
  diagnostics: Diagnostic[];
  summary: Record<string, number>;
};

export type LogicUnitFixture = {
  key: string;
  features: string[];
  target: {
    namespace: string;
    key: string;
  };
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
  unsupportedSemantics?: string[];
};

export type InterpreterPlan = {
  key: string;
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
