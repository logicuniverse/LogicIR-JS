# LogicIR-JS

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Topology](https://img.shields.io/badge/topology-ZYModel-orange)

**The JavaScript/TypeScript manifestation of the LogicUniverse: A Tri-Axial Fractal Topology for Deterministic Logic as Data.**

## I. About LogicIR-JS

This repository is the official implementation of **LogicIR** (Logic Intermediate Representation) for the JS ecosystem. It transforms abstract logic topologies into functional entities, governed by the three orthogonal axes of digital reality:

- **X (Interaction: Push/Pull)**: Data reconciliation at the boundary.
- **Y (Manifestation: Time/Space)**: Operational existence and temporal evolution.
- **Z (Sovereignty: Provide/Inject)**: Vertical conduit for logic essence and dependency injection.

By moving beyond the **1D Turing Tape**, LogicIR-JS provides a high-fidelity execution plane for the next generation of deterministic systems.

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

## III. Development & Tooling

To ensure absolute determinism in the development environment, this project is optimized for **Yarn Classic (1.22.x)** and utilizes **`ultra-runner`** for high-performance task execution.

### Prerequisites

- **Node.js**: >= 18.x
- **Yarn**: 1.22.x (Classic)

### Getting Started

```bash
# 1. Clone and install dependencies
git clone https://github.com/logicuniverse/logicuniverse.git
cd LogicIR-JS
yarn install

# 2. Build the entire logic fabric
yarn build

# 3. Enter real-time development mode (Watch Mode)
yarn dev

# 4. Execute tests across all topological zones
yarn test
```
