import {
  ComponentNode,
  ComputeNode,
  NodeCommonData,
  NodeKind,
  NodeTargetData,
  SequenceNode,
  StateMachineNode,
  TriggerNode,
} from 'ff-runtime-core';
import { CompileContext } from '../types';
import {
  EditorFlowInfoCore,
  EditorNodeTargetKind,
  EditorNodeTargetData,
  RunModeKind,
  RunModeOverrideKind,
} from '../../common/types';
import {
  editorPortsInfo2ComponentPorts,
  editorPortsInfo2ComputePorts,
  editorPortsInfo2SequencePorts,
  editorPortsInfo2StateMachinePorts,
  editorPortsInfo2TriggerPorts,
} from './port';
import { editorFlow2RuntimeFlow } from './flow';
import { getEditorFlowInfoMap } from '../../common/utils/flow';
import { getNodePortsInfo } from '../../common/utils/node';
import {
  getFlowPathKey,
  getSubflowKey,
  getSubsystemFullId,
} from '../../common';

type AllNodes = {
  computeNodes: Record<string, ComputeNode>;
  sequenceNodes: Record<string, SequenceNode>;
  stateMachineNodes: Record<string, StateMachineNode>;
  componentNodes: Record<string, ComponentNode>;
  triggerNodes: Record<string, TriggerNode>;
  compileTimeNodes: Record<string, ComputeNode>;
};

const editorNodeTargetData2RuntimeNodeTargetData = (
  targetData: EditorNodeTargetData
): NodeTargetData => {
  if (targetData.kind === EditorNodeTargetKind.Reserved) {
    throw new Error(
      'Reserved node target data cannot be converted to runtime node target data.'
    );
  }
  if (targetData.kind === EditorNodeTargetKind.Flow) {
    return {
      kind: NodeKind.Flow,
      flowId: targetData.subsystemEntry
        ? getSubsystemFullId(targetData.flowId, targetData.subsystemEntry)
        : targetData.flowId,
    };
  } else if (targetData.kind === EditorNodeTargetKind.Predefined) {
    return {
      kind: NodeKind.Native,
      packageId: targetData.packageId,
      methodKey: targetData.key,
    };
  } else {
    return {
      kind: NodeKind.Injection,
      injectionKey: targetData.injectionKey,
      methodKey: targetData.key,
      source: targetData.source,
      defaultSubflowKey: targetData.defaultSubflowKey,
    };
  }
};

