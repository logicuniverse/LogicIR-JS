# Design Notes

## Boundary

The catalog in this task is a replica of legacy stdlib node identity and
behavior evidence. It is not a new formal feature catalog.

Legacy stdlib behavior is evidence, not authority. The task proves a complete
baseline against old stdlib keys; formal promotion may split, rename, drop,
defer, or re-model nodes when current LogicIR feature/profile boundaries require
it.

Core schema remains target-neutral. JS method behavior, callbacks, event emits,
property state operations, async delay, and component composition helpers are
all task-local provider/runtime behavior.

Stdlib LogicUnit fixtures use plain external-target LUIs with no software
invocation feature. Provider selection is task-local execution data, not a
LogicIR feature manifest requirement.

## Latest-Schema Chain

Each smoke case uses this path:

```text
legacy stdlib key
  -> task-local catalog spec
  -> latest core LogicUnit fixture
  -> task-local interpreter plan
  -> stdlib provider
  -> output/emitted/state assertion
```

This prevents the task from validating only raw JS functions. The fixture
surface still uses current core `LogicUnit`, `LUI`, `Port`, and `Connection`
data shapes.

## Behavioral Notes

- `array.entries` returns a JS iterator in the old object-method path. The
  replica normalizes it to an array of `[index, value]` pairs so smoke evidence
  is serializable.
- `string.length` and `array.length` are implemented as property reads. The old
  object-method helper would try to call them as methods; this task records the
  intended template behavior rather than preserving that bug.
- Callback-based array nodes use function-valued task-local smoke inputs. This
  is runtime/provider evidence only, not a core schema proposal.
- Event passthrough nodes emit to `out`, matching the old passthrough helper.
- Property nodes use a task-local state map keyed by `stdlib:<node-key>`.
- Component nodes return serializable component composition objects under
  `root`, matching the legacy component return port.

## JS/TS Impact

The replica is directly relevant to a future software interpreter provider
package. Promotion should happen by extracting reviewed provider behavior,
coverage cases, and catalog rows into formal feature/tool/runtime packages.
The formal package should not inherit this task's catalog layout or provider
dispatch model by default.

## Verilog HDL Impact

Most replicated stdlib nodes are JS/software semantics. HDL projectors should
reject these nodes unless a future feature explicitly lowers a subset into HDL
operators, modules, or simulation-only helpers.
