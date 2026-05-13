import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../../../../../schema/core/v0-draft/types';
import type {
  ExecutionProfile,
  IRPipelineProfile,
  ProjectionProfile,
  StackDefinition,
} from './architecture-types';
import { provider, requiredDiagnosticPolicy } from './architecture-types';
import {
  coreValidationFeature,
  hdlClockingFeature,
  hdlCombinationalFeature,
  hdlElaborationFeature,
  hdlModuleFeature,
  hdlSignalFeature,
  hdlStateFeature,
  hdlStructuralSlicesFeature,
  hdlUnsupportedSemanticsFeature,
  typeSystemFeature,
} from './features';

export const basicHdlIRProfile: IRPipelineProfile = {
  id: 'logicir.profile.basic-hdl-ir',
  kind: 'ir-pipeline',
  title: 'Basic HDL IR Pipeline',
  status: 'exploration',
  description:
    'Validates, specializes, and normalizes LogicIR into a static Verilog-ready LogicIR form.',
  input: 'logicir',
  output: 'logicir',
  acceptedCoreVersions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  features: [
    {
      feature: coreValidationFeature,
      requirement: 'required',
      extensionKeys: [],
      notes: 'Capability marker for core validation support.',
    },
    {
      feature: typeSystemFeature,
      requirement: 'required',
      extensionKeys: [
        'type-definitions',
        'payload-types',
        'path-schema',
        'port-compatibility',
        'requirement-compatibility',
        'composition-compatibility',
      ],
      notes:
        'HDL projection needs static width, layout, path, and compatibility evidence.',
    },
    {
      feature: hdlSignalFeature,
      requirement: 'required',
      extensionKeys: ['signal-types', 'packed-layout', 'path-flattening'],
      notes:
        'Signal and payload layout evidence is required before Verilog emission.',
    },
    {
      feature: hdlModuleFeature,
      requirement: 'required',
      extensionKeys: ['module-binding', 'port-map', 'parameters', 'blackbox'],
      notes:
        'External targets and generated boundaries must resolve to static module contracts.',
    },
    {
      feature: hdlClockingFeature,
      requirement: 'recommended',
      extensionKeys: ['clock-reset', 'clock-domain', 'reset-policy'],
      notes:
        'Required when stateful, sequential, or register-like retained-current behavior is present.',
    },
    {
      feature: hdlStateFeature,
      requirement: 'recommended',
      extensionKeys: ['state-registers', 'register-enable', 'reset-value'],
      notes:
        'Required when retained-current or stateful topology is realized as registers.',
    },
    {
      feature: hdlElaborationFeature,
      requirement: 'recommended',
      extensionKeys: ['static-only', 'generate-loop', 'unroll', 'specialize'],
      notes:
        'Required when structural or requirement-backed logic needs static specialization before emission.',
    },
    {
      feature: hdlUnsupportedSemanticsFeature,
      requirement: 'recommended',
      extensionKeys: [
        'unsupported-push-policy',
        'unsupported-retained-policy',
        'unsupported-dynamic-fulfillment-policy',
      ],
      notes:
        'Keeps unsupported software-like semantics explicit during the IR pipeline.',
    },
  ],
  stages: [
    {
      id: 'core-validate',
      capability: 'logicir.capability.core-validate.v0',
      requirement: 'required',
      consumesFeatures: [coreValidationFeature],
      produces: 'validated core topology',
    },
    {
      id: 'resolve-target-contracts',
      capability: 'logicir.capability.resolve-target-contracts',
      requirement: 'required',
      consumesFeatures: [hdlModuleFeature],
      produces: 'resolved LU/external/requirement module contracts',
    },
    {
      id: 'resolve-requirement-contracts',
      capability: 'logicir.capability.resolve-requirement-contracts',
      requirement: 'required',
      produces: 'resolved requirement service contracts',
    },
    {
      id: 'check-extension-capabilities',
      capability: 'logicir.capability.check-extension-capabilities',
      requirement: 'required',
      produces: 'profile-required feature/extension contract diagnostics',
    },
    {
      id: 'type-and-signal-check',
      capability: 'logicir.capability.hdl.type-and-signal-check',
      requirement: 'required',
      consumesFeatures: [typeSystemFeature, hdlSignalFeature],
      produces: 'verified widths, signedness, payload paths, and pin layouts',
    },
    {
      id: 'hdl-static-suitability-check',
      capability: 'logicir.capability.hdl.static-suitability-check',
      requirement: 'required',
      consumesFeatures: [hdlUnsupportedSemanticsFeature],
      produces: 'diagnostics for unsupported dynamic/software semantics',
    },
    {
      id: 'normalize-payload-paths',
      capability: 'logicir.capability.hdl.normalize-payload-paths',
      requirement: 'required',
      consumesFeatures: [hdlSignalFeature],
      produces: 'flattened or packed payload path mapping plan',
    },
    {
      id: 'validate-module-bindings',
      capability: 'logicir.capability.hdl.validate-module-bindings',
      requirement: 'required',
      consumesFeatures: [hdlModuleFeature],
      produces: 'checked module/interface bindings',
    },
    {
      id: 'validate-clock-reset',
      capability: 'logicir.capability.hdl.validate-clock-reset',
      requirement: 'recommended',
      consumesFeatures: [hdlClockingFeature],
      produces: 'clock/reset coverage diagnostics',
    },
    {
      id: 'validate-structural-slices',
      capability: 'logicir.capability.hdl.validate-structural-slices',
      requirement: 'recommended',
      consumesFeatures: [hdlStructuralSlicesFeature],
      produces: 'checked structural export-anchor slice plan',
    },
    {
      id: 'static-specialization',
      capability: 'logicir.capability.hdl.static-specialization',
      requirement: 'recommended',
      consumesFeatures: [hdlElaborationFeature],
      produces: 'statically elaborable LogicIR',
    },
  ],
  stripPolicy: {
    authoringData: 'strip',
    consumedTypeData: 'retain',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicVerilogProjectionProfile: ProjectionProfile = {
  id: 'logicir.profile.basic-verilog-hdl',
  kind: 'projection',
  title: 'Basic Verilog HDL Projection',
  status: 'exploration',
  description:
    'Projects validated HDL-ready LogicIR into a Verilog HDL artifact set plus projection metadata.',
  input: 'logicir',
  output: 'artifact',
  projectionTarget: 'verilog-hdl',
  artifactKinds: [
    'verilog-module-files',
    'verilog-artifact-manifest',
    'projection-metadata',
    'diagnostics-report',
  ],
  features: [
    {
      feature: typeSystemFeature,
      requirement: 'required',
      extensionKeys: ['payload-types', 'path-schema', 'port-compatibility'],
    },
    {
      feature: hdlSignalFeature,
      requirement: 'required',
      extensionKeys: [
        'signal-types',
        'packed-layout',
        'path-flattening',
        'pin-layout',
      ],
    },
    {
      feature: hdlModuleFeature,
      requirement: 'required',
      extensionKeys: [
        'module-binding',
        'port-map',
        'parameters',
        'blackbox',
        'module-registry',
      ],
    },
    {
      feature: hdlCombinationalFeature,
      requirement: 'recommended',
      extensionKeys: [
        'combinational-assigns',
        'primitive-op',
        'expression-width-policy',
      ],
      notes:
        'Required when a projector emits primitive behavior as Verilog expressions instead of module instances.',
    },
    {
      feature: hdlClockingFeature,
      requirement: 'recommended',
      extensionKeys: ['clock-reset', 'clock-domain', 'reset-policy'],
      notes:
        'Required for any sequential/stateful/register lowering unless the projection profile declares a user-accepted default domain.',
    },
    {
      feature: hdlStateFeature,
      requirement: 'recommended',
      extensionKeys: ['state-registers', 'register-enable', 'reset-value'],
      notes:
        'Required when retained-current/stateful behavior is emitted as registers.',
    },
    {
      feature: hdlElaborationFeature,
      requirement: 'recommended',
      extensionKeys: ['static-only', 'generate-loop', 'unroll', 'specialize'],
      notes:
        'Required for non-trivial structural or requirement specialization.',
    },
    {
      feature: hdlStructuralSlicesFeature,
      requirement: 'recommended',
      extensionKeys: [
        'slice-interface',
        'rx-tx-bus',
        'routing-policy',
        'fan-in-policy',
      ],
      notes:
        'Required when structural export anchors are emitted as slice modules, partitions, or explicit cross-slice buses.',
    },
    {
      feature: hdlUnsupportedSemanticsFeature,
      requirement: 'recommended',
      extensionKeys: [
        'unsupported-push-policy',
        'unsupported-retained-policy',
        'unsupported-dynamic-fulfillment-policy',
      ],
    },
  ],
  stages: [
    {
      id: 'plan-signals',
      capability: 'logicir.capability.hdl.plan-signals',
      requirement: 'required',
      consumesFeatures: [hdlSignalFeature, typeSystemFeature],
      produces: 'wire/reg/packed signal plan',
    },
    {
      id: 'flatten-payload-paths',
      capability: 'logicir.capability.hdl.flatten-payload-paths',
      requirement: 'required',
      consumesFeatures: [hdlSignalFeature],
      produces: 'Verilog-safe signal names and part-select mappings',
    },
    {
      id: 'plan-modules',
      capability: 'logicir.capability.hdl.plan-modules',
      requirement: 'required',
      consumesFeatures: [hdlModuleFeature],
      produces: 'Verilog module hierarchy and module instance plan',
    },
    {
      id: 'plan-combinational-assigns',
      capability: 'logicir.capability.hdl.plan-combinational-assigns',
      requirement: 'recommended',
      consumesFeatures: [hdlCombinationalFeature],
      produces: 'continuous assign or always-comb equivalent plan',
    },
    {
      id: 'plan-state-registers',
      capability: 'logicir.capability.hdl.plan-state-registers',
      requirement: 'recommended',
      consumesFeatures: [hdlStateFeature, hdlClockingFeature],
      produces: 'register and reset plan',
    },
    {
      id: 'plan-clock-reset',
      capability: 'logicir.capability.hdl.plan-clock-reset',
      requirement: 'recommended',
      consumesFeatures: [hdlClockingFeature],
      produces: 'clock/reset ports, domains, and reset policy',
    },
    {
      id: 'plan-structural-slices',
      capability: 'logicir.capability.hdl.plan-structural-slices',
      requirement: 'recommended',
      consumesFeatures: [hdlStructuralSlicesFeature],
      produces: 'slice module/partition and cross-slice routing plan',
    },
    {
      id: 'emit-verilog',
      capability: 'logicir.capability.hdl.emit-verilog',
      requirement: 'required',
      produces: 'Verilog HDL files',
    },
    {
      id: 'emit-projection-metadata',
      capability: 'logicir.capability.hdl.emit-projection-metadata',
      requirement: 'recommended',
      produces: 'artifact manifest and LogicIR-to-HDL mapping metadata',
    },
  ],
  unsupportedSemantics: {
    'runtime-late-bound-fulfillment': 'fail',
    'switchable-provider-fulfillment': 'fail',
    'software-continuation-completion': 'fail',
    'push-delivery-without-clocked-lowering': 'fail',
    'retained-current-without-state-policy': 'requires-feature',
    'payload-path-without-layout': 'requires-feature',
    'dynamic-structural-composition': 'fail',
    'ambiguous-fan-in-without-policy': 'requires-feature',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicVerilogSimulationExecutionProfile: ExecutionProfile = {
  id: 'logicir.profile.basic-verilog-sim',
  kind: 'execution',
  title: 'Basic Verilog Simulator Execution',
  status: 'exploration',
  description:
    'Runs emitted Verilog artifacts through a simulator with explicit testbench, stimulus, and probe providers.',
  input: 'artifact',
  output: 'execution',
  target: 'verilog-simulator',
  environments: [
    'icarus-verilog',
    'verilator',
    'commercial-verilog-simulator',
  ],
  features: [
    {
      feature: hdlModuleFeature,
      requirement: 'required',
      extensionKeys: ['module-binding', 'module-registry'],
    },
    {
      feature: hdlClockingFeature,
      requirement: 'recommended',
      extensionKeys: ['clock-reset', 'clock-domain', 'reset-policy'],
    },
    {
      feature: hdlSignalFeature,
      requirement: 'required',
      extensionKeys: ['signal-types', 'path-flattening'],
    },
  ],
  providerContracts: [
    {
      id: 'hdl-simulator-provider',
      title: 'HDL simulator provider',
      requirement: 'required',
      capabilities: [
        'logicir.capability.provider.hdl.compile',
        'logicir.capability.provider.hdl.run',
      ],
      notes:
        'Compiles emitted Verilog artifacts and runs the simulation executable.',
    },
    {
      id: 'testbench-provider',
      title: 'Testbench provider',
      requirement: 'recommended',
      capabilities: [
        'logicir.capability.provider.hdl.clock-reset',
        'logicir.capability.provider.hdl.stimulus',
        'logicir.capability.provider.hdl.probe',
      ],
      notes:
        'Supplies clocks, resets, stimuli, and observation probes.',
    },
    {
      id: 'foreign-module-provider',
      title: 'Foreign module provider',
      requirement: 'optional',
      capabilities: ['logicir.capability.provider.hdl.foreign-module'],
      notes:
        'Satisfies blackbox or simulator-specific foreign modules when a design needs them.',
    },
  ],
  bindings: [
    {
      kind: 'module',
      abstractRef: 'verilog-artifact-manifest:*',
      provider: provider('hdl.simulator', 'compile-and-run'),
      requirement: 'required',
      notes:
        'The provider consumes the Verilog artifact manifest emitted by the projection profile.',
    },
    {
      kind: 'clock-reset',
      abstractRef: 'logicir.basic-hdl/clock-reset/default',
      provider: provider('hdl.testbench', 'clock-reset-generator'),
      requirement: 'optional',
      notes:
        'Required when the emitted design contains clocked state and no explicit testbench already provides it.',
    },
    {
      kind: 'stimulus',
      abstractRef: 'logicir.basic-hdl/stimulus/default',
      provider: provider('hdl.testbench', 'stimulus-source'),
      requirement: 'optional',
    },
    {
      kind: 'probe',
      abstractRef: 'logicir.basic-hdl/probe/default',
      provider: provider('hdl.testbench', 'probe-sink'),
      requirement: 'optional',
    },
  ],
  policies: {
    buildOnlyDefault: 'no-execution-profile',
    missingSimulator: 'fail-when-execution-selected',
    missingClockResetStimulus: 'fail-if-design-requires-it',
    waveformEmission: 'profile-defined',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicHdlStack: StackDefinition = {
  id: 'logicir.stack.basic-hdl',
  title: 'Basic HDL Stack',
  status: 'exploration',
  description:
    'Verilog-oriented HDL stack for static LogicIR validation, Verilog artifact emission, and optional simulation.',
  irPipeline: basicHdlIRProfile,
  projection: basicVerilogProjectionProfile,
  variants: [
    {
      id: 'logicir.stack.basic-hdl.build',
      title: 'Basic HDL Build',
      notes:
        'Build-only flow: LogicIR is projected into Verilog artifacts and no execution profile is selected.',
    },
    {
      id: 'logicir.stack.basic-hdl.sim',
      title: 'Basic HDL Simulation',
      execution: basicVerilogSimulationExecutionProfile,
      notes:
        'Simulation flow: generated Verilog artifacts are run by a simulator provider.',
    },
  ],
};
