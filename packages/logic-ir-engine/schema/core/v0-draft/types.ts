/**
 * LogicIR core schema v0 draft.
 *
 * This file is the TypeScript authoring source for target-neutral protocol data
 * shapes. It must not contain runtime/projector implementation mechanics.
 */

// --- Protocol / Identity / Extension ---

export const LOGIC_IR_CORE_SCHEMA_VERSION = '0.0.0-draft' as const;

export type LogicIRCoreSchemaVersion = typeof LOGIC_IR_CORE_SCHEMA_VERSION;

/**
 * `id` values are opaque machine/editor identities used for storage, graph
 * references, diffing, and migration. They must not encode semantic meaning.
 */
export type LogicIRId = string;
export type LUId = LogicIRId;
export type LUIId = LogicIRId;
export type ConnectionId = LogicIRId;
export type ClosureId = LogicIRId;

/**
 * `key` values are stable semantic names in a declared namespace or contract
 * surface. Do not use keys for visual-editor-generated graph node identity.
 */
export type LogicIRKey = string;
export type PortKey = LogicIRKey;
export type PinKey = LogicIRKey;
export type RequirementServiceKey = LogicIRKey;
export type RequirementUnitKey = LogicIRKey;
export type ExternalRequirementServiceNamespace = string;
export type ExternalRequirementServiceKey = LogicIRKey;
export type ExternalTargetNamespace = string;
export type ExternalTargetKey = LogicIRKey;
export type FeatureNamespace = string;
export type FeatureKey = LogicIRKey;
export type ExtensionKey = LogicIRKey;
export type ExtensionPayload = unknown;
export type CompositionAnchorKey = LogicIRKey;
export type CompositionOutletKey = LogicIRKey;
export type CompositionFieldKey = LogicIRKey;

export type ExtensionRequirement = 'optional' | 'required';

export type FeatureRef = {
  namespace: FeatureNamespace;
  key: FeatureKey;
};

export type ExtensionRecord = {
  feature: FeatureRef;
  key: ExtensionKey;
  requirement: ExtensionRequirement;
  payload: ExtensionPayload;
};

export type WithExtensions = {
  extensions?: ExtensionRecord[];
};

// --- X: Boundary Interaction ---

export type PortBoundary = 'input' | 'output';
export type PortRole = 'primary-result';

export type PortInteraction = {
  pullReadable: boolean;
  pushNotifiable: boolean;
  retainedCurrent: boolean;
};

export type PinSet =
  | { kind: 'indexed'; count: number }
  | { kind: 'keyed'; keys: PinKey[] };

export type Port = WithExtensions & {
  interaction: PortInteraction;
  boundary: PortBoundary;
  role?: PortRole;
  pins?: PinSet;
};

/**
 * A port surface has one `PortKey` namespace. `input` and `output` are
 * `Port.boundary` values, so the same owner cannot declare both input `foo`
 * and output `foo`.
 */
export type PortSurface = Record<PortKey, Port>;

export type PortOwner =
  | { kind: 'lu' }
  | { kind: 'lui'; luiId: LUIId }
  | { kind: 'closure'; closureId: ClosureId };

export type PayloadPathSegment = PinKey | number;
export type PayloadPath = PayloadPathSegment[];

export type EndpointRef = {
  owner: PortOwner;
  portKey: PortKey;
  payloadPath?: PayloadPath;
};

export type Connection = WithExtensions & {
  from: EndpointRef;
  to: EndpointRef;
};

// --- Y: Manifestation / Organization ---

export type LUKind =
  | 'combinational'
  | 'sequential'
  | 'stateful'
  | 'structural';

export type LUITarget =
  | { kind: 'lu'; luId: LUId }
  | {
      kind: 'external';
      namespace: ExternalTargetNamespace;
      key: ExternalTargetKey;
    }
  | {
      kind: 'requirement';
      serviceKey: RequirementServiceKey;
      unitKey: RequirementUnitKey;
    };

export type LUIBase = WithExtensions & {
  target: LUITarget;
  ports: PortSurface;
  fulfillments: Record<
    RequirementServiceKey,
    RequirementServiceFulfillment
  >;
};

export type StructuralCompositionContract = WithExtensions & {
  outlets: CompositionOutletKey[];
  anchors: Record<CompositionAnchorKey, CompositionAnchor>;
};

export type StructuralLUI = LUIBase & {
  kind: 'structural';
  compositionSurface: StructuralCompositionContract;
};

export type CombinationalLUI = LUIBase & { kind: 'combinational' };

export type SequentialLUI = LUIBase & { kind: 'sequential' };

export type StatefulLUI = LUIBase & { kind: 'stateful' };

export type LUI =
  | StructuralLUI
  | CombinationalLUI
  | SequentialLUI
  | StatefulLUI;

export type CompositionAnchorShape = 'single' | 'collection' | 'map';

export type CompositionAnchor = {
  shape: CompositionAnchorShape;
  required: boolean;
};

export type CompositionExportAnchor = {
  required: boolean;
};

export type CompositionLeaf =
  | {
      kind: 'lui-outlet';
      luiId: LUIId;
      outletKey: CompositionOutletKey;
    }
  | {
      kind: 'external-outlet';
      outletKey: CompositionOutletKey;
    }
  | { kind: 'empty' };

export type CompositionValue =
  | CompositionLeaf
  | { kind: 'collection'; items: CompositionLeaf[] }
  | {
      kind: 'map';
      entries: Record<CompositionFieldKey, CompositionLeaf>;
    };

export type LUCoreBase = WithExtensions & {
  ports: PortSurface;
  connections: Record<ConnectionId, Connection>;
  closures: Record<ClosureId, Closure>;
};

