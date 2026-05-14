# AI Workspace

This directory contains repository-local coordination surfaces for AI-assisted
work, especially fully autonomous AI task output that has not been promoted.

## Directories

- [`tasks/`](tasks/): write-isolated sandboxes for AI-autonomous tasks.
- [`templates/`](templates/): reusable templates for AI task directories and
  promotion review material.
- [`skills/`](skills/): repository-local source for reusable Codex skills.

Do not put accepted project source here. Formal project content belongs in
`packages/`, `schema/`, `docs/`, `dev/`, `examples/`, `fixtures/`, or other
reviewed project directories after human confirmation.

AI task output may be useful code, data, notes, tests, or reports, but it is
only source material until a human reviews and promotes the smallest useful
pieces into the correct formal directory.

Autonomous tasks must produce runnable verification evidence. JS/TS work should
run the relevant type check, build, test, or smoke path. Verilog HDL work should
use OSS CAD Suite from `E:\oss-cad-suite` and run `iverilog` directly after
activating `E:\oss-cad-suite\environment.ps1`. A task that claims both JS/TS and
HDL support must verify both paths or record a concrete blocker for the
unverified path.
