import { SimpleNodeFunction } from 'ff-runtime-core';
import { ReactiveComponentContext } from '../utils/types';

export const rawContentNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  meta,
}) => {
  let emitContent: ((val: unknown) => void) | null = null;
  let currentContent: unknown = inputs['content'];
  subscribe({
    data: (key, value) => {
      currentContent = value;
      emitContent?.(value);
    },
    error: (key, error) => {},
  });
  return {
    root: (context: ReactiveComponentContext) => {
      const contentProperty = context.useProperty(
        (callback) => {
          emitContent = callback;
          return () => {
            emitContent = null;
          };
        },
        () => currentContent
      );
      return () => {
        return contentProperty;
      };
    },
  };
};
