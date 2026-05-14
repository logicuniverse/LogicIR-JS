import {
  ComputeNode,
  createRunner,
  Data,
  FlowFunction,
  FlowRunnerPlugin,
  NodeFunction,
  NodeKind,
  Nothing,
  Ok,
  OptionKind,
  Result,
  ResultKind,
  ReturnResultKind,
  Some,
} from 'ff-runtime-core';

import { CompileContext } from '../types';
import {
  EditorFlowInfoCore,
  EditorFlowDataCore,
  EditorPortType,
  EditorReservedPortKey,
  NodeTemplate,
  RunModeKind,
  RunModeOverrideKind,
} from '../../common/types';

import { editorStateMachineFlowCore2RuntimeFlow } from './flow';
import { getInjectablePortKey, getPortId } from '../../common';

export const editorFlow2CompileTimeFlow = (flowInfo: EditorFlowInfoCore) => {
  const { flowData } = flowInfo;
  const compileTimeFlow: EditorFlowDataCore = {
    nodes: {},
    ports: { input: [], output: [] },
    connections: {},
    metaPorts: {},
    sequenceConnections: {},
    componentConnections: {},
  };
  const rootConstantNodeIds: string[] = [];
  for (const [nodeId, node] of Object.entries(flowData.nodes)) {
    if (node.runModeOverride?.kind === RunModeOverrideKind.CompileTime) {
      compileTimeFlow.nodes[nodeId] = { ...node, runModeOverride: null };
    }
  }
  for (const [connectionId, connection] of Object.entries(
    flowData.connections
  )) {
    if (
      connection.from.port.parent?.nodeId &&
      Object.keys(compileTimeFlow.nodes).includes(
        connection.from.port.parent.nodeId
      )
    ) {
      if (
        connection.to.port.parent?.nodeId &&
        Object.keys(compileTimeFlow.nodes).includes(
          connection.to.port.parent.nodeId
        )
      ) {
        compileTimeFlow.connections[connectionId] = connection;
      } else {
        rootConstantNodeIds.push(connection.from.port.parent.nodeId);
      }
    }
  }
  // const rootConstantNodeIds = Object.keys(compileTimeFlow.nodes).filter(
  //   (id) =>
  //     !Object.values(compileTimeFlow.connections).find(
  //       (x) => x.from.port.parent?.nodeId === id
  //     )
  // );
  for (const nodeId of rootConstantNodeIds) {
    const portKey = getPortId(true, {
      key: EditorReservedPortKey.Return,
      parent: { nodeId, subflowKey: null },
    });
    compileTimeFlow.ports.output.push({
      key: portKey,
      type: EditorPortType.Property,
    });
    compileTimeFlow.connections[`const-output-${nodeId}`] = {
      from: {
        port: {
          key: EditorReservedPortKey.Return,
          parent: { nodeId, subflowKey: null },
        },
        pinKey: null,
      },
      to: {
        port: {
          key: portKey,
          parent: null,
        },
        pinKey: null,
      },
    };
  }
  // todo: for better performance, we can remove unused node templates
  const result: EditorFlowInfoCore = {
    flowInterface: {
      kind: RunModeKind.StateMachine,
      ports: { input: [], output: [] },
    },
    flowData: compileTimeFlow,
    path: flowInfo.path,
    injectables: flowInfo.injectables,
    nodeTemplates: flowInfo.nodeTemplates,
  };
  return result;
};

