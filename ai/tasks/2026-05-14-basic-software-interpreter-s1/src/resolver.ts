import { profiles } from './architecture';
import type {
  CatalogEntry,
  ExecutionProfileDefinition,
  ProfileCatalogEntry,
  ResolvedStack,
  StackCatalogEntry,
} from './types';

const refKey = (ref: {
  namespace: string;
  key: string;
  version?: string;
}): string => `${ref.namespace}/${ref.key}${ref.version ? `@${ref.version}` : ''}`;

const entryKey = (entry: CatalogEntry<unknown>): string =>
  refKey({
    namespace: entry.namespace,
    key: entry.key,
    version: entry.version,
  });

const findProfile = (
  ref: { namespace: string; key: string; version?: string },
  expectedKind: ProfileCatalogEntry['definition']['profileKind'],
): ProfileCatalogEntry => {
  const profile = profiles.find((entry) => entryKey(entry) === refKey(ref));

  if (!profile) {
    throw new Error(`Missing profile: ${refKey(ref)}`);
  }

  if (profile.definition.profileKind !== expectedKind) {
    throw new Error(
      `Profile ${refKey(ref)} has kind ${profile.definition.profileKind}, expected ${expectedKind}`,
    );
  }

  return profile;
};

export const resolveStack = (stack: StackCatalogEntry): ResolvedStack => {
  findProfile(stack.definition.profiles.irPipeline, 'ir-pipeline');
  findProfile(stack.definition.profiles.projection, 'projection');

  if (!stack.definition.profiles.execution) {
    throw new Error('S1 requires an execution profile.');
  }

  const executionProfile = findProfile(
    stack.definition.profiles.execution,
    'execution',
  ) as CatalogEntry<ExecutionProfileDefinition>;

  return {
    stackKey: entryKey(stack),
    executionBindings: executionProfile.definition.bindings.filter(
      (binding) => binding.requirement === 'required',
    ),
  };
};
