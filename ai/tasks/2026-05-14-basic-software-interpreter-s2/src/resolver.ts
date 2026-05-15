import { profiles } from './architecture';
import type {
  CatalogEntry,
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
  findProfile(stack.definition.profiles.irPipeline);
  const projection = findProfile(stack.definition.profiles.projection);

  if (!stack.definition.profiles.execution) {
    throw new Error('S2 requires an execution profile.');
  }

  findProfile(stack.definition.profiles.execution);

  return {
    stackKey: identityKey(stack),
    requiredFeatures: projection.definition.featureContracts.filter(
      (contract) => contract.requirement === 'required',
    ),
  };
};
