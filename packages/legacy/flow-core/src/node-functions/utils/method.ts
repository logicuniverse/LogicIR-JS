import { SimpleNodeFunction } from 'ff-runtime-core';

export const getServiceMethod = (
  injectKey: string,
  methodKey: string
): SimpleNodeFunction => {
  return ({ inputs, emit, inject, subscribe }) => {
    const injectedFn = inject(injectKey, methodKey);
    if (!injectedFn) {
      throw new Error(
        `Injected function not found for ${injectKey}.${methodKey}`
      );
    }
    return injectedFn({ inputs, emit, inject, subscribe });
  };
};