export type CombinationalLUCore = LUCoreBase & {
  kindOrganization: { kind: 'combinational' };
  luis: Record<LUIId, CombinationalLUI>;
};

export type SequentialLUCore = LUCoreBase & {
  kindOrganization: { kind: 'sequential'; steps: LUIId[] };
  luis: Record<
    LUIId,
    CombinationalLUI | StatefulLUI | SequentialLUI
  >;
};

export type StatefulLUCore = LUCoreBase & {
  kindOrganization: { kind: 'stateful' };
  luis: Record<LUIId, CombinationalLUI | StatefulLUI>;
};

export type StructuralLUCore = LUCoreBase & {
  kindOrganization: {
    kind: 'structural';
    exportAnchors: Record<CompositionAnchorKey, CompositionExportAnchor>;
    externalOutlets: Record<CompositionOutletKey, CompositionAnchor>;
    exportAnchorFills: Record<CompositionAnchorKey, CompositionLeaf>;
    luiFills: Record<
      LUIId,
      Record<CompositionAnchorKey, CompositionValue>
    >;
  };
  luis: Record<LUIId, CombinationalLUI | StatefulLUI | StructuralLUI>;
};

// --- Z: Requirement Fulfillment ---

export type RequirementFulfillmentScope =
  | 'independent-units'
  | 'shared-service';

export type RequirementSurface = Record<
  RequirementServiceKey,
  RequirementServiceEntry
>;

export type PlainRequirementSurface = Record<
  RequirementServiceKey,
  PlainRequirementServiceEntry
>;

export type RequirementServiceEntry =
  | InlineRequirementServiceEntry
  | ExternalRequirementServiceEntry;

export type PlainRequirementServiceEntry =
  | InlinePlainRequirementServiceEntry
  | ExternalRequirementServiceEntry;

export type InlineRequirementServiceEntry = {
  kind: 'inline';
  service: RequirementService;
};

export type InlinePlainRequirementServiceEntry = {
  kind: 'inline';
  service: PlainRequirementService;
};

export type ExternalRequirementServiceEntry = {
  kind: 'external';
  namespace: ExternalRequirementServiceNamespace;
  key: ExternalRequirementServiceKey;
};

export type RequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: Record<RequirementUnitKey, RequirementUnit>;
};

export type PlainRequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: Record<RequirementUnitKey, PlainRequirementUnit>;
};

export type RequirementUnitBase = {
  ports: PortSurface;
  requirements: PlainRequirementSurface;
};

export type PlainRequirementUnitBase = {
  ports: PortSurface;
};

export type CombinationalRequirementUnit = RequirementUnitBase & {
  kind: 'combinational';
};

export type SequentialRequirementUnit = RequirementUnitBase & {
  kind: 'sequential';
};

export type StatefulRequirementUnit = RequirementUnitBase & {
  kind: 'stateful';
};

export type StructuralRequirementUnit = RequirementUnitBase & {
  kind: 'structural';
  compositionSurface: StructuralCompositionContract;
};

export type RequirementUnit =
  | CombinationalRequirementUnit
  | SequentialRequirementUnit
  | StatefulRequirementUnit
  | StructuralRequirementUnit;

export type PlainCombinationalRequirementUnit =
  PlainRequirementUnitBase & { kind: 'combinational' };

export type PlainSequentialRequirementUnit =
  PlainRequirementUnitBase & { kind: 'sequential' };

export type PlainStatefulRequirementUnit =
  PlainRequirementUnitBase & { kind: 'stateful' };

export type PlainStructuralRequirementUnit =
  PlainRequirementUnitBase & {
    kind: 'structural';
    compositionSurface: StructuralCompositionContract;
  };

export type PlainRequirementUnit =
  | PlainCombinationalRequirementUnit
  | PlainSequentialRequirementUnit
  | PlainStatefulRequirementUnit
  | PlainStructuralRequirementUnit;

export type RequirementServiceFulfillment = WithExtensions &
  (IndependentUnitsFulfillment | SharedServiceFulfillment);

export type IndependentUnitsFulfillment = {
  kind: 'independent-units';
  units: Record<RequirementUnitKey, UnitFulfillment>;
};

export type SharedServiceFulfillment = {
  kind: 'shared-service';
  supplier: UpstreamServiceSupplierFulfillment;
};

export type UnitFulfillment = WithExtensions &
  (ClosureFulfillment | UpstreamUnitFulfillment);

export type ClosureFulfillment = {
  kind: 'closure';
  closureId: ClosureId;
};

export type UpstreamUnitFulfillment = {
  kind: 'upstream-unit';
  reachabilityPath: ReachabilityPath;
  supplierServiceKey: RequirementServiceKey;
  supplierUnitKey: RequirementUnitKey;
};

export type UpstreamServiceSupplierFulfillment = {
  kind: 'upstream-service';
  reachabilityPath: ReachabilityPath;
  supplierServiceKey: RequirementServiceKey;
};

export type ReachabilityPath = ClosureId[];

export type ForwardedPortKeys = {
  inputs: PortKey[];
  outputs: PortKey[];
};

export type Closure = WithExtensions & {
  core: LUCore;
  forwardedPortKeys: ForwardedPortKeys;
};

// --- Recursive Core Containers ---

export type LUCore =
  | CombinationalLUCore
  | SequentialLUCore
  | StatefulLUCore
  | StructuralLUCore;

export type LogicUnit = WithExtensions & {
  schemaVersion: LogicIRCoreSchemaVersion;
  core: LUCore;
  requirements: RequirementSurface;
};
