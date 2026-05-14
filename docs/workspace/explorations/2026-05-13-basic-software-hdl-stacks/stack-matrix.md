# Stack Matrix

This matrix compares the two proposed initial stacks.

| Area | Basic Software | Basic HDL |
| --- | --- | --- |
| Feasibility read | Feasible as the first runtime/execution stack | Feasible as the first strict static projection stack |
| What it proves | LogicIR can be interpreted, provider-bound, and run through software environments | LogicIR core can be constrained, lowered, and emitted as Verilog-oriented hardware artifacts |
| Working stack | `logicir.stack.basic-software` | `logicir.stack.basic-hdl` |
| Primary target | Language-neutral software interpretation/codegen | Verilog HDL projection |
| IR profile | `basic-software-ir` | `basic-hdl-ir` |
| Projection profile | `basic-software-plan` | `basic-verilog-hdl` |
| Execution profile | `basic-software-execution` | none for build, `basic-verilog-sim` optional |
| Core shape | All four LU kinds as a goal | Combinational/structural first; stateful/sequential with explicit HDL features |
| Type system | Recommended, required when compatibility must be proven before execution | Usually required |
| Completion | Immediate + continuation model | Not a target semantic |
| Retained-current | Runtime/provider/store/cache realization | Register/stable signal realization |
| Dynamic fulfillment | Static-at-startup baseline; late-bound/switchable as required feature | Rejected by default; static binding required |
| External target | Execution provider binding | Module binding / blackbox / generated module |
| Structural composition | Can realize structural output or software UI-like trees | Can lower export anchors to modules/slices |
| Payload path | Runtime addressing and packet path routing | Flattening, packed fields, bus lanes, part-selects |
| Execution provider | Function/module/remote service/state store/message bus | Optional simulator/testbench/foreign module provider |
| Current code evidence | Strong: `projector.ts`, `projection.ts`, runtime types | Indirect: core shape plus archived Verilog draft |

## Shared Profile Requirements

Both stacks need:

- Core validator.
- Feature capability checker.
- Profile-level required/optional feature and extension contract handling.
- Target/external requirement contract resolution.
- Type-system feature path for payload/pin/path compatibility.
- Diagnostics rather than silent degradation.

The shared requirement set is the important result: neither stack currently
requires a core schema fork. Stack-specific behavior is carried by profiles,
feature requirements, projection stages, and execution bindings.

## Divergence Points

### Completion

Basic software treats continuation-style completion as a first-class feature.
Basic HDL should reject or statically lower any software completion behavior.

### Retained Current

Basic software can realize retained current through source store, sink cache,
execution-engine adapter, host observable, or provider backing.

Basic HDL must realize retained current as static signal/register behavior or
reject it.

### Requirement Fulfillment

Basic software can support runtime provider binding. Basic HDL requires static
binding before emission.

### Structural Slices

Both stacks can use structural export anchors, but the purpose differs:

- Basic software may use slices for UI/component/region composition or
  distributed runtime partitioning.
- Basic HDL may use slices for module partitioning and explicit cross-slice
  wires/buses.

## Stack Composition Examples

```text
basic-software-interpreter:
  stack: logicir.stack.basic-software
  ir: basic-software-ir
  projection: basic-software-plan with target interpreter-plan
  execution: basic-software-execution with target interpreter

basic-software-codegen:
  stack: logicir.stack.basic-software
  ir: basic-software-ir
  projection: basic-software-plan with target generated-code-plan
  execution: basic-software-execution with target generated-host

basic-hdl-build:
  stack: logicir.stack.basic-hdl
  ir: basic-hdl-ir
  projection: basic-verilog-hdl
  execution: none

basic-hdl-sim:
  stack: logicir.stack.basic-hdl
  ir: basic-hdl-ir
  projection: basic-verilog-hdl
  execution: basic-verilog-sim
```
