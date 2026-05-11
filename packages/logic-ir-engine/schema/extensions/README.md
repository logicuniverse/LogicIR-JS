# LogicIR Extensions

Extensions must be namespaced and marked optional or required by the schema object that uses them.

Unsupported optional extensions may be ignored only if core semantics remain unchanged. Unsupported required extensions must produce diagnostics.

Extension records are concrete node-level declarations under a profile namespace. They should stay small and focused.

Use this pattern:

- Profile groups a stable domain, such as `logicir.profile.software-runtime`.
- Feature names a capability inside that domain, such as `dynamic-fulfillment`.
- Extension record carries the local payload for one schema node.

Guidelines:

- Use `required` when unsupported data would change semantics, correctness, compatibility, or projection validity.
- Use `optional` only when unsupported data can be ignored without changing core semantics.
- Do not use extensions as unstructured `customData`.
- Do not create a single catch-all extension payload for an entire runtime or target.
- Do not split every field into a separate profile; use extension keys inside the relevant profile namespace.
