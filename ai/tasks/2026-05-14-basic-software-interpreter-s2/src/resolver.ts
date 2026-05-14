import { profiles } from './architecture';
import type {
  CatalogEntry,
  ProfileDefinition,
  ResolvedStack,
  StackDefinition,
} from './types';
import { identityKey } from './types';

const findProfile = (ref: {
  namespace: string;
  key: string;
  version?: string;
}): CatalogEntry<ProfileDefinition> => {
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
  const execution = findProfile(stack.definition.profiles.execution);
  const profileDefinitions = [ir.definition, projection.definition, execution.definition];

  return {
    stackKey: identityKey(stack),
    profiles: profileDefinitions,
    requiredFeatures: profileDefinitions.flatMap((profile) =>
      profile.featureContracts.filter(
        (contract) => contract.requirement === 'required',
      ),
    ),
    executionBindings: execution.definition.bindings?.filter(
      (binding) => binding.requirement === 'required',
    ) ?? [],
  };
};
