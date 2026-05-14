# LogicIR Type-System v0 Draft Artifacts

The TypeScript authoring source for this feature lives in:

- [`packages/features/type-system/src`](../../../../packages/features/type-system/src)

This draft currently has no generated JSON Schema or rendered reference output
checked in. The package source defines target-neutral algebraic type expressions
and extension payload data for payloads, payload paths, requirement contracts,
and structural composition compatibility.

Implementation tooling currently lives in:

- [`packages/tools/type-system`](../../../../packages/tools/type-system)

Target-specific adapters such as JSON Schema, TypeScript, Verilog, Python, or
ArkType projection should consume this feature data rather than changing core.

