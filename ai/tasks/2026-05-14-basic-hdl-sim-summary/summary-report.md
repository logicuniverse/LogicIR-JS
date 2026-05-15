# basic-hdl-sim Route Summary

## Summary

H1-H5 prove that the HDL route is viable. LogicIR fixtures can be projected to
Verilog HDL, simulated with `iverilog`, and rejected safely when software-only
semantics are required.

These rounds are baselines for review, not HDL projector law. A promoted
projector may use different emitters, feature payloads, module-library
resolution, structural lowering, or diagnostics if HDL semantics remain explicit
and simulation/diagnostic evidence is preserved.

The route is ready for human review as a set of projector seeds:

- H1 proves basic combinational module/testbench emission.
- H2 proves signal width metadata and vector arithmetic emission.
- H3 proves clock/reset/register state emission.
- H4 proves unsupported software semantics are rejected instead of silently
  degraded.
- H5 proves simple structural hierarchy through module instances and internal
  wires.

## Round Matrix

| Round | Capability Proven | Verification | Promotion Use |
| --- | --- | --- | --- |
| H1 combinational module | One-bit AND module and testbench. | `yarn verify` passed with `H1_PASS`. | Seed Verilog emitter and HDL smoke pattern. |
| H2 signal width / simple type | 4-bit unsigned add and wraparound. | `yarn verify` passed with `H2_PASS`. | Seed signal width helpers and vector fixture. |
| H3 sequential state | 4-bit register with active-high reset. | `yarn verify` passed with `H3_PASS`. | Seed clock/reset/register emitter. |
| H4 unsupported-semantics rejection | Required software invocation rejected. | `yarn verify` passed with structured rejection. | Seed capability checker/projector diagnostic path. |
| H5 structural module composition | `and3` hierarchy from two `and2` instances. | `yarn verify` passed with `H5_PASS` and 8 vectors. | Seed hierarchy emitter and structural validation. |

## Not A Full Projector Yet

Do not treat H5 as the HDL summary. H5 is the structural round, not an
integrated Verilog projector. The current route still lacks:

- One shared HDL feature payload model used by all rounds.
- One shared Verilog module/testbench emitter.
- One shared diagnostic model for rejection and validation failures.
- Formal profile/capability checking against architecture definitions.
- Formal module library resolution.
- Structural anchor/outlet lowering.
- Packed/signed signal semantics beyond the H2 unsigned case.
- Multi-clock and richer reset semantics.

## Recommended Promotion Slice

The first formal promotion should be narrow:

1. HDL signal declaration helper.
2. Module/testbench emission helper.
3. Register emitter seed.
4. Unsupported required feature diagnostic path.
5. Structural instance emission helper.
6. H1-H5 fixtures as formal regression candidates, after adapting them to
   accepted core/architecture/feature types.

H4 should be promoted alongside positive projection fixtures. A Verilog
projector that only emits successful modules but cannot reject unsupported
required features would violate the current profile discipline.

## Recommended Follow-Up Rounds

| Round | Why It Comes Next |
| --- | --- |
| H6 unified-verilog-projector | Merge H1/H2/H3/H5 emitter seeds under one projector surface. |
| H7 formal-hdl-diagnostic-model | Replace task-local thrown errors with structured diagnostics. |
| H8 anchor-outlet-structural-lowering | Align H5 structural payload with LogicIR structural anchors/outlets. |
| H9 multi-module-library-resolution | Make structural module reuse explicit and checkable. |
| H10 signed-and-packed-signal-semantics | Extend H2 beyond unsigned width metadata. |

## Do Not Promote

- Whole H1-H5 sandbox directories.
- Generated `.vvp` files.
- Task-local schema subsets.
- H5 structural payload as final schema.
- Thrown-error validation as final diagnostic model.
- Any H1-H5 emitter or lowering algorithm as mandatory projector architecture.

## Conclusion

`basic-hdl-sim` is viable enough to plan a formal `packages/projectors/verilog`
seed. The next engineering task should not add another isolated HDL feature; it
should unify the proven H1-H5 slices behind one projector API with explicit
capability checks and structured diagnostics.
