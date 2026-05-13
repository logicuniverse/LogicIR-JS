# LogicIR Extensions

Extensions must be feature-scoped and marked optional or required by the schema object that uses them.

Unsupported optional extensions may be ignored only if core semantics remain unchanged. Unsupported required extensions must produce diagnostics.

Extension records are concrete node-level declarations under a feature identity. They should stay small and focused.

Use this pattern:

- A profile may reference named features as part of an IR pipeline, projection, or execution compatibility contract.
- A stack may compose multiple profiles for an end-to-end workflow, but extension records still belong to features, not directly to profiles or stacks.
- Feature is a capability unit with its own `namespace + key`, such as `logicir.software-runtime / dynamic-fulfillment`.
- Extension record carries the local payload for one schema node under a `feature` reference and an extension `key`.

Feature, profile, and stack are not a strict tree: one feature can appear in multiple profiles, and one stack can compose profiles that reference features from multiple namespaces. Extension records belong to features. LogicIR core does not define profile or stack membership.

Attachment:

- Attach extensions to stable owner or relationship nodes, such as `LogicUnit`, `LUCore`, `LUI`, `Port`, `Connection`, `Closure`, requirement services, service-level fulfillment, or unit fulfillment.
- Do not attach extensions directly to helper children such as `PinSet`, sequential `steps`, `kindOrganization` branch internals, `CompositionLeaf`, or `CompositionValue`.
- When metadata targets an internal position, put selectors in the owner-level payload, such as `portKey`, `unitKey`, `stepIndex`, `anchorKey`, `outletKey`, or `payloadPath`.
- Kind-specific organization metadata belongs on `LUCore.extensions`, not inside each `kindOrganization` branch.

Guidelines:

- Use `required` when unsupported data would change semantics, correctness, compatibility, or projection validity.
- Use `optional` only when unsupported data can be ignored without changing core semantics.
- Do not use extensions as unstructured `customData`.
- Do not create a single catch-all extension payload for an entire runtime or target.
- Do not split every field into a separate feature; use extension keys inside the relevant feature namespace.
- Distributed slice projection details, such as subsystem placement, transport guarantees, scheduling, serialization, bus packing, or cross-slice merge/resolution policy, belong in explicit features or required extensions when core topology alone is not enough.
