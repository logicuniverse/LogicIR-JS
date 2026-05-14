# Schema Protocol Reference

Use this when designing schema evolution, compatibility, feature extensions,
architecture definitions, profiles, stacks, tools, projectors, engines,
providers, or capability declarations.

## Long-Lived Protocol Model

Treat LogicIR schema like a long-lived protocol:

- Stable semantic core.
- Serializable architecture definitions for features, profiles, stacks,
  capabilities, provider contracts, provider capabilities, stages, policies,
  and execution bindings.
- Namespaced features and feature-scoped extensions.
- Explicit capability declarations from tools, projectors, engines, and
  providers.
- Safe failure when declared semantics cannot be preserved.

## Core vs Feature Extension

Core schema contains target-neutral logical topology semantics. Put a field in core only if removing or changing it changes whether the LogicIR object is the same logical topology.

Feature extensions contain target, host, runtime, tool, or domain constraints.
Feature identity is the semantic capability unit; concrete payload kinds are
extension points under that feature. Examples:

- Feature `logicir.type-system / core`, extension point `payload-type`.
- Feature `logicir.software-runtime / core`, extension point `completion-policy`.
- Feature `logicir.verilog-hdl / core`, extension point `clock-reset`.
- Feature `logicir.distributed-runtime / core`, extension point `placement`.
- Feature `logicir.verification / assertions`, extension point `assertion`.

Profile and stack definitions are architecture content, not part of the
canonical LogicIR object model. Profiles are single-layer compatibility
contracts; stacks compose profiles for user-facing workflows.

## Architecture Definitions

- Keep architecture schema pure JSON-serializable data.
- Do not use document wrappers, factories, helper functions, callbacks,
  providers, runtime implementations, or TypeScript generic schema abstractions.
- Keep registry identity, namespace, version, indexing, persistence, package
  layout, and database keys outside architecture content shapes.
- Let feature definitions own extension points. Each extension point has one
  attachment kind and one payload schema reference.
- Let profiles define requiredness, stages, diagnostics, target constraints,
  provider contracts, and bindings.
- Let stacks compose profile identities; a stack is not a capability proof by
  itself.

## Features and Extensions

- Give each feature a stable identity, usually `namespace + key`.
- Application-layer bundles may group features, but projectors must resolve them to concrete feature identities.
- Each `LogicUnit` declares a local feature manifest that inlines feature namespace/key/version.
- Extension records reference that manifest by local `featureKey` and use an extension key inside the resolved feature.
- References to external namespace/key contracts may carry optional versions.
- Feature definitions own extension-point schemas, including payload required
  and optional fields.
- Profiles mark feature and extension-point contracts as `required`,
  `conditional-required`, `recommended`, or `optional` for a specific processing
  layer.
- `conditional-required` means required when the LogicIR input uses the relevant
  semantic condition; otherwise not required.
- Unsupported required or conditionally required contracts must fail with
  diagnostic.
- Unsupported recommended or optional contracts may be ignored only if profile
  semantics remain unchanged.
- Attach extensions to stable owner or relationship nodes. For internal helper positions such as sequential `steps`, composition leaves/values, pin children, or `kindOrganization` branch internals, use selector fields in the owner-level payload rather than adding extension arrays to the helper itself.
- Kind-specific metadata should attach to `LUCore.extensions`; `kindOrganization` remains the target-neutral minimal organization skeleton.

## Versioning

- Core schema stable releases default to additive changes.
- Breaking core semantic changes require a major version.
- Breaking changes require migration or compat-layer notes.
- Profiles, stacks, features, and provider contracts may version independently
  at the catalog/registry layer, but must state compatible core version ranges
  and concrete feature identities when relevant.

## Capability Sets

Tools, projectors, execution engines, and providers must declare relevant
capabilities:

- Supported core schema versions.
- Supported concrete features.
- Feature manifest resolution from local `featureKey` aliases to concrete feature identities.
- Supported extension points under those features, checked against the selected
  profile's requiredness contracts.
- Supported LU kinds.
- Supported fulfillment forms.
- Target constraints and known semantic limits.
- Supported profiles only after resolving them into concrete features, stages,
  policies, provider contracts, and bindings.

Implementations must refuse work when required schema semantics or profile
contracts exceed declared capability.

## Plan Checklist

Every schema/projection plan must include:

- Old implementation reference points.
- Theory mapping.
- Core/feature/extension/profile/stack boundary.
- Required, conditional-required, recommended, or optional contract status.
- Tool, projector, engine, and provider capability changes.
- JS/TS runtime impact.
- Verilog HDL impact.
- Compatibility and migration strategy.
