import { EditorPortType } from '../types';

export type EditorPortInfo = {
  id: string;
  key: string;
  type: EditorPortType;
  isTrigger?: boolean;
  isConstant?: boolean;
  destructuringData: string[] | number | null;
  displayName?: string;
  description?: string;
};

export type EditorPortsInfo = {
  inputs: EditorPortInfo[];
  outputs: EditorPortInfo[];
};

export type EditorNodePortsInfo = EditorPortsInfo & {
  subFlows: Record<string, EditorPortsInfo>;
  dependencies: Record<string, EditorPortInfo>;
};

// export enum EditorFlowPortTemplateType {
//   Predefiend = 'P',
//   Custom = 'C',
//   Meta = 'M',
// }
