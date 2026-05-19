import type {
  CompositionAnchorKey,
  CompositionOutletKey,
  InputPortKey,
  LogicUnit,
  OutputPortKey,
} from '@logic-universe/logic-ir-core';

export type RuntimeValue = unknown;

export type RuntimeListener = (value: RuntimeValue) => void;

export type CoreExternalTargetRef = {
  namespace: string;
  key: string;
  version?: string;
};

export type CombinationalTargetRuntime = {
  kind: 'combinational';
  evaluate: (inputs: Record<InputPortKey, RuntimeValue | undefined>) => RuntimeValue;
};

export type SequentialTargetRuntime = {
  kind: 'sequential';
  execute: (inputs: Record<InputPortKey, RuntimeValue | undefined>) => RuntimeValue;
};

export type StatefulTargetContext = {
  getInputValue: (key: InputPortKey) => RuntimeValue | undefined;
  emitOutput: (key: OutputPortKey, value: RuntimeValue) => void;
  readOutput: (key: OutputPortKey) => RuntimeValue | undefined;
};

export type StatefulTargetInstance = {
  initialize: () => void;
  pushInput: (key: InputPortKey, value: RuntimeValue) => void;
  refreshInput?: (key: InputPortKey) => void;
};

export type StatefulTargetRuntime = {
  kind: 'stateful';
  create: (context: StatefulTargetContext) => StatefulTargetInstance;
};

export type StructuralTargetRuntime = {
  kind: 'structural';
  compose: (args: {
    inputs: Record<InputPortKey, RuntimeValue | undefined>;
    anchors: Record<CompositionAnchorKey, RuntimeValue | undefined>;
  }) => Record<CompositionOutletKey, RuntimeValue | undefined>;
};

export type CoreExternalTargetRuntime =
  | CombinationalTargetRuntime
  | SequentialTargetRuntime
  | StatefulTargetRuntime
  | StructuralTargetRuntime;

export type CoreExternalTargetCatalog = Record<
  string,
  CoreExternalTargetRuntime
>;

export type CoreInterpreterCatalog = {
  logicUnits?: Record<string, LogicUnit>;
  targets?: CoreExternalTargetCatalog;
};

export type StatefulResponseHandle = {
  readonly logicUnit: LogicUnit;
  pushInput: (key: InputPortKey, value: RuntimeValue) => void;
  readOutput: (key: OutputPortKey) => RuntimeValue | undefined;
  subscribeOutput: (key: OutputPortKey, listener: RuntimeListener) => () => void;
};

export type CoreRunResult = {
  initialObservation: RuntimeValue | undefined;
  handle?: StatefulResponseHandle;
};

export type CoreRuntimeRunner = {
  readonly logicUnit: LogicUnit;
  readonly kind: LogicUnit['core']['kindOrganization']['kind'];
  setInputCurrent: (key: InputPortKey, value: RuntimeValue) => void;
  pushInput: (key: InputPortKey, value: RuntimeValue) => void;
  applyOutlets: (outlets: Record<CompositionOutletKey, RuntimeValue>) => void;
  readResult: () => RuntimeValue | undefined;
  readOutput: (key: OutputPortKey) => RuntimeValue | undefined;
  readAnchor: (key: CompositionAnchorKey) => RuntimeValue | undefined;
  subscribeOutput: (key: OutputPortKey, listener: RuntimeListener) => () => void;
  run: () => CoreRunResult;
};

export type NestedCoreRuntimeRunner = Pick<
  CoreRuntimeRunner,
  'setInputCurrent' | 'pushInput' | 'readResult' | 'readOutput' | 'readAnchor' | 'run'
>;

export type CoreSoftwareInterpreter = {
  manifest: (logicUnit: LogicUnit) => CoreRuntimeRunner;
};
