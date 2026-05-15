# Feature/Profile Matrix

Status: AI task material, not accepted project source.

Historical planning note: this matrix predates the current rule that each
runnable task round must stay minimal. Treat its requiredness rows as future
profile candidates, not as automatic requirements for S/H round sandboxes.

This matrix is the requiredness source of truth for this exploration pack.
`feature-catalog.md` defines feature purpose and extension keys; profiles define
whether those contracts are required, conditional, recommended, or optional.

## Requirement Levels

| Level | Meaning |
| --- | --- |
| `required` | The selected profile must support this contract. Unsupported required contracts fail with diagnostics. |
| `conditional-required` | Required when the input LogicIR uses the relevant semantic condition; otherwise not required. |
| `recommended` | Useful for compatibility, static checks, or portability, but not mandatory for the baseline profile. |
| `optional` | Tooling, observation, optimization, or integration support that does not change baseline semantics. |

## Shared Contracts

| Contract | Basic Software | Basic HDL | Notes |
| --- | --- | --- | --- |
| `logicir.type-system / core` | `recommended` | `required` | Software can delegate some checks to providers/runtime; HDL needs static width, layout, path, and compatibility evidence. |
| Core validation | `required` IR stage | `required` IR stage | Not a LogicIR feature. It is a profile stage/capability covering core version, endpoint resolution, LUI kind matrix, fulfillment, and composition integrity. |

## Basic Software Contracts

| Feature | Requiredness | Baseline extension keys | Notes |
| --- | --- | --- | --- |
| `logicir.value / literals` | `required` | `literal-values`, `default-inputs`, `initial-values` | Provides portable constants/defaults/initial values without host-language syntax. |
| `logicir.software-runtime / completion` | `required` | `completion-contract`, `step-await-policy`, `completion-error-policy` | Defines immediate/continuation completion and sequential step waiting semantics without choosing JS Promise or Python coroutine. |
| `logicir.software-runtime / invocation` | `conditional-required` | `call-contract`, `input-read-policy`, `push-delivery-policy`, `packet-path-policy` | Plain external-target provider calls use architecture-level execution binding and do not require a LogicIR invocation feature. This feature is required only when the LogicIR input uses non-default software invocation semantics such as push delivery, packet-path policy, or custom input-read policy. |
| `logicir.software-runtime / retained-current` | `required` | `retained-current-realization`, `state-backing`, `latest-value-cache` | Required software stack capability for retained-current contact realization. |
| `logicir.fulfillment / static-binding` | `required` | `provider-binding-policy` | Baseline is static-at-startup architecture-level execution binding. `dynamic-fulfillment`, `late-bound-provider`, and `switching-policy` are explicit extra required contracts only when used. |
| `logicir.execution / error` | `required` | `error-policy`, `error-port`, `error-channel` | Defines how provider errors map to results, ports/channels, or diagnostics. |
| `logicir.software-runtime / lifecycle` | `recommended` | `resource-lifecycle`, `start-stop`, `dispose` | Recommended for long-running/resource-owning providers; not required for stateless providers. |
| `logicir.software-runtime / observation` | `optional` | `trace-events`, `runtime-hooks`, `override-policy` | Observation is tooling support by default. Behavior-changing hooks require explicit binding. |

## Basic HDL Contracts

| Feature | Requiredness | Baseline extension keys | Notes |
| --- | --- | --- | --- |
| `logicir.verilog-hdl / signal` | `required` | `signal-types`, `packed-layout`, `path-flattening`, `pin-layout` | Defines Verilog signal width, signedness, packing, pins, and logical path flattening. |
| `logicir.verilog-hdl / module` | `required` | `module-binding`, `port-map`, `parameters`, `blackbox`, `module-registry` | Binds external or LU-backed targets to static Verilog module contracts. |
| `logicir.verilog-hdl / clocking` | `conditional-required` | `clock-reset`, `clock-domain`, `reset-policy` | Required for sequential/stateful/retained-current/cross-cycle semantics. |
| `logicir.verilog-hdl / state` | `conditional-required` | `state-registers`, `register-enable`, `reset-value` | Required when state or retained-current behavior is emitted as registers. |
| `logicir.verilog-hdl / combinational` | `conditional-required` | `combinational-assigns`, `primitive-op`, `expression-width-policy` | Required when primitive behavior is emitted as Verilog expressions or assigns. |
| `logicir.verilog-hdl / elaboration` | `required` | `static-only`, `generate-loop`, `unroll`, `specialize` | Verilog projection must guarantee static elaboration or fail with diagnostics. |
| `logicir.partition / structural-slices` | `conditional-required` | `slice-interface`, `rx-tx-bus`, `routing-policy`, `fan-in-policy` | Required when structural export anchors become HDL slice/module partition boundaries. |
| `logicir.diagnostics / unsupported-semantics` | `required` | `unsupported-push-policy`, `unsupported-retained-policy`, `unsupported-dynamic-fulfillment-policy` | Required diagnostics/lowering policy for software-like semantics that HDL cannot preserve directly. |

## Placement Rule

Feature catalog entries should not be the source of profile requiredness.
Requiredness belongs to profile contracts and matrices like this one. Feature
definitions own semantic meaning, extension keys, attachment rules, and payload
shape.
