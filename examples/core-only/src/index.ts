import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { combinationalAddExample } from './scenarios/01-combinational-add/index.js';
import { statefulCounterExample } from './scenarios/02-stateful-counter/index.js';
import { sequentialPipelineExample } from './scenarios/03-sequential-pipeline/index.js';
import { structuralDomExample } from './scenarios/04-structural-dom/index.js';
import { multiLuiCompositionExample } from './scenarios/05-multi-lui-composition/index.js';
import { requirementClosureExample } from './scenarios/06-z-requirement-closure/index.js';

export type CoreOnlyExample = {
  key: string;
  title: string;
  purpose: string;
  logicUnit?: LogicUnit;
  run: () => CoreOnlyExampleResult;
};

export type CoreOnlyExampleResult = {
  key: string;
  ok: boolean;
  summary: string;
};

export const examples: CoreOnlyExample[] = [
  combinationalAddExample,
  statefulCounterExample,
  sequentialPipelineExample,
  structuralDomExample,
  multiLuiCompositionExample,
  requirementClosureExample,
];

export function runExamples(): CoreOnlyExampleResult[] {
  return examples.map((example) => example.run());
}
