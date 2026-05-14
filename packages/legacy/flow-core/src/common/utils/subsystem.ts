import {
  EditorPortType,
  EditorReservedPortKey,
  EditorRootFlowCore,
  RunModeKind,
} from '../types';

export const getEditorComponentRootFlowSubsystems = (
  editorFlow: EditorRootFlowCore
): Record<string, EditorRootFlowCore> => {
  throw new Error('Not implemented');
  // const subsystems: Record<string, EditorRootFlowCore> = {};
  // // const exports = getComponentFlowExports(editorFlow);
  // const exports = {};
  // for (const entry of Object.keys(exports)) {
  //   const subsystem: EditorRootFlowCore = {
  //     kind: RunModeKind.Component,
  //     ports: {
  //       input: [],
  //       output: [],
  //     },
  //     nodes: {},
  //     connections: {},
  //     // destructuringMap: {
  //     //   input: {},
  //     //   output: {},
  //     // },
  //     dependencies: {},
  //     metaPorts: {},
  //     componentRelations: [],
  //     sequenceConnections: {},
  //     goBackConnections: {},
  //     // stateMachineNodeOrders: null,
  //   };
  //   // componentChildren.map((x) => {
  //   //   if (typeof x === 'string') {
  //   //     subsystem.exports[entry].children.push(x);
  //   //   } else {
  //   //     subsystem.exports[entry].children.push(x.nodeId);
  //   //   }
  //   // });
  //   // traverseComponents(componentChildren, (child) => {
  //   //   if (typeof child === 'string') {
  //   //     subsystem.ports.input.push({
  //   //       key: child,
  //   //       type: EditorPortType.Component,
  //   //     });
  //   //   } else {
  //   //     subsystem.nodes[child.nodeId] = editorFlow.nodes[child.nodeId];
  //   //     const result: Record<string, string[]> = {};
  //   //     Object.entries(child.children ?? {}).map(([k, v]) => {
  //   //       result[k] = v.map((x) => {
  //   //         if (typeof x === 'string') {
  //   //           return x;
  //   //         } else {
  //   //           return x.nodeId;
  //   //         }
  //   //       });
  //   //     });
  //   //     subsystem.componentChildren[child.nodeId] = result;
  //   //   }
  //   // });

  //   //todo: handle provides and slot injections

  //   // Object.values(subsystem.nodes).map((node) => {

  //   // if (node.target.kind === EditorNodeTargetKind.Slot) {
  //   //   const slotKey = node.target.slotKey;
  //   //   if (!subsystem.injectedFlows[slotKey]) {
  //   //     subsystem.injectedFlows[slotKey] = editorFlow.injectedFlows[slotKey];
  //   //   }
  //   // }
  //   // if (node.provides) {
  //   //   Object.values(node.provides).map((injection) => {
  //   //     if (injection.items) {
  //   //       // todo
  //   //     } else {
  //   //       if (!injection.provider) {
  //   //         subsystem.injectedServices[injection.providerServiceKey] =
  //   //           editorFlow.injectedServices[injection.providerServiceKey];
  //   //       }
  //   //     }
  //   //   });
  //   // }
  //   // });
  //   subsystems[entry] = subsystem;
  // }
  // // for each connections
  // for (const [connectionId, connection] of Object.entries(
  //   editorFlow.connections
  // )) {
  //   //find from subsystem string|null, null => flow ports, undefined=> unused node
  //   let entryFrom: string | null | undefined = null;
  //   let entryTo: string | null | undefined = null;
  //   if (connection.from.port.parent) {
  //     entryFrom = Object.keys(subsystems).find(
  //       (k) => subsystems[k].nodes[connection.from.port.parent!.nodeId]
  //     ); // maybe from unused nodes
  //   }
  //   if (connection.to.port.parent) {
  //     entryTo = Object.keys(subsystems).find(
  //       (k) => subsystems[k].nodes[connection.to.port.parent!.nodeId]
  //     ); // maybe from unused nodes
  //   }
  //   if (entryFrom !== undefined && entryTo !== undefined) {
  //     if (entryFrom && !entryTo) {
  //       subsystems[entryFrom].connections[connectionId] = connection;
  //       if (
  //         !subsystems[entryFrom].ports.output.find(
  //           (x) => x.key === connection.to.port.key
  //         )
  //       ) {
  //         subsystems[entryFrom].ports.output.push(
  //           editorFlow.ports.output.find(
  //             (x) => x.key === connection.to.port.key
  //           )!
  //         );
  //         // const destructuringData =
  //         //   editorFlow.destructuringMap.output[connection.to.port.key];
  //         // if (destructuringData) {
  //         //   subsystems[entryFrom].destructuringMap.output[
  //         //     connection.to.port.key
  //         //   ] = destructuringData;
  //         // }
  //       }
  //     } else if (!entryFrom && entryTo) {
  //       subsystems[entryTo].connections[connectionId] = connection;
  //       if (
  //         !subsystems[entryTo].ports.input.find(
  //           (x) => x.key === connection.from.port.key
  //         )
  //       ) {
  //         subsystems[entryTo].ports.input.push(
  //           editorFlow.ports.input.find(
  //             (x) => x.key === connection.from.port.key
  //           )!
  //         );
  //         // const destructuringData =
  //         //   editorFlow.destructuringMap.input[connection.from.port.key];
  //         // if (destructuringData) {
  //         //   subsystems[entryTo].destructuringMap.input[connection.to.port.key] =
  //         //     destructuringData;
  //         // }
  //       }
  //     } else if (entryFrom && entryTo) {
  //       if (entryFrom === entryTo) {
  //         subsystems[entryFrom].connections[connectionId] = connection;
  //       } else {
  //         // fromSubsystem!==toSubsystem
  //         const subsystemFrom = subsystems[entryFrom];
  //         const subsystemTo = subsystems[entryTo];
  //         // fromSubsystem
  //         if (!subsystemFrom.ports.output.find((x) => x.key === entryTo)) {
  //           subsystemFrom.ports.output.push({
  //             key: entryTo,
  //             type: EditorPortType.Stream,
  //             displayName: `To ${entryTo}`,
  //           });
  //           // subsystemFrom.destructuringMap.output[
  //           //   EditorReservedPortKey.SubsystemTx
  //           // ] = [];
  //         }
  //         // const txDestructuringMap =
  //         //   subsystemFrom.destructuringMap.output[
  //         //     EditorReservedPortKey.SubsystemTx
  //         //   ];
  //         // if (!txDestructuringMap.find((x) => x === entryTo)) {
  //         //   txDestructuringMap.push(entryTo);
  //         // }
  //         subsystemFrom.connections[connectionId] = {
  //           from: connection.from,
  //           to: {
  //             port: {
  //               key: entryTo,
  //               parent: null,
  //             },
  //             pinKey: connectionId,
  //           },
  //         };

  //         // toSubsystem
  //         if (
  //           !subsystemTo.ports.input.find(
  //             (x) => x.key === EditorReservedPortKey.SubsystemRx
  //           )
  //         ) {
  //           subsystemFrom.ports.input.push({
  //             key: EditorReservedPortKey.SubsystemRx,
  //             type: EditorPortType.Stream,
  //           });
  //         }
  //         subsystemTo.connections[connectionId] = {
  //           from: {
  //             port: {
  //               key: EditorReservedPortKey.SubsystemRx,
  //               parent: null,
  //             },
  //             pinKey: connectionId,
  //           },
  //           to: connection.to,
  //         };
  //       }
  //     }
  //   }
  // }
  // return subsystems;
};
