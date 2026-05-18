# Core Software Interpreter

The current core software interpreter is:

- package: `@logic-universe/logic-ir-engine-core-software-interpreter`
- source: `packages/engines/core-software-interpreter`

It is the current accepted TypeScript execution seed for **core-only LogicIR**.

## Purpose

This package exists to execute the current core IR without requiring extra
feature families first.

It is used to validate the meaning of the current IR with runnable examples
before more feature-heavy software stacks are added.

## Current Scope

The current seed supports these core paths:

- combinational
  - `pull` inputs
  - `result` reads
- sequential
  - ordered `steps`
  - `result` reads
- stateful
  - `pull` initial/current reads
  - `push` updates
  - `property` outputs
- structural
  - anchors
  - outlets
  - fills
- requirement-backed and closure-backed minimal execution paths in the current
  seed shape

Primary exported surface:

- `packages/engines/core-software-interpreter/src/types.ts`
- `packages/engines/core-software-interpreter/src/interpreter.ts`

## Important Boundaries

This package is intentionally narrow.

It is **not** the final answer for:

- full software feature families
- lifecycle and scheduling systems
- transport/runtime orchestration
- generated code hosts
- HDL execution

It is a core execution baseline and a semantic pressure test.

## How It Is Used

The current reviewed examples use this package as their shared runner:

- `examples/core-only/`

That means example execution logic is no longer hand-written separately per
scenario.
