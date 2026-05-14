# LogicIR Architecture v0 Draft

The TypeScript authoring source for this draft lives in
`packages/architecture/src/types.ts`. This directory is the language-neutral
specification surface for architecture schema notes and future generated
artifacts.

This draft defines architecture content definitions, not a storage or document
format.

The schema covers:

- `FeatureDefinition`: a logical feature and the extension points it uses to
  attach to core schema locations.
- `ProfileDefinition`: a single-layer compatibility contract for IR pipeline,
  projection, or execution.
- `StackDefinition`: a user-facing composition of profiles.
- `ProviderContractDefinition`: abstract provider interface and semantic
  obligations.
- `CapabilityDefinition`: reusable capability declarations for tools, stages,
  projections, execution, and providers.

Layer rules:

- Feature definitions do not embed their registry identity.
- Profile definitions reference feature identities, but do not define features.
- Profile extension-point contracts identify extension points by both
  `key` and `attachment`, so same-key extension points on different core
  attachment locations are never ambiguous.
- Stack definitions compose profile identities only.
- Provider contracts and capabilities are definitions, not implementations.
- Execution binding subjects keep only stable generic subjects in the schema:
  external targets, requirement services, requirement units, and namespaced
  named needs. Concrete subjects such as state stores, schedulers, transports,
  modules, probes, or clock/reset bindings must be defined by features or
  provider contracts, not by the architecture schema itself.
- Execution profiles that run `logicir` directly must declare accepted core
  versions. Execution profiles that run an executable plan or artifact may omit
  core versions because their compatibility boundary is the realized input
  format.
- This draft intentionally does not define one catch-all `ArchitectureDefinition`
  union. Registries, index exports, or databases decide how differently typed
  definitions are grouped and keyed.
- Catalog identity, namespace, version, indexing, persistence, file layout, and
  database keys belong to a registry, package, index export, or application
  layer outside this schema.
