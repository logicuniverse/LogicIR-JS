# LogicIR Projection Contracts

This directory defines projection-facing contracts. A projector is a declared capability set plus a lowering/realization pipeline, not just an unchecked conversion function.

Do not create a concrete capability draft until core/profile fields exist. Projection work should then define capability declarations, diagnostics, and safe-failure behavior against those fields.
