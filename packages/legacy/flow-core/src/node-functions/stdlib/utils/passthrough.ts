import { SimpleNodeFunction } from 'ff-runtime-core';

export const passthroughNodeFunction: SimpleNodeFunction = ({
  subscribe,
  emit,
}) => {
  subscribe({
    data: (pinKey, data, _subflowKey, path) => {
      emit.data('out', data, path);
    },
    error: (pinKey, error, _subflowKey, path) => {
      emit.error('out', error, path);
    },
  });
};
