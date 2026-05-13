# LogicIR Extensions

Extensions must be feature-scoped. A LogicIR extension record identifies a
`LogicUnit.features` local key, an extension key, and local payload only;
required/optional compatibility is defined by profile contracts, not by each
record.

Extension records are concrete node-level declarations under a resolved feature
identity. They should stay small and focused.

Use this pattern:

- A profile may reference named features as part of an IR pipeline, projection, or execution compatibility contract.
- A stack may compose multiple profiles for an end-to-end workflow, but extension records still belong to features, not directly to profiles or stacks.
- Feature is a capability unit identified by the registry or catalog layer with
  `namespace + key`, such as `logicir.software-runtime / dynamic-fulfillment`.
- `LogicUnit.features` is the local feature manifest for one independent LU. It
  maps local aliases to inline feature namespace/key/version data.
- Extension record carries the local payload for one schema node under a
  `featureKey` alias and an extension `key`.
- Feature definitions own extension points: each point has one attachment kind
  and its own payload schema reference.
- Profiles decide which feature and extension points are required, conditional,
  recommended, or optional for a specific pipeline, projection, or execution
  target.

Feature, profile, and stack are not a strict tree: one feature can appear in multiple profiles, and one stack can compose profiles that reference features from multiple namespaces. Extension records belong to features. LogicIR core does not define profile or stack membership.

Every extension record's `featureKey` must resolve in the containing
`LogicUnit.features` manifest. Tools must resolve the local alias to the inline
feature identity before validation or capability checking.

Do not use the feature manifest as a generic configuration surface. Feature-wide
semantic options should be modeled as feature-owned extensions, profile policy,
or execution bindings.

Attachment:

- Attach extensions to stable owner or relationship nodes, such as `LogicUnit`, `LUCore`, `LUI`, `Port`, `Connection`, `Closure`, requirement services, service-level fulfillment, or unit fulfillment.
- Do not attach extensions directly to helper children such as `PinSet`, sequential `steps`, `kindOrganization` branch internals, `CompositionLeaf`, or `CompositionValue`.
- When metadata targets an internal position, put selectors in the owner-level payload, such as `portKey`, `unitKey`, `stepIndex`, `anchorKey`, `outletKey`, or `payloadPath`.
- Kind-specific organization metadata belongs on `LUCore.extensions`, not inside each `kindOrganization` branch.

Guidelines:

- Treat an extension point as required in a profile contract when
  unsupported data would change semantics, correctness, compatibility, or
  projection validity.
- Treat an extension point as optional only when unsupported data can be ignored
  without changing core semantics for that profile.
- Do not use extensions as unstructured `customData`.
- Do not create a single catch-all extension payload for an entire runtime or target.
- Do not split every field into a separate feature; use extension points inside the relevant feature namespace.
- Distributed slice projection details, such as subsystem placement, transport guarantees, scheduling, serialization, bus packing, or cross-slice merge/resolution policy, belong in explicit features or profile-required extension points when core topology alone is not enough.

Unsupported required feature or extension contracts must produce diagnostics.
Unsupported optional feature or extension contracts may be ignored only when core
semantics for that profile remain unchanged.
