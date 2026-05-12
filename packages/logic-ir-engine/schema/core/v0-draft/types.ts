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
export type LocalId = LogicIRId;
export type LUId = LocalId;
export type LUIId = LocalId;
export type ConnectionId = LocalId;
export type ClosureId = LocalId;

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

export type NonStructuralLUKind = Exclude<LUKind, 'structural'>;

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
  ports: Record<PortKey, Port>;
  fulfillments: Record<
    RequirementServiceKey,
    RequirementServiceFulfillment
  >;
};

export type StructuralLUI = LUIBase & {
  kind: 'structural';
  compositionSurface: {
    outlets: Record<CompositionOutletKey, CompositionOutlet>;
    anchors: Record<CompositionAnchorKey, CompositionAnchor>;
  };
};

export type NonStructuralLUI = LUIBase & {
  kind: NonStructuralLUKind;
};

export type LUI = StructuralLUI | NonStructuralLUI;

export type CompositionSlotShape = 'single' | 'collection' | 'map';

export type CompositionAnchor = {
  shape: CompositionSlotShape;
  required: boolean;
};

export type CompositionOutlet = {};

export type CompositionExportSlot = {
  required: boolean;
};

export type CompositionLeaf =
  | {
      kind: 'lui-outlet';
      luiId: LUIId;
      outletKey: CompositionOutletKey;
    }
  | {
      kind: 'placeholder';
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

export type CompositionAnchorFills = Record<
  CompositionAnchorKey,
  CompositionValue
>;

export type CompositionExportSlotFills = Record<
  CompositionAnchorKey,
  CompositionLeaf
>;

export type SequentialStep = {
  luiId: LUIId;
};

export type LUKindOrganization =
  | { kind: 'combinational' }
  | { kind: 'sequential'; steps: SequentialStep[] }
  | { kind: 'stateful' }
  | {
      kind: 'structural';
      exportSlots: Record<CompositionAnchorKey, CompositionExportSlot>;
      placeholderOutlets: Record<CompositionOutletKey, CompositionAnchor>;
      exportSlotFills: CompositionExportSlotFills;
      luiFills: Record<LUIId, CompositionAnchorFills>;
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

export type RequirementUnit = {
  kind: LUKind;
  ports: Record<PortKey, Port>;
  requirements: PlainRequirementSurface;
};

export type PlainRequirementUnit = {
  kind: LUKind;
  ports: Record<PortKey, Port>;
};

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

export type LUCore = WithExtensions & {
  kindOrganization: LUKindOrganization;
  ports: Record<PortKey, Port>;
  luis: Record<LUIId, LUI>;
  connections: Record<ConnectionId, Connection>;
  closures: Record<ClosureId, Closure>;
};

export type LogicUnit = WithExtensions & {
  schemaVersion: LogicIRCoreSchemaVersion;
  core: LUCore;
  requirements: RequirementSurface;
};
