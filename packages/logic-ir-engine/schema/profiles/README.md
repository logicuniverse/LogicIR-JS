# Application Feature Bundles

LogicIR core does not define profiles as part of the LogicIR object model.

This directory is reserved for application/tool-layer feature bundle notes. A bundle can make it convenient to say "use this set of features for software runtime projection" or "use this set for Verilog HDL projection", but the canonical LogicIR schema still sees concrete feature identities and node-level extension records.

Feature bundles should:

- Stay outside the canonical LogicIR data shape.
- Reference explicit feature identities.
- Declare compatible core schema version ranges when used as a packaging or tooling contract.
- Use explicit namespaces.
- Leave optional/required semantics on extension records where they appear on schema nodes.
- Avoid changing core semantics silently.

Possible application bundle names:

- `software-runtime`: async policy, lifecycle hooks, dynamic fulfillment, runtime state, default values.
- `verilog-hdl`: clock/reset, module binding, blackbox/external targets, bit shapes, elaboration constraints.
- `type-system`: port types, pin types, payload path types, requirement compatibility contracts.
- `control-flow`: branch, return, go-back, guard conditions for sequential organization.
- `visual-editor`: layout, labels, collapsed state, editor-only annotations.
- `legacy-tsjs-v1`: migration and compatibility mapping from the old TS/JS prototype.

Projectors should declare support for concrete features. Supporting a bundle name alone must not imply support for every feature in that bundle unless the projector also resolves the bundle manifest and declares each feature it covers.

Feature and bundle are many-to-many: a feature can be reused by multiple bundles, and a bundle can reference features from multiple namespaces when that is the clearest compatibility contract. Extension records on schema nodes point to a feature plus an extension key, not directly to a bundle.

Do not create a concrete bundle draft until there are actual features to bundle.