export const getEditorFlowCoreConstants = async (
  context: CompileContext,
  editorFlow: EditorFlowInfoCore
) => {
  // console.log('Running compile-time flow to get constants...');
  const compileTimeFlow = editorFlow2CompileTimeFlow(editorFlow);
  // console.log('Compile-time flow:', compileTimeFlow);
  const runtimeFlow = await editorStateMachineFlowCore2RuntimeFlow(
    context,
    compileTimeFlow,
    true
  );

  const injectionConstants: Record<string, Data> = {};

  //update runtime flow for injectables
  editorFlow.injectables.map((injectable) => {
    Object.entries(injectable.items).map(([key, v]) => {
      const portKey = getInjectablePortKey(injectable.provider, key); //getInjectablePortKey(injectable.provider, key);
      const portId = getPortId(true, {
        parent: null,
        key: portKey,
      });
      injectionConstants[portId] = {
        parent: injectable.provider,
        key,
      };
    });
  });
  Object.assign(runtimeFlow.constants, injectionConstants);

  // console.log('Runtime compile-time flow:', runtimeFlow);

  const compilePlugin: FlowRunnerPlugin = {
    name: 'compile-time-plugin',
    getServiceMethod: (packageId, methodKey) =>
      context.getServiceMethodNodeFunction(packageId, methodKey),
    inject: (injectionKey, methodKey) =>
      context.inject(injectionKey, methodKey),
  };
  const runner = createRunner('default', { default: runtimeFlow }, [
    compilePlugin,
  ]);

  const result = runner({});
  console.log('Compile-time flow execution result:', result);
  if (result.kind === ReturnResultKind.Thenable) {
    throw new Error(
      'Compile-time flow execution resulted in a Thenable, which is not supported.'
    );
  }
  if (result.returnValue.kind === ResultKind.Error) {
    throw new Error(
      'Compile-time flow execution resulted in an Error: ' +
        result.returnValue.error.toString()
    );
  }
  if (result.returnValue.resultValue.kind === OptionKind.Some) {
    const outputData = result.returnValue.resultValue.optionValue;
    return {
      ...(outputData as Record<string, Data>),
      ...injectionConstants,
    };
    // return outputData as Record<string, Data>;
  }
  return {};

  // const rootConstantNodeIds: string[] = [];
  // Object.values(editorFlow.connections).map((con) => {
  //   if (
  //     con.from.port.parent?.nodeId && // connection starts from node
  //     Object.keys(compileTimeNodes).includes(con.from.port.parent.nodeId) && // node is a constant node
  //     !(
  //       con.to.port.parent &&
  //       Object.keys(compileTimeNodes).includes(con.to.port.parent.nodeId)
  //     ) // destination node is not a constant node
  //   ) {
  //     rootConstantNodeIds.push(con.from.port.parent.nodeId);
  //   }
  // });
  // const compileTimeNodesData: Record<string, Data> = {};
  // const runCompileTimeNode = async (nodeId: string) => {
  //   const compileTimeNode = compileTimeNodes[nodeId];

  //   let nodeFunction: NodeFunction | undefined = undefined;
  //   // if (compileTimeNode.target.kind === NodeKind.Native) {
  //   //   // run native
  //   //   nodeFunction = context.getCompileTimeNodeFunction(
  //   //     compileTimeNode.target.id
  //   //   );
  //   // } else
  //   if (compileTimeNode.target.kind === NodeKind.ServiceMethod) {
  //     nodeFunction = context.getServiceMethodNodeFunction(
  //       compileTimeNode.target.serviceId,
  //       compileTimeNode.target.methodKey
  //     );
  //     // } else if (compileTimeNode.target.kind === NodeKind.Injection) {
  //     //   // run service
  //     //   nodeFunction = context.inject(
  //     //     compileTimeNode.target.injectionKey,
  //     //     compileTimeNode.target.methodKey
  //     //   );
  //     // } else if (runtimeNode.kind === NodeKind.Flow) {
  //   } else {
  //     throw new Error(
  //       'Unexpected runtime node kind: ' + compileTimeNode.target.kind
  //     );
  //   }
  //   if (!nodeFunction) {
  //     throw new Error(`Can not run node ${nodeId}`);
  //   }
  //   // read inputs
  //   // todo: destructuring
  //   const inputs: Record<string, Result> = {};
  //   Object.entries(compileTimeNode.staticInputs ?? {}).map(([k, v]) => {
  //     inputs[k] = Ok(Some(v));
  //   });

  //   for (const inputPort of compileTimeNode.ports.input) {
  //     const sourceNodeId = Object.values(editorFlow.connections).find(
  //       (x) =>
  //         x.to.port.key === inputPort.key &&
  //         x.to.port.parent?.nodeId === nodeId &&
  //         x.from.port.parent
  //     )?.from?.port.parent?.nodeId;
  //     if (sourceNodeId) {
  //       if (!Object.keys(compileTimeNodesData).includes(sourceNodeId)) {
  //         compileTimeNodesData[sourceNodeId] =
  //           await runCompileTimeNode(sourceNodeId);
  //       }
  //       inputs[inputPort.key] =
  //         compileTimeNodesData[sourceNodeId] === undefined
  //           ? Ok(Nothing())
  //           : Ok(Some(compileTimeNodesData[sourceNodeId]));
  //     }
  //   }
  //   const subFlowFunctions: Record<string, FlowFunction> = {};
  //   // todo
  //   if (Object.keys(compileTimeNode.subflows ?? {}).length > 0) {
  //     throw new Error('Not implemented');
  //   }

  //   const result = nodeFunction(
  //     inputs,
  //     () => {},
  //     () => () => {},
  //     (injectionKey: string, methodKey: string) => {
  //       throw new Error('Not implemented');
  //       // return context.inject(injectionKey, methodKey);
  //     },
  //     {
  //       node: compileTimeNode,
  //       nodeId,
  //       nodeRunId: '',
  //     }
  //   );
  //   if (result.kind === ReturnResultKind.Thenable) {
  //     return new Promise((resolve, reject) => {
  //       result.then((awaitedResult) => {
  //         if (awaitedResult.kind === ResultKind.Ok) {
  //           if (awaitedResult.resultValue.kind === OptionKind.Some) {
  //             resolve(awaitedResult.resultValue.optionValue);
  //           } else {
  //             resolve(undefined);
  //           }
  //         } else {
  //           reject(awaitedResult.error);
  //         }
  //       });
  //     });
  //   } else {
  //     if (result.returnValue.kind === ResultKind.Ok) {
  //       if (result.returnValue.resultValue.kind === OptionKind.Some) {
  //         return result.returnValue.resultValue.optionValue;
  //       }
  //     } else {
  //       throw new Error(result.returnValue.error.toString());
  //     }
  //   }
  // };
  // for (const nodeId of rootConstantNodeIds) {
  //   const result = await runCompileTimeNode(nodeId);
  //   if (result !== undefined) {
  //     const portId = getPortId(true, {
  //       key: EditorReservedPortKey.Return,
  //       parent: { nodeId, subflowKey: null },
  //     });
  //     constants[portId] = result;
  //   }
  // }
  // return constants;
};
