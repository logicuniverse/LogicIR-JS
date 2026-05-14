# Tracked Patch Extract

This file extracts the useful ideas from the automatic run's tracked-document
edits into readable exploration material. The intermediate patch capture was
used only to build this extract and is not kept as a long-term artifact. Some
edits describe useful development-doc policy; other edits only make sense if the
archived automatic-run schema/projection files are reviewed and reintroduced.
Paths from `docs/workspace/` and old `schema/extensions` routes are preserved
below as historical patch evidence, not as current repository structure.

## Edit Inventory

The tracked-document edits touched:

- `.gitignore`
- `docs/workspace/README.md`
- `docs/workspace/schema-principles.md`
- `docs/workspace/skills/logicir-schema-designer/references/projection-targets.md`
- `docs/workspace/skills/logicir-schema-designer/references/schema-protocol.md`
- `schema/README.md`
- `schema/core/v0-draft/README.md`
- `schema/extensions/README.md`
- `schema/migrations/legacy-tsjs-v1/README.md`
- `schema/profiles/README.md`
- `schema/projection/README.md`

## Per-File Coverage

This table makes the extraction explicit so the intermediate patch capture does
not need to remain as a long-term artifact.

| Edited file | Useful content extracted here | Apply directly later? |
| --- | --- | --- |
| `.gitignore` | `tmp/` is generated smoke output and should not become source. See Directly Useful Workspace Policy. | Yes, as a tiny reviewed cleanup if generated smoke output continues to appear. |
| `docs/workspace/README.md` | Add `explorations/` as a workspace category for unconfirmed automatic drafts and staged discussion material. See Directly Useful Workspace Policy. | Superseded by the root-level `ai/tasks/` sandbox. |
| `docs/workspace/schema-principles.md` | Python runtime and type-system are explicit feature/projection axes; feature identity should be `namespace + key` plus extension key. See Useful Schema-Principles Updates. | Yes, but only after human confirmation as stable policy. |
| `docs/workspace/skills/logicir-schema-designer/references/projection-targets.md` | Expand projection assessment to JS/TS, Python, type-system, and Verilog HDL; add screening questions for Python and type-system pressure. See Useful Skill Reference Updates. | Yes, as a small policy/reference update. |
| `docs/workspace/skills/logicir-schema-designer/references/schema-protocol.md` | Clarify feature identity examples: feature `logicir.js-runtime / core` with extension key `async-policy`, etc. See Directly Useful Workspace Policy and Useful Schema-Principles Updates. | Yes, as a small protocol wording update. |
| `schema/README.md` | Index of generated companion artifacts. See Archived Draft Index Material. | No, not until archived files are reviewed and restored. |
| `schema/core/v0-draft/README.md` | File list for core examples/validator drafts. See Archived Draft Index Material. | No, not while these files live only in exploration artifacts. |
| `schema/extensions/README.md` | File list and validator-status summary for extension drafts. See Archived Draft Index Material and Type-System/Runtime evidence in `results-map.md`. | No, not while extension draft files are archived. |
| `schema/migrations/legacy-tsjs-v1/README.md` | Old prototype to new schema mapping: Pull/Push/Property/SequentialStep/Composable/provider patterns. See Useful Legacy Migration Notes. | Yes, after review; it is migration guidance rather than formal package code. |
| `schema/profiles/README.md` | Split `software-runtime` into `js-runtime` and `python-runtime` bundle names. See Directly Useful Workspace Policy. | Yes, if profile wording is updated alongside feature-policy docs. |
| `schema/projection/README.md` | Projection stack roadmap and completion criteria, plus detailed status claims tied to archived drafts. See Projection Roadmap Material. | Roadmap yes as a reviewed plan; detailed formal README status no. |

Coverage decision:

- All useful policy, migration, index, and roadmap content has been extracted
  into this document or into `results-map.md`.
- Exact patch mechanics are no longer needed after this file is reviewed.
- Hunk-level text that only listed archived files as accepted project files is
  intentionally not preserved as formal documentation.

