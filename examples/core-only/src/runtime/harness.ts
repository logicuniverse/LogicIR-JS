import {
  createCoreSoftwareInterpreter,
  type CoreRuntimeInstance,
} from '@logic-universe/logic-ir-engine-core-software-interpreter';
import type {
  CompositionAnchorKey,
  CompositionOutletKey,
  InputPortKey,
  LogicUnit,
  OutputPortKey,
} from '@logic-universe/logic-ir-core';
import { coreOnlyTargetCatalog } from './catalog.js';

export type ExampleHarness = {
  readonly logicUnit: LogicUnit;
  setInputValue: (key: InputPortKey, value: unknown) => void;
  pushInput: (key: InputPortKey, value: unknown) => void;
  setOutletValue: (key: CompositionOutletKey, value: unknown) => void;
  readResult: () => unknown;
  readOutput: (key: OutputPortKey) => unknown;
  readAnchor: (key: CompositionAnchorKey) => unknown;
  subscribeOutput: (key: OutputPortKey, listener: (value: unknown) => void) => () => void;
};

export const createExampleHarness = (logicUnit: LogicUnit): ExampleHarness => {
  const interpreter = createCoreSoftwareInterpreter({
    targets: coreOnlyTargetCatalog,
  });
  const runtime = interpreter.instantiate(logicUnit);

  return wrapRuntime(logicUnit, runtime);
};

const wrapRuntime = (
  logicUnit: LogicUnit,
  runtime: CoreRuntimeInstance,
): ExampleHarness => ({
  logicUnit,
  setInputValue: (key, value) => runtime.setInputValue(key, value),
  pushInput: (key, value) => runtime.pushInput(key, value),
  setOutletValue: (key, value) => runtime.setOutletValue(key, value),
  readResult: () => runtime.readResult(),
  readOutput: (key) => runtime.readOutput(key),
  readAnchor: (key) => runtime.readAnchor(key),
  subscribeOutput: (key, listener) => runtime.subscribeOutput(key, listener),
});
