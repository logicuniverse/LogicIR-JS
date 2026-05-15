export type {
  Connection,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  LUI,
  Port,
  PortKey,
} from '@logic-universe/logic-ir-core';

export type HdlSignalPayload = {
  width: 1;
  signed: false;
};

export type HdlOperationPayload = {
  op: 'and';
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
  note: 'This task-local HDL artifact is review evidence and a runnable baseline, not final schema authority or a mandatory projector algorithm.',
});

export type HdlArtifacts = {
  interpretation: InterpretationMetadata;
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
