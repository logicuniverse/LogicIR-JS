import { EditorConnectionPort, EditorPortParent } from '../types';

export const simpleNanoId = (length: number) => {
  let text = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
export const generateKey = (length = 12) => simpleNanoId(length);

export const generateConnectionId = () => `con_${generateKey()}`;
export const generateGroupId = () => `group_${generateKey()}`;
export const generateNodeId = () => `node_${generateKey()}`;

export const getSubflowKey = (injectionKey: string, flowKey: string) =>
  `${injectionKey}_${flowKey}`;
// key or key.index

export const generateFlowId = () => `flow_${generateKey()}`;

// export const generateSubFlowId = () => `subFlow_${generateKey()}`;

export const getPortId = (
  isSource: boolean,
  port: EditorConnectionPort
): string => {
  return `port_${isSource ? 'src' : 'dest'}_${port.parent ? port.parent.nodeId + '_' : ''}${
    port.parent?.subflowKey ? port.parent.subflowKey + '_' : ''
  }${port.key}`;
};

export const getComponentConnectionId = (
  nodeId: string | null,
  key: string,
  pinKey: number | string | null
) => {
  return `cc_${nodeId ? nodeId + '_' : ''}${key}${pinKey !== null ? '_' + pinKey : ''}`;
};

// export const getSlotId = (isIncoming: boolean, slotKey: string) => {
//   return `slot_${isIncoming ? 'incoming' : 'outgoing'}_${slotKey}`;
// };

// export const getSubflowId = (nodeId: string, subflowKey: string) =>
//   `subflow_${nodeId}_${subflowKey}`;
export const generateSubflowContainerId = () => `sbc_${generateKey()}`;

export const getSubsystemFullId = (prefix: string, subsystemEntry: string) =>
  `${prefix}.${subsystemEntry}`;

export const generateInjectionKey = () => `dep_${generateKey()}`;

export const getFlowPathKey = (
  flowPath: {
    nodeId: string;
    subflowKey: string;
  }[]
): string => {
  return (
    '/' +
    flowPath
      .map(({ nodeId, subflowKey }) => `${nodeId}_${subflowKey}`)
      .join('/')
  );
};

export const getInjectableSourceKey = (
  source: { nodeId: string; subflowKey: string } | null
) => {
  return source ? `inj_${source.nodeId}_${source.subflowKey}` : 'inj_/';
};

export const getInjectablePortKey = (
  provider: { nodeId: string; subflowKey: string } | null,
  itemKey: string
) => {
  return `inj_${provider ? provider.nodeId + '_' + provider.subflowKey + '_' : ''}${itemKey}`;
};

// export const getInjectPortId = (nodeId: string, injectKey: string) =>
//   `inject_${nodeId}_${injectKey}`;
