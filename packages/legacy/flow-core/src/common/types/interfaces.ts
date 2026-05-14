import { CommonText } from './helpers';

export enum EditorPortType {
  Data = 'D',
  Stream = 'S',
  Property = 'P',
  Component = 'C',
}

export type GenericEditorPort<T extends EditorPortType> = {
  key: string;
  type: T;
} & CommonText;

type GenericEditorPorts<I extends EditorPortType, O extends EditorPortType> = {
  input: GenericEditorPort<I>[];
  output: GenericEditorPort<O>[];
};

export type EditorPorts = GenericEditorPort<EditorPortType>[];

export type EditorComputePorts = GenericEditorPorts<EditorPortType.Data, never>;

export type EditorStateMachinePorts = GenericEditorPorts<
  EditorPortType.Data | EditorPortType.Stream,
  EditorPortType.Stream | EditorPortType.Property
>;

export type EditorSequencePorts = GenericEditorPorts<
  EditorPortType.Data | EditorPortType.Stream,
  EditorPortType.Stream
>;

export type EditorComponentPorts = GenericEditorPorts<
  EditorPortType,
  EditorPortType.Stream
> & {
  return: ({ key: string } & CommonText)[];
};

export enum RunModeKind {
  Sequence = 'SEQ',
  Compute = 'CPT',
  StateMachine = 'STM',
  Component = 'CPN',
}

export type SequenceInterface = {
  kind: RunModeKind.Sequence;
  isAsync?: boolean; // default false
  ports: EditorSequencePorts;
  returnVoid?: boolean; // default false
  returnText?: CommonText;
};

export type ComputeInterface = {
  kind: RunModeKind.Compute;
  ports: EditorComputePorts;
  returnText?: CommonText;
};

export type StateMachineInterface = {
  kind: RunModeKind.StateMachine;
  ports: EditorStateMachinePorts;
};

export type ComponentInterface = {
  kind: RunModeKind.Component;
  ports: EditorComponentPorts;
};

export type InterfaceData =
  | SequenceInterface
  | ComputeInterface
  | StateMachineInterface
  | ComponentInterface;

export type IndependentFlowInterface = InterfaceData;

// export enum InjectionKind {
//   Service = 'S',
//   Flows = 'F',
// }

export type DirectInjection = {
  isComposite: false;
  packageId: string; // null means same package
  serviceKey: string; // xxx.xxx can be sub-paths
  // subPath: string[]; // if a node is a provider, then it can provide multiple methods, some methods may also be providers, so methodPath is an array
  scope?: string[]; // undefined means all
  // version?: string; //
  // autoImport?: boolean;
} & CommonText;

export type CompositeInjection<T extends IndependentFlowInterface> = {
  isComposite: true;
  isStateful?: boolean; // flows injection can have internal state between method calls, or just library functions
  items: Record<string, T & { isOptional?: boolean } & CommonText>; // <key,flowInterface>
} & CommonText;

export type Injection<T extends IndependentFlowInterface> =
  | DirectInjection
  | CompositeInjection<T>;

// export enum ProvisionKind {
//   Direct = 'D',
//   Composite = 'C',
// }

// export enum CompositeProvisionKind {
//   Injection = 'IJ',
//   Subflow = 'SF',
// }

// export type Provision =
//   | {
//       isComposite: false;
//       source: { nodeId: string; subflowKey: string } | null; // null => root flow
//       injectionKey: string;
//     }
//   | {
//       isComposite: true;
//       items: Record<
//         string,
//         | {
//             kind: CompositeProvisionKind.Injection;
//             source: { nodeId: string; subflowKey: string } | null; // null => root flow
//             injectionKey: string;
//             methodKey: string;
//           }
//         | { kind: CompositeProvisionKind.Subflow; subflowKey: string }
//       >;
//     };
// export type Provisions = Record<string, Provision>;

export type NodeDependencies = Record<string, Injection<FlowInterface>>;

export type FlowDependencies = Record<
  string,
  Injection<IndependentFlowInterface>
>;

export type FlowInterface = IndependentFlowInterface & {
  dependencies?: FlowDependencies;
};

export type NodeInterface = InterfaceData & {
  dependencies?: NodeDependencies;
};
