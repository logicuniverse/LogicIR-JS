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
export type ExternalTargetId = LogicIRId;

/**
 * `key` values are stable semantic names in a declared namespace or contract
 * surface. Do not use keys for visual-editor-generated graph node identity.
 */
export type LogicIRKey = string;
export type PortKey = LogicIRKey;
export type PinKey = LogicIRKey;
export type RequirementServiceKey = LogicIRKey;
export type RequirementUnitKey = LogicIRKey;
export type ExtensionNamespace = string;
export type ExtensionKey = LogicIRKey;
export type ExtensionPayload = unknown;
export type CompositionExposedSlotKey = LogicIRKey;
export type CompositionAcceptedSlotKey = LogicIRKey;
export type CompositionFieldKey = LogicIRKey;

export type ExtensionRequirement = 'optional' | 'required';

export type ExtensionRecord = {
  namespace: ExtensionNamespace;
  key: ExtensionKey;
  requirement: ExtensionRequirement;
  payload: ExtensionPayload;
};

export type WithExtensions = {
  extensions?: ExtensionRecord[];
};

// --- X: Boundary Interaction ---

export type PortPolarity = 'pull' | 'push';
export type PortDirection = 'input' | 'output';
export type PortRole = 'primary-result';

export type Pin = WithExtensions;

export type PinSet =
  | { kind: 'indexed'; count: number; item?: Pin }
  | { kind: 'keyed'; entries: Record<PinKey, Pin> };

export type Port = WithExtensions & {
  polarity: PortPolarity;
  direction: PortDirection;
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

export type LUITarget =
  | { kind: 'lu'; luId: LUId }
  | { kind: 'external'; targetId: ExternalTargetId }
  | {
      kind: 'requirement';
      serviceKey: RequirementServiceKey;
      unitKey: RequirementUnitKey;
    };

export type LUI = WithExtensions & {
  kind: LUKind;
  target: LUITarget;
  ports: Record<PortKey, Port>;
  fulfillments?: Record<
    RequirementServiceKey,
    RequirementServiceFulfillment
  >;
};

export type CompositionSlotShape = 'single' | 'collection' | 'map';

export type CompositionExposedSlot = WithExtensions & {
  shape?: CompositionSlotShape;
  required?: boolean;
};

export type CompositionAcceptedSlot = WithExtensions & {
  required?: boolean;
};

export type CompositionLeaf =
  | {
      kind: 'lui-exposure';
      luiId: LUIId;
      exposedSlotKey: CompositionExposedSlotKey;
      acceptedSlots?: Record<
        CompositionAcceptedSlotKey,
        CompositionValue
      >;
    }
  | { kind: 'accepted-slot'; slotKey: CompositionAcceptedSlotKey };

export type CompositionValue =
  | CompositionLeaf
  | { kind: 'collection'; items: CompositionLeaf[] }
  | { kind: 'map'; entries: Record<CompositionFieldKey, CompositionLeaf> };

export type SequentialStep = WithExtensions & {
  luiId: LUIId;
};

export type LUOrganization =
  | { kind: 'combinational' }
  | { kind: 'sequential'; steps: SequentialStep[] }
  | { kind: 'stateful' }
  | {
      kind: 'structural';
      exposedSlots: Record<
        CompositionExposedSlotKey,
        CompositionExposedSlot
      >;
      acceptedSlots?: Record<
        CompositionAcceptedSlotKey,
        CompositionAcceptedSlot
      >;
      exposedValues?: Record<CompositionExposedSlotKey, CompositionValue>;
    };

// --- Z: Requirement Fulfillment ---

export type RequirementFulfillmentScope =
  | 'independent-units'
  | 'shared-service';

export type RequirementSurface = Record<
  RequirementServiceKey,
  RequirementService
>;

export type PlainRequirementSurface = Record<
  RequirementServiceKey,
  PlainRequirementService
>;

export type RequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: Record<RequirementUnitKey, RequirementUnit>;
};

export type PlainRequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: Record<RequirementUnitKey, PlainRequirementUnit>;
};

export type RequirementUnit = WithExtensions & {
  kind: LUKind;
  ports: Record<PortKey, Port>;
  requirements?: PlainRequirementSurface;
};

export type PlainRequirementUnit = WithExtensions & {
  kind: LUKind;
  ports: Record<PortKey, Port>;
};

export type RequirementServiceFulfillment =
  | IndependentUnitsFulfillment
  | SharedServiceFulfillment;

export type IndependentUnitsFulfillment = WithExtensions & {
  kind: 'independent-units';
  units: Record<RequirementUnitKey, UnitFulfillment>;
};

export type SharedServiceFulfillment = WithExtensions & {
  kind: 'shared-service';
  supplier: UpstreamServiceSupplierFulfillment;
};

export type UnitFulfillment =
  | ClosureFulfillment
  | UpstreamUnitFulfillment;

export type ClosureFulfillment = WithExtensions & {
  kind: 'closure';
  closureId: ClosureId;
};

export type UpstreamUnitFulfillment = WithExtensions & {
  kind: 'upstream-unit';
  reachabilityPath: ReachabilityPath;
  supplierServiceKey: RequirementServiceKey;
  supplierUnitKey: RequirementUnitKey;
};

export type UpstreamServiceSupplierFulfillment = WithExtensions & {
  kind: 'upstream-service';
  reachabilityPath: ReachabilityPath;
  supplierServiceKey: RequirementServiceKey;
};

export type ReachabilityPath = ClosureId[];

export type ForwardedPortKeys = WithExtensions & {
  inputs?: PortKey[];
  outputs?: PortKey[];
};

export type Closure = WithExtensions & {
  core: LUCore;
  forwardedPortKeys?: ForwardedPortKeys;
};

// --- Recursive Core Containers ---

export type LUCore = WithExtensions & {
  organization: LUOrganization;
  ports: Record<PortKey, Port>;
  luis: Record<LUIId, LUI>;
  connections: Record<ConnectionId, Connection>;
  closures?: Record<ClosureId, Closure>;
};

export type LogicUnit = WithExtensions & {
  schemaVersion: LogicIRCoreSchemaVersion;
  core: LUCore;
  requirements?: RequirementSurface;
};
