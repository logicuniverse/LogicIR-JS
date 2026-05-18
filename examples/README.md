# Examples

This directory holds human-readable LogicIR examples that demonstrate complete
workflows.

Examples should be small, named, and tied to a concrete stack or scenario. They
may reference fixtures, but they should explain why the example exists and what
it is meant to show.

Planned first areas:

- `core-only/`: feature-free examples that validate the current core IR shape
  before feature, profile, provider, or runtime-specific data is introduced.
  They should run through the shared core software interpreter seed, not
  scenario-local ad hoc execution code.
- `basic-software/`: minimal LogicIR units and stacks for software execution.
- `basic-hdl/`: minimal LogicIR units and stacks for Verilog HDL projection.
