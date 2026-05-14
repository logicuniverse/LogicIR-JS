import { EditorPortType, EditorReservedPortKey } from '../../common/types';
import {
  ComponentPorts,
  ComputePorts,
  PortType,
  SequencePorts,
  StatePorts,
  TriggerPorts,
} from 'ff-runtime-core';

import { EditorNodePortsInfo, EditorPortsInfo } from '../../common/utils/types';

export const editorPortsInfo2ComputePorts = (
  portsInfo: EditorPortsInfo
): ComputePorts => {
  const returnPortInfo = portsInfo.outputs.find(
    (x) => x.key === EditorReservedPortKey.Return
  )!;
  const result: ComputePorts = {
    inputs: portsInfo.inputs.map((x) => ({
      key: x.key,
      type: PortType.Data,
      id: x.id,
      destructuringData: x.destructuringData,
    })),
    outputs: [],
    return: {
      id: returnPortInfo.id,
      destructuringData: returnPortInfo.destructuringData,
    },
  };
  return result;
};

export const editorPortsInfo2TriggerPorts = (
  portsInfo: EditorPortsInfo | EditorNodePortsInfo
): TriggerPorts => {
  const returnPortInfo = portsInfo.outputs.find(
    (x) => x.key === EditorReservedPortKey.Return
  )!;
  const result: TriggerPorts = {
    inputs: portsInfo.inputs.map((x) => ({
      key: x.key,
      type: x.type === EditorPortType.Data ? PortType.Data : PortType.Stream,
      id: x.id,
      destructuringData: x.destructuringData,
    })),
    outputs: portsInfo.outputs
      .filter((x) => x.key !== EditorReservedPortKey.Return)
      .map((x) => ({
        key: x.key,
        id: x.id,
        type: PortType.Stream,
        destructuringData: x.destructuringData,
      })),
    return: {
      id: returnPortInfo.id,
      destructuringData: returnPortInfo.destructuringData,
    },
  };
  return result;
};

export const editorPortsInfo2SequencePorts = (
  portsInfo: EditorPortsInfo
): SequencePorts => {
  const returnPortInfo = portsInfo.outputs.find(
    (x) => x.key === EditorReservedPortKey.Return
  );
  const result: SequencePorts = {
    inputs: portsInfo.inputs.map((x) => ({
      key: x.key,
      type: x.type === EditorPortType.Data ? PortType.Data : PortType.Stream,
      id: x.id,
      destructuringData: x.destructuringData,
    })),
    outputs: portsInfo.outputs
      .filter((x) => x.key !== EditorReservedPortKey.Return)
      .map((x) => ({
        key: x.key,
        id: x.id,
        type: PortType.Stream,
        destructuringData: x.destructuringData,
      })),
  };
  if (returnPortInfo) {
    result.return = {
      id: returnPortInfo.id,
      destructuringData: returnPortInfo.destructuringData,
    };
  }
  return result;
};

export const editorPortsInfo2StateMachinePorts = (
  portsInfo: EditorPortsInfo
): StatePorts => {
  const result: StatePorts = {
    inputs: portsInfo.inputs.map((x) => ({
      key: x.key,
      type: x.type === EditorPortType.Data ? PortType.Data : PortType.Stream,
      id: x.id,
      destructuringData: x.destructuringData,
    })),
    outputs: portsInfo.outputs.map((x) => ({
      key: x.key,
      id: x.id,
      type:
        x.type === EditorPortType.Property
          ? PortType.Property
          : PortType.Stream,
      destructuringData: x.destructuringData,
    })),
  };
  return result;
};

export const editorPortsInfo2ComponentPorts = (
  portsInfo: EditorPortsInfo
): ComponentPorts => {
  const result: ComponentPorts = {
    inputs: portsInfo.inputs
      .filter((x) => x.type !== EditorPortType.Component)
      .map((x) => ({
        key: x.key,
        type:
          x.type === EditorPortType.Data
            ? PortType.Data
            : x.type === EditorPortType.Stream
              ? PortType.Stream
              : PortType.Property,
        id: x.id,
        destructuringData: x.destructuringData,
      })),
    outputs: portsInfo.outputs
      .filter((x) => x.type !== EditorPortType.Component)
      .map((x) => ({
        key: x.key,
        id: x.id,
        type: PortType.Stream,
        destructuringData: x.destructuringData,
      })),
  };
  return result;
};
