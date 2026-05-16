# Core Theory Reference

当任务询问 LogicIR core schema 必须表达什么时使用本参考。

## Source Priority

- 完整理论源头：`docs/essay.md`。
- 工程执行摘录：`dev/operational-theory.md`。

## LogicIR Role

LogicIR 是 logical topology 的 structured-data representation。它本身不是
runtime、engine、generated code、Verilog HDL 或 JS API。Runtime、tool、
editor、analyzer 和 projector 消费 LogicIR。

## LU、LUI、Closure

- LU：在某个 boundary 与 scale 上被界定的 logic topology。
- LUI：某个 LU 在更大 topology 内的 local manifestation。
- Closure：挂在 LUI 上，用于局部 fulfill 一个 exposed requirement 的 wrapper；
  它可以包含 core，并 forward ordinary input contacts 与 push outputs。

## X/Y Execution Plane

- X = unit-level boundary drive。
  - Pull (-X)：sampling、reading、requesting、latching、gated progression。
  - Push (+X)：arrival、event、notification、delivery 直接推进 boundary。
- Y = manifestation mode。
  - Space (-Y)：present mapping，没有 retained own temporal trajectory。
  - Time (+Y)：retained progression、state、history 或 temporal identity。

四类 LU kinds：

- Combinational (-X, -Y)。
- Sequential (-X, +Y)。
- Stateful (+X, +Y)。
- Structural (+X, -Y)。

## Z Requirement Fulfillment

- Requirement 由 LU 内部 site/surface 声明。
- Fulfillment 是满足该 requirement 的 compatible logic。
- Z-0 是当前 manifestation 上的 local Closure fulfillment。
- Z-n 是通过 supply lineage 完成的 upstream resolution。
- Required logic 不能被偷塞进 ordinary in-plane data flow。

## Representation Obligations

Core schema 至少必须保存：

- Bounded LUs 与 local LUIs。
- Ports、endpoint refs、port discipline 和 in-plane connections。
- Port-level contact kind：`pull`、`push`、`property`，但不把 runtime/HDL
  realization 写入 core。
- Payload-level endpoint addressing，用于 object fields、array items、bus
  lanes、wrapped bus fields 等 nested payload structures；deep type/packing
  realization 留给 feature extensions 或 projectors。
- LU kind 与 kind-specific organization。
- Requirement services 与 requirement units。
- Fulfillment relations，包括 Closure 和 upstream lineage。
- Closure cores 与 same-key forwarded input / push-output declarations。
- LU-defined、external 和 requirement-backed manifestations 的 target refs。
- Representation 与 projection/runtime 的清晰分离。

## 当前 Core Draft Alignment

当前 v0 draft 用以下结构表达这些 obligation：

- Kind-specific `PortSurface` objects，按合法性提供 `inputs`、`outputs` 和
  独立 `result` slot。没有 port `role`；`result` 仍是 pull port，可以声明
  `pins`。Combinational ports 只有 `inputs + result`，没有 ordinary outputs。
- `Port.contact` 是 contact kind：`pull`、`push` 或 `property`。`property` 是
  retained-current 且有初始值。
- `EndpointRef.payloadPath` 用于 payload/bus/lane/result-pin addressing，
  不把 nested payload 变成 nested core pins。
- `EndpointRef.owner.kind === "boundary"` 表示当前 `LUCore` 自身边界；该 core
  可以是 root `LogicUnit.core`，也可以是任意 `Closure.core`。不要把任意
  closure 内部的自身边界称为 LU。
- 普通 connection 的方向是 `from -> to`，composition 的方向是
  `outlet -> anchor`。`from` 与 `outlet` 是 source，`to` 与 `anchor` 是
  destination。
- `LUCore.kindOrganization.kind` 是 execution-plane kind discriminator。
- `steps: LUIId[]` 是 minimal sequential organization；更丰富 control flow 属于
  feature/projection。
- Structural anchors/outlets 通过当前 core 的 `anchors`、`outlets`、
  `anchorFills`、`luiFills` 和 structural LUI `compositionSurface` 表达。
  Outlet 是 source composition value，anchor 是 destination composition slot；
  同一 structural LU 被实例化为 LUI 后，父级视角下
  该 LUI 的 anchors/outlets 极性与目标 LU 内部视角相反。
- Requirement services 可以是 inline 或 external contracts；fulfillment 是显式
  closure 或 upstream lineage relation。
- Extensions 挂在稳定 owner 或 relationship nodes；对 internal helper
  positions 使用 selector payload。
