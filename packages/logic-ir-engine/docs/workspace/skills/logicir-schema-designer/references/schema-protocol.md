# Schema Protocol Reference

Use this when designing schema evolution, compatibility, profiles, extensions, or projector capability declarations.

## Long-Lived Protocol Model

Treat LogicIR schema like a long-lived protocol:

- Stable semantic core.
- Namespaced profiles/sub-schemas/extensions.
- Explicit projector capability declaration.
- Safe failure when declared semantics cannot be preserved.

## Core vs Profile

Core schema contains target-neutral logical topology semantics. Put a field in core only if removing or changing it changes whether the LogicIR object is the same logical topology.

Profile/sub-schema contains target, host, runtime, tool, or domain constraints. Examples:

- `profile.software-runtime`.
- `profile.verilog-hdl`.
- `profile.distributed-runtime`.
- `profile.verification`.

## Extensions

- Namespace every extension.
- Mark each extension optional or required.
- Optional extension: unsupported tools may ignore it only if core semantics remain unchanged.
- Required extension: unsupported tools must fail with diagnostic.

## Versioning

- Core schema stable releases default to additive changes.
- Breaking core semantic changes require a major version.
- Breaking changes require migration or compat-layer notes.
- Profiles may version independently, but must state compatible core version ranges.

## Projector Capability Set

Projectors must declare:

- Supported core schema versions.
- Supported profiles and extension namespaces.
- Supported optional/required features.
- Supported LU kinds.
- Supported fulfillment forms.
- Target constraints and known semantic limits.

Projectors must refuse projection when required schema semantics exceed declared capability.

## Plan Checklist

Every schema/projection plan must include:

- Old implementation reference points.
- Theory mapping.
- Core/profile/extension boundary.
- Required vs optional extension status.
- Projector capability changes.
- JS/TS runtime impact.
- Verilog HDL impact.
- Compatibility and migration strategy.

