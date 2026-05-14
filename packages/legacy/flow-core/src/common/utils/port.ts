import { EditorPortsInfo, EditorNodePortsInfo, EditorPortInfo } from './types';

export type AllPortsInfo = {
  sourcePortsInfo: Record<string, EditorPortInfo>;
  destPortsInfo: Record<string, EditorPortInfo>;
};

export const getAllPortsInfo = (
  flowPortsInfo: EditorPortsInfo,
  nodesPortsInfo: Record<string, EditorNodePortsInfo>
): AllPortsInfo => {
  const sourcePortsInfo: Record<string, EditorPortInfo> = {};
  const destPortsInfo: Record<string, EditorPortInfo> = {};
  flowPortsInfo.inputs.map((x) => {
    sourcePortsInfo[x.id] = x;
  });
  flowPortsInfo.outputs.map((x) => {
    destPortsInfo[x.id] = x;
  });
  Object.values(nodesPortsInfo).map((nodePortsInfo) => {
    nodePortsInfo.inputs.map((x) => {
      destPortsInfo[x.id] = x;
    });
    nodePortsInfo.outputs.map((x) => {
      sourcePortsInfo[x.id] = x;
    });
    Object.values(nodePortsInfo.subFlows).map((portsInfo) => {
      portsInfo.inputs.map((x) => {
        destPortsInfo[x.id] = x;
      });
      portsInfo.outputs.map((x) => {
        sourcePortsInfo[x.id] = x;
      });
    });
    Object.entries(nodePortsInfo.dependencies).map(([k, dep]) => {
      destPortsInfo[dep.id] = dep;
    });
  });
  return {
    sourcePortsInfo,
    destPortsInfo,
  };
};
