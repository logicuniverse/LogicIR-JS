import { profiles } from './architecture';
import type {
  CatalogEntry,
  ExecutionProfileDefinition,
  ResolvedStack,
  SoftwareProfileCatalogEntry,
  StackDefinition,
} from './types';
import { identityKey } from './types';

const findProfile = (ref: {
  namespace: string;
  key: string;
  version?: string;
}): SoftwareProfileCatalogEntry => {
  const profile = profiles.find((entry) => identityKey(entry) === identityKey(ref));

  if (!profile) {
    throw new Error(`Missing profile ${identityKey(ref)}`);
  }

  return profile;
};

export const resolveStack = (
  stack: CatalogEntry<StackDefinition>,
): ResolvedStack => {
  const ir = findProfile(stack.definition.profiles.irPipeline);
  const projection = findProfile(stack.definition.profiles.projection);

  if (!stack.definition.profiles.execution) {
    throw new Error('S2 requires an execution profile.');
  }

  const execution = findProfile(stack.definition.profiles.execution);
  const profileDefinitions = [ir.definition, projection.definition, execution.definition];
  const executionDefinition = execution.definition as ExecutionProfileDefinition;

  return {
    stackKey: identityKey(stack),
    profiles: profileDefinitions,
    requiredFeatures: profileDefinitions.flatMap((profile) =>
      profile.featureContracts.filter(
        (contract) => contract.requirement === 'required',
      ),
    ),
    executionBindings: executionDefinition.bindings.filter(
      (binding) => binding.requirement === 'required',
    ),
  };
};
