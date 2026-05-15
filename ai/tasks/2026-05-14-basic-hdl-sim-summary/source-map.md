# Source Map

## HDL Round Evidence

| Source | Why It Matters |
| --- | --- |
| `ai/tasks/2026-05-14-basic-hdl-sim-h1-combinational-module/` | Combinational HDL module and testbench emission. |
| `ai/tasks/2026-05-14-basic-hdl-sim-h2-signal-width/` | Signal width and vector arithmetic emission. |
| `ai/tasks/2026-05-14-basic-hdl-sim-h3-sequential-state/` | Clock/reset/register projection and simulation. |
| `ai/tasks/2026-05-14-basic-hdl-sim-h4-unsupported-semantics/` | Required software feature rejection and diagnostic behavior. |
| `ai/tasks/2026-05-14-basic-hdl-sim-h5-structural-composition/` | Structural module hierarchy and child instance emission. |

## Project Guidance

| Source | Why It Matters |
| --- | --- |
| `dev/roadmap.md` | Defines the H1-H5 round intent and HDL verification discipline. |
| `dev/operational-theory.md` | Requires projection targets to preserve declared semantics or reject explicitly. |
| `dev/schema-principles.md` | Keeps HDL clock/reset/module details in feature extensions, not LogicIR core. |
| `E:\oss-cad-suite\environment.ps1` | Local HDL verification environment used by H1, H2, H3, and H5. |

## Source Priority Notes

- H1-H5 are sandbox evidence, not formal implementation.
- Generated Verilog text can be useful review evidence, but generated `.vvp`
  files should remain ignored.
- Formal promotion must re-run HDL smoke from the destination package context.
