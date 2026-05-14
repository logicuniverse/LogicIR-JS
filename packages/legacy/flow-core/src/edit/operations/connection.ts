import { EditorConnection, EditorConnectionPort } from '../../common';
import { generateConnectionId } from '../../common/utils/id';
import { EditHandler, EditReturn } from '../types';
import { updateObjectProperty } from '../../utils/object';

type OpAddConnectionParams = {
  from: { port: EditorConnectionPort; pinKey: string | number | null };
  to: { port: EditorConnectionPort; pinKey: string | number | null };
};

export const opAddConnection = (params: OpAddConnectionParams): EditReturn => {
  const connectionId = generateConnectionId();
  return {
    updater: (targetFlow) => {
      // Object.keys(targetFlow.connections).map((key) => {
      //   const conn = targetFlow.connections[key];
      //   if (
      //     conn.to.port.parent?.nodeId === params.to.port.parent?.nodeId &&
      //     conn.to.port.key === params.to.port.key &&
      //     conn.to.pinKey === params.to.pinKey
      //   ) {
      //     // Remove existing connection to the same to port
      //     delete targetFlow.connections[key];
      //   }
      // });

      targetFlow.connections[connectionId] = {
        from: params.from,
        to: params.to,
        tags: [],
      };
    },
  };
};

type ConnectionField = keyof EditorConnection;
type OpUpdateConnectionFieldParams<
  T extends ConnectionField = ConnectionField,
> = {
  connectionId: string;
  key: T;
  value: EditorConnection[T];
};

export const opUpdateConnectionField: EditHandler = (
  params: OpUpdateConnectionFieldParams
) => {
  return {
    updater: (targetFlow) => {
      const connection = targetFlow.connections[params.connectionId];
      updateObjectProperty(connection, params.key, params.value);
    },
  };
};
