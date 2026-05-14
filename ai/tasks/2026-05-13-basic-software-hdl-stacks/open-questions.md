# Open Questions

These questions should be resolved before promoting any part of this pack into
formal package/schema/profile files.

## Resolved Working Assumptions

1. `basic-software` and `basic-hdl` are both feasible as initial primary stacks.
2. They should share the same target-neutral core and diverge through profiles,
   feature requirements, projection stages, and execution bindings.
3. `basic-software` proves runtime interpretation/provider realization.
4. `basic-hdl` proves static lowering and Verilog-oriented projection rigor.
5. Circuit/netlist, mechanical assembly, product enclosure, and heterogeneous
   system realization remain future probes, not current stack targets.

## Naming

1. Should the HDL stack be named `basic-hdl` or `basic-verilog-hdl`?
2. Should software use `basic-software`, `software-core`, or another name?
3. Which additional shared feature namespaces should be introduced as the pack
   grows, beyond `logicir.type-system`, `logicir.value`, `logicir.fulfillment`,
   `logicir.execution`, `logicir.partition`, and `logicir.diagnostics`?

## Profile Boundaries

1. Is `basic-software-plan` a real projection artifact, or can direct
   interpretation use `ProjectionProfile = identity` and rely mostly on
   execution profile?
2. Should generated JS/Python/etc. use the same `basic-software-plan` projection
   profile plus target emitters, or separate projection profiles per language?
3. Does HDL simulation need its own execution profile now, or should it wait
   until Verilog artifact shape stabilizes?

## Feature Requiredness

1. Is `logicir.type-system / core` required for basic software, or only
   recommended?
2. Is `logicir.type-system / core` always required for basic HDL?
3. Which retained-current realization modes are mandatory in basic software?
4. Should dynamic fulfillment beyond static startup be outside the initial
   basic software stack?
5. Should basic HDL allow any push-notifiable contact without explicit clocked
   lowering?

## Feature Relations

1. Should future feature catalog entries declare `requires` dependencies on
   other features, or should profiles remain the only source of feature
   composition?
2. Should feature catalog entries declare `conflictsWith` for mutually exclusive
   semantics such as incompatible scheduler or routing policies?
3. What version selector shape is needed if a feature dependency requires a
   range rather than a pinned feature version?

## Provider Contracts

1. What is the minimum data shape for an execution binding?
2. Should provider contracts live in execution profiles or in separate provider
   manifests referenced by execution profiles?
3. Should local functions, remote services, and generated-code imports share one
   provider identity shape?
4. How should provider capability declarations be verified?

## Projection Artifacts

1. What is the minimal software executable plan shape?
2. What is the minimal Verilog artifact manifest shape?
3. Should diagnostics be separate artifacts or embedded in projection result
   envelopes?

## Future Reference Probes

1. What is the smallest circuit/netlist projection profile that can stress-test
   core topology without becoming a current project target?
2. Which circuit concepts belong in future features, such as component binding,
   pin map, footprint, electrical rules, net classes, and EDA export adapters?
3. Can mechanical assembly or product enclosure projections reuse LogicIR
   structural topology plus domain extensions, or do they require a separate
   model that only references LogicIR units?
4. What criteria would justify promoting heterogeneous system realization from
   north-star probe to an actual stack exploration?

## Current Code Alignment

1. Which old runtime hooks are pure observation versus behavior-changing
   providers?
2. Should old `Thenable` be renamed to `Continuation` in future software
   profile docs?
3. How should old `Composable` migration map to structural anchors/outlets in
   examples?
4. Which current JS runtime behaviors should remain implementation details
   rather than profile requirements?
