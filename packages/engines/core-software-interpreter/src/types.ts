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

export type NestedCoreRuntimeInstance = Pick<
  CoreRuntimeInstance,
  'setInputValue' | 'pushInput' | 'readResult' | 'readOutput' | 'readAnchor' | 'subscribeOutput'
>;

export type CoreRuntimeInstance = {
  readonly logicUnit: LogicUnit;
  readonly kind: LogicUnit['core']['kindOrganization']['kind'];
  setInputValue: (key: InputPortKey, value: RuntimeValue) => void;
  pushInput: (key: InputPortKey, value: RuntimeValue) => void;
  setOutletValue: (key: CompositionOutletKey, value: RuntimeValue) => void;
  readResult: () => RuntimeValue | undefined;
  readOutput: (key: OutputPortKey) => RuntimeValue | undefined;
  readAnchor: (key: CompositionAnchorKey) => RuntimeValue | undefined;
  subscribeOutput: (key: OutputPortKey, listener: RuntimeListener) => () => void;
};

export type CoreSoftwareInterpreter = {
  instantiate: (logicUnit: LogicUnit) => CoreRuntimeInstance;
};
