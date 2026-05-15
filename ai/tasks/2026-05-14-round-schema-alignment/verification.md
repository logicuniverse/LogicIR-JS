# Verification

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `yarn verify` before alignment | failed | Red check: S1 lacked architecture schema imports while rounds still copied schema-owned types. |
| `yarn verify` in S1-S5 | passed | All basic-software-interpreter rounds typechecked, built, and ran smoke verification after schema import alignment. |
| `yarn verify` in H1-H5 | passed | H1/H2/H3/H5 typechecked, emitted Verilog, and passed `iverilog`/`vvp`; H4 typechecked, built, and rejected unsupported software invocation. |
| `yarn verify` after alignment | passed | Alignment audit checked all 10 S/H round task directories. |

## Expected Checks

- No S1-S5/H1-H5 task-local `src/types.ts` redefines core schema types such as
  `LogicUnit`, `Port`, `LUI`, `Connection`, or `ExtensionRecord`.
- No task-local `src/types.ts` redefines architecture schema types such as
  `FeatureDefinition`, `StackDefinition`, or profile definitions.
- Every checked task imports `@logic-universe/logic-ir-core`.
- Every checked task with current `src/architecture.ts` imports
  `@logic-universe/logic-ir-architecture`; rounds without architecture data are
  not required to create one.
- Every checked task remains `ready-for-review` and records passed
  `yarn verify`.

## Known Gaps

- This verifies TypeScript schema ownership, not final feature payload design.
