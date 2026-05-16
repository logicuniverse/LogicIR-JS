/**
 * LogicIR core schema v0 draft.
 *
 * This file is the TypeScript authoring source for target-neutral protocol data
 * shapes. It must not contain runtime, projection, or execution implementation mechanics.
 * It also must not use TypeScript generics or utility types as schema
 * abstraction; spell protocol shapes out with serializable object, union,
 * intersection, array, and index-signature types.
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
export type ExternalRequirementServiceVersion = string;
export type ExternalTargetNamespace = string;
export type ExternalTargetKey = LogicIRKey;
export type ExternalTargetVersion = string;
export type FeatureUseKey = LogicIRKey;
export type FeatureNamespace = string;
export type FeatureKey = LogicIRKey;
export type FeatureVersion = string;
export type ExtensionKey = LogicIRKey;
export type ExtensionPayload = unknown;
export type CompositionAnchorKey = LogicIRKey;
export type CompositionOutletKey = LogicIRKey;
export type CompositionFieldKey = LogicIRKey;

export type FeatureUse = {
  namespace: FeatureNamespace;
  key: FeatureKey;
  version?: FeatureVersion;
};

export type ExtensionRecord = {
  featureKey: FeatureUseKey;
  key: ExtensionKey;
  payload: ExtensionPayload;
};

export type WithExtensions = {
  extensions?: ExtensionRecord[];
};

// --- X: Boundary Contact ---

export type PortContactKind = 'pull' | 'push' | 'property';

export type PinSet =
  | { kind: 'indexed'; count: number }
  | { kind: 'keyed'; keys: PinKey[] };

export type PortBase = WithExtensions & {
  pins?: PinSet;
};

export type PullPort = PortBase & { contact: 'pull' };

export type PushPort = PortBase & { contact: 'push' };

/**
 * A retained-current reactive contact. A property is readable as a current
 * value and notifies updates; the current value must be initialized by the
 * declaring unit, its source, or an explicit preserving adapter.
 */
export type PropertyPort = PortBase & { contact: 'property' };

export type Port = PullPort | PushPort | PropertyPort;

export type PullInputPort = PullPort;
export type PushInputPort = PushPort;
export type PropertyInputPort = PropertyPort;
export type PushOutputPort = PushPort;
export type PropertyOutputPort = PropertyPort;

/**
 * Result is a distinct endpoint slot, but still a pull port. It may declare
 * pins like other ports when the result surface needs first-level addressing.
 */
export type PullResultPort = PullPort;

export type CombinationalPorts = {
  inputs: { [key: PortKey]: PullInputPort };
  result: PullResultPort;
};

export type SequentialPorts = {
  inputs: { [key: PortKey]: PullInputPort | PushInputPort };
  outputs: { [key: PortKey]: PushOutputPort };
  result?: PullResultPort;
};

export type StatefulPorts = {
  inputs: { [key: PortKey]: PullInputPort | PushInputPort };
  outputs: { [key: PortKey]: PushOutputPort | PropertyOutputPort };
};

export type StructuralPorts = {
  inputs: {
    [key: PortKey]: PullInputPort | PushInputPort | PropertyInputPort;
  };
  outputs: { [key: PortKey]: PushOutputPort };
};

export type PortSurface =
  | CombinationalPorts
  | SequentialPorts
  | StatefulPorts
  | StructuralPorts;

export type PortOwner =
  | { kind: 'lu' }
  | { kind: 'lui'; luiId: LUIId }
  | { kind: 'closure'; closureId: ClosureId };

export type PayloadPathSegment = PinKey | number;
export type PayloadPath = PayloadPathSegment[];

export type EndpointPortRef =
  | { kind: 'input'; key: PortKey }
  | { kind: 'output'; key: PortKey }
  | { kind: 'result' };

export type EndpointRef = {
  owner: PortOwner;
  port: EndpointPortRef;
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
      version?: ExternalTargetVersion;
    }
  | {
      kind: 'requirement';
      serviceKey: RequirementServiceKey;
      unitKey: RequirementUnitKey;
    };

export type LUIShared = WithExtensions & {
  target: LUITarget;
  fulfillments: {
    [key: RequirementServiceKey]: RequirementServiceFulfillment;
  };
};

export type StructuralCompositionContract = WithExtensions & {
  outlets: CompositionOutletKey[];
  anchors: { [key: CompositionAnchorKey]: CompositionAnchor };
};

