# LogicIR Projection Contracts

This directory defines projection-facing contracts. A projection compiler is a
declared capability set plus a lowering/emission pipeline, not just an unchecked
conversion function.

Projection profiles cover `LogicIR -> target artifact | executable plan`.
Execution profiles cover realization after that point. See
[`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the profile and stack model.

Projection targets are not limited to software and HDL in principle. Future
reference routes may include circuit/netlist, mechanical assembly, product
enclosure, or mixed hardware/software realization artifacts. Those routes should
be introduced as feature-backed projection profiles with explicit diagnostics
and capability declarations. They must not cause footprint, electrical,
mechanical, manufacturing, or tool-export details to move into core schema.

Do not create a concrete capability draft until core or feature extension-point
contracts exist. Projection work should then define capability declarations,
diagnostics, and safe-failure behavior against those fields.

Current core-facing capability checks should account for:

- Supported core schema version.
- Supported feature manifest resolution from `ExtensionRecord.featureKey` to
  `LogicUnit.features` entries.
- Supported LU kinds and the allowed LUI kind set inside each LU kind.
- Supported port contact capabilities: `pullReadable`, `pushNotifiable`, and `retainedCurrent`.
- Supported endpoint addressing depth, including `Port.pins` and `EndpointRef.payloadPath`.
- Supported structural composition features: `exportAnchors`, `externalOutlets`, `compositionSurface.outlets`, `compositionSurface.anchors`, `exportAnchorFills`, and `luiFills`.
- Supported requirement fulfillment forms: closure fulfillment, upstream unit fulfillment, and upstream shared-service supplier fulfillment.
- Supported feature identities and extension points, checked against the
  required/optional status declared by the selected profile contracts.

Projection must fail with diagnostics when required core semantics or required
feature/extension-point contracts exceed the declared capability set.
