# Promotion Checklist

Human review is required before any task output becomes project content.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`

## Promotable Pieces

Move only the smallest reviewed pieces into formal project locations.

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Required Formal Updates

- Package exports:
- Schema docs:
- Dev docs or plans:
- Fixtures:
- Examples:
- Tests:
- README/docs:
- Migration notes:

## Required Verification After Promotion

- `yarn build`
- `yarn test`
- JS/TS smoke or fixture command, when the promoted piece affects software
  runtime, tools, projectors, compilers, examples, or fixtures:
- Verilog HDL smoke command, when the promoted piece affects HDL features,
  projectors, examples, or fixtures:
  `. E:\oss-cad-suite\environment.ps1; iverilog <files>`
- Additional checks:

## Do Not Promote

List task files or ideas that should remain sandbox-only:

- 

Do not promote generated reports, exploratory logs, broad task README material,
or whole sandbox directories unless a human explicitly decides they are the
formal artifact.