## Directly Useful Development-Doc Policy

These points are useful independent of whether the archived automatic-run code
is reintroduced:

- Keep useful automatic-run stage results under `ai/tasks/`; they are useful
  discussion material but not ready to become canonical schema or projection
  files.
- Treat Python runtime as a first-class projection assessment axis when a
  schema or feature change touches software runtime semantics.
- Treat type-system validation as a first-class feature/projection concern:
  payload types, path schemas, port/requirement/composition compatibility, and
  adapter evidence remain feature data, not core.
- Use feature identity as `namespace + key` for the capability unit, then use
  extension `key` for the concrete payload kind inside that feature. Examples:
  `logicir.js-runtime / core` plus `async-policy`, or
  `logicir.verilog-hdl / core` plus `clock-reset`.
- Keep application bundle/profile names outside canonical LogicIR objects, but
  use names such as `js-runtime`, `python-runtime`, `verilog-hdl`, and
  `type-system` as convenient application-layer groupings.
- Ignore or archive temporary smoke output such as `tmp/`; it should not become
  a durable source artifact.

These ideas have now been reflected in the exploration mechanism itself. They
can later be copied into stable development docs if the human confirms them.

## Useful Skill Reference Updates

The patch proposed expanding the projection target reference from JS/TS +
Verilog only to JS/TS + Python + type-system + Verilog.

Useful extraction:

- Python runtime details belong in feature extensions or projector
  implementation, not core:
  coroutine/generator/async-generator invocation, context managers,
  asyncio/task/thread/process/queue/backpressure mechanics, dependency
  injection/contextvars/late-bound services, exception/cancellation policy, and
  Python type hints.
- Type-system extensions may be required by validators or projectors, but they
  remain feature data:
  payload type lookup, path-schema validation, port/connection compatibility,
  requirement compatibility proofs, composition anchor/outlet type matching,
  and adapter evidence.
- For every proposed core field, add these screening questions:
  does Python need this only because of runtime implementation, and does a
  type-system validator need this only for compatibility checking?

Recommended later action:

- If the human wants the local `logicir-schema-designer` skill to guide future
  agents with Python/type-system awareness, update
  `dev/skills/logicir-schema-designer/references/projection-targets.md`
  from these bullets in a small reviewed patch.

## Useful Schema-Principles Updates

The patch proposed adding Python/type-system language to
`schema-principles.md`.

Useful extraction:

- JS runtime, Python runtime, Verilog HDL, and type-system concerns should be
  separate features rather than a single broad `software-runtime` feature.
- Python runtime feature scope:
  coroutine/generator, context manager, task/thread/process,
  queue/backpressure, exception/cancellation.
- Type-system feature scope:
  payload types, path schemas, port/requirement/composition compatibility,
  adapter proof.
- Projection target discipline should explicitly mention Python when a change
  touches software runtime abstractions.

Recommended later action:

- Promote these bullets into `schema-principles.md` only as stable policy, not
  as evidence that the archived Python runtime lowering is accepted.

## Useful Legacy Migration Notes

The patch proposed a concise mapping from old TS/JS prototype concepts to the
current schema direction.

Useful extraction:

- Old `PullPort` / `PushPort` map to
  `Port.interaction.pullReadable` and `Port.interaction.pushNotifiable`.
- Old `PropertyPort` maps to `pullReadable: true`,
  `pushNotifiable: true`, and `retainedCurrent: true`; cache/store/subscribe
  mechanics belong in runtime feature realization.
- Old `SequentialStep` is evidence for ordered progression, but core keeps only
  `kindOrganization.steps: LUIId[]`; branch/guard/return/go-back/await/promise
  behavior belongs in features or lowering.
- Old `Composable` maps to structural composition concepts:
  `exportAnchors`, `externalOutlets`, `compositionSurface.outlets`,
  `compositionSurface.anchors`, `exportAnchorFills`, and `luiFills`.
