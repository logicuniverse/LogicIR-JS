import type { FeatureCatalogEntry } from './architecture-types';
import { feature } from './architecture-types';

export const typeSystemFeature = feature('logicir.type-system', 'core');
export const coreValidationFeature = feature('logicir.core-validation', 'v0');

export const softwareValueFeature = feature('logicir.basic-software', 'value');
export const softwareCompletionFeature = feature(
  'logicir.basic-software',
  'completion'
);
export const softwareInvocationFeature = feature(
  'logicir.basic-software',
  'invocation'
);
export const softwareRetainedCurrentFeature = feature(
  'logicir.basic-software',
  'retained-current'
);
export const softwareFulfillmentFeature = feature(
  'logicir.basic-software',
  'fulfillment'
);
export const softwareErrorFeature = feature('logicir.basic-software', 'error');
export const softwareLifecycleFeature = feature(
  'logicir.basic-software',
  'lifecycle'
);
export const softwareObservationFeature = feature(
  'logicir.basic-software',
  'observation'
);

export const hdlSignalFeature = feature('logicir.basic-hdl', 'signal');
export const hdlModuleFeature = feature('logicir.basic-hdl', 'module');
export const hdlClockingFeature = feature('logicir.basic-hdl', 'clocking');
export const hdlCombinationalFeature = feature(
  'logicir.basic-hdl',
  'combinational'
);
export const hdlStateFeature = feature('logicir.basic-hdl', 'state');
export const hdlElaborationFeature = feature(
  'logicir.basic-hdl',
  'elaboration'
);
export const hdlStructuralSlicesFeature = feature(
  'logicir.basic-hdl',
  'structural-slices'
);
export const hdlUnsupportedSemanticsFeature = feature(
  'logicir.basic-hdl',
  'unsupported-semantics'
);

