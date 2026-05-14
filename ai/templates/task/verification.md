# Verification

Record all checks performed for this task.

## Commands

| Command | Result | Notes |
| --- | --- | --- |
|  |  |  |

## Expected Minimum Checks

Every autonomous AI task must leave runnable verification evidence. Do not mark
a task `ready-for-review` only because the files look plausible.

When the task contains TypeScript:

- Run a local type check against task-local code when possible.
- Run the relevant JS/TS build, test, or smoke command when the task implements
  runtime behavior, tools, projectors, compilers, examples, or fixtures.
- If task code references formal packages, use imports as read-only dependency
  evidence and do not modify those packages.

When the task contains or generates Verilog HDL:

- Activate OSS CAD Suite before verification on Windows:
  `. E:\oss-cad-suite\environment.ps1`
- Run `iverilog` directly for syntax or simulation smoke checks.
- Record the exact generated HDL files, testbench files, and output artifact
  paths used by `iverilog`.

When the task claims both JS/TS and Verilog HDL support:

- Run both the JS/TS verification path and the Verilog HDL verification path.
- If either path cannot run, record the concrete blocker and do not describe
  that path as verified.

When the task proposes promotion:

- Record the expected formal verification after promotion, usually `yarn build`
  and `yarn test`.
- Record any documentation link checks, fixture checks, or target-specific
  commands needed for the formal destination.
- Confirm no task-local code is imported by formal packages before promotion.

## Known Gaps

- 
