import type {
  CoreExternalTargetCatalog,
  RuntimeValue,
  StatefulTargetContext,
} from '@logic-universe/logic-ir-engine-core-software-interpreter';

export const coreOnlyTargetCatalog: CoreExternalTargetCatalog = {
  'logicir.examples.core-only/add-pair@0.1.0': {
    kind: 'combinational',
    evaluate: (inputs: Record<string, RuntimeValue | undefined>) =>
      Number(inputs.left ?? 0) + Number(inputs.right ?? 0),
  },
  'logicir.examples.core-only/increment@0.1.0': {
    kind: 'combinational',
    evaluate: (inputs: Record<string, RuntimeValue | undefined>) =>
      Number(inputs.value ?? 0) + 1,
  },
  'logicir.examples.core-only/double@0.1.0': {
    kind: 'combinational',
    evaluate: (inputs: Record<string, RuntimeValue | undefined>) =>
      Number(inputs.value ?? 0) * 2,
  },
  'logicir.examples.core-only/counter-register@0.1.0': {
    kind: 'stateful',
    create: (context: StatefulTargetContext) => {
      const emitCurrent = (value: RuntimeValue) => {
        context.emitOutput('current', value);
      };

      return {
        initialize: () => {
          emitCurrent(Number(context.getInputValue('initial') ?? 0));
        },
        pushInput: (key, value) => {
          if (key === 'increment') {
            const next = Number(context.readOutput('current') ?? 0) + Number(value ?? 0);
            emitCurrent(next);
            return;
          }
          if (key === 'reset') {
            emitCurrent(Number(value ?? 0));
          }
        },
        refreshInput: (key) => {
          if (key === 'initial' && context.readOutput('current') === undefined) {
            emitCurrent(Number(context.getInputValue('initial') ?? 0));
          }
        },
      };
    },
  },
  'logicir.examples.core-only/headless-layout@0.1.0': {
    kind: 'structural',
    compose: ({
      inputs,
      anchors,
    }: {
      inputs: Record<string, RuntimeValue | undefined>;
      anchors: Record<string, RuntimeValue | undefined>;
    }) => ({
      root: {
        type: 'layout',
        theme: inputs.theme ?? 'default',
        slots: {
          header: anchors.header,
          body: anchors.body,
        },
      },
    }),
  },
};
