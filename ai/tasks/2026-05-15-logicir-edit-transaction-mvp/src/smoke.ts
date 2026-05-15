import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { editTransaction, executionBindings } from './fixture';
import { stableStringify } from './hash';
import {
  executeInvocationPlan,
  projectInvocationPlan,
} from './interpreter';
import { replayTransaction } from './replay';
import type { JsonValue, ProviderRegistry, TestResult } from './types';
import { hasErrors, validateTransaction } from './validate';

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const providers: ProviderRegistry = {
  'add-pair-provider': (inputs) => {
    const left = inputs.left;
    const right = inputs.right;

    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new Error('add-pair-provider expects numeric left and right inputs.');
    }

    return {
      sum: left + right,
    };
  },
};

const validation = validateTransaction(editTransaction);
const validationDiagnostics = validation.flatMap((result) => result.diagnostics);

assert(
  editTransaction.interpretation.baselineOnly,
  'Edit transaction must declare baseline interpretation metadata.',
);

assert(
  !hasErrors(validationDiagnostics),
  `Transaction validation failed: ${stableStringify(validationDiagnostics as unknown as JsonValue)}`,
);

const replayed = replayTransaction(editTransaction);
const logicUnit = replayed.data as unknown as LogicUnit;
const plan = projectInvocationPlan(logicUnit, executionBindings);
const outputs = executeInvocationPlan(plan, { left: 2, right: 3 }, providers);

assert(outputs.sum === 5, `Expected smoke output sum=5, got ${String(outputs.sum)}.`);

const tests: TestResult[] = [
  {
    name: 'replay-and-core-validation',
    status: 'passed',
    diagnostics: validationDiagnostics,
  },
  {
    name: 'provider-invocation-smoke',
    status: 'passed',
    diagnostics: [],
  },
];

const report = {
  task: 'logicir-edit-transaction-mvp',
  status: 'passed',
  interpretation: editTransaction.interpretation,
  beforeHash: editTransaction.before.hash,
  afterHash: editTransaction.after.hash,
  operationCount: editTransaction.operations.length,
  validation,
  plan,
  outputs,
  tests,
};

console.log(JSON.stringify(report, null, 2));
