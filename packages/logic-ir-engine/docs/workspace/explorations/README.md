# Explorations

This directory stores working exploration packs for LogicIR design and
projection work. An exploration pack is not a final specification. It is a
structured set of evidence, decisions, open questions, and follow-up prompts
that lets a later human/AI session continue from the current state without
reconstructing the whole chat history.

Use explorations when work has produced useful partial results, draft
implementations, or target-specific probes, but the result should remain
discussion material rather than canonical protocol text.

## Packs

- [2026-05-13 Basic Software And Basic HDL Stacks](2026-05-13-basic-software-hdl-stacks/README.md):
  draft stack/profile/feature breakdown for the first two target stacks using
  the latest `schema/ARCHITECTURE.md` model.
- [2026-05-13 Latest Schema Software Runtime](2026-05-13-latest-schema-software-runtime/README.md):
  current-core/current-architecture software runtime replay of the old JS/TS
  runtime behavior, kept as executable exploration material.
- [2026-05-13 Projection Stack Goal](2026-05-13-projection-stack-goal/README.md):
  consolidation of the current type-system, JS runtime, Python runtime, and
  Verilog HDL projection goal.

## Rules

- Keep canonical schema statements in `schema/` and theory extracts in
  `docs/workspace/operational-theory.md` / `schema-principles.md`.
- Use exploration files to merge context, record tradeoffs, and pose next
  questions.
- Link to source artifacts instead of duplicating large code or reference
  documents.
- Clearly mark draft status and remaining risk.
