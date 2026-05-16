# Schema Protocol Reference

设计 schema evolution、compatibility、feature extensions、architecture
definitions、profiles、stacks、tools、projectors、engines、providers 或
capability declarations 时使用本参考。

## 长期协议模型

把 LogicIR schema 当成长生命周期协议：

- 稳定 semantic core。
- Serializable architecture definitions，用于描述 features、profiles、stacks、
  capabilities、provider contracts、provider capabilities、stages、policies 和
  execution bindings。
- Namespaced features 与 feature-scoped extensions。
- Tool、projector、engine 和 provider 的显式 capability declarations。
- 当 declared semantics 无法保持时安全失败，而不是静默降级。

## Core 与 Feature Extension

Core schema 只包含 target-neutral logical topology semantics。判断一个字段是否
属于 core 的标准是：移除或改变它，是否会改变这个 LogicIR object 是否仍是同一个
logical topology。

Feature extensions 承载 target、host、runtime、tool 或 domain constraints。
Feature identity 是语义能力单元；具体 payload kind 是该 feature 下的 extension
point。例如：

- Feature `logicir.type-system / core`，extension point `payload-type`。
- Feature `logicir.software-runtime / core`，extension point `completion-policy`。
- Feature `logicir.verilog-hdl / core`，extension point `clock-reset`。
- Feature `logicir.distributed-runtime / core`，extension point `placement`。
- Feature `logicir.verification / assertions`，extension point `assertion`。

Profile 和 stack definitions 是 architecture content，不属于 canonical LogicIR
object model。Profile 是 single-layer compatibility contract；stack 组合 profile
形成 user-facing workflow。

显式资源管理、副作用纪律、no-GC 内存策略、catalog database、dependency index 和
AI tool-routing index 默认也不属于 core。它们应先作为 feature/profile/tooling
问题处理；只有当它们暴露缺失的 target-neutral topology relation 时，才考虑
core 变化。

## Architecture Definitions

- Architecture schema 保持 pure JSON-serializable data。
- 不使用 document wrapper、factory、helper function、callback、provider、
  runtime implementation 或 TypeScript generic / utility type 作为 schema
  abstraction。
- Schema authoring source 中，优先使用显式 serializable object、union、
  intersection、array 和 index-signature types；不要用 `Base<T>`、
  `Record<K, V>`、`Exclude<T, U>`、`Pick`、`Omit` 或 `Partial` 这类 TS-only
  convenience。
- Registry identity、namespace、version、indexing、persistence、package layout
  和 database keys 保持在 architecture content shapes 之外。
- Feature definitions 拥有 extension points。每个 extension point 有一个
  attachment kind 和一个 payload schema reference。
- Profiles 定义 requiredness、stages、diagnostics、target constraints、
  provider contracts 和 bindings。
- Stacks 组合 profile identities；stack 本身不是 capability proof。

## Features 与 Extensions

- 每个 feature 应有稳定 identity，通常是 `namespace + key`。
- Application-layer bundle 可以组合 feature，但 projector 必须解析到具体
  feature identities。
- 每个 `LogicUnit` 声明本地 feature use manifest，inline 保存 feature
  namespace/key/version。
- Extension record 通过 local `featureKey` 引用该 manifest，并使用已解析
  feature 下的 extension key。
- 指向外部 namespace/key contract 的 reference 可以携带 optional version。
- Feature definitions 拥有 extension-point schemas，包括 payload required 和
  optional fields。
- Profiles 把 feature 与 extension-point contracts 标记为 `required`、
  `conditional-required`、`recommended` 或 `optional`。
- `conditional-required` 表示当 LogicIR input 使用相关语义条件时必须支持，
  否则不要求支持。
- Unsupported required 或 conditional-required contract 必须失败并返回
  diagnostic。
- Unsupported recommended 或 optional contract 只有在 profile semantics 保持
  不变时才可忽略。
- Extension 挂到稳定 owner 或 relationship nodes。对 sequential `steps`、
  composition leaves/values、pin children、`kindOrganization` branch internals
  这类 internal helper position，应在 owner-level payload 使用 selector 字段，
  不要让 helper 自己挂 extension array。
- Kind-specific metadata 应挂到 `LUCore.extensions`；`kindOrganization` 保持
  target-neutral minimal organization skeleton。

## Versioning

- Core schema stable release 默认做 additive changes。
- Breaking core semantic changes 需要 major version。
- Breaking changes 需要 migration 或 compat-layer notes。
- Profiles、stacks、features 和 provider contracts 可以在 catalog/registry 层
  独立 version，但必须声明 compatible core version ranges，并在需要时声明具体
  feature identities。

## Capability Sets

Tools、projectors、execution engines 和 providers 必须声明相关 capabilities：

- Supported core schema versions。
- Supported concrete features。
- 从 local `featureKey` alias 到 concrete feature identity 的 feature use manifest
  resolution。
- Supported extension points，并按 selected profile 的 requiredness contracts
  检查。
- Supported LU kinds。
- Supported fulfillment forms。
- Target constraints 和 known semantic limits。
- 只有在把 profile 解析成 concrete features、stages、policies、provider
  contracts 和 bindings 后，才能声明 supported profiles。

Implementation 在 required schema semantics 或 profile contracts 超出 declared
capability 时必须拒绝工作。

## Plan Checklist

每个 schema/projection plan 必须包含：

- Old implementation reference points。
- Theory mapping。
- Core/feature/extension/profile/stack boundary。
- Required、conditional-required、recommended 或 optional contract status。
- Tool、projector、engine 和 provider capability changes。
- JS/TS runtime impact。
- Verilog HDL impact。
- Compatibility 和 migration strategy。
