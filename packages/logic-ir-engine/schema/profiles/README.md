# LogicIR Profiles

Profiles are target, host, runtime, tool, or domain sub-schemas layered on top of core schema.

Use profiles as domain-level packages, not as one large catch-all extension and not as one profile per field.

Profiles must:

- Declare compatible core schema version ranges.
- Use explicit namespaces.
- Declare supported features/capabilities separately from the profile name.
- Mark extension payloads as optional or required where they appear on schema nodes.
- Avoid changing core semantics silently.

Recommended initial profile boundaries:

- `software-runtime`: async policy, lifecycle hooks, dynamic fulfillment, runtime state, default values.
- `verilog-hdl`: clock/reset, module binding, blackbox/external targets, bit shapes, elaboration constraints.
- `type-system`: port types, pin types, payload path types, requirement compatibility contracts.
- `control-flow`: branch, return, go-back, guard conditions for sequential organization.
- `visual-editor`: layout, labels, collapsed state, editor-only annotations.
- `legacy-tsjs-v1`: migration and compatibility mapping from the old TS/JS prototype.

Projectors should declare a capability matrix such as profile + feature list. Supporting a profile name alone must not imply support for every feature in that profile.

Do not create a concrete profile draft until a core schema decision needs target-specific constraints. Expected first profiles are software runtime and Verilog HDL.
