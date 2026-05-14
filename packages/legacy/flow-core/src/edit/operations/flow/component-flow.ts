import { getComponentConnectionId } from '../../../common';
import { EditReturn } from '../../types';

export type OpUpdateCompositionParams = {
  from: { nodeId: string | null; key: string };
  to: {
    nodeId: string | null;
    key: string;
    pinKey: number | string | null;
  } | null;
};

export const opUpdateComposition = (
  params: OpUpdateCompositionParams
): EditReturn => {
  return {
    updater: (targetFlow) => {
      // remove from old composition
      if (!params.to) {
        return;
      }
      for (const connectionId of Object.keys(targetFlow.componentConnections)) {
        const connection = targetFlow.componentConnections[connectionId];
        if (
          (connection.to.nodeId === params.to.nodeId &&
            connection.to.key === params.to.key &&
            connection.to.pinKey === params.to.pinKey) ||
          (connection.from.nodeId === params.from.nodeId &&
            connection.from.key === params.from.key)
        ) {
          // found the connection
          delete targetFlow.componentConnections[connectionId];
        }
      }
      const connectionId = getComponentConnectionId(
        params.from.nodeId,
        params.from.key,
        params.to.pinKey
      );
      targetFlow.componentConnections[connectionId] = {
        from: params.from,
        to: params.to,
      };
      // targetFlow.compositions.map((c) => {
      //   if (
      //     c.children.find(
      //       (x) => x.nodeId === params.from.nodeId && x.key === params.from.key
      //     )
      //   ) {
      //     c.children = c.children.filter(
      //       (x) =>
      //         !(x.nodeId === params.from.nodeId && x.key === params.from.key)
      //     );
      //   }
      // });
      // console.log('opUpdateComposition', params);
      // const to = params.to;

      // if (to) {
      //   const composition = targetFlow.compositions.find(
      //     (c) => c.parent.nodeId === to.nodeId && c.parent.key === to.key
      //   );
      //   if (!composition) {
      //     console.warn('Composition target not found');
      //     return;
      //   }
      //   if ('child' in composition) {
      //     // todo
      //   } else if (Array.isArray(composition.children)) {
      //     const newChildren = composition
      //       ? [
      //           ...composition.children.slice(0, to.pinKey as number),
      //           params.from,
      //           ...composition.children.slice(to.pinKey as number),
      //         ].filter((x) => !!x)
      //       : [params.from];

      //     targetFlow.compositions = targetFlow.compositions.filter(
      //       (c) => !(c.parent.nodeId === to.nodeId && c.parent.key === to.key)
      //     );
      //     targetFlow.compositions.push({
      //       parent: { nodeId: to.nodeId, key: to.key },
      //       children: newChildren,
      //     });
      //   } else {
      //     // object
      //   }
      // }
    },
  };
};
