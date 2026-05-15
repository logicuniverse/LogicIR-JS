import type { EndpointRef, LogicUnit } from '@logic-universe/logic-ir-core';

export type JsonPrimitive = null | boolean | number | string;
export type JsonArray = JsonValue[];
export type JsonRecord = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonRecord;

export type JsonPathSegment = string | number;
export type JsonPath = JsonPathSegment[];

export type ScopeRef = {
  kind: 'logic-unit' | 'closure' | 'profile' | 'stack' | 'task-fixture';
  ref: string;
};

export type Snapshot = {
  ref: string;
  hash: string;
  data: JsonValue;
};

export type TypedHole = {
  $hole: {
    id: string;
    expected:
      | 'feature-use'
      | 'lui'
      | 'connection'
      | 'extension-payload'
      | 'provider-binding'
      | 'custom';
    reason: string;
    contract?: string;
  };
};

export type SetOperation = {
  kind: 'set';
  path: JsonPath;
  value: JsonValue;
};

export type InsertOperation = {
  kind: 'insert';
  path: JsonPath;
  key: string;
  value: JsonValue;
};

export type DeleteOperation = {
  kind: 'delete';
  path: JsonPath;
};

export type ConnectOperation = {
  kind: 'connect';
  connectionId: string;
  from: EndpointRef;
  to: EndpointRef;
};

export type LogicIREditOperation =
  | SetOperation
  | InsertOperation
  | DeleteOperation
  | ConnectOperation;

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export type Diagnostic = {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  path?: JsonPath;
};

export type ValidationResult = {
  name: string;
  diagnostics: Diagnostic[];
};

export type TestResult = {
  name: string;
  status: 'passed' | 'failed';
  diagnostics: Diagnostic[];
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
  note: 'This edit transaction MVP is review evidence and a runnable sandbox baseline, not final edit protocol schema or mandatory tool architecture.',
});

export type LogicIREditTransaction = {
  schemaVersion: 'logicir.edit-transaction.mvp/0.1';
  interpretation: InterpretationMetadata;
  intent: string;
  scope: ScopeRef;
  before: Snapshot;
  operations: LogicIREditOperation[];
  after: Snapshot;
  validation?: ValidationResult[];
  tests?: TestResult[];
  rationale: string;
};

export type ReplayResult = {
  data: JsonValue;
  diagnostics: Diagnostic[];
};

export type InvocationPlan = {
  providerKey: string;
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
};

export type ProviderFunction = (
  inputs: Record<string, JsonValue>,
) => Record<string, JsonValue>;

export type ProviderRegistry = Record<string, ProviderFunction>;

export type LogicUnitJson = LogicUnit & JsonRecord;