export const editorFlow2RuntimeNodes = async (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore
) => {
  const { flowInterface, flowData, nodeTemplates } = flowInfo;
  const nodes: AllNodes = {
    computeNodes: {},
    sequenceNodes: {},
    stateMachineNodes: {},
    componentNodes: {},
    triggerNodes: {},
    compileTimeNodes: {},
  };
  for (const [nodeId, editorNode] of Object.entries(flowData.nodes)) {
    if (editorNode.target.kind === EditorNodeTargetKind.Reserved) {
      continue;
    }

    if (editorNode.target.kind === EditorNodeTargetKind.Flow) {
      if (editorNode.target.subsystemEntry) {
        throw new Error('Not implemented: flow node with subsystemEntry');
      }
      if (!context.cachedRuntimeFlows[editorNode.target.flowId]) {
        const newRootFlow = await context.getFlow(editorNode.target.flowId);
        const newContext = {
          ...context,
          currentRootFlow: newRootFlow,
        };
        const newFlowInfo = getEditorFlowInfoMap(newContext, newRootFlow).get(
          getFlowPathKey([])
        )!;
        const runtimeFlow = await editorFlow2RuntimeFlow(
          newContext,
          newFlowInfo
        );
        context.cachedRuntimeFlows[editorNode.target.flowId] = runtimeFlow;
      }
    }

    const nodeInterface = nodeTemplates[nodeId];
    if (!nodeInterface) {
      throw new Error(`Node template not found for node ${nodeId}`);
    }
    const nodePortsInfo = getNodePortsInfo(editorNode, nodeInterface, nodeId);
    const nodeCommon: NodeCommonData = {
      staticInputs: editorNode.staticInputs,
      // provides: editorNode.provides,
      customData: editorNode.customData,
      subflows: {},
      dependencies: {},
    };
    Object.entries(nodePortsInfo.dependencies).forEach(([k, dep]) => {
      nodeCommon.dependencies[k] = {
        portId: dep.id,
        subflowKeys: {},
        // default: dep.default,
      };
    });

    const nodeTarget = editorNodeTargetData2RuntimeNodeTargetData(
      editorNode.target
    );

    const flowInfoMap = getEditorFlowInfoMap(context, context.currentRootFlow);

    // subflows
    for (const [injectionKey, injection] of Object.entries(
      nodeInterface.dependencies ?? {}
    )) {
      if (injection.isComposite) {
        for (const [flowKey, flowInterface] of Object.entries(
          injection.items
        )) {
          const subflowKey = getSubflowKey(injectionKey, flowKey);
          const subflowContent =
            (editorNode.subflows ?? {})[subflowKey] ?? null;
          if (subflowContent) {
            const subflowInfo = flowInfoMap.get(
              getFlowPathKey([
                ...(flowInfo.path ?? []),
                {
                  nodeId: nodeId,
                  subflowKey: subflowKey,
                },
              ])
            );
            if (!subflowInfo) {
              throw new Error(
                `Subflow info not found for node ${nodeId} and subflow key ${subflowKey}`
              );
            }
            const runtimeFlow = await editorFlow2RuntimeFlow(
              context,
              subflowInfo
            );
            nodeCommon.subflows![subflowKey] = {
              flow: runtimeFlow,
              outerPorts: {
                input: nodePortsInfo.subFlows[subflowKey].inputs.map((p) => ({
                  key: p.key,
                  id: p.id,
                  destructuringData: null,
                })),
                output: nodePortsInfo.subFlows[subflowKey].outputs.map((p) => ({
                  key: p.key,
                  id: p.id,
                  destructuringData: null,
                })),
              },
              // target: {
              //   serviceKey: injectionKey,
              //   methodKey: flowKey,
              // },
            };
            nodeCommon.dependencies[injectionKey].subflowKeys[flowKey] =
              subflowKey;
          }
        }
      }
    }
    if (
      nodeTarget.kind === NodeKind.Injection &&
      nodeTarget.defaultSubflowKey
    ) {
      const subflowContent =
        (editorNode.subflows ?? {})[nodeTarget.defaultSubflowKey] ?? null;
      if (subflowContent) {
        const subflowInfo = flowInfoMap.get(
          getFlowPathKey([
            ...(flowInfo.path ?? []),
            {
              nodeId: nodeId,
              subflowKey: nodeTarget.defaultSubflowKey,
            },
          ])
        );
        if (!subflowInfo) {
          throw new Error(
            `Subflow info not found for node ${nodeId} and subflow key ${nodeTarget.defaultSubflowKey}`
          );
        }

        // const subFlow = getUnifiedEditorFlow({
        //   editorFlowData: subflowContent.flow,
        //   flowInterface: nodeInterface,
        //   injectables: getEditorFlowAllInjectables(flowInfo),
        //   path: [
        //     ...(flowInfo.path ?? []),
        //     {
        //       nodeId: nodeId,
        //       subflowKey: nodeTarget.defaultSubflowKey,
        //     },
        //   ],
        // });
        const runtimeFlow = await editorFlow2RuntimeFlow(context, subflowInfo);
        nodeCommon.subflows![nodeTarget.defaultSubflowKey] = {
          flow: runtimeFlow,
          outerPorts: {
            input: nodePortsInfo.subFlows[
              nodeTarget.defaultSubflowKey
            ].inputs.map((p) => ({
              key: p.key,
              id: p.id,
              destructuringData: null,
            })),
            output: nodePortsInfo.subFlows[
              nodeTarget.defaultSubflowKey
            ].outputs.map((p) => ({
              key: p.key,
              id: p.id,
              destructuringData: null,
            })),
          },
          // target: null,
        };
      }
    }

    // dependencies as inputs
    // nodePortsInfo.inputs.push(...Object.values(nodePortsInfo.dependencies));

    if (editorNode.runModeOverride?.kind === RunModeOverrideKind.Trigger) {
      const ports = editorPortsInfo2TriggerPorts(nodePortsInfo);
      const triggerNode: TriggerNode = {
        ...nodeCommon,
        target: nodeTarget,
        ports,
      };
      nodes.triggerNodes[nodeId] = triggerNode;
    } else if (nodeInterface.kind === RunModeKind.Compute) {
      const ports = editorPortsInfo2ComputePorts(nodePortsInfo);
      const computeNode: ComputeNode = {
        ...nodeCommon,
        target: nodeTarget,
        ports,
      };
      if (
        editorNode.runModeOverride?.kind === RunModeOverrideKind.CompileTime
      ) {
        nodes.compileTimeNodes[nodeId] = computeNode;
      } else {
        nodes.computeNodes[nodeId] = computeNode;
      }
    } else if (nodeInterface.kind === RunModeKind.Sequence) {
      const ports = editorPortsInfo2SequencePorts(nodePortsInfo);
      const sequenceNode = {
        ...nodeCommon,
        target: nodeTarget,
        ports,
      };
      nodes.sequenceNodes[nodeId] = sequenceNode;
    } else if (nodeInterface.kind === RunModeKind.StateMachine) {
      const ports = editorPortsInfo2StateMachinePorts(nodePortsInfo);
      nodes.stateMachineNodes[nodeId] = {
        ...nodeCommon,
        target: nodeTarget,
        ports,
      };
    } else {
      const ports = editorPortsInfo2ComponentPorts(nodePortsInfo);
      nodes.componentNodes[nodeId] = {
        ...nodeCommon,
        target: nodeTarget,
        ports,
      };
    }
  }
  return nodes;
};
