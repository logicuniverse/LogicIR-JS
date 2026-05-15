import type {
  Diagnostic,
  DiagnosticPhase,
  DiagnosticReport,
} from './types';
import { baselineInterpretation } from './types';

export const diagnostic = (
  code: Diagnostic['code'],
  phase: DiagnosticPhase,
  message: string,
  subject?: string,
  detail?: Record<string, unknown>,
): Diagnostic => ({
  code,
  severity: 'error',
  phase,
  message,
  subject,
  detail,
});

export const reportDiagnostics = (
  diagnostics: Diagnostic[],
): DiagnosticReport => {
  const summary: Record<string, number> = {};

  for (const entry of diagnostics) {
    summary[entry.code] = (summary[entry.code] ?? 0) + 1;
  }

  return {
    status: diagnostics.some((entry) => entry.severity === 'error')
      ? 'error'
      : 'ok',
    interpretation: baselineInterpretation('s5-diagnostic-reporting-baseline', [
      'Projection and execution failures are surfaced as phase-scoped diagnostics.',
      'Unsupported semantics are rejected instead of silently lowering to different behavior.',
    ]),
    diagnostics,
    summary,
  };
};
