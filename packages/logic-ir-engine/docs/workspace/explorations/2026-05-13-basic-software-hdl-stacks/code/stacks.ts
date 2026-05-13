import type { Profile, StackDefinition } from './architecture-types';
import {
  basicHdlIRProfile,
  basicHdlStack,
  basicVerilogProjectionProfile,
  basicVerilogSimulationExecutionProfile,
} from './basic-hdl';
import {
  basicSoftwareExecutionProfile,
  basicSoftwareIRProfile,
  basicSoftwareProjectionProfile,
  basicSoftwareStack,
} from './basic-software';
import { featureCatalog } from './features';

export {
  basicHdlIRProfile,
  basicHdlStack,
  basicSoftwareExecutionProfile,
  basicSoftwareIRProfile,
  basicSoftwareProjectionProfile,
  basicSoftwareStack,
  basicVerilogProjectionProfile,
  basicVerilogSimulationExecutionProfile,
  featureCatalog,
};

export const irPipelineProfiles = [
  basicSoftwareIRProfile,
  basicHdlIRProfile,
] as const;

export const projectionProfiles = [
  basicSoftwareProjectionProfile,
  basicVerilogProjectionProfile,
] as const;

export const executionProfiles = [
  basicSoftwareExecutionProfile,
  basicVerilogSimulationExecutionProfile,
] as const;

export const profiles = [
  ...irPipelineProfiles,
  ...projectionProfiles,
  ...executionProfiles,
] satisfies readonly Profile[];

export const stacks = [
  basicSoftwareStack,
  basicHdlStack,
] satisfies readonly StackDefinition[];
