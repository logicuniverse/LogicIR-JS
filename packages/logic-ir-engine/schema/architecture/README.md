# LogicIR Architecture Schema

This directory defines serializable content shapes for LogicIR architecture:
features, profiles, stacks, provider contracts, provider capabilities, stages,
policies, and execution bindings.

Architecture definitions are not part of the canonical LogicIR core object
model. They are read-only compatibility and catalog content used by tools,
compilers, runtimes, provider registries, and profile resolvers.

Current draft:

- [`v0-draft/types.ts`](v0-draft/types.ts)

Rules:

- Keep architecture schema pure data: no factories, helper functions, classes,
  callbacks, providers, or runtime implementations.
- Avoid TypeScript-only schema abstractions such as generics. The TS source is a
  maintainable way to write protocol data shapes, not a place to encode behavior
  or schema logic that cannot be serialized.
- Do not make feature/profile/stack/provider content depend on a document or
  file-storage wrapper. Identity, namespace, version, registry keys, indexes,
  package layout, and database storage belong to a catalog/application layer.
- All free-form config, policy, and inline schema fields must be JSON
  serializable data.
- Feature definitions define a logical feature plus the extension points that
  let that feature attach to core schema locations. Each extension point has one
  attachment kind and its own payload schema reference.
- Profile definitions reference features and define requiredness, stages,
  diagnostics, target constraints, provider contracts, and bindings.
- Profile extension-point contracts must include both extension `key` and
  `attachment` to avoid ambiguity when one feature uses the same key on multiple
  attachment locations.
- Stack definitions compose profiles for user-facing workflows.
- Capability definitions name reusable tool, pass, projection, execution, or
  provider capabilities.
- Tool and provider capability definitions declare supported profiles, features,
  capabilities, contracts, and environments; they do not execute anything.
- Execution binding subjects use generic target, requirement, and namespaced
  named-need references. Target-specific binding subjects such as software state
  stores or HDL clock/reset belong to feature/provider contracts.
- Execution profiles declare accepted core versions only when their input is a
  LogicIR document. Plan/artifact execution profiles are checked against their
  realized input contract instead.
- LogicIR core documents may reference feature identities through
  `LogicUnit.features`, but they do not reference profiles or stacks.