export type StructuralLUI = LUIShared & {
  kind: 'structural';
  ports: StructuralPorts;
  compositionSurface: StructuralCompositionContract;
};

export type CombinationalLUI = LUIShared & {
  kind: 'combinational';
  ports: CombinationalPorts;
};

export type SequentialLUI = LUIShared & {
  kind: 'sequential';
  ports: SequentialPorts;
};

export type StatefulLUI = LUIShared & {
  kind: 'stateful';
  ports: StatefulPorts;
};

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
      entries: { [key: CompositionFieldKey]: CompositionLeaf };
    };

export type LUCoreShared = WithExtensions & {
  connections: { [id: ConnectionId]: Connection };
  closures: { [id: ClosureId]: Closure };
};

export type CombinationalLUCore = LUCoreShared & {
  kindOrganization: { kind: 'combinational' };
  ports: CombinationalPorts;
  luis: { [id: LUIId]: CombinationalLUI };
};

export type SequentialLUCore = LUCoreShared & {
  kindOrganization: { kind: 'sequential'; steps: LUIId[] };
  ports: SequentialPorts;
  luis: { [id: LUIId]: CombinationalLUI | StatefulLUI | SequentialLUI };
};

export type StatefulLUCore = LUCoreShared & {
  kindOrganization: { kind: 'stateful' };
  ports: StatefulPorts;
  luis: { [id: LUIId]: CombinationalLUI | StatefulLUI };
};

export type StructuralLUCore = LUCoreShared & {
  kindOrganization: {
    kind: 'structural';
    exportAnchors: {
      [key: CompositionAnchorKey]: CompositionExportAnchor;
    };
    externalOutlets: { [key: CompositionOutletKey]: CompositionAnchor };
    exportAnchorFills: { [key: CompositionAnchorKey]: CompositionLeaf };
    luiFills: {
      [id: LUIId]: { [key: CompositionAnchorKey]: CompositionValue };
    };
  };
  ports: StructuralPorts;
  luis: { [id: LUIId]: CombinationalLUI | StatefulLUI | StructuralLUI };
};

// --- Z: Requirement Fulfillment ---

export type RequirementFulfillmentScope =
  | 'independent-units'
  | 'shared-service';

export type RequirementSurface = {
  [key: RequirementServiceKey]: RequirementServiceEntry;
};

export type PlainRequirementSurface = {
  [key: RequirementServiceKey]: PlainRequirementServiceEntry;
};

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
  version?: ExternalRequirementServiceVersion;
};

export type RequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: { [key: RequirementUnitKey]: RequirementUnit };
};

export type PlainRequirementService = WithExtensions & {
  fulfillmentScope: RequirementFulfillmentScope;
  units: { [key: RequirementUnitKey]: PlainRequirementUnit };
};

export type RequirementUnitShared = {
  requirements: PlainRequirementSurface;
};

export type CombinationalRequirementUnit = RequirementUnitShared & {
  kind: 'combinational';
  ports: CombinationalPorts;
};

export type SequentialRequirementUnit = RequirementUnitShared & {
  kind: 'sequential';
  ports: SequentialPorts;
};

export type StatefulRequirementUnit = RequirementUnitShared & {
  kind: 'stateful';
  ports: StatefulPorts;
};

export type StructuralRequirementUnit = RequirementUnitShared & {
  kind: 'structural';
  ports: StructuralPorts;
  compositionSurface: StructuralCompositionContract;
};

export type RequirementUnit =
  | CombinationalRequirementUnit
  | SequentialRequirementUnit
  | StatefulRequirementUnit
  | StructuralRequirementUnit;

export type PlainCombinationalRequirementUnit = {
  kind: 'combinational';
  ports: CombinationalPorts;
};

export type PlainSequentialRequirementUnit = {
  kind: 'sequential';
  ports: SequentialPorts;
};

export type PlainStatefulRequirementUnit = {
  kind: 'stateful';
  ports: StatefulPorts;
};

export type PlainStructuralRequirementUnit = {
  kind: 'structural';
  ports: StructuralPorts;
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
  units: { [key: RequirementUnitKey]: UnitFulfillment };
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
  pushOutputs: PortKey[];
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
  features: { [key: FeatureUseKey]: FeatureUse };
  core: LUCore;
  requirements: RequirementSurface;
};
