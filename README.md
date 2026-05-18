# LogicIR-JS

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Topology](https://img.shields.io/badge/topology-ZYModel-orange)

**The JavaScript/TypeScript manifestation of the LogicUniverse: A Tri-Axial Fractal Topology for Deterministic Logic as Data.**

## I. About LogicIR-JS

This repository is the TypeScript/JavaScript reference workspace for
**LogicIR** (Logic Intermediate Representation). LogicIR treats logical
topology as portable data that can be validated, transformed, projected, and
executed through declared profiles and capabilities.

- **X (Interaction: Push/Pull)**: unit-level boundary drive; port-level contact
  capabilities are modeled separately.
- **Y (Manifestation: Time/Space)**: whether logic is current mapping,
  progression, resident state, or structural manifestation.
- **Z (Requirement/Fulfillment)**: explicit declaration and satisfaction of
  required logic through closures or upstream supply.

The current workspace keeps the core target-neutral while using features,
profiles, stacks, tools, projectors, engines, and providers to realize concrete
software and Verilog HDL paths.

## II. Monorepo Architecture

This workspace is organized as a modular LogicIR TS/JS reference monorepo:

- **[`@logic-universe/logic-ir-core`](packages/core)**: LogicIR core protocol
  TypeScript authoring source.
- **[`@logic-universe/logic-ir-architecture`](packages/architecture)**:
  feature, profile, stack, tool, provider, and capability schema source.
- **[`@logic-universe/logic-ir-feature-type-system`](packages/features/type-system)**:
  target-neutral algebraic type-system feature schema.
- **[`@logic-universe/logic-ir-tool-type-system`](packages/tools/type-system)**:
  TypeScript type-system checker and LogicIR extension helpers.
- **[`@logic-universe/logic-ir-legacy-engine`](packages/legacy/engine)**: The old
  JS/TS execution and projection package, retained as migration/reference
  material.
- **[`packages/legacy/flow-runtime-core`](packages/legacy/flow-runtime-core)** and
  **[`packages/legacy/flow-core`](packages/legacy/flow-core)**: source-only
  historical snapshots from the earlier FlowForge-era implementation. They are
  evidence material, not active workspace packages.

Repository-level surfaces:

- **[`docs/`](docs)**: reader-facing theory and user documentation.
- **[`dev/`](dev)**: internal development theory extracts, change proposals,
  shared rules, handoff notes, and engineering coordination.
- **[`schema/`](schema)**: language-neutral schema artifact routes and curated
  specification notes.
- **[`ai/`](ai)**: write-isolated AI task sandboxes, task templates, and
  repository-local AI skill sources.
- **[`examples/`](examples)** and **[`fixtures/`](fixtures)**: reviewed examples
  and reusable machine-checkable inputs when they are promoted.

## III. New AI Session Handoff

If a new AI session is asked to "read the existing project", it should not start
by recursively reading every task sandbox. Use this order:

1. Read [`dev/getting-started/handoff.md`](dev/getting-started/handoff.md).
2. Read [`dev/workflow/shared-rules.md`](dev/workflow/shared-rules.md) and
   [`dev/workflow/process.md`](dev/workflow/process.md).
3. Read [`dev/theory/operational-theory.md`](dev/theory/operational-theory.md),
   [`dev/theory/schema-principles.md`](dev/theory/schema-principles.md), and
   [`dev/theory/logicir-architecture.md`](dev/theory/logicir-architecture.md) as needed for
   the task.
4. Read [`dev/planning/feature-catalog.md`](dev/planning/feature-catalog.md) when feature scope
   or promotion is involved.
5. Read [`dev/planning/roadmap.md`](dev/planning/roadmap.md) before starting roadmap or `/goal`
   work.
6. Read [`dev/planning/long-term-vision.md`](dev/planning/long-term-vision.md) only for
   uncertain long-term research or pressure-test directions.
7. Read specific [`ai/tasks/`](ai/tasks) directories only as sandbox evidence
   for review or promotion. Task output is not accepted project source until a
   human reviews and promotes the smallest useful pieces.

## IV. Development & Tooling

To ensure absolute determinism in the development environment, this project is optimized for **Yarn Classic (1.22.x)** and utilizes **`ultra-runner`** for high-performance task execution.

### Prerequisites

- **Node.js**: >= 18.x
- **Yarn**: 1.22.x (Classic)

### Getting Started

```bash
# 1. Clone and install dependencies
git clone https://github.com/logicuniverse/logicuniverse.git LogicIR-JS
cd LogicIR-JS
yarn install

# 2. Build the entire logic fabric
yarn build

# 3. Enter real-time development mode (Watch Mode)
yarn dev

# 4. Execute tests across all topological zones
yarn test
```
