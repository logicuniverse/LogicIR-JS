# Open Questions And Interaction Prompts

Use this file to choose the next human/AI discussion. Each section is phrased
as material for interaction rather than as a conclusion.

## Stabilization Strategy

Question:

- Which draft layer should become stable first: core validator,
  type-system feature schema, JS/Python executable runtime subset, or HDL
  static skeleton?

Useful prompt:

```text
Review the current projection-stack exploration. Pick the smallest layer that
can be stabilized next, list the invariants it needs, and propose the exact
files/tests to change without expanding target-specific semantics into core.
```

## Extension Payload Naming

Question:

- Should `ExtensionPayload` remain as the generic core field name, or should
  the core type and docs move toward `ExtensionContent` / `payload` wording?

Context:

- The wire field is currently `payload`.
- The TS alias is `ExtensionPayload`.
- Changing the alias is low cost, but changing the wire field would have more
  migration cost and little immediate semantic gain.

Useful prompt:

```text
Evaluate the naming of ExtensionPayload versus ExtensionContent in the core
draft. Preserve wire compatibility unless there is a clear semantic win.
```

## Runtime Shape Guards

Question:

- Which protocol rules currently enforced by TypeScript shape should also have
  runtime validator diagnostics?

Candidates:

- Required map/list presence.
- Concrete union branch integrity.
- Composition leaf/value shape at unknown-input boundaries.
- Extension record payload type narrowing.
- Requirement nesting discipline beyond current structural checks.

Useful prompt:

```text
Audit schema/core/v0-draft/validator.ts against types.ts and VALIDATION.md.
Find TypeScript-only assumptions that need runtime diagnostics for JSON input.
```

## Type-System Compatibility

Question:

- How much assignability should the draft type-system feature own before it is
  considered stable?

Current coverage:

- primitive, record, array, tuple, union, named types.
- exact, assignable, widening, projector-adapter, custom policies.
- local connections, structural composition, closure/upstream/shared-service
  requirement compatibility.

Open edges:

- recursive/nominal type rules.
- variance decisions for arrays/tuples.
- discriminated unions versus simple ordered unions.
- adapter proof format.
- versioned feature namespace.

Useful prompt:

```text
Take the current type-system draft and propose a v0 stabilization boundary:
what is guaranteed, what is diagnostic-only, and what remains explicitly
future extension work?
```

## JS Runtime Semantics

Question:

- Which JS runtime behaviors should remain executable probes, and which should
  be promoted into a stable feature contract?

Open edges:

- async-iterator streaming versus final-yield subset.
- reentrant invocation and push scheduling.
- retained-current host observable contract.
- lifecycle hook ordering and idempotency.
- dynamic fulfillment consistency beyond invocation-boundary snapshots.
- typed error port payloads and event channel contracts.

Useful prompt:

```text
Review the JS runtime draft and executable smoke tests. Separate stable
contract semantics from probe implementation details, then propose the next
three tests that would most reduce ambiguity.
```

## Python Runtime Semantics

Question:

- Which Python-specific features need target-level contracts instead of being
  treated as implementation conveniences?

Open edges:

- already-running event loop behavior.
- async-generator streaming and cancellation.
- executor reuse and thread/process boundaries.
- queue/backpressure semantics.
- resource lifecycle ordering across LUIs and closures.
- exception/cancellation policy alignment with JS error policy.

Useful prompt:

```text
Review the Python runtime draft and lowerings. Identify where Python semantics
should intentionally diverge from JS, and where the same LogicIR feature should
project consistently to both.
```

## HDL Payload Flattening

Question:

- What should be the next HDL step after explicitly typed numeric lane
  part-selects?

Options:

- Add diagnostics for unsupported nested/non-numeric packed paths.
- Introduce a type-system-driven layout feature.
- Generate packed struct-like layouts from path schemas.
- Keep only explicit signal-types and require adapters for everything else.

Useful prompt:

```text
Design the next HDL payloadPath flattening increment. It must add diagnostics
or lowering without making HDL bit layout a core schema concern.
```

## HDL Structural Slices

Question:

- How far should `structural-slices` go before a separate distributed or HDL
  routing feature is needed?

Current coverage:

- slice plan derivation.
- static footprints.
- RX/TX interface metadata.
- conservative top-level wires/instances/stubs.
- single-provider typed links.
- ambiguous fan-in diagnostics and bitwise fan-in policies.

Open edges:

- routed buses.
- arbitration.
- child module placement inside slices.
- multi-hop links.
- stateful/sequential integration.
- payload serialization and channel addressing.

Useful prompt:

```text
Starting from structural-slices, propose a staged HDL/distributed routing
roadmap. Keep core fixed and classify every new semantic obligation as feature,
projection pass, or diagnostic.
```

## Conformance Suite Shape

Question:

- When should the smoke files split into dedicated fixture suites?

Signals that it is time:

- smoke files become too large to review.
- target semantics stabilize enough to name fixture categories.
- conformance matrix needs reusable positive/negative fixture modules.

Useful prompt:

```text
Refactor the current conformance smoke strategy into target fixture suites.
Keep the matrix executable and preserve all current expected diagnostic checks.
```

## Essay Synchronization

Question:

- Which results should eventually feed back into a clean essay/docs edition,
  and which are purely implementation details?

Candidates for clean docs:

- X-axis versus port interaction split.
- retained-current as contact capability.
- anchor/outlet structural composition.
- spatial slices and distributed projection as enabled by core, not forced by
  core.
- projection capability and required-extension safe failure.

Candidates not for essay core:

- JS/Python concrete cache/subscription mechanisms.
- HDL diagnostic codes and module skeleton details.
- smoke file organization.

Useful prompt:

```text
Compare this exploration pack against the submitted essay. List only the
conceptual clarifications worth carrying into a future clean docs revision,
and exclude implementation-specific projection details.
```
