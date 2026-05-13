# LogicIR Projection Contracts

This directory defines projection-facing contracts. A projection compiler is a
declared capability set plus a lowering/emission pipeline, not just an unchecked
conversion function.

Projection profiles cover `LogicIR -> target artifact | executable plan`.
Execution profiles cover realization after that point. See
[`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the profile and stack model.

Do not create a concrete capability draft until core or feature-extension fields exist. Projection work should then define capability declarations, diagnostics, and safe-failure behavior against those fields.

Current core-facing capability checks should account for:

- Supported core schema version.
- Supported LU kinds and the allowed LUI kind set inside each LU kind.
- Supported port contact capabilities: `pullReadable`, `pushNotifiable`, and `retainedCurrent`.
- Supported endpoint addressing depth, including `Port.pins` and `EndpointRef.payloadPath`.
- Supported structural composition features: `exportAnchors`, `externalOutlets`, `compositionSurface.outlets`, `compositionSurface.anchors`, `exportAnchorFills`, and `luiFills`.
- Supported requirement fulfillment forms: closure fulfillment, upstream unit fulfillment, and upstream shared-service supplier fulfillment.
- Supported feature identities and extension keys, including whether each is optional or required.

Projection must fail with diagnostics when required core semantics or required extensions exceed the declared capability set.
