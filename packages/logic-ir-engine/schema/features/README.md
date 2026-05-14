# LogicIR Feature Schemas

Feature schemas define namespaced semantic capabilities that attach additional
contracts to LogicIR core nodes through extension records.

Feature schemas are not core schema. They may be required by profiles, projection
targets, validators, or execution environments, but unsupported required feature
contracts must be diagnosed rather than silently ignored.

Current drafts:

- [`type-system/v0-draft`](type-system/v0-draft): target-neutral algebraic
  payload and compatibility types.

