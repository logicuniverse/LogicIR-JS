# Code Drafts

Status: exploration material, not active schema.

This folder contains TypeScript data-model drafts for the two proposed stacks.
The files intentionally live under `docs/workspace/explorations/` so they can be
used as later human/AI discussion material before any promotion into active
`schema/`.

These profile drafts name concrete feature identities. Concrete LogicIR examples
should declare those identities in `LogicUnit.features` and refer to them from
extension records with local `featureKey` aliases. Optional feature versions
belong in the manifest; feature-wide behavior options should be modeled as
feature-owned extensions or profile data, not generic manifest config.

## Files

- `architecture-types.ts`: minimal profile/stack/config types derived from
  `schema/ARCHITECTURE.md`.
- `features.ts`: shared, basic-software, and basic-hdl feature catalog entries.
- `basic-software.ts`: IR pipeline, projection, execution, and stack draft for
  portable software realization.
- `basic-hdl.ts`: IR pipeline, Verilog projection, optional simulator execution,
  and stack draft for basic HDL.
- `stacks.ts`: registry exports for stacks, profiles, and feature catalog.
- `smoke.ts`: small runtime assertions for profile/stack wiring.

## Typecheck

From the package root:

```powershell
.\node_modules\.bin\tsc.cmd --strict --noEmit --target ES2022 --module ESNext --moduleResolution node docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\architecture-types.ts docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\features.ts docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\basic-software.ts docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\basic-hdl.ts docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\stacks.ts docs\workspace\explorations\2026-05-13-basic-software-hdl-stacks\code\smoke.ts
```

## Smoke Check

The smoke check is deliberately small. It verifies stack/profile wiring, that the
HDL build and simulation variants differ as intended, and that every referenced
feature has a catalog entry.
