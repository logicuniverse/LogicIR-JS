import { Connection } from 'ff-runtime-core';
import { EditorConnectionCore } from '../../common/types';
import { getPortId } from '../../common/utils/id';

export const editorConnections2RuntimeConnections = (
  editorConnections: Record<string, EditorConnectionCore>
) => {
  const connections: Record<string, Connection> = {};
  for (const [id, connection] of Object.entries(editorConnections)) {
    connections[id] = {
      from: {
        portId: getPortId(true, connection.from.port),
        subPath:
          connection.from.pinKey === null
            ? undefined
            : [connection.from.pinKey],
      },
      to: {
        portId: getPortId(false, connection.to.port),
        subPath:
          connection.to.pinKey === null ? undefined : [connection.to.pinKey],
      },
    };
  }
  return connections;
};