- Old provider/dependency/sovereign-source patterns map to explicit requirement
  services plus closure or upstream fulfillment relations.
- Old projector/runtime callback and plugin mechanics belong in projection
  contracts or feature extensions, not core.

Recommended later action:

- Move this mapping into `schema/migrations/legacy-tsjs-v1/README.md` once the
  human confirms it as useful migration guidance.

## Archived Draft Index Material

Several patch hunks added file lists to formal `schema/` READMEs. Those lists
are no longer correct for formal `schema/`, because the uncommitted files have
been archived under `artifacts/unsubmitted-working-tree/schema/`.

Still useful as exploration index:

- Core archived drafts:
  examples, validation checklist, validator, validator smoke.
- Extension archived drafts:
  JS runtime, Python runtime, type-system, Verilog HDL, draft payload types,
  draft extension validator.
- Projection archived drafts:
  capability types, preflight, target plans, lowering, preflight smoke,
  JS/Python runtime smoke, conformance fixtures, conformance smoke,
  conformance matrix, implementation gaps.

Recommended later action:

- Do not apply README file-list hunks until corresponding files are reviewed
  and restored to formal `schema/`.
- If only the index is useful, keep it in this exploration pack instead of
  formal schema docs.

## Projection Roadmap Material

The largest patch hunk added a roadmap to `schema/projection/README.md`.
Because it references archived automatic-run files, it should remain
exploration material for now.

Useful staged roadmap:

1. Core validator:
   implement `validateLogicUnit`, use minimal examples as positive fixtures,
   add negative fixtures for interactions, endpoint direction, target overlap,
   structural composition, fulfillment, closure forwarding, reachability, and
   unsupported required extensions.
2. Type-system feature:
   formalize payload types, path schemas, type lookup, connection
   compatibility, composition compatibility, requirement compatibility, and
   adapter evidence.
3. JS runtime projection:
   formalize async policy, retained-current realization, dynamic fulfillment,
   lifecycle, error policy, capability diagnostics, target planning, and
   executable lowering only for declared subsets.
4. Python runtime projection:
   mirror the JS structure where semantics align, but keep coroutine,
   generator, resource lifecycle, concurrency, queue/backpressure, and
   cancellation mechanics in Python feature/projector code.
5. Verilog HDL projection:
   require signal type or compatible type-system evidence, handle clock/reset
   outside core, keep module binding and structural slice lowering in HDL
   feature/projector layers, and emit diagnostics for unsupported dynamic or
   non-static constructs.
6. Cross-target conformance:
   maintain a fixture matrix with core-only, type-system, JS/Python runtime,
   and HDL examples; record expected diagnostics per target.

Useful completion criteria:

- Core validation implemented and tested.
- Type-system feature schema formalized and validated.
- JS, Python, and Verilog projector capability declarations exist.
- Each projector rejects unsupported required extensions with diagnostics.
- Each projector has positive and negative fixtures for claimed support.
- The same LogicIR core object can be checked against target capabilities
  before lowering.

Recommended later action:

- Turn this roadmap into a reviewed plan under `dev/plans/` before
  reintroducing the archived implementation files.

## Not Worth Applying Directly

These patch parts should not be applied as-is:

- Active `schema/README.md`, `schema/core/v0-draft/README.md`,
  `schema/extensions/README.md`, and `schema/projection/README.md` file lists
  that reference archived files as if they were active.
- Detailed projection status claims that imply archived automatic lowerings are
  accepted production work.
- Any wording that makes JS/Python/HDL implementation details sound like core
  schema obligations.

## Recommended Next Review Path

1. Review `schema-principles` and skill-reference bullets first; they are small
   and policy-level.
2. Review legacy migration mapping next; it is conceptually useful and low
   risk.
3. Convert the projection roadmap into a plan, not formal README text.
4. Reintroduce archived code only one layer at a time, starting with core
   examples/validator or type-system payload validation.
