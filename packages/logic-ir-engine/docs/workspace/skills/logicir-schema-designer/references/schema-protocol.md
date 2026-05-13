# Schema Protocol Reference

Use this when designing schema evolution, compatibility, feature extensions, application feature bundles, or projector capability declarations.

## Long-Lived Protocol Model

Treat LogicIR schema like a long-lived protocol:

- Stable semantic core.
- Namespaced features and feature-scoped extensions.
- Explicit projector capability declaration.
- Safe failure when declared semantics cannot be preserved.

## Core vs Feature Extension

Core schema contains target-neutral logical topology semantics. Put a field in core only if removing or changing it changes whether the LogicIR object is the same logical topology.

Feature extensions contain target, host, runtime, tool, or domain constraints. Examples:

- `logicir.software-runtime / async-policy`.
- `logicir.verilog-hdl / clock-reset`.
- `logicir.distributed-runtime / placement`.
- `logicir.verification / assertions`.

Profile/bundle names are application-layer conveniences for grouping features. They are not part of the canonical LogicIR object model.

## Features and Extensions

- Give each feature a stable identity, usually `namespace + key`.
- Application-layer bundles may group features, but projectors must resolve them to concrete feature identities.
- Each `LogicUnit` declares a local feature manifest that inlines feature namespace/key/version.
- Extension records reference that manifest by local `featureKey` and use an extension key inside the resolved feature.
- References to external namespace/key contracts may carry optional versions.
- Feature definitions own extension-kind schemas, including payload required and optional fields.
- Profiles mark feature/extension contracts optional or required for a specific processing layer.
- Optional contract: unsupported tools may ignore it only if profile semantics remain unchanged.
- Required contract: unsupported tools must fail with diagnostic.
- Attach extensions to stable owner or relationship nodes. For internal helper positions such as sequential `steps`, composition leaves/values, pin children, or `kindOrganization` branch internals, use selector fields in the owner-level payload rather than adding extension arrays to the helper itself.
- Kind-specific metadata should attach to `LUCore.extensions`; `kindOrganization` remains the target-neutral minimal organization skeleton.

## Versioning

- Core schema stable releases default to additive changes.
- Breaking core semantic changes require a major version.
- Breaking changes require migration or compat-layer notes.
- Application-layer feature bundles may version independently, but must state compatible core version ranges and concrete feature identities.

## Projector Capability Set

Projectors must declare:

- Supported core schema versions.
- Supported concrete features.
- Feature manifest resolution from local `featureKey` aliases to concrete feature identities.
- Supported extension keys under those features, checked against the selected profile's required/optional contracts.
- Supported LU kinds.
- Supported fulfillment forms.
- Target constraints and known semantic limits.

Projectors must refuse projection when required schema semantics exceed declared capability.

## Plan Checklist

Every schema/projection plan must include:

- Old implementation reference points.
- Theory mapping.
- Core/feature/extension boundary.
- Required vs optional feature/extension contract status.
- Projector capability changes.
- JS/TS runtime impact.
- Verilog HDL impact.
- Compatibility and migration strategy.
