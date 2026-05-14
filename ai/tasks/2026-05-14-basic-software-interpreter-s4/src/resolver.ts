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
  const profileDefinitions = [
    findProfile(stack.definition.profiles.irPipeline).definition,
    findProfile(stack.definition.profiles.projection).definition,
    findProfile(stack.definition.profiles.execution).definition,
  ];

  return {
    stackKey: identityKey(stack),
    requiredFeatures: profileDefinitions.flatMap((profile) =>
      profile.featureContracts
        .filter((contract) => contract.requirement === 'required')
        .map((contract) => contract.feature),
    ),
  };
};
