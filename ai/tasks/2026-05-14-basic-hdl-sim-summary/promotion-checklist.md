# Promotion Checklist

Human review is required before promotion.

## Review Summary

- Reviewer:
- Review date:
- Decision: `promote-partial` / `needs-rework` / `archive-only`
- Task: `basic-hdl-sim-summary`
- Verification reviewed: yes / no

## Promotable Pieces

| Sandbox Path | Proposed Formal Path | Status | Notes |
| --- | --- | --- | --- |
| `summary-report.md` | `dev/basic-hdl-sim-summary.md` or roadmap appendix | candidate | Useful as promotion planning input. |
| `summary.json` | future planning data under `dev/` | candidate | Machine-readable route matrix. |
| Recommended promotion slice | `dev/roadmap.md` or focused plan | candidate | Promote only selected items after review. |

## Required Formal Updates

- Roadmap: add accepted HDL integration task and selected H6+ rounds.
- Dev docs: optionally add stable HDL route summary.
- Package plans: create focused plan for `packages/projectors/verilog`.
- Fixtures: decide which H1-H5 fixtures become formal regression fixtures.
- HDL environment docs: keep OSS CAD Suite / `iverilog` verification command.

## Required Verification After Promotion

- Markdown link/source path check.
- Formal package `yarn build`.
- Formal projector tests or fixture runner smoke.
- HDL smoke using `. E:\oss-cad-suite\environment.ps1; iverilog ...; vvp ...`.
- Confirm no formal package imports from `ai/tasks/`.

## Do Not Promote

- Whole summary sandbox.
- Whole H1-H5 task directories.
- Generated `.vvp` files.
- Task-local type subsets.