export const featureCatalog: FeatureCatalogEntry[] = [
  {
    feature: typeSystemFeature,
    title: 'Logical payload and compatibility type system',
    owner: 'shared',
    extensionKeys: [
      'type-definitions',
      'payload-types',
      'path-schema',
      'port-compatibility',
      'requirement-compatibility',
      'composition-compatibility',
    ],
    usedBy: ['logicir.stack.basic-software', 'logicir.stack.basic-hdl'],
    notes:
      'Recommended for software, usually required for HDL because widths and static compatibility must be known.',
  },
  {
    feature: coreValidationFeature,
    title: 'Core validation capability',
    owner: 'shared',
    extensionKeys: [],
    usedBy: ['logicir.stack.basic-software', 'logicir.stack.basic-hdl'],
    notes:
      'Capability marker for validators rather than a LogicIR node extension feature.',
  },
  {
    feature: softwareCompletionFeature,
    title: 'Portable software completion',
    owner: 'basic-software',
    extensionKeys: [
      'completion-contract',
      'step-await-policy',
      'completion-error-policy',
    ],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Abstracts old Immediate/Thenable without choosing JS Promise or Python coroutine.',
  },
  {
    feature: softwareValueFeature,
    title: 'Portable software values',
    owner: 'basic-software',
    extensionKeys: [
      'literal-values',
      'default-inputs',
      'initial-values',
      'host-value-shape',
    ],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Represents constants and defaults without choosing a host language syntax.',
  },
  {
    feature: softwareInvocationFeature,
    title: 'Portable software invocation',
    owner: 'basic-software',
    extensionKeys: [
      'call-contract',
      'input-read-policy',
      'push-delivery-policy',
      'packet-path-policy',
    ],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Abstracts how providers are invoked and how pull reads, push packets, and payload paths are routed.',
  },
  {
    feature: softwareRetainedCurrentFeature,
    title: 'Software retained-current realization',
    owner: 'basic-software',
    extensionKeys: [
      'retained-current-realization',
      'state-backing',
      'latest-value-cache',
    ],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Abstracts old PropertyPort plus StateStore/cache/subscription mechanics.',
  },
  {
    feature: softwareFulfillmentFeature,
    title: 'Software provider fulfillment',
    owner: 'basic-software',
    extensionKeys: [
      'provider-binding-policy',
      'dynamic-fulfillment',
      'late-bound-provider',
      'switching-policy',
    ],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Static startup binding is baseline; late-bound and switchable policies require explicit support.',
  },
  {
    feature: softwareErrorFeature,
    title: 'Software error channel',
    owner: 'basic-software',
    extensionKeys: ['error-policy', 'error-port', 'error-channel'],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Keeps host exception, rejection, and result-error mechanics out of core.',
  },
  {
    feature: softwareLifecycleFeature,
    title: 'Software resource lifecycle',
    owner: 'basic-software',
    extensionKeys: ['resource-lifecycle', 'start-stop', 'dispose'],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Represents provider resource lifecycle without making hooks a core schema concept.',
  },
  {
    feature: softwareObservationFeature,
    title: 'Software execution observation',
    owner: 'basic-software',
    extensionKeys: ['trace-events', 'runtime-hooks', 'override-policy'],
    usedBy: ['logicir.stack.basic-software'],
    notes:
      'Optional tooling/observation support; behavior-changing observation requires explicit binding.',
  },
  {
    feature: hdlSignalFeature,
    title: 'HDL signal and payload layout',
    owner: 'basic-hdl',
    extensionKeys: [
      'signal-types',
      'packed-layout',
      'path-flattening',
      'pin-layout',
    ],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Defines widths, signedness, packing, and logical path flattening for Verilog.',
  },
  {
    feature: hdlModuleFeature,
    title: 'Verilog module binding',
    owner: 'basic-hdl',
    extensionKeys: [
      'module-binding',
      'port-map',
      'parameters',
      'blackbox',
      'module-registry',
    ],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Binds external or LU-backed targets to Verilog modules and checks interfaces.',
  },
  {
    feature: hdlClockingFeature,
    title: 'Verilog clock/reset realization',
    owner: 'basic-hdl',
    extensionKeys: ['clock-reset', 'clock-domain', 'reset-policy'],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Required for stateful/sequential/register projection unless an explicit default domain is accepted.',
  },
  {
    feature: hdlCombinationalFeature,
    title: 'Verilog combinational behavior',
    owner: 'basic-hdl',
    extensionKeys: [
      'combinational-assigns',
      'primitive-op',
      'expression-width-policy',
    ],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Allows simple behavior to emit as expressions/assigns instead of requiring external modules.',
  },
  {
    feature: hdlStateFeature,
    title: 'Verilog state/register realization',
    owner: 'basic-hdl',
    extensionKeys: ['state-registers', 'register-enable', 'reset-value'],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Realizes retained-current or stateful behavior as explicit registers under a clock/reset policy.',
  },
  {
    feature: hdlElaborationFeature,
    title: 'Verilog static elaboration',
    owner: 'basic-hdl',
    extensionKeys: ['static-only', 'generate-loop', 'unroll', 'specialize'],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Ensures generated Verilog is statically elaborable before emission.',
  },
  {
    feature: hdlStructuralSlicesFeature,
    title: 'Structural slice lowering',
    owner: 'basic-hdl',
    extensionKeys: [
      'slice-interface',
      'rx-tx-bus',
      'routing-policy',
      'fan-in-policy',
    ],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Lowers export anchors into modules/partitions while keeping placement and routing policy out of core.',
  },
  {
    feature: hdlUnsupportedSemanticsFeature,
    title: 'Explicit HDL unsupported-semantics diagnostics',
    owner: 'basic-hdl',
    extensionKeys: [
      'unsupported-push-policy',
      'unsupported-retained-policy',
      'unsupported-dynamic-fulfillment-policy',
    ],
    usedBy: ['logicir.stack.basic-hdl'],
    notes:
      'Makes software-like semantics fail or lower explicitly instead of being silently dropped.',
  },
];
