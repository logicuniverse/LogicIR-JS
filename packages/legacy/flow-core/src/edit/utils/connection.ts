import { EditorConnectionCore, EditorPortType } from '../../common';
import { getPortId } from '../../common/utils/id';
import { AllPortsInfo } from '../../common/utils/port';

const isPinKeyValid = (
  key: string | number | null,
  destructuringData: string[] | number | null
): boolean => {
  if (!key) {
    return true;
  }
  if (!destructuringData) {
    return false;
  }
  if (typeof key === 'number') {
    if (typeof destructuringData === 'number') {
      return key >= 0 && key < destructuringData;
    }
  }
  if (typeof key === 'string') {
    if (Array.isArray(destructuringData)) {
      return destructuringData.includes(key);
    }
  }
  return false;
};

const isPortTypeValid = (from: EditorPortType, to: EditorPortType) => {
  if (to === EditorPortType.Data) {
    return from === EditorPortType.Data || from === EditorPortType.Property;
  } else if (to === EditorPortType.Stream) {
    return from === EditorPortType.Property || from === EditorPortType.Stream;
  }
  // to===EditorPortType.Property
  return true;
};

export const isConnectionValid = (
  { sourcePortsInfo, destPortsInfo }: AllPortsInfo,
  connection: EditorConnectionCore
) => {
  const fromId = getPortId(true, connection.from.port);
  const toId = getPortId(false, connection.to.port);
  const sourceInfo = sourcePortsInfo[fromId];
  const destInfo = destPortsInfo[toId];
  if (
    !sourceInfo?.type ||
    !destInfo?.type ||
    !isPortTypeValid(sourceInfo.type, destInfo.type)
  ) {
    return false;
  }
  if (!sourceInfo || !destInfo) {
    return false;
  }

  if (!isPinKeyValid(connection.from.pinKey, sourceInfo.destructuringData)) {
    return false;
  }

  if (!isPinKeyValid(connection.to.pinKey, destInfo.destructuringData)) {
    return false;
  }
  return true;
};
