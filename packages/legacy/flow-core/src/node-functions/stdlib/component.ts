import {
  ComponentContext,
  SimpleNodeFunction,
  simpleService2Service,
} from 'ff-runtime-core';

export const composeComponentNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
}) => {
  // Implementation for array component node function
  return {
    root:
      (context: ComponentContext) => (componentInputs: Record<string, any>) => {
        return context.compose({
          item: null,
          children: componentInputs['children'],
        });
      },
  };
};

export const componentService = simpleService2Service({
  'component.fromObject': composeComponentNodeFunction,
  'component.fromArray': composeComponentNodeFunction,
});
