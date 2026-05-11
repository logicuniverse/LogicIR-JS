# LogicIR Profiles

Profiles are target, host, runtime, tool, or domain sub-schemas layered on top of core schema.

Profiles must:

- Declare compatible core schema version ranges.
- Use explicit namespaces.
- Mark extensions/features as optional or required.
- Avoid changing core semantics silently.

Do not create a concrete profile draft until a core schema decision needs target-specific constraints. Expected first profiles are software runtime and Verilog HDL.
