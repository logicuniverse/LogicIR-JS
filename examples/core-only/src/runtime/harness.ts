import {
  createCoreSoftwareInterpreter,
  type CoreRunResult,
  type CoreRuntimeRunner,
} from '@logic-universe/logic-ir-engine-core-software-interpreter';
import type {
  InputPortKey,
  LogicUnit,
  OutputPortKey,
} from '@logic-universe/logic-ir-core';
import { coreOnlyTargetCatalog } from './catalog.js';

export type ExampleHarness = {
  readonly logicUnit: LogicUnit;
  setInputCurrent: (key: InputPortKey, value: unknown) => void;
  pushInput: (key: InputPortKey, value: unknown) => void;
  readResult: () => unknown;
  readOutput: (key: OutputPortKey) => unknown;
  subscribeOutput: (key: OutputPortKey, listener: (value: unknown) => void) => () => void;
  run: () => CoreRunResult;
};

export const createExampleHarness = (logicUnit: LogicUnit): ExampleHarness => {
  const interpreter = createCoreSoftwareInterpreter({
    targets: coreOnlyTargetCatalog,
  });
  const runtime = interpreter.manifest(logicUnit);

  return wrapRuntime(logicUnit, runtime);
};

const wrapRuntime = (
  logicUnit: LogicUnit,
  runtime: CoreRuntimeRunner,
): ExampleHarness => ({
  logicUnit,
  setInputCurrent: (key, value) => runtime.setInputCurrent(key, value),
  pushInput: (key, value) => runtime.pushInput(key, value),
  readResult: () => runtime.readResult(),
  readOutput: (key) => runtime.readOutput(key),
  subscribeOutput: (key, listener) => runtime.subscribeOutput(key, listener),
  run: () => runtime.run(),
});
