# LogicIR Extensions

Extensions must be feature-scoped and marked optional or required by the schema object that uses them.

Unsupported optional extensions may be ignored only if core semantics remain unchanged. Unsupported required extensions must produce diagnostics.

Extension records are concrete node-level declarations under a feature identity. They should stay small and focused.

Use this pattern:

- An application or tool may define a named bundle of features for convenient reference, such as a software runtime bundle or a Verilog HDL bundle.
- Feature is a projector capability unit with its own `namespace + key`, such as `logicir.software-runtime / dynamic-fulfillment`.
- Extension record carries the local payload for one schema node under a `feature` reference and an extension `key`.

Feature and bundle are not a strict tree: one feature can appear in multiple bundles, and one bundle can reference many features. Extension records belong to features, not directly to bundles. LogicIR core does not define profile membership.

Guidelines:

- Use `required` when unsupported data would change semantics, correctness, compatibility, or projection validity.
- Use `optional` only when unsupported data can be ignored without changing core semantics.
- Do not use extensions as unstructured `customData`.
- Do not create a single catch-all extension payload for an entire runtime or target.
- Do not split every field into a separate feature; use extension keys inside the relevant feature namespace.
- Distributed slice projection details, such as subsystem placement, transport guarantees, scheduling, serialization, bus packing, or cross-slice merge/resolution policy, belong in explicit features or required extensions when core topology alone is not enough.
